// ============================================
// Backend/routes/cart.routes.js - FIXED
// Path: Backend/routes/cart.routes.js
// ============================================

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All cart routes require authentication
router.use(authenticate);

// Cart CRUD - Order matters! Specific routes before parameterized routes
router.get('/', cartController.getCart);                        // GET /api/cart
router.post('/', cartController.addToCart);                     // POST /api/cart
router.put('/', cartController.updateCartItem);                 // PUT /api/cart
router.delete('/', cartController.clearCart);                   // DELETE /api/cart ✅ FIXED

// Coupon routes (must be before /:productId to avoid conflicts)
router.post('/coupon', cartController.applyCoupon);             // POST /api/cart/coupon
router.delete('/coupon', cartController.removeCoupon);          // DELETE /api/cart/coupon

// Save for later routes
router.post('/save-for-later/:productId', cartController.saveForLater);
router.post('/move-to-cart/:productId', cartController.moveToCart);

// DELETE by productId (must be last to avoid route conflicts)
router.delete('/:productId', cartController.removeFromCart);    // DELETE /api/cart/:productId

module.exports = router;