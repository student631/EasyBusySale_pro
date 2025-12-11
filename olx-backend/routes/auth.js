const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const validation = require('../middleware/validation');

const router = express.Router();

// Google OAuth client - initialized lazily to ensure env vars are loaded
let googleClient = null;
function getGoogleClient() {
  if (!googleClient && process.env.GOOGLE_CLIENT_ID) {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return googleClient;
}

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

    // Enhanced validation using middleware
    if (!validation.validateUsername(username)) {
      return res.status(400).json({ success: false, error: 'Username is required and must be at least 3 characters long' });
    }

    if (!validation.validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }

    if (!validation.validatePassword(password)) {
      return res.status(400).json({ success: false, error: 'Password is required and must be at least 6 characters long' });
    }

    if (!validation.validateFullName(full_name)) {
      return res.status(400).json({ success: false, error: 'Full name must be at least 2 characters long' });
    }

    if (!validation.validatePhone(phone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format' });
    }

    if (!validation.validateLocation(location)) {
      return res.status(400).json({ success: false, error: 'Location must be at least 2 characters long' });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const createdUser = await User.create({
      username: username.trim(),
      email: email.trim(),
      password_hash,
      full_name: full_name ? full_name.trim() : null,
      phone: phone ? phone.trim() : null,
      location: location ? location.trim() : null,
    });

    const token = jwt.sign(
      { id: createdUser.id, email: createdUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ success: true, user: createdUser, token });
  } catch (error) {
    if (error && error.code === '23505') {
      // Handle duplicate key constraint
      if (error.detail && error.detail.includes('username')) {
        return res.status(409).json({ success: false, error: 'Username already exists' });
      }
      if (error.detail && error.detail.includes('email')) {
        return res.status(409).json({ success: false, error: 'Email already exists' });
      }
      return res.status(409).json({ success: false, error: 'Username or email already exists' });
    }
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Enhanced validation using middleware
    if (!validation.validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    if (!validation.validatePassword(password)) {
      return res.status(400).json({ success: false, message: 'Password is required and must be at least 6 characters long' });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const user = await User.findByEmail(email.trim());
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
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ success: true, user: publicUser, token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/auth/google - Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, error: 'Google credential is required' });
    }

    // Check if Google Client ID is configured
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID not configured');
      return res.status(500).json({ success: false, error: 'Google OAuth is not configured' });
    }

    // Verify the Google token
    let ticket;
    try {
      const client = getGoogleClient();
      if (!client) {
        return res.status(500).json({ success: false, error: 'Google OAuth client not initialized' });
      }
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError);
      return res.status(401).json({ success: false, error: 'Invalid Google credential' });
    }

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email not provided by Google' });
    }

    // Check if user exists
    let user = await User.findByEmail(email);

    if (user) {
      // Existing user - log them in
      console.log('Google login: existing user found:', email);
    } else {
      // Create new user with Google info
      console.log('Google login: creating new user:', email);

      // Generate a unique username from email
      const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      let username = baseUsername;
      let counter = 1;

      // Check if username exists and generate unique one
      while (await User.findByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Create user without password (Google-only account)
      const randomPassword = require('crypto').randomBytes(32).toString('hex');
      const password_hash = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        username: username,
        email: email,
        password_hash: password_hash,
        full_name: name || null,
        phone: null,
        location: null,
        google_id: googleId,
        avatar_url: picture || null,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const publicUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      location: user.location,
      created_at: user.created_at,
    };

    return res.json({ success: true, user: publicUser, token });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
