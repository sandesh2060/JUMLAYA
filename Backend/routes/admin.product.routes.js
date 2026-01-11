// ============================================
// ADMIN PRODUCT ROUTES - WITH CLOUDINARY
// Path: Backend/routes/admin.product.routes.js
// REPLACE YOUR EXISTING FILE WITH THIS (if you have one)
// ============================================

const express = require('express');
const router = express.Router();
const productController = require('../controllers/admin/admin.product.controller');
const { uploadMultiple, uploadSingle, handleUploadError } = require('../middlewares/upload.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/authorize.middleware');

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// ============================================
// IMAGE UPLOAD ROUTES (Before creating product)
// ============================================

// Upload single image
router.post(
  '/upload-image',
  uploadSingle('image'),
  handleUploadError,
  productController.uploadImage
);

// Upload multiple images
router.post(
  '/upload-images',
  uploadMultiple('images', 10),
  handleUploadError,
  productController.uploadProductImages
);

// ============================================
// PRODUCT CRUD ROUTES
// ============================================

// Get all products
router.get(
  '/',
  productController.getAllProducts
);

// Get single product
router.get(
  '/:id',
  productController.getProductById
);

// Create product (with images)
router.post(
  '/',
  uploadMultiple('images', 10),
  handleUploadError,
  productController.createProduct
);

// Update product (with new images)
router.put(
  '/:id',
  uploadMultiple('images', 10),
  handleUploadError,
  productController.updateProduct
);

// Delete product (will delete images from Cloudinary)
router.delete(
  '/:id',
  productController.deleteProduct
);

// ============================================
// IMAGE MANAGEMENT ROUTES
// ============================================

// Add images to existing product
router.post(
  '/:id/images',
  uploadMultiple('images', 10),
  handleUploadError,
  productController.uploadProductImages
);

// Delete specific image from product
router.delete(
  '/:id/images',
  productController.deleteProductImage
);

module.exports = router;