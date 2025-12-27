// ==========================================
// validators/address.validator.js
// ==========================================

const { body } = require('express-validator');

exports.createAddressValidator = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^(\+977)?[0-9]{10}$/).withMessage('Please enter a valid Nepal phone number'),
  
  body('alternatePhone')
    .optional()
    .matches(/^(\+977)?[0-9]{10}$/).withMessage('Please enter a valid phone number'),
  
  body('email')
    .optional()
    .isEmail().withMessage('Please enter a valid email'),
  
  body('addressLine1')
    .trim()
    .notEmpty().withMessage('Address line 1 is required')
    .isLength({ min: 5, max: 200 }).withMessage('Address must be 5-200 characters'),
  
  body('addressLine2')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Address line 2 cannot exceed 200 characters'),
  
  body('landmark')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Landmark cannot exceed 100 characters'),
  
  body('city')
    .trim()
    .notEmpty().withMessage('City is required'),
  
  body('state')
    .trim()
    .notEmpty().withMessage('State/Province is required'),
  
  body('postalCode')
    .optional()
    .matches(/^[0-9]{5}$/).withMessage('Postal code must be 5 digits'),
  
  body('addressType')
    .optional()
    .isIn(['home', 'office', 'other']).withMessage('Address type must be home, office, or other'),
  
  body('isDefault')
    .optional()
    .isBoolean().withMessage('isDefault must be a boolean'),
  
  body('deliveryInstructions')
    .optional()
    .isLength({ max: 500 }).withMessage('Delivery instructions cannot exceed 500 characters')
];

exports.updateAddressValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+977)?[0-9]{10}$/).withMessage('Please enter a valid Nepal phone number'),
  
  body('alternatePhone')
    .optional()
    .matches(/^(\+977)?[0-9]{10}$/).withMessage('Please enter a valid phone number'),
  
  body('email')
    .optional()
    .isEmail().withMessage('Please enter a valid email'),
  
  body('addressLine1')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Address must be 5-200 characters'),
  
  body('city')
    .optional()
    .trim()
    .notEmpty().withMessage('City cannot be empty'),
  
  body('state')
    .optional()
    .trim()
    .notEmpty().withMessage('State/Province cannot be empty'),
  
  body('postalCode')
    .optional()
    .matches(/^[0-9]{5}$/).withMessage('Postal code must be 5 digits'),
  
  body('addressType')
    .optional()
    .isIn(['home', 'office', 'other']).withMessage('Address type must be home, office, or other'),
  
  body('isDefault')
    .optional()
    .isBoolean().withMessage('isDefault must be a boolean')
];
