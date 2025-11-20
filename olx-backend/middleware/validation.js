const validationMiddleware = {
  // Validate email format
  validateEmail: (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  // Validate phone number format
  validatePhone: (phone) => {
    if (!phone || phone === null || phone === '') return true; // Optional
    if (typeof phone !== 'string') return false;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone.trim());
  },

  // Validate password strength
  validatePassword: (password) => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 6;
  },

  // Validate username
  validateUsername: (username) => {
    if (!username || typeof username !== 'string') return false;
    return username.trim().length >= 3;
  },

  // Validate title length
  validateTitle: (title) => {
    if (!title || typeof title !== 'string') return false;
    return title.trim().length >= 3;
  },

  // Validate description length
  validateDescription: (description) => {
    if (!description || typeof description !== 'string') return false;
    return description.trim().length >= 10;
  },

  // Validate price
  validatePrice: (price) => {
    if (price === undefined || price === null || price === '') return false;
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice > 0;
  },

  // Validate location
  validateLocation: (location) => {
    if (!location || typeof location !== 'string') return false;
    return location.trim().length >= 2;
  },

  // Validate full name
  validateFullName: (fullName) => {
    if (!fullName || fullName === null || fullName === '') return true; // Optional
    if (typeof fullName !== 'string') return false;
    return fullName.trim().length >= 2;
  },

  // Validate condition type
  validateCondition: (condition) => {
    if (!condition || condition === null || condition === '') return true; // Optional
    const validConditions = ['new', 'like-new', 'good', 'fair', 'poor', 'used'];
    return validConditions.includes(condition);
  },

  // Validate images array
  validateImages: (images) => {
    if (!images || !Array.isArray(images)) return false;
    return images.length <= 5; // Max 5 images
  },

  // Sanitize string input
  sanitizeString: (input) => {
    if (!input || typeof input !== 'string') return input;
    return input.trim();
  },

  // Sanitize number input
  sanitizeNumber: (input) => {
    if (input === undefined || input === null || input === '') return input;
    const num = parseFloat(input);
    return isNaN(num) ? input : num;
  },

  // Error response helper
  createValidationError: (field, message) => {
    return {
      success: false,
      error: message,
      field: field
    };
  }
};

module.exports = validationMiddleware;