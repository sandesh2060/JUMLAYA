// ============================================
// Backend/middlewares/validate.middleware.js
// Express-validator middleware for request validation
// ============================================
const { validationResult } = require('express-validator');

/**
 * Middleware to validate request using express-validator
 * Checks for validation errors and returns formatted error response
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format errors for better readability
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));
    
    // Log validation errors in development
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Validation Error:', JSON.stringify(formattedErrors, null, 2));
    }
    
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: formattedErrors
    });
  }
  
  // No validation errors, proceed to next middleware
  next();
};

/**
 * Alternative: Validate and throw error (for use with error handler)
 */
exports.validateAndThrow = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.errors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return next(error);
  }
  
  next();
};