// Backend/middlewares/rateLimit.middleware.js
const rateLimit = require("express-rate-limit");

// ============================================
// GENERAL API RATE LIMITER (Relaxed for development)
// ============================================
const isDev = process.env.NODE_ENV === "development";
const apiLimiter = isDev
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // ✅ Increased from 100 to 1000 requests per window
      message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
      },
      standardHeaders: true, // Return rate limit info in headers
      legacyHeaders: false, // Disable X-RateLimit headers
      // Skip rate limiting in development
      skip: (req) => process.env.NODE_ENV === "development",
    });

// ============================================
// AUTH RATE LIMITER (Stricter for security)
// ============================================
const authLimiter = isDev
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 requests per 15 minutes
      message: {
        success: false,
        message: "Too many authentication attempts, please try again later.",
      },
      skipSuccessfulRequests: true, // Don't count successful requests
      // Skip in development
      skip: (req) => process.env.NODE_ENV === "development",
    });

// ============================================
// PAYMENT RATE LIMITER
// ============================================
const paymentLimiter = isDev
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20, // 20 payment requests per hour
      message: {
        success: false,
        message: "Too many payment requests, please try again later.",
      },
      // Skip in development
      skip: (req) => process.env.NODE_ENV === "development",
    });

// ============================================
// ADMIN RATE LIMITER (More lenient for admin operations)
// ============================================
const adminLimiter = isDev
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 2000, // ✅ Very high limit for admin operations
      message: {
        success: false,
        message: "Too many admin requests, please try again later.",
      },
      // Skip in development
      skip: (req) => process.env.NODE_ENV === "development",
    });

// ============================================
// OTP RATE LIMITER (Very strict)
// ============================================
const otpLimiter = isDev
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Only 5 OTP requests per 15 minutes
      message: {
        success: false,
        message: "Too many OTP requests, please try again after 15 minutes.",
      },
      skipSuccessfulRequests: false,
    });

module.exports = {
  apiLimiter,
  authLimiter,
  paymentLimiter,
  adminLimiter,
  otpLimiter,
};
