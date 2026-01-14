// ============================================
// Backend/routes/delivery.routes.js
// Delivery fee estimation routes
// ============================================

const express = require('express');
const router = express.Router();
const deliveryFeeController = require('../controllers/deliveryFee.controller');
const { protect } = require('../middlewares/auth.middleware'); // ✅ FIXED PATH

// Public routes (no authentication required)
router.post('/estimate-fee', deliveryFeeController.estimateDeliveryFee);
router.get('/pricing-tiers', deliveryFeeController.getPricingTiers);

// Protected routes (authentication required)
router.use(protect); // Apply auth middleware to all routes below

router.post('/nearby-riders', deliveryFeeController.getNearbyRiders);
router.post('/calculate-fee', deliveryFeeController.calculateFeeForRider);

module.exports = router;
