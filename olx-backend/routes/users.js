const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const validation = require('../middleware/validation');

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { full_name, phone, location } = req.body;

    // Enhanced validation using middleware
    if (!validation.validateFullName(full_name)) {
      return res.status(400).json({
        success: false,
        error: 'Full name must be at least 2 characters long'
      });
    }

    if (!validation.validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }

    if (!validation.validateLocation(location)) {
      return res.status(400).json({
        success: false,
        error: 'Location must be at least 2 characters long'
      });
    }
    
    const updateData = {
      ...(full_name !== undefined && { full_name: full_name ? full_name.trim() : null }),
      ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
      ...(location !== undefined && { location: location ? location.trim() : null })
    };
    
    const updatedUser = await User.update(req.user.id, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    // Handle specific database errors
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Database constraint violation'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile'
    });
  }
});

// Get user by ID (public profile)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Return only public information
    const publicUser = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      location: user.location,
      created_at: user.created_at
    };

    res.json({
      success: true,
      data: publicUser
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

module.exports = router;