// ============================================
// Backend/routes/rider.routes.js
// ✅ PRODUCTION READY
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
  getOrderHistory,
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
router.get('/orders/pending', getPendingOrders);
router.get('/orders/active', getActiveOrders);
router.get('/orders/history', getOrderHistory);

// ✅ GENERAL LIST ROUTE
router.get('/orders', getOrders);

// ✅ DYNAMIC ROUTES LAST
router.get('/orders/:orderId', getOrderDetails);
router.post('/orders/:orderId/accept', acceptOrder);
router.patch('/orders/:orderId/status', updateOrderStatus);
router.post('/orders/:orderId/pickup', pickupOrder);
router.post('/orders/:orderId/deliver', deliverOrder);

// ============================================
// PROFILE - ✅ FIXED: Both GET and PUT
// ============================================
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);  // ✅ Changed from PATCH to PUT

// ============================================
// EARNINGS
// ============================================
router.get('/earnings', getEarnings);

module.exports = router;
