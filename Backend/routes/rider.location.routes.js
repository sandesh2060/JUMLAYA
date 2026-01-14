// Backend/routes/rider.location.routes.js

const express = require('express');
const router = express.Router();
const locationController = require('../controllers/rider/rider.location.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/authorize.middleware');
const { validateLocation } = require('../validators/location.validator');

// All routes require authentication as rider
router.use(protect);
router.use(restrictTo('rider'));

/**
 * @route   POST /api/rider/location/update
 * @desc    Update rider's current location
 * @access  Private (Rider only)
 */
router.post(
  '/update',
  validateLocation,
  locationController.updateLocation
);

/**
 * @route   GET /api/rider/location/route/:orderId
 * @desc    Get optimal route to delivery address
 * @access  Private (Rider only)
 */
router.get(
  '/route/:orderId',
  locationController.getRoute
);

/**
 * @route   POST /api/rider/location/arrival
 * @desc    Mark arrival at pickup/delivery location
 * @access  Private (Rider only)
 */
router.post(
  '/arrival',
  locationController.markArrival
);

/**
 * @route   PATCH /api/rider/location/status
 * @desc    Toggle rider online/offline status
 * @access  Private (Rider only)
 */
router.patch(
  '/status',
  locationController.toggleOnlineStatus
);

/**
 * @route   GET /api/rider/location/history/:orderId
 * @desc    Get location history for an order
 * @access  Private (Rider, Customer, Admin)
 */
router.get(
  '/history/:orderId',
  locationController.getLocationHistory
);

module.exports = router;