// ============================================
// Backend/routes/order.routes.js
// PRODUCTION READY - ALL ROUTES CONFIGURED
// ============================================
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// ============================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ============================================
router.use(authenticate);

// ============================================
// ORDER CREATION & LISTING
// ============================================
router.post('/', orderController.createOrder);
router.get('/', orderController.getMyOrders);
router.get('/stats', orderController.getMyOrderStats); // ⚠️ Must be BEFORE /:id

// ============================================
// SPECIFIC ORDER ACTIONS (Must be before /:id)
// ============================================
router.get('/:id/track', orderController.trackOrder);
router.get('/:id/invoice', orderController.downloadInvoice);
router.post('/:id/cancel', orderController.cancelOrder);
router.post('/:id/return', orderController.requestReturn);
router.post('/:id/reorder', orderController.reorder);

// ============================================
// GENERIC ORDER DETAILS (Must be LAST)
// ============================================
router.get('/:id', orderController.getOrder);

module.exports = router;