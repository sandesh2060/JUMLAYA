// ============================================
// controllers/category.controller.js
// ============================================

const Category = require('../models/category.model');

// Utility to wrap async functions
const catchAsync = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Standardized success response
const successResponse = (res, data, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ------------------------------
// Controller Methods
// ------------------------------
exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1 });
  return successResponse(res, categories);
});

exports.getCategoryTree = catchAsync(async (req, res, next) => {
  const tree = await Category.getCategoryTree();
  return successResponse(res, tree);
});

exports.getCategory = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const category = await Category.getBySlug(slug);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  return successResponse(res, category);
});

exports.getFeaturedCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.getFeaturedCategories();
  return successResponse(res, categories);
});

exports.getPopularCategories = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;
  const categories = await Category.getPopularCategories(parseInt(limit));
  return successResponse(res, categories);
});
