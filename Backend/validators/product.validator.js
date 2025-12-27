// ============================================
// FILE #21: validators/product.validator.js
// ============================================
const { body, param, query } = require('express-validator');

exports.createProductValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3, max: 200 }).withMessage('Name must be 3-200 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Description must be 10-5000 characters'),
  
  body('productType')
    .isIn(['fruit', 'herb', 'honey', 'grain']).withMessage('Invalid product type'),
  
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('stock')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),
  
  body('isOrganic')
    .optional()
    .isBoolean().withMessage('isOrganic must be boolean')
];

exports.updateProductValidator = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  ...exports.createProductValidator.map(validation => validation.optional())
];

exports.updateStockValidator = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  
  body('stock')
    .isInt({ min: 0 }).withMessage('Stock must be non-negative'),
  
  body('operation')
    .optional()
    .isIn(['set', 'increase', 'decrease']).withMessage('Invalid operation')
];

