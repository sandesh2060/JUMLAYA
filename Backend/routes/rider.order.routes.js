// ============================================
// Backend/routes/rider.order.routes.js
// Rider Order Management Routes
// ============================================

const express = require('express');
const router = express.Router();

const {
  getActiveOrders,
  getOrderHistory,
  getOrderDetails,
  acceptOrder,
  updateOrderStatus,
  pickupOrder,
  startDelivery,
  completeDelivery,
  reportIssue
} = require('../controllers/rider/rider.order.controller');

const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { isVerifiedRider, isOrderOwner } = require('../middlewares/rider.middleware');

// ============================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ============================================
router.use(protect);
router.use(restrictTo('rider'));
router.use(isVerifiedRider);

// ============================================
// ORDER LISTING
// ============================================

// Get active orders (currently assigned to rider)
router.get('/active', getActiveOrders);

// Get order history (completed/cancelled orders)
router.get('/history', getOrderHistory);

// ============================================
// ORDER DETAILS & ACTIONS
// ============================================

// Get specific order details
router.get('/:orderId', getOrderDetails);

// Accept an order
router.post('/:orderId/accept', acceptOrder);

// Mark order as picked up
router.post('/:orderId/pickup', isOrderOwner, pickupOrder);

// Start delivery (out for delivery)
router.post('/:orderId/start-delivery', isOrderOwner, startDelivery);

// Complete delivery
router.post('/:orderId/complete', isOrderOwner, completeDelivery);

// Update order status (generic)
router.put('/:orderId/status', isOrderOwner, updateOrderStatus);

// Report issue with order
router.post('/:orderId/report-issue', isOrderOwner, reportIssue);

module.exports = router;