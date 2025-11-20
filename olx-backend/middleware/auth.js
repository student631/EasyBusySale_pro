const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    // Support both 'id' and 'userId' fields for backwards compatibility
    const userId = decoded.id || decoded.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token - user not found'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 * Used for routes that work with or without authentication
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    req.user = null;
    next();
    return;
  }

  try {
    if (!process.env.JWT_SECRET) {
      req.user = null;
      next();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Support both 'id' and 'userId' fields for backwards compatibility
    const userId = decoded.id || decoded.userId;
    const user = await User.findById(userId);
    
    req.user = user || null;
    next();
  } catch (error) {
    // Token is invalid or expired, continue without authentication
    req.user = null;
    next();
  }
};

/**
 * Authorization middleware to check if user owns the resource
 * @param {string} resourceOwnerId - The owner ID from the resource
 */
const authorizeResourceOwner = (resourceOwnerId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (req.user.id !== resourceOwnerId && req.user.id !== parseInt(resourceOwnerId)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

/**
 * Authorization middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // Add admin check logic here if you have an admin role
  // For now, we'll just require authentication
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authorizeResourceOwner,
  requireAdmin
};