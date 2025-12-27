// Backend/routes/admin.dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/admin/admin.dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');

console.log('📊 Admin Dashboard Routes - Loading...');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

console.log('✅ Admin Dashboard Routes - Middleware attached');

// Dashboard stats
router.get('/stats', dashboardController.getStats);

// Recent orders
router.get('/recent-orders', dashboardController.getRecentOrders);

// Top products
router.get('/top-products', dashboardController.getTopProducts);

// Low stock products
router.get('/low-stock', dashboardController.getLowStockProducts);

// Sales chart data
router.get('/sales-chart', dashboardController.getSalesChart);

console.log('✅ Admin Dashboard Routes - All routes registered');

module.exports = router;