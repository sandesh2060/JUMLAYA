// Backend/routes/rider.routes.js
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
  getOrderDetails,
  acceptOrder,
  updateOrderStatus,
  pickupOrder,
  deliverOrder,
  getProfile,
  updateProfile,
  getEarnings
} = require('../controllers/rider/rider.controller');

// ✅ FIXED: Changed from '../middleware/' to '../middlewares/'
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// ============ PUBLIC ROUTES ============
router.post('/register', registerRider);

// ============ PROTECTED ROUTES (Require Authentication) ============
// All routes below require authentication and rider role
router.use(protect);
router.use(restrictTo('rider', 'admin'));

// Dashboard & Stats
router.get('/dashboard', getDashboard);
router.get('/stats', getStats);

// Status Management
router.patch('/status', updateStatus);
router.patch('/location', updateLocation);

// Orders
router.get('/orders', getOrders);
router.get('/orders/pending', getPendingOrders);
router.get('/orders/active', getActiveOrders);
router.get('/orders/:orderId', getOrderDetails);
router.post('/orders/:orderId/accept', acceptOrder);
router.patch('/orders/:orderId/status', updateOrderStatus);
router.post('/orders/:orderId/pickup', pickupOrder);
router.post('/orders/:orderId/deliver', deliverOrder);

// Profile
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

// Earnings
router.get('/earnings', getEarnings);

module.exports = router;