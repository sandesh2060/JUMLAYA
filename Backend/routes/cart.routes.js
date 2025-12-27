// ============================================
// Backend/routes/cart.routes.js - UPDATED TO MATCH FRONTEND
// ============================================

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All cart routes require authentication
router.use(authenticate);

// Cart CRUD - Order matters! Specific routes before parameterized routes
router.get('/', cartController.getCart);                        // GET /users/cart
router.post('/', cartController.addToCart);                     // POST /users/cart (matches frontend)
router.delete('/clear', cartController.clearCart);              // DELETE /users/cart/clear (must be before /:productId)

// Coupon routes (must be before /:productId to avoid conflicts)
router.post('/coupon/apply', cartController.applyCoupon);       // POST /users/cart/coupon/apply
router.delete('/coupon/remove', cartController.removeCoupon);   // DELETE /users/cart/coupon/remove

// Save for later routes (must be before /:productId)
router.post('/save-for-later/:productId', cartController.saveForLater);  // POST /users/cart/save-for-later/:productId
router.post('/move-to-cart/:productId', cartController.moveToCart);      // POST /users/cart/move-to-cart/:productId

// Parameterized routes - MUST BE LAST to avoid catching other routes
router.put('/:productId', cartController.updateCartItem);       // PUT /users/cart/:productId (matches frontend)
router.delete('/:productId', cartController.removeFromCart);    // DELETE /users/cart/:productId (matches frontend)

module.exports = router;