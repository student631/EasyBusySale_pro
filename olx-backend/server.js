const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config({ path: './config.env' });
const initializeDatabase = require('./init-database');
const adsRoutes = require('./routes/ads');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const aiRoutes = require('./routes/ai');
const statsRoutes = require('./routes/stats');
const favoritesRoutes = require('./routes/favorites');
const messagesRoutes = require('./routes/messages');
const notificationsRoutes = require('./routes/notifications');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Add connection logging middleware
io.use((socket, next) => {
  console.log('🔗 Socket.IO middleware - New connection attempt from:', socket.handshake.address);
  next();
});
const PORT = process.env.PORT || 5000;

// Middleware
// ...existing code...
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'expires', 'cache-control', 'pragma', 'x-requested-with'],
  credentials: false
}));
// ...existing code...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to OLX Backend API!' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Temporary mock data for testing frontend connection (Texas market)
const mockAds = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max',
    price: '$1,100',
    location: 'Austin, TX',
    category: 'electronics',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop'],
    description: 'Brand new iPhone 15 Pro Max, 256GB, Space Black'
  },
  {
    id: '2',
    title: 'Ford F-150 XLT 2021',
    price: '$35,000',
    location: 'Dallas, TX',
    category: 'vehicles',
    images: ['https://images.unsplash.com/photo-1549924231-f129b911e442?w=300&h=200&fit=crop'],
    description: 'Well maintained Ford F-150 2021 model, low miles'
  }
];

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/ads', adsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// WebSocket connection handling
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const userSockets = new Map(); // Map to store userId -> socketId

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Debug: Log all events received
  socket.onAny((eventName, ...args) => {
    console.log(`📡 Event received: "${eventName}" from socket ${socket.id}`);
  });

  // Authenticate user
  socket.on('authenticate', (token) => {
    try {
      console.log('🔐 Authentication attempt with token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      userSockets.set(decoded.id, socket.id);
      socket.emit('authenticated', { userId: decoded.id });
      console.log(`✅ User ${decoded.id} authenticated successfully`);

      // Broadcast user online status
      io.emit('user_status_change', {
        userId: decoded.id,
        status: 'online'
      });
    } catch (error) {
      socket.emit('authentication_error', { message: 'Invalid token' });
    }
  });

  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`Socket ${socket.id} left conversation ${conversationId}`);
  });

  // Handle new message
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, receiverId, messageText } = data;
      console.log(`📨 Message received from User ${socket.userId} to User ${receiverId} in conversation ${conversationId}`);

      // Check if user is authenticated
      if (!socket.userId) {
        console.error('❌ ERROR: socket.userId is undefined! User not authenticated.');
        socket.emit('message_error', {
          message: 'Not authenticated. Please refresh the page.',
          error: 'USER_NOT_AUTHENTICATED'
        });
        return;
      }

      // Persist message to database
      const savedMessage = await Message.create(
        conversationId,
        socket.userId,
        receiverId,
        messageText
      );
      console.log(`✅ Message saved to database with ID: ${savedMessage.id}`);

      // Prepare message data with database info
      const messageData = {
        id: savedMessage.id,
        conversationId,
        senderId: socket.userId,
        receiverId,
        messageText,
        isRead: false,
        createdAt: savedMessage.created_at
      };

      // Broadcast to conversation room
      const roomName = `conversation_${conversationId}`;
      const roomSockets = io.sockets.adapter.rooms.get(roomName);
      console.log(`🔊 Broadcasting to room ${roomName}, members: ${roomSockets ? roomSockets.size : 0}`);
      io.to(roomName).emit('new_message', messageData);

      // Send acknowledgment to sender
      socket.emit('message_sent', {
        success: true,
        messageId: savedMessage.id,
        timestamp: savedMessage.created_at
      });

      // Notify receiver if they're online but not in the conversation
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        // Create notification
        await Notification.create(
          receiverId,
          'message',
          'New Message',
          messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''),
          conversationId
        );

        // Send notification via socket
        io.to(receiverSocketId).emit('new_message_notification', {
          conversationId,
          senderId: socket.userId,
          messageText: messageText.substring(0, 50)
        });

        // Emit new_notification event for real-time notification updates
        io.to(receiverSocketId).emit('new_notification', {
          type: 'message',
          conversationId,
          message: messageText.substring(0, 50)
        });
      }
    } catch (error) {
      console.error('Error handling send_message:', error);
      socket.emit('message_error', {
        message: 'Failed to send message',
        error: error.message
      });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { conversationId, isTyping } = data;
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId: socket.userId,
      isTyping
    });
  });

  // Handle marking messages as read
  socket.on('mark_messages_read', async (data) => {
    try {
      const { conversationId, senderId } = data;

      // Mark messages as read in database
      await Message.markAsRead(conversationId, socket.userId);

      // Notify the sender that their messages were read
      const senderSocketId = userSockets.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messages_read', {
          conversationId,
          readBy: socket.userId
        });
      }

      // Acknowledge to the reader
      socket.emit('messages_marked_read', {
        success: true,
        conversationId
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      socket.emit('mark_read_error', {
        message: 'Failed to mark messages as read',
        error: error.message
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);

      // Broadcast user offline status
      io.emit('user_status_change', {
        userId: socket.userId,
        status: 'offline'
      });
    }
    console.log('Client disconnected:', socket.id);
  });

  // Handle explicit online status request
  socket.on('get_user_status', (userId) => {
    const isOnline = userSockets.has(userId);
    socket.emit('user_status', {
      userId,
      status: isOnline ? 'online' : 'offline'
    });
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Try to initialize database tables (optional for now)
    console.log('Attempting to connect to database...');
    try {
      await initializeDatabase();
      console.log('✅ Database connected successfully!');
    } catch (dbError) {
      console.log('⚠️  Database connection failed, running without database');
      console.log('Database error:', dbError.message);
    }

    // Start server regardless of database connection
    server.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log('🔌 WebSocket server is ready!');
      console.log('📝 Backend is ready for frontend connection!');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, io };
