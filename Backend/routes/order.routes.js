// Backend/routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate); // All routes require authentication

router.post('/', orderController.createOrder);
router.get('/', orderController.getMyOrders);
router.get('/stats', orderController.getMyOrderStats);

// Specific routes first
router.get('/:id/track', orderController.trackOrder);
router.get('/:id/invoice', orderController.downloadInvoice);
router.get('/:id', orderController.getOrder);

// Actions
router.post('/:id/cancel', orderController.cancelOrder);
router.post('/:id/return', orderController.requestReturn);
router.post('/:id/reorder', orderController.reorder);

module.exports = router;
