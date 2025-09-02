const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Mock ads route
app.get('/api/ads', (req, res) => {
  const { limit = 20 } = req.query;
  
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

  res.json({
    success: true,
    ads: mockAds.slice(0, parseInt(limit)),
    total: mockAds.length,
    limit: parseInt(limit)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Test server is running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log('📝 Backend is ready for frontend connection!');
});
