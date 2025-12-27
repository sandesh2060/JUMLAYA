// ============================================
// Backend/validators/user.validator.js - FIXED
// ✅ Matches your controller and RegisterForm
// ============================================
const { body, param } = require('express-validator');

// ============================================
// REGISTRATION VALIDATOR - FIXED
// ============================================
exports.registerValidator = [
  // ✅ FIX: Changed from 'fullName' to 'firstname' + 'lastname'
  body('firstname')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('lastname')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  // ✅ FIX: Added username validation
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
    .toLowerCase(),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9]{10,15}$/).withMessage('Phone number must be 10-15 digits'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  
  // ✅ ADDED: Role validation
  body('role')
    .optional()
    .isIn(['customer', 'rider']).withMessage('Role must be either customer or rider'),
  
  // ✅ ADDED: Rider profile validation (conditional)
  body('riderProfile')
    .optional()
    .isObject().withMessage('Rider profile must be an object'),
  
  body('riderProfile.vehicleType')
    .optional()
    .isIn(['bike', 'scooter', 'bicycle', 'car']).withMessage('Invalid vehicle type'),
  
  body('riderProfile.vehicleNumber')
    .if(body('role').equals('rider'))
    .notEmpty().withMessage('Vehicle number is required for riders')
    .trim(),
  
  body('riderProfile.licenseNumber')
    .if(body('role').equals('rider'))
    .notEmpty().withMessage('License number is required for riders')
    .trim()
];

// ============================================
// OTP VALIDATORS
// ============================================
exports.verifyOTPValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email'),
  
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers')
];

exports.resendOTPValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email')
];

// ============================================
// LOGIN VALIDATOR
// ============================================
exports.loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

// ============================================
// PROFILE UPDATE VALIDATOR
// ============================================
exports.updateProfileValidator = [
  body('firstname')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name can only contain letters'),
  
  body('lastname')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name can only contain letters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10,15}$/).withMessage('Phone number must be 10-15 digits')
];

// ============================================
// PASSWORD VALIDATORS
// ============================================
exports.changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  
  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match')
];

exports.forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email')
];

exports.resetPasswordValidator = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  
  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match')
];

// ============================================
// ADDRESS VALIDATORS
// ============================================
exports.addAddressValidator = [
  body('label')
    .optional()
    .isIn(['home', 'office', 'other']).withMessage('Label must be home, office, or other'),
  
  body('street')
    .trim()
    .notEmpty().withMessage('Street address is required')
    .isLength({ min: 5, max: 200 }).withMessage('Street must be 5-200 characters'),
  
  body('city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ min: 2, max: 50 }).withMessage('City must be 2-50 characters'),
  
  body('state')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('State must be less than 50 characters'),
  
  body('zip')
    .trim()
    .notEmpty().withMessage('ZIP code is required')
    .isLength({ min: 4, max: 10 }).withMessage('ZIP code must be 4-10 characters'),
  
  body('country')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Country must be less than 50 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10,15}$/).withMessage('Phone number must be 10-15 digits'),
  
  body('isDefault')
    .optional()
    .isBoolean().withMessage('isDefault must be a boolean')
];

exports.updateAddressValidator = [
  param('addressId')
    .notEmpty().withMessage('Address ID is required')
    .isMongoId().withMessage('Invalid address ID'),
  
  ...exports.addAddressValidator // Reuse the same validations
];

exports.deleteAddressValidator = [
  param('addressId')
    .notEmpty().withMessage('Address ID is required')
    .isMongoId().withMessage('Invalid address ID')
];

// ============================================
// CART VALIDATORS
// ============================================
exports.addToCartValidator = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

exports.updateCartItemValidator = [
  param('itemId')
    .notEmpty().withMessage('Cart item ID is required')
    .isMongoId().withMessage('Invalid cart item ID'),
  
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

exports.removeCartItemValidator = [
  param('itemId')
    .notEmpty().withMessage('Cart item ID is required')
    .isMongoId().withMessage('Invalid cart item ID')
];