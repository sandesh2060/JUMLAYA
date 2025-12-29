const Rider = require('../models/rider.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Check if user is a verified rider
exports.isVerifiedRider = catchAsync(async (req, res, next) => {
  const rider = await Rider.findOne({ user: req.user._id });

  if (!rider) {
    return next(new AppError('Rider profile not found', 404));
  }

  if (!rider.verification.isVerified) {
    return next(new AppError('Your rider account is not verified yet', 403));
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

// Check if rider is online
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

// Check if rider can accept orders
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

// Check if rider has active orders
exports.hasActiveOrders = catchAsync(async (req, res, next) => {
  if (!req.rider) {
    const rider = await Rider.findOne({ user: req.user._id });
    req.rider = rider;
  }

  if (!req.rider) {
    return next(new AppError('Rider profile not found', 404));
  }

  if (req.rider.currentOrders.length === 0) {
    return next(new AppError('You have no active orders', 404));
  }

  next();
});

// Check if order belongs to rider
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

  if (order.rider.toString() !== req.rider._id.toString()) {
    return next(new AppError('This order is not assigned to you', 403));
  }

  req.order = order;
  next();
});

// Rate limiting for location updates (max 1 per 10 seconds)
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