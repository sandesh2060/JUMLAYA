// ============================================
// Backend/controllers/deliveryFee.controller.js
// Handle delivery fee estimation requests
// ============================================

const deliveryFeeService = require('../services/deliveryFee.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

/**
 * Estimate delivery fee for a given address
 * POST /api/delivery/estimate-fee
 * Body: { latitude, longitude, orderTotal (optional) }
 */
exports.estimateDeliveryFee = catchAsync(async (req, res, next) => {
  const { latitude, longitude, coordinates, orderTotal = 0 } = req.body;

  // Validate input
  let location;
  if (latitude && longitude) {
    location = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
  } else if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
    location = { coordinates: coordinates.map(c => parseFloat(c)) };
  } else {
    return next(new AppError('Valid location (latitude, longitude) required', 400));
  }

  console.log('📍 Estimating delivery fee for location:', location);
  if (orderTotal > 0) {
    console.log('💰 Order total provided:', orderTotal);
  }

  // Calculate delivery fee (with free delivery check if orderTotal provided)
  const feeDetails = await deliveryFeeService.calculateDeliveryFee(
    location, 
    null, 
    parseFloat(orderTotal) || 0
  );

  return successResponse(res, {
    deliveryFee: feeDetails.fee,
    originalFee: feeDetails.originalFee || feeDetails.fee,
    distance: feeDetails.distance,
    tier: feeDetails.tier,
    calculation: feeDetails.calculation,
    riderAvailable: feeDetails.riderAvailable,
    estimatedDeliveryTime: feeDetails.estimatedDeliveryTime,
    freeDelivery: feeDetails.freeDelivery || false,
    freeDeliveryThreshold: feeDetails.freeDeliveryThreshold || 5000
  }, 'Delivery fee estimated successfully');
});

/**
 * Get all available riders near a location
 * POST /api/delivery/nearby-riders
 * Body: { latitude, longitude, radius }
 */
exports.getNearbyRiders = catchAsync(async (req, res, next) => {
  const { latitude, longitude, radius = 10 } = req.body;

  if (!latitude || !longitude) {
    return next(new AppError('Latitude and longitude required', 400));
  }

  const location = { 
    latitude: parseFloat(latitude), 
    longitude: parseFloat(longitude) 
  };

  console.log('🔍 Finding riders near:', location, `within ${radius} km`);

  const riders = await deliveryFeeService.getRidersInRadius(location, parseFloat(radius));

  return successResponse(res, {
    riders,
    count: riders.length,
    searchRadius: parseFloat(radius)
  }, `Found ${riders.length} riders nearby`);
});

/**
 * Get delivery pricing tiers
 * GET /api/delivery/pricing-tiers
 */
exports.getPricingTiers = catchAsync(async (req, res, next) => {
  const tiers = await deliveryFeeService.getPricingTiers();

  return successResponse(res, {
    tiers,
    currency: 'NPR'
  }, 'Pricing tiers retrieved successfully');
});

/**
 * Calculate delivery fee for specific rider
 * POST /api/delivery/calculate-fee
 * Body: { latitude, longitude, riderId, orderTotal (optional) }
 */
exports.calculateFeeForRider = catchAsync(async (req, res, next) => {
  const { latitude, longitude, riderId, orderTotal = 0 } = req.body;

  if (!latitude || !longitude) {
    return next(new AppError('Location required', 400));
  }

  const location = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };

  const feeDetails = await deliveryFeeService.calculateDeliveryFee(
    location, 
    riderId, 
    parseFloat(orderTotal) || 0
  );

  return successResponse(res, feeDetails, 'Delivery fee calculated successfully');
});

module.exports = exports;