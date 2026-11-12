import mongoose from 'mongoose';

// Password Validation Rule:
// 8-16 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required and must be a string' };
  }
  if (password.length < 8 || password.length > 16) {
    return { valid: false, message: 'Password must be between 8 and 16 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true };
};

// Rating Validation Rule:
// Whole number between 1 and 5
export const validateRating = (rating) => {
  if (rating === undefined || rating === null || rating === '') {
    return { valid: false, message: 'Rating is required' };
  }
  if (typeof rating !== 'number' || !Number.isFinite(rating)) {
    return { valid: false, message: 'Rating must be a numeric value' };
  }
  if (!Number.isInteger(rating)) {
    return { valid: false, message: 'Rating must be a whole number (integer)' };
  }
  if (rating < 1 || rating > 5) {
    return { valid: false, message: 'Rating must be between 1 and 5' };
  }
  return { valid: true, value: rating };
};

// ObjectId Validation
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Middleware helper to validate request bodies
export const validateRegisterInput = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Name must be at least 2 characters long' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }
  const pwdCheck = validatePassword(password);
  if (!pwdCheck.valid) {
    return res.status(400).json({ success: false, message: pwdCheck.message });
  }
  next();
};
