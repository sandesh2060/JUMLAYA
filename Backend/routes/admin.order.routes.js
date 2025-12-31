// path: Backend/routes/admin.order.routes.js
const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/admin/admin.order.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');
const { path } = require('pdfkit');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Order statistics
router.get('/stats', adminOrderController.getOrderStats);

// Export orders
router.get('/export', adminOrderController.exportOrders);

// Bulk operations
router.patch('/bulk-update', adminOrderController.bulkUpdateStatus);

// Get all orders with filters
router.get('/', adminOrderController.getAllOrders);

// Get single order
router.get('/:id', adminOrderController.getOrderById);

// Update order status
router.patch('/:id/status', adminOrderController.updateOrderStatus);

// Update payment status
router.patch('/:id/payment-status', adminOrderController.updatePaymentStatus);

// Update admin notes
router.patch('/:id/notes', adminOrderController.updateAdminNotes);

// Delete order
router.delete('/:id', adminOrderController.deleteOrder);

module.exports = router;