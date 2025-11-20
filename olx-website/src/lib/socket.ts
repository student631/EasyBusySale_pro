import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Expose socket to window for debugging
declare global {
  interface Window {
    socket?: Socket | null;
  }
}

export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  console.log('🔌 Initializing socket with URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

  socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling']
  });

  // Expose to window for debugging
  if (typeof window !== 'undefined') {
    window.socket = socket;
    console.log('✅ Socket exposed to window.socket for debugging');
  }

  socket.connect();

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);
    console.log('📤 Emitting authenticate event with token');
    socket?.emit('authenticate', token);
  });

  socket.on('authenticated', (data) => {
    console.log('Socket authenticated for user:', data.userId);
  });

  socket.on('authentication_error', (error) => {
    console.error('Socket authentication error:', error);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinConversation = (conversationId: number | string) => {
  socket?.emit('join_conversation', conversationId);
};

export const leaveConversation = (conversationId: number | string) => {
  socket?.emit('leave_conversation', conversationId);
};

export const sendSocketMessage = (data: {
  conversationId: number;
  receiverId: number;
  messageText: string;
}) => {
  if (!socket) {
    console.error('❌ Cannot send message: socket is null');
    return;
  }
  if (!socket.connected) {
    console.error('❌ Cannot send message: socket is not connected');
    return;
  }
  console.log('📨 Emitting send_message event:', data);
  socket.emit('send_message', data);
  console.log('✅ send_message event emitted successfully');
};

export const emitTyping = (conversationId: number | string, isTyping: boolean) => {
  socket?.emit('typing', { conversationId, isTyping });
};
