// ============================================
// FILE #22: validators/review.validator.js
// ============================================
const { body, param } = require('express-validator');

exports.createReviewValidator = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title too long'),
  
  body('comment')
    .trim()
    .notEmpty().withMessage('Review comment is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters'),
  
  body('orderId')
    .optional()
    .isMongoId().withMessage('Invalid order ID')
];

exports.updateReviewValidator = [
  param('id').isMongoId().withMessage('Invalid review ID'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
];

exports.voteReviewValidator = [
  param('id').isMongoId().withMessage('Invalid review ID'),
  
  body('voteType')
    .isIn(['helpful', 'not-helpful']).withMessage('Invalid vote type')
];

exports.moderateReviewValidator = [
  param('id').isMongoId().withMessage('Invalid review ID'),
  
  body('status')
    .isIn(['approved', 'rejected']).withMessage('Invalid status'),
  
  body('rejectionReason')
    .if(body('status').equals('rejected'))
    .notEmpty().withMessage('Rejection reason required')
    .isLength({ max: 500 })
];
