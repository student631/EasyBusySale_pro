'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  initializeSocket,
  disconnectSocket,
  getSocket,
  joinConversation,
  leaveConversation,
  sendSocketMessage,
  emitTyping
} from '@/lib/socket';
import type { Socket } from 'socket.io-client';

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'connecting';

interface SocketContextType {
  socket: Socket | null;
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  joinConversation: (conversationId: number) => void;
  leaveConversation: (conversationId: number) => void;
  sendMessage: (data: { conversationId: number; receiverId: number; messageText: string }) => void;
  emitTyping: (conversationId: number, isTyping: boolean) => void;
  markMessagesRead: (conversationId: number, senderId: number) => void;
  getUserStatus: (userId: number) => void;
  onlineUsers: Set<number>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  // Initialize socket connection
  useEffect(() => {
    if (token && user) {
      console.log('Initializing socket connection...');
      setConnectionStatus('connecting');

      const socketInstance = initializeSocket(token);
      setSocket(socketInstance);

      // Connection event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setConnectionStatus('connected');
      });

      socketInstance.on('authenticated', (data) => {
        console.log('Socket authenticated:', data);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnectionStatus('disconnected');
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnectionStatus('reconnecting');
      });

      socketInstance.on('authentication_error', (error) => {
        console.error('Socket authentication error:', error);
        setConnectionStatus('disconnected');
      });

      // Online status tracking
      socketInstance.on('user_status_change', (data: { userId: number; status: 'online' | 'offline' }) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          if (data.status === 'online') {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      });

      socketInstance.on('user_status', (data: { userId: number; status: 'online' | 'offline' }) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          if (data.status === 'online') {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      });

      return () => {
        console.log('Cleaning up socket connection...');
        socketInstance.off('connect');
        socketInstance.off('authenticated');
        socketInstance.off('disconnect');
        socketInstance.off('connect_error');
        socketInstance.off('authentication_error');
        socketInstance.off('user_status_change');
        socketInstance.off('user_status');
        disconnectSocket();
        setSocket(null);
        setConnectionStatus('disconnected');
      };
    } else {
      // Disconnect if no token
      if (socket) {
        disconnectSocket();
        setSocket(null);
        setConnectionStatus('disconnected');
      }
    }
  }, [token, user]);

  // Join conversation
  const handleJoinConversation = useCallback((conversationId: number) => {
    joinConversation(conversationId);
  }, []);

  // Leave conversation
  const handleLeaveConversation = useCallback((conversationId: number) => {
    leaveConversation(conversationId);
  }, []);

  // Send message
  const handleSendMessage = useCallback((data: { conversationId: number; receiverId: number; messageText: string }) => {
    sendSocketMessage(data);
  }, []);

  // Emit typing indicator
  const handleEmitTyping = useCallback((conversationId: number, isTyping: boolean) => {
    emitTyping(conversationId, isTyping);
  }, []);

  // Mark messages as read
  const markMessagesRead = useCallback((conversationId: number, senderId: number) => {
    const currentSocket = getSocket();
    if (currentSocket) {
      currentSocket.emit('mark_messages_read', { conversationId, senderId });
    }
  }, []);

  // Get user status
  const getUserStatus = useCallback((userId: number) => {
    const currentSocket = getSocket();
    if (currentSocket) {
      currentSocket.emit('get_user_status', userId);
    }
  }, []);

  const value: SocketContextType = {
    socket,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    joinConversation: handleJoinConversation,
    leaveConversation: handleLeaveConversation,
    sendMessage: handleSendMessage,
    emitTyping: handleEmitTyping,
    markMessagesRead,
    getUserStatus,
    onlineUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
