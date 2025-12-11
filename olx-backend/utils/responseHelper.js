/**
 * Shared Response Helper Utilities
 * Consolidates duplicate error handling and response patterns
 */

// Standard success response
const successResponse = (res, data, message = null, statusCode = 200) => {
  const response = { success: true };
  if (data !== undefined) response.data = data;
  if (message) response.message = message;
  return res.status(statusCode).json(response);
};

// Standard error response
const errorResponse = (res, error, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: error
  });
};

// Validation error response
const validationError = (res, error, field = null) => {
  const response = { success: false, error };
  if (field) response.field = field;
  return res.status(400).json(response);
};

// Not found error response
const notFoundError = (res, resource = 'Resource') => {
  return res.status(404).json({
    success: false,
    error: `${resource} not found`
  });
};

// Permission denied error response
const forbiddenError = (res, message = 'You do not have permission to access this resource') => {
  return res.status(403).json({
    success: false,
    error: message
  });
};

// Server error response
const serverError = (res, error, isDev = false) => {
  console.error('Server error:', error);
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: isDev ? error.message : undefined
  });
};

// Conflict error response (for duplicate entries)
const conflictError = (res, message = 'Resource already exists') => {
  return res.status(409).json({
    success: false,
    error: message
  });
};

// Handle database errors
const handleDatabaseError = (res, error, isDev = false) => {
  // Handle specific PostgreSQL error codes
  if (error.code === '23505') {
    // Unique constraint violation
    if (error.detail && error.detail.includes('username')) {
      return conflictError(res, 'Username already exists');
    }
    if (error.detail && error.detail.includes('email')) {
      return conflictError(res, 'Email already exists');
    }
    return conflictError(res, 'Database constraint violation');
  }

  // Generic database error
  return serverError(res, error, isDev);
};

module.exports = {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
  forbiddenError,
  serverError,
  conflictError,
  handleDatabaseError
};
