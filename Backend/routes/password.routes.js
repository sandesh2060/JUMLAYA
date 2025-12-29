// ============================================
// Backend/routes/password.routes.js
// Password Reset Routes
// ============================================

const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/password.controller');
const { validateForgotPassword, validateResetPassword } = require('../validators/password.validator');
const rateLimit = require('express-rate-limit');

// =====================================================
// RATE LIMITING (Prevent Brute Force & Spam)
// =====================================================

// Stricter rate limit for forgot password (3 requests per 15 minutes)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for OTP verification (5 attempts per 15 minutes)
const verifyOTPLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many OTP verification attempts. Please try again later.',
  },
});

// Rate limit for password reset (3 attempts per 15 minutes)
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again later.',
  },
});

// =====================================================
// ROUTES
// =====================================================

/**
 * @route   POST /api/password/forgot
 * @desc    Request password reset (sends OTP to email)
 * @access  Public
 */
router.post(
  '/forgot',
  forgotPasswordLimiter,
  validateForgotPassword,
  passwordController.forgotPassword
);

/**
 * @route   POST /api/password/reset
 * @desc    Reset password with OTP
 * @access  Public
 */
router.post(
  '/reset',
  resetPasswordLimiter,
  validateResetPassword,
  passwordController.resetPassword
);

/**
 * @route   POST /api/password/resend-otp
 * @desc    Resend OTP to email
 * @access  Public
 */
router.post(
  '/resend-otp',
  forgotPasswordLimiter,
  validateForgotPassword,
  passwordController.resendOTP
);

/**
 * @route   POST /api/password/verify-otp
 * @desc    Verify OTP (optional - for UI validation before password reset)
 * @access  Public
 */
router.post(
  '/verify-otp',
  verifyOTPLimiter,
  passwordController.verifyOTP
);

module.exports = router;