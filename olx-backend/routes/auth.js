const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Helpful GET endpoints for browser visits
router.get('/', (req, res) => {
  return res.json({ success: true, message: 'Auth routes are up. Use POST /api/auth/signup or POST /api/auth/login.' });
});

router.get('/signup', (req, res) => {
  return res.status(405).json({ success: false, message: 'Use POST /api/auth/signup with JSON body.' });
});

router.get('/login', (req, res) => {
  return res.status(405).json({ success: false, message: 'Use POST /api/auth/login with JSON body.' });
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, full_name, phone, location } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'username, email and password are required' });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const createdUser = await User.create({
      username,
      email,
      password_hash,
      full_name: full_name || null,
      phone: phone || null,
      location: location || null,
    });

    const token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ success: true, user: createdUser, token });
  } catch (error) {
    if (error && error.code === '23505') {
      // Handle duplicate key constraint
      if (error.detail && error.detail.includes('username')) {
        return res.status(409).json({ success: false, message: 'Username already exists' });
      }
      if (error.detail && error.detail.includes('email')) {
        return res.status(409).json({ success: false, message: 'Email already exists' });
      }
      return res.status(409).json({ success: false, message: 'Username or email already exists' });
    }
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const publicUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      location: user.location,
      created_at: user.created_at,
    };

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ success: true, user: publicUser, token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
