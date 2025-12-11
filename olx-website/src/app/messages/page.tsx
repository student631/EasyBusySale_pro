'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { MessageSquare, Send, Search, ArrowLeft, User, Check, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { getImageProps, getFirstImageUrl } from '@/lib/imageUtils';

interface Conversation {
  id: string;
  ad_id: string;
  ad_title: string;
  ad_price: string;
  ad_images: string[];
  buyer_name: string;
  seller_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  buyer_id: number;
  seller_id: number;
}

interface Message {
  id: string;
  sender_id: number;
  sender_name: string;
  message_text: string;
  created_at: string;
  is_read: boolean;
}

export default function MessagesPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const { socket, joinConversation, leaveConversation, sendMessage, emitTyping, markMessagesRead, onlineUsers } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [readReceipts, setReadReceipts] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchConversationsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingClearTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (data: any) => {
      console.log('📨 Received new_message event:', data);

      // Convert both to numbers for comparison to avoid string vs number mismatch
      const incomingConvId = typeof data.conversationId === 'string' ? parseInt(data.conversationId) : data.conversationId;
      const currentConvId = selectedConversation?.id ? parseInt(selectedConversation.id) : null;

      console.log(`🔍 Comparing conversations - Incoming: ${incomingConvId}, Current: ${currentConvId}`);

      if (incomingConvId === currentConvId) {
        console.log('✅ Message is for current conversation, adding to UI');
        const newMsg: Message = {
          id: data.id || Date.now().toString(),
          sender_id: data.senderId,
          sender_name: data.senderId === user?.id ? 'You' : 'Other',
          message_text: data.messageText,
          created_at: data.createdAt || data.timestamp,
          is_read: data.isRead || false
        };
        setMessages(prev => [...prev, newMsg]);

        // Mark messages as read if from other user
        if (data.senderId !== user?.id && selectedConversation) {
          markMessagesRead(parseInt(selectedConversation.id), data.senderId);
        }
      } else {
        console.log('⚠️ Message is for a different conversation, not displaying');
      }
      // Refresh conversations list to update last message
      fetchConversations();
    };

    // Listen for typing indicator with auto-clear after 3 seconds
    const handleUserTyping = (data: any) => {
      if (data.userId !== user?.id) {
        // Clear any existing timeout for this user
        const existingTimeout = typingClearTimeoutRef.current.get(data.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          typingClearTimeoutRef.current.delete(data.userId);
        }

        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
            // Auto-clear typing indicator after 3 seconds if no update
            const timeout = setTimeout(() => {
              setTypingUsers(p => {
                const cleared = new Set(p);
                cleared.delete(data.userId);
                return cleared;
              });
              typingClearTimeoutRef.current.delete(data.userId);
            }, 3000);
            typingClearTimeoutRef.current.set(data.userId, timeout);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      }
    };

    // Listen for new message notifications
    const handleNewMessageNotification = () => {
      fetchConversations();
    };

    // Listen for read receipts
    const handleMessagesRead = (data: { conversationId: string; readBy: number }) => {
      // Convert both to numbers for comparison
      const incomingConvId = typeof data.conversationId === 'string' ? parseInt(data.conversationId) : data.conversationId;
      const currentConvId = selectedConversation?.id ? parseInt(selectedConversation.id) : null;

      if (incomingConvId === currentConvId) {
        setReadReceipts(prev => ({ ...prev, [data.conversationId]: true }));
        // Update messages to show as read
        setMessages(prev => prev.map(msg =>
          msg.sender_id === user?.id ? { ...msg, is_read: true } : msg
        ));
      }
    };

    // Listen for message sent acknowledgment
    const handleMessageSent = (data: { success: boolean; messageId: string; timestamp: string }) => {
      if (data.success) {
        console.log('✅ Message sent successfully:', data.messageId);
      }
    };

    // Listen for message errors
    const handleMessageError = (data: { message: string; error: string }) => {
      console.error('❌ Message error:', data);
      alert(data.message);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('new_message_notification', handleNewMessageNotification);
    socket.on('messages_read', handleMessagesRead);
    socket.on('message_sent', handleMessageSent);
    socket.on('message_error', handleMessageError);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('new_message_notification', handleNewMessageNotification);
      socket.off('messages_read', handleMessagesRead);
      socket.off('message_sent', handleMessageSent);
      socket.off('message_error', handleMessageError);
    };
  }, [socket, selectedConversation, user]);

  // Fetch conversations
  useEffect(() => {
    if (!loading && isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, loading]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const convId = parseInt(selectedConversation.id);
      console.log(`🚪 Joining conversation ${convId}`);

      fetchMessages(selectedConversation.id);
      joinConversation(convId);

      // Mark messages as read
      const otherUserId = user?.id === selectedConversation.buyer_id
        ? selectedConversation.seller_id
        : selectedConversation.buyer_id;
      markMessagesRead(convId, otherUserId);

      return () => {
        console.log(`🚪 Leaving conversation ${convId}`);
        leaveConversation(convId);
      };
    }
  }, [selectedConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup all timeouts on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (fetchConversationsTimeoutRef.current) {
        clearTimeout(fetchConversationsTimeoutRef.current);
      }
      // Clear all typing indicator timeouts
      typingClearTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      typingClearTimeoutRef.current.clear();
    };
  }, []);

  const fetchConversations = async () => {
    try {
      console.log('📞 Fetching conversations...');
      setLoadingConversations(true);
      const response = await apiClient.getConversations();
      console.log('📥 Conversations response:', response);

      // Check for authentication error
      if (!response.success && response.error) {
        console.error('❌ Error fetching conversations:', response.error);
        if (response.error.includes('Authentication') || response.error.includes('token')) {
          alert('Your session has expired. Please login again.');
        }
        setConversations([]);
        return;
      }

      if (response.success) {
        // Handle different response structures
        let conversationsData = null;

        // Check multiple possible locations for conversations array
        if ((response as any).conversations) {
          // Backend sends: {success: true, conversations: [...]}
          conversationsData = (response as any).conversations;
          console.log('✅ Found conversations at root level:', conversationsData.length);
        } else if (response.data && (response.data as any).conversations) {
          // Wrapped: {success: true, data: {conversations: [...]}}
          conversationsData = (response.data as any).conversations;
          console.log('✅ Found conversations in data.conversations:', conversationsData.length);
        } else if (response.data && Array.isArray(response.data)) {
          // Array directly: {success: true, data: [...]}
          conversationsData = response.data;
          console.log('✅ Found conversations as data array:', conversationsData.length);
        }

        if (conversationsData && Array.isArray(conversationsData)) {
          console.log('📊 Setting conversations:', conversationsData);
          setConversations(conversationsData);
          if (conversationsData.length > 0 && !selectedConversation) {
            console.log('🎯 Auto-selecting first conversation');
            setSelectedConversation(conversationsData[0]);
          }
        } else {
          console.log('⚠️ No conversations data found');
          setConversations([]);
        }
      } else {
        console.log('⚠️ Response not successful');
        setConversations([]);
      }
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const response = await apiClient.getMessages(conversationId);

      if (response.success && response.data) {
        const messagesData = (response.data as any).messages || [];
        setMessages(messagesData);
        // Mark messages as read
        await apiClient.markMessagesAsRead(conversationId);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = Array.isArray(conversations) ? conversations.filter(conv =>
    conv.ad_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.seller_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);
      const otherUserId = user?.id === selectedConversation.buyer_id
        ? selectedConversation.seller_id
        : selectedConversation.buyer_id;

      const messageText = newMessage.trim();
      const convId = parseInt(selectedConversation.id);

      console.log(`📤 Sending message: convId=${convId}, receiverId=${otherUserId}, text="${messageText}"`);
      setNewMessage('');

      // Send via WebSocket (now persists automatically in backend)
      sendMessage({
        conversationId: convId,
        receiverId: otherUserId,
        messageText: messageText
      });
      console.log('✅ Message sent via WebSocket');

      // Stop typing indicator
      emitTyping(parseInt(selectedConversation.id), false);
      setIsTyping(false);

      // Add message to local state immediately for better UX
      const newMsg: Message = {
        id: Date.now().toString(),
        sender_id: user?.id || 0,
        sender_name: user?.username || 'You',
        message_text: messageText,
        created_at: new Date().toISOString(),
        is_read: false
      };
      setMessages(prev => [...prev, newMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);

    if (!selectedConversation) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing start event
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      emitTyping(parseInt(selectedConversation.id), true);
    }

    // Set timeout to stop typing
    if (text.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        emitTyping(parseInt(selectedConversation.id), false);
      }, 2000);
    } else {
      setIsTyping(false);
      emitTyping(parseInt(selectedConversation.id), false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getOtherUserName = (conv: Conversation) => {
    if (!user) return '';
    return user.id === conv.buyer_id ? conv.seller_name : conv.buyer_name;
  };

  const getOtherUserId = (conv: Conversation) => {
    if (!user) return 0;
    return user.id === conv.buyer_id ? conv.seller_id : conv.buyer_id;
  };

  const isUserOnline = (userId: number) => {
    return onlineUsers.has(userId);
  };

  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please login to view your messages</h1>
          <p className="text-gray-600 mb-6">Connect with buyers and sellers securely</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-700 underline">
            Login here
          </Link>
        </div>
      </div>
    );
  }

  if (loadingConversations) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-500 mr-3" />
            Messages
          </h1>
          <p className="text-gray-600 mt-2">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className={`lg:col-span-1 ${showMobileChat ? 'hidden lg:block' : 'block'}`}>
            <Card className="h-full flex flex-col">
              <CardContent className="p-4 flex-1 flex flex-col">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No conversations yet</p>
                      <p className="text-sm text-gray-400">Start messaging about ads to see conversations here</p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => {
                          setSelectedConversation(conversation);
                          setShowMobileChat(true);
                        }}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedConversation?.id === conversation.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Ad Image */}
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              {...getImageProps(
                                getFirstImageUrl(conversation.ad_images, 'Electronics'),
                                conversation.ad_title
                              )}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {getOtherUserName(conversation)}
                                </p>
                                {isUserOnline(getOtherUserId(conversation)) && (
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  </div>
                                )}
                              </div>
                              {conversation.unread_count > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mb-1 truncate">
                              {conversation.ad_title}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.last_message || 'No messages yet'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {conversation.last_message_time ? formatTime(conversation.last_message_time) : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className={`lg:col-span-2 ${!showMobileChat ? 'hidden lg:block' : 'block'}`}>
            {selectedConversation ? (
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b bg-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMobileChat(false)}
                        className="lg:hidden"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div className="relative w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                        {isUserOnline(getOtherUserId(selectedConversation)) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {getOtherUserName(selectedConversation)}
                          </h3>
                          {isUserOnline(getOtherUserId(selectedConversation)) && (
                            <span className="text-xs text-green-600 font-medium">Online</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          About: {selectedConversation.ad_title}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        ₹{parseInt(selectedConversation.ad_price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No messages yet</p>
                      <p className="text-sm text-gray-400">Start the conversation!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === user?.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message_text}</p>
                            <div className="flex items-center justify-between mt-1 space-x-2">
                              <p
                                className={`text-xs ${
                                  message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {formatTime(message.created_at)}
                              </p>
                              {message.sender_id === user?.id && (
                                <div className="flex items-center">
                                  {message.is_read ? (
                                    <CheckCheck className="h-3 w-3 text-blue-100" />
                                  ) : (
                                    <Check className="h-3 w-3 text-blue-100" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {typingUsers.size > 0 && (
                        <div className="flex justify-start">
                          <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                            <p className="text-sm italic text-gray-500">typing...</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-white rounded-b-lg">
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                      disabled={sendingMessage}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a conversation to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}