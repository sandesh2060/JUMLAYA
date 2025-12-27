// ============================================
// admin.product.routes.js
// Path: Backend/routes/admin.product.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const productController = require('../controllers/admin/admin.product.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/authorize.middleware');
const upload = require('../middlewares/upload.middleware');

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// ============================================
// PRODUCT ROUTES
// ============================================

// GET /api/admin/products - Get all products with filters
router.get('/', productController.getAllProducts);

// GET /api/admin/products/:id - Get single product
router.get('/:id', productController.getProductById);

// POST /api/admin/products - Create product
router.post('/', productController.createProduct);

// PUT /api/admin/products/:id - Update product
router.put('/:id', productController.updateProduct);

// DELETE /api/admin/products/:id - Delete product (soft delete)
router.delete('/:id', productController.deleteProduct);

// POST /api/admin/products/:id/images - Upload product images
router.post(
  '/:id/images',
  upload.array('images', 5),
  productController.uploadProductImages
);

// DELETE /api/admin/products/:id/images - Delete product image
router.delete('/:id/images', productController.deleteProductImage);

module.exports = router;