// ============================================
// FILE #19: validators/cart.validator.js
// ============================================
const { body, param } = require('express-validator');

exports.addToCartValidator = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Quantity must be 1-100')
];

exports.updateCartValidator = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  
  body('quantity')
    .isInt({ min: 0, max: 100 }).withMessage('Quantity must be 0-100')
];

exports.applyCouponValidator = [
  body('couponCode')
    .trim()
    .notEmpty().withMessage('Coupon code is required')
    .isLength({ min: 3, max: 20 }).withMessage('Invalid coupon code')
];
