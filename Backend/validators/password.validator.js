// ============================================
// Backend/validators/password.validator.js
// 🚫 OTP DISABLED TEMPORARILY
// RE-ENABLE OTP: restore otp + confirmPassword validators in validateResetPassword
// ============================================

const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

exports.validateForgotPassword = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  validate
];

// 🚫 OTP DISABLED: removed otp field requirement
// RE-ENABLE OTP: restore these validators ↓
// body('otp').trim().notEmpty().withMessage('OTP is required')
//   .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
//   .isNumeric().withMessage('OTP must contain only numbers'),
// body('confirmPassword').optional().custom((value, { req }) => {
//   if (value && value !== req.body.newPassword) throw new Error('Passwords do not match');
//   return true;
// }),

exports.validateResetPassword = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('newPassword').trim().notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
  validate
];