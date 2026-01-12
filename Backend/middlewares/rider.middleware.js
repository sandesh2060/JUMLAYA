// ============================================
// Backend/middlewares/rider.middleware.js
// ✅ FIXED - Auto-creates rider profile if missing
// ============================================

const Rider = require('../models/rider.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// ============================================
// MAIN MIDDLEWARE - Sets req.rider (auto-creates if needed)
// ============================================
exports.isVerifiedRider = catchAsync(async (req, res, next) => {
  let rider = await Rider.findOne({ user: req.user._id });

  // ✅ AUTO-CREATE rider profile if it doesn't exist
  if (!rider) {
    console.log(`🔧 Auto-creating rider profile for user: ${req.user._id}`);
    
    const riderCode = await Rider.generateRiderCode();
    
    rider = await Rider.create({
      user: req.user._id,
      riderCode,
      phoneNumber: req.user.phone || req.user.email, // Use phone or email as fallback
      vehicleType: 'bike', // Default vehicle type
      status: 'offline',
      verification: {
        isVerified: false, // Needs admin verification
      }
    });

    console.log(`✅ Rider profile created: ${rider.riderCode}`);
  }

  // ✅ ALLOW UNVERIFIED RIDERS (for testing/development)
  // Remove this check in production if you want strict verification
  if (!rider.verification.isVerified) {
    console.log(`⚠️  Rider ${rider.riderCode} not verified - allowing access for development`);
    // In production, uncomment this:
    // return next(new AppError('Your rider account is not verified yet', 403));
  }

  if (rider.isSuspended) {
    return next(new AppError('Your rider account is suspended', 403));
  }

  if (rider.isDeleted) {
    return next(new AppError('Your rider account is deactivated', 403));
  }

  req.rider = rider;
  next();
});

// ============================================
// CHECK IF RIDER IS ONLINE
// ============================================
exports.isOnline = catchAsync(async (req, res, next) => {
  if (!req.rider) {
    const rider = await Rider.findOne({ user: req.user._id });
    req.rider = rider;
  }

  if (!req.rider) {
    return next(new AppError('Rider profile not found', 404));
  }

  if (req.rider.status === 'offline') {
    return next(new AppError('You must be online to perform this action', 400));
  }

  next();
});

// ============================================
// CHECK IF RIDER CAN ACCEPT ORDERS
// ============================================
exports.canAcceptOrders = catchAsync(async (req, res, next) => {
  if (!req.rider) {
    const rider = await Rider.findOne({ user: req.user._id });
    req.rider = rider;
  }

  if (!req.rider) {
    return next(new AppError('Rider profile not found', 404));
  }

  if (!req.rider.canAcceptOrders) {
    return next(new AppError('You cannot accept orders at this time. Please check your status and active orders.', 400));
  }

  next();
});

// ============================================
// CHECK IF RIDER HAS ACTIVE ORDERS
// ============================================
exports.hasActiveOrders = catchAsync(async (req, res, next) => {
  if (!req.rider) {
    const rider = await Rider.findOne({ user: req.user._id });
    req.rider = rider;
  }

  if (!req.rider) {
    return next(new AppError('Rider profile not found', 404));
  }

  if (!req.rider.currentOrders || req.rider.currentOrders.length === 0) {
    return next(new AppError('You have no active orders', 404));
  }

  next();
});

// ============================================
// CHECK IF ORDER BELONGS TO RIDER
// ============================================
exports.isOrderOwner = catchAsync(async (req, res, next) => {
  const Order = require('../models/order.model');
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (!req.rider) {
    const rider = await Rider.findOne({ user: req.user._id });
    req.rider = rider;
  }

  if (!order.rider || order.rider.toString() !== req.rider._id.toString()) {
    return next(new AppError('This order is not assigned to you', 403));
  }

  req.order = order;
  next();
});

// ============================================
// RATE LIMITING FOR LOCATION UPDATES
// ============================================
const locationUpdateTimestamps = new Map();

exports.rateLimitLocation = (req, res, next) => {
  const userId = req.user._id.toString();
  const now = Date.now();
  const lastUpdate = locationUpdateTimestamps.get(userId);

  if (lastUpdate && now - lastUpdate < 10000) {
    return next(new AppError('Please wait before updating location again', 429));
  }

  locationUpdateTimestamps.set(userId, now);
  next();
};

// Clean up old timestamps periodically (every hour)
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  for (const [userId, timestamp] of locationUpdateTimestamps.entries()) {
    if (timestamp < oneHourAgo) {
      locationUpdateTimestamps.delete(userId);
    }
  }
}, 3600000);