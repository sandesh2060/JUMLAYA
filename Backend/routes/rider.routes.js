// ============================================
// Backend/routes/rider.routes.js
// ✅ FIXED - Correct route order (specific before dynamic)
// ============================================
const express = require('express');
const router = express.Router();
const {
  registerRider,
  getDashboard,
  getStats,
  updateStatus,
  updateLocation,
  getOrders,
  getPendingOrders,
  getActiveOrders,
  getOrderHistory,  // ✅ ADDED - Import the function
  getOrderDetails,
  acceptOrder,
  updateOrderStatus,
  pickupOrder,
  deliverOrder,
  getProfile,
  updateProfile,
  getEarnings
} = require('../controllers/rider/rider.controller');

const { protect, restrictTo } = require('../middlewares/auth.middleware');

// ============================================
// PUBLIC ROUTES
// ============================================
router.post('/register', registerRider);

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================
router.use(protect);
router.use(restrictTo('rider', 'admin'));

// ============================================
// DASHBOARD & STATS
// ============================================
router.get('/dashboard', getDashboard);
router.get('/stats', getStats);

// ============================================
// STATUS MANAGEMENT
// ============================================
router.patch('/status', updateStatus);
router.patch('/location', updateLocation);

// ============================================
// ORDERS - CRITICAL: Specific routes BEFORE dynamic routes
// ============================================

// ✅ SPECIFIC ROUTES FIRST (before :orderId)
router.get('/orders/pending', getPendingOrders);   // Must be before /orders/:orderId
router.get('/orders/active', getActiveOrders);     // Must be before /orders/:orderId
router.get('/orders/history', getOrderHistory);    // ✅ MOVED - Must be before /orders/:orderId

// ✅ GENERAL LIST ROUTE
router.get('/orders', getOrders);

// ✅ DYNAMIC ROUTES LAST (catches anything not matched above)
router.get('/orders/:orderId', getOrderDetails);
router.post('/orders/:orderId/accept', acceptOrder);
router.patch('/orders/:orderId/status', updateOrderStatus);
router.post('/orders/:orderId/pickup', pickupOrder);
router.post('/orders/:orderId/deliver', deliverOrder);

// ============================================
// PROFILE
// ============================================
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

// ============================================
// EARNINGS
// ============================================
router.get('/earnings', getEarnings);

module.exports = router;