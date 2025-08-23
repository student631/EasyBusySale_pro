const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });
const initializeDatabase = require('./init-database');
const adsRoutes = require('./routes/ads');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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

// Temporary mock data for testing frontend connection
const mockAds = [
  {
    id: '1',
    title: 'iPhone 14 Pro Max',
    price: '₹85,000',
    location: 'Mumbai, Maharashtra',
    category: 'mobiles',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop'],
    description: 'Brand new iPhone 14 Pro Max, 256GB, Space Black'
  },
  {
    id: '2',
    title: 'Toyota Camry 2020',
    price: '₹25,00,000',
    location: 'Delhi, India',
    category: 'cars',
    images: ['https://images.unsplash.com/photo-1549924231-f129b911e442?w=300&h=200&fit=crop'],
    description: 'Well maintained Toyota Camry 2020 model'
  }
];

// API Routes
app.use('/api/ads', adsRoutes);
app.use('/api/auth', authRoutes);

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
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log('📝 Backend is ready for frontend connection!');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
