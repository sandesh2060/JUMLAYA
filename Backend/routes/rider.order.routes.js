// ============================================
// Backend/routes/rider.order.routes.js
// ✅ COMPLETE Rider Order Management Routes
// ✅ FIXED: Correct middleware imports
// ============================================

const express = require('express');
const router = express.Router();

// Import all controller methods
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

// ✅ FIXED: Import correct middleware
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');

// Import rider-specific middlewares (optional - add if available)
// const { isVerifiedRider, isOrderOwner } = require('../middlewares/rider.middleware');

// ============================================
// APPLY GLOBAL MIDDLEWARE TO ALL ROUTES
// All routes require authentication and rider role
// ============================================
router.use(protect);
router.use(authorize('rider')); // ✅ FIXED: Use authorize instead of restrictTo

// Uncomment if you have rider verification middleware
// router.use(isVerifiedRider);

// ============================================
// ORDER LISTING ROUTES
// ============================================

/**
 * @route   GET /api/rider/orders/active
 * @desc    Get rider's currently active orders (assigned & in-progress)
 * @access  Private (Rider only)
 */
router.get('/active', getActiveOrders);

/**
 * @route   GET /api/rider/orders/history
 * @desc    Get rider's order history (completed/cancelled orders with pagination)
 * @access  Private (Rider only)
 */
router.get('/history', getOrderHistory);

// ============================================
// ORDER DETAILS & ACTIONS
// ============================================

/**
 * @route   GET /api/rider/orders/:orderId
 * @desc    Get specific order details with full information
 * @access  Private (Rider only)
 */
router.get('/:orderId', getOrderDetails);

/**
 * @route   POST /api/rider/orders/:orderId/accept
 * @desc    Accept an available order assignment
 * @access  Private (Rider only)
 */
router.post('/:orderId/accept', acceptOrder);

/**
 * @route   POST /api/rider/orders/:orderId/pickup
 * @desc    Mark order as picked up from restaurant
 * @access  Private (Rider only)
 */
router.post('/:orderId/pickup', pickupOrder);

/**
 * @route   POST /api/rider/orders/:orderId/start-delivery
 * @desc    Start delivery (mark as out for delivery)
 * @access  Private (Rider only)
 */
router.post('/:orderId/start-delivery', startDelivery);

/**
 * @route   POST /api/rider/orders/:orderId/complete
 * @desc    Complete delivery with proof and signature
 * @access  Private (Rider only)
 */
router.post('/:orderId/complete', completeDelivery);

/**
 * @route   PUT /api/rider/orders/:orderId/status
 * @desc    Update order status (generic status update)
 * @access  Private (Rider only)
 */
router.put('/:orderId/status', updateOrderStatus);

/**
 * @route   POST /api/rider/orders/:orderId/report-issue
 * @desc    Report an issue with an order
 * @access  Private (Rider only)
 */
router.post('/:orderId/report-issue', reportIssue);

// ============================================
// ALTERNATIVE ROUTES (if using PATCH instead of POST)
// Uncomment these if you prefer PATCH for updates
// ============================================

// router.patch('/:orderId/accept', acceptOrder);
// router.patch('/:orderId/pickup', pickupOrder);
// router.patch('/:orderId/deliver', completeDelivery);

module.exports = router;