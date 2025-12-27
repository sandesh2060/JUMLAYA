// ============================================
// FILE #20: validators/order.validator.js
// ============================================
const { body, param, query } = require('express-validator');

exports.createOrderValidator = [
  body('shippingAddress.fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }),
  
  body('shippingAddress.phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^(\+977)?[0-9]{10}$/).withMessage('Invalid phone number'),
  
  body('shippingAddress.email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email'),
  
  body('shippingAddress.addressLine1')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 5, max: 200 }),
  
  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('City is required'),
  
  body('shippingAddress.state')
    .trim()
    .notEmpty().withMessage('State is required'),
  
  body('paymentMethod')
    .isIn(['esewa', 'cod', 'khalti', 'bank_transfer'])
    .withMessage('Invalid payment method'),
  
  body('customerNote')
    .optional()
    .isLength({ max: 500 }).withMessage('Note too long')
];

exports.cancelOrderValidator = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  
  body('cancellationReason')
    .trim()
    .notEmpty().withMessage('Cancellation reason is required')
    .isLength({ min: 10, max: 500 }).withMessage('Reason must be 10-500 characters')
];

exports.returnOrderValidator = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  
  body('returnReason')
    .trim()
    .notEmpty().withMessage('Return reason is required')
    .isLength({ min: 10, max: 500 })
];

exports.updateOrderStatusValidator = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Invalid status'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
];
