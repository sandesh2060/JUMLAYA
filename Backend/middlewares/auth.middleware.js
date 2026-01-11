// ============================================
// Backend/middlewares/auth.middleware.js
// Authentication & Authorization Middleware
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Protect routes - Verify JWT token
 */
const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1) Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
  }

  try {
    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+active');
    
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Check if user is active
    if (currentUser.active === false) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    // 5) Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password. Please log in again.', 401));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    return next(error);
  }
});

/**
 * Restrict to specific roles
 * Usage: restrictTo('admin', 'moderator')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array like ['admin', 'moderator']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

/**
 * Check if user is admin
 */
const isAdmin = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Please log in first', 401));
  }

  if (req.user.role !== 'admin' && !req.user.isAdmin) {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }

  next();
});

/**
 * Check if user is rider
 */
const isRider = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Please log in first', 401));
  }

  if (req.user.role !== 'rider') {
    return next(new AppError('Access denied. Rider privileges required.', 403));
  }

  next();
});

/**
 * Optional authentication - Don't throw error if not authenticated
 * Just attach user to req if token is valid
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    
    if (currentUser) {
      req.user = currentUser;
    }
  } catch (error) {
    // Silently fail for optional auth
    console.log('Optional auth failed:', error.message);
  }

  next();
});

/**
 * Verify email token
 */
const verifyEmailToken = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return next(new AppError('Email verification token is required', 400));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.isEmailVerified) {
      return next(new AppError('Email already verified', 400));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired verification token', 400));
  }
});

/**
 * Check account ownership
 * User can only access their own resources
 */
const checkOwnership = catchAsync(async (req, res, next) => {
  const userId = req.params.userId || req.params.id;

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  // Admin can access any resource
  if (req.user.role === 'admin' || req.user.isAdmin) {
    return next();
  }

  // Check if user is accessing their own resource
  if (req.user._id.toString() !== userId) {
    return next(new AppError('You can only access your own resources', 403));
  }

  next();
});

/**
 * Rate limiting per user
 * Track API calls per user
 */
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const userRequests = requests.get(userId) || [];

    // Filter out old requests
    const recentRequests = userRequests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return next(new AppError('Too many requests. Please try again later.', 429));
    }

    recentRequests.push(now);
    requests.set(userId, recentRequests);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      for (const [key, value] of requests.entries()) {
        if (value.length === 0 || now - value[value.length - 1] > windowMs) {
          requests.delete(key);
        }
      }
    }

    next();
  };
};

// ============================================
// ✅ EXPORTS - Fixed to include 'authenticate'
// ============================================
module.exports = {
  protect,
  authenticate: protect, // ✅ ADDED: authenticate is an alias for protect
  restrictTo,
  isAdmin,
  isRider,
  optionalAuth,
  verifyEmailToken,
  checkOwnership,
  userRateLimit
};