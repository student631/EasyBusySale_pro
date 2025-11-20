// Frontend validation utilities

export interface ValidationErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export class FormValidator {
  // Email validation
  static validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  // Phone number validation
  static validatePhone(phone: string): boolean {
    if (!phone || phone.trim() === '') return true; // Optional
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone.trim());
  }

  // Password validation
  static validatePassword(password: string): boolean {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 6;
  }

  // Username validation
  static validateUsername(username: string): boolean {
    if (!username || typeof username !== 'string') return false;
    return username.trim().length >= 3;
  }

  // Title validation
  static validateTitle(title: string): boolean {
    if (!title || typeof title !== 'string') return false;
    return title.trim().length >= 3;
  }

  // Description validation
  static validateDescription(description: string): boolean {
    if (!description || typeof description !== 'string') return false;
    return description.trim().length >= 10;
  }

  // Price validation
  static validatePrice(price: string | number): boolean {
    if (price === undefined || price === null || price === '') return false;
    const numPrice = parseFloat(price.toString());
    return !isNaN(numPrice) && numPrice > 0;
  }

  // Location validation
  static validateLocation(location: string): boolean {
    if (!location || typeof location !== 'string') return false;
    return location.trim().length >= 2;
  }

  // Full name validation
  static validateFullName(fullName: string): boolean {
    if (!fullName || fullName.trim() === '') return true; // Optional
    return fullName.trim().length >= 2;
  }

  // Condition validation
  static validateCondition(condition: string): boolean {
    if (!condition || condition.trim() === '') return true; // Optional
    const validConditions = ['new', 'like-new', 'good', 'fair', 'poor', 'used'];
    return validConditions.includes(condition);
  }

  // Images validation
  static validateImages(images: File[]): boolean {
    if (!images || !Array.isArray(images)) return false;
    return images.length <= 5; // Max 5 images
  }

  // Validate signup form
  static validateSignupForm(formData: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
    location?: string;
  }): ValidationResult {
    const errors: ValidationErrors = {};

    if (!this.validateUsername(formData.username)) {
      errors.username = 'Username is required and must be at least 3 characters long';
    }

    if (!this.validateEmail(formData.email)) {
      errors.email = 'Valid email is required';
    }

    if (!this.validatePassword(formData.password)) {
      errors.password = 'Password is required and must be at least 6 characters long';
    }

    if (formData.full_name !== undefined && !this.validateFullName(formData.full_name)) {
      errors.full_name = 'Full name must be at least 2 characters long';
    }

    if (formData.phone !== undefined && formData.phone !== '' && !this.validatePhone(formData.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    if (formData.location !== undefined && formData.location !== '' && !this.validateLocation(formData.location)) {
      errors.location = 'Location must be at least 2 characters long';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate login form
  static validateLoginForm(formData: {
    email: string;
    password: string;
  }): ValidationResult {
    const errors: ValidationErrors = {};

    if (!this.validateEmail(formData.email)) {
      errors.email = 'Valid email is required';
    }

    if (!this.validatePassword(formData.password)) {
      errors.password = 'Password is required and must be at least 6 characters long';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate ad form
  static validateAdForm(formData: {
    title: string;
    description: string;
    price: string;
    category: string;
    location: string;
    condition?: string;
    contact_phone?: string;
    contact_email?: string;
    images?: File[];
  }): ValidationResult {
    const errors: ValidationErrors = {};

    if (!this.validateTitle(formData.title)) {
      errors.title = 'Title is required and must be at least 3 characters long';
    }

    if (!this.validateDescription(formData.description)) {
      errors.description = 'Description is required and must be at least 10 characters long';
    }

    if (!this.validatePrice(formData.price)) {
      errors.price = 'Price is required and must be a positive number';
    }

    if (!formData.category || formData.category.trim() === '') {
      errors.category = 'Category is required';
    }

    if (!this.validateLocation(formData.location)) {
      errors.location = 'Location is required and must be at least 2 characters long';
    }

    if (formData.condition !== undefined && !this.validateCondition(formData.condition)) {
      errors.condition = 'Invalid condition type';
    }

    if (formData.contact_phone !== undefined && formData.contact_phone !== '' && !this.validatePhone(formData.contact_phone)) {
      errors.contact_phone = 'Invalid phone number format';
    }

    if (formData.contact_email !== undefined && formData.contact_email !== '' && !this.validateEmail(formData.contact_email)) {
      errors.contact_email = 'Invalid email format';
    }

    if (formData.images && !this.validateImages(formData.images)) {
      errors.images = 'Maximum 5 images allowed';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate profile form
  static validateProfileForm(formData: {
    full_name?: string;
    phone?: string;
    location?: string;
  }): ValidationResult {
    const errors: ValidationErrors = {};

    if (formData.full_name !== undefined && formData.full_name !== '' && !this.validateFullName(formData.full_name)) {
      errors.full_name = 'Full name must be at least 2 characters long';
    }

    if (formData.phone !== undefined && formData.phone !== '' && !this.validatePhone(formData.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    if (formData.location !== undefined && formData.location !== '' && !this.validateLocation(formData.location)) {
      errors.location = 'Location must be at least 2 characters long';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Sanitize string input
  static sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') return input;
    return input.trim();
  }

  // Sanitize number input
  static sanitizeNumber(input: string): number | string {
    if (input === undefined || input === null || input === '') return input;
    const num = parseFloat(input);
    return isNaN(num) ? input : num;
  }
}