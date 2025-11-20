const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.message
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }

  // Handle database errors
  if (err.code === '23505') {
    let field = 'Unknown field';
    if (err.detail) {
      if (err.detail.includes('username')) field = 'Username';
      else if (err.detail.includes('email')) field = 'Email';
      else if (err.detail.includes('title')) field = 'Title';
    }
    
    return res.status(409).json({
      success: false,
      error: `${field} already exists`
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'Foreign key constraint violation'
    });
  }

  if (err.code === '23502') {
    return res.status(400).json({
      success: false,
      error: 'Not null constraint violation'
    });
  }

  // Handle file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File size too large'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      error: 'Too many files uploaded'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Unexpected file type'
    });
  }

  // Handle multer errors
  if (err.message && err.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      success: false,
      error: 'Only image files are allowed'
    });
  }

  // Handle custom validation errors
  if (err.message && err.message.includes('Invalid')) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }
    next();
  };
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    method: req.method,
    path: req.path
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  validateRequest,
  notFoundHandler
};