// Backend/controllers/rider/rider.controller.js - UPDATED FOR PROCESSING ORDERS
const mongoose = require('mongoose');
const Rider = require('../../models/rider.model');
const Order = require('../../models/order.model');
const User = require('../../models/user.model');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

// ============ AUTHENTICATION & REGISTRATION ============

exports.registerRider = catchAsync(async (req, res, next) => {
  const {
    email,
    password,
    name,
    phoneNumber,
    vehicleType,
    vehicleNumber,
    licenseNumber
  } = req.body;

  if (!email || !password || !name || !phoneNumber) {
    return next(new AppError('Please provide all required fields', 400));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('User already exists', 400));
  }

  const phoneExists = await Rider.findOne({ phoneNumber });
  if (phoneExists) {
    return next(new AppError('Phone number already registered', 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'rider'
  });

  const riderCode = await Rider.generateRiderCode();

  const rider = await Rider.create({
    user: user._id,
    riderCode,
    phoneNumber,
    vehicleType: vehicleType || 'bike',
    vehicleNumber,
    licenseNumber,
    status: 'offline',
    verification: {
      isVerified: false
    }
  });

  res.status(201).json({
    success: true,
    message: 'Rider registered successfully. Awaiting verification.',
    rider: {
      id: rider._id,
      riderCode: rider.riderCode,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      phoneNumber: rider.phoneNumber,
      vehicleType: rider.vehicleType,
      isVerified: rider.verification.isVerified
    }
  });
});

// ============ DASHBOARD ============

exports.getDashboard = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;

  const rider = await Rider.findById(riderId)
    .populate('user', 'name email')
    .populate('currentOrders');

  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  // ✅ CHANGED: Show 'Processing' orders instead of 'Confirmed'
  const pendingOrders = await Order.find({
    orderStatus: 'Processing', // ✅ Orders ready for delivery
    rider: null, // ✅ Not yet assigned to any rider
  })
    .populate('user', 'name phone email')
    .limit(10)
    .sort({ createdAt: -1 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = await Order.countDocuments({
    rider: riderId,
    createdAt: { $gte: today },
    orderStatus: 'Delivered'
  });

  const todayEarnings = await Order.aggregate([
    {
      $match: {
        rider: new mongoose.Types.ObjectId(riderId),
        createdAt: { $gte: today },
        orderStatus: 'Delivered'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$shippingPrice' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      rider: {
        id: rider._id,
        riderCode: rider.riderCode,
        name: rider.user.name,
        phone: rider.phoneNumber,
        vehicleType: rider.vehicleType,
        currentLocation: rider.currentLocation,
        isVerified: rider.verification.isVerified
      },
      status: rider.status,
      stats: {
        todayDeliveries: todayOrders,
        todayEarnings: todayEarnings[0]?.total || 0,
        pendingOrders: pendingOrders.length,
        completedOrders: rider.stats.completedDeliveries,
        rating: rider.rating.average,
        totalEarnings: rider.earnings.total,
        weeklyDeliveries: rider.stats.weeklyDeliveries,
        weeklyEarnings: rider.stats.weeklyEarnings
      },
      orders: pendingOrders,
      currentOrders: rider.currentOrders
    }
  });
});

// ============ STATS ============

exports.getStats = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;
  const { period = 'today' } = req.query;

  const rider = await Rider.findById(riderId);
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  let dateFilter = {};
  const now = new Date();

  switch (period) {
    case 'today':
      dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
      break;
    case 'week':
      dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
      break;
    case 'month':
      dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
      break;
  }

  const orders = await Order.find({
    rider: riderId,
    createdAt: dateFilter
  });

  const stats = {
    totalOrders: orders.length,
    completed: orders.filter(o => o.orderStatus === 'Delivered').length,
    cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length,
    totalEarnings: orders.reduce((sum, o) => sum + (o.shippingPrice || 0), 0),
    averageRating: rider.rating.average,
    acceptanceRate: rider.stats.acceptanceRate,
    onTimeRate: rider.stats.onTimeDeliveryRate
  };

  res.json({
    success: true,
    period,
    stats
  });
});

// ============ STATUS MANAGEMENT ============

exports.updateStatus = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;
  const { status } = req.body;

  const validStatuses = ['offline', 'active', 'inactive'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const rider = await Rider.findById(riderId);
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  if (status === 'offline' && rider.currentOrders.length > 0) {
    return next(new AppError('Cannot go offline while on delivery', 400));
  }

  if (status === 'active' && !rider.verification.isVerified) {
    return next(new AppError('Account not verified. Please complete verification.', 403));
  }

  await rider.updateStatus(status);

  res.json({
    success: true,
    message: `Status updated to ${status}`,
    status: rider.status,
    isAvailable: rider.availability.isAvailable
  });
});

exports.updateLocation = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;
  const { lat, lng, address } = req.body;

  if (!lat || !lng) {
    return next(new AppError('Latitude and longitude required', 400));
  }

  const rider = await Rider.findById(riderId);
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  rider.currentLocation = {
    type: 'Point',
    coordinates: [lng, lat],
    address: address || rider.currentLocation.address,
    lastUpdated: new Date()
  };
  rider.activity.lastLocationUpdate = new Date();

  await rider.save();

  res.json({
    success: true,
    message: 'Location updated',
    location: {
      lat,
      lng,
      address: rider.currentLocation.address,
      lastUpdated: rider.currentLocation.lastUpdated
    }
  });
});

// ============ ORDER MANAGEMENT ============

exports.getOrders = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;
  const { status, page = 1, limit = 20 } = req.query;

  const query = { rider: riderId };
  if (status) query.orderStatus = status;

  const orders = await Order.find(query)
    .populate('user', 'name phone email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    data: orders,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total
    }
  });
});

exports.getPendingOrders = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;
  const rider = await Rider.findById(riderId);

  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  // ✅ CHANGED: Show 'Processing' orders
  const orders = await Order.find({
    orderStatus: 'Processing', // ✅ Changed from 'Confirmed'
    rider: null
  })
    .populate('user', 'name phone email')
    .limit(20)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: orders,
    count: orders.length
  });
});

exports.getActiveOrders = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;

  const orders = await Order.find({
    rider: riderId,
    orderStatus: { $in: ['Shipped', 'Out for Delivery'] }
  })
    .populate('user', 'name phone email')
    .sort({ createdAt: 1 });

  res.json({
    success: true,
    data: orders,
    count: orders.length
  });
});

exports.getOrderDetails = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const riderId = req.rider._id;

  const order = await Order.findById(orderId)
    .populate('user', 'name phone email')
    .populate('items.product', 'name price images');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.rider && order.rider.toString() !== riderId.toString()) {
    return next(new AppError('Access denied', 403));
  }

  res.json({
    success: true,
    data: order
  });
});

exports.acceptOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const riderId = req.rider._id;

  const rider = await Rider.findById(riderId);
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  if (!rider.canAcceptOrders) {
    return next(new AppError('Cannot accept order. Check your status and active order count.', 400));
  }

  const order = await Order.findById(orderId);
  
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // ✅ CHANGED: Accept 'Processing' orders instead of 'Confirmed'
  if (order.orderStatus !== 'Processing' || order.rider) {
    return next(new AppError('Order not available for acceptance', 400));
  }

  order.rider = riderId;
  order.orderStatus = 'Shipped';
  order.riderAcceptedAt = Date.now();
  await order.save();

  await rider.acceptOrder(orderId);

  res.json({
    success: true,
    message: 'Order accepted successfully',
    order: {
      id: order._id,
      orderId: order.orderId,
      status: order.orderStatus,
      totalPrice: order.totalPrice,
      shippingPrice: order.shippingPrice
    }
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const riderId = req.rider._id;

  const order = await Order.findById(orderId);
  
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.rider.toString() !== riderId.toString()) {
    return next(new AppError('Access denied', 403));
  }

  const validTransitions = {
    'Shipped': ['Out for Delivery', 'Cancelled'],
    'Out for Delivery': ['Delivered']
  };

  if (!validTransitions[order.orderStatus]?.includes(status)) {
    return next(new AppError('Invalid status transition', 400));
  }

  order.orderStatus = status;
  
  if (status === 'Out for Delivery') {
    order.riderPickedUpAt = Date.now();
  } else if (status === 'Delivered') {
    order.riderDeliveredAt = Date.now();
    order.deliveredAt = Date.now();
  }
  
  await order.save();

  if (status === 'Delivered') {
    const rider = await Rider.findById(riderId);
    await rider.completeOrder(orderId);
    await rider.addEarnings(order.shippingPrice, orderId, 'delivery');
  }

  res.json({
    success: true,
    message: `Order ${status}`,
    order: {
      id: order._id,
      orderId: order.orderId,
      status: order.orderStatus
    }
  });
});

exports.pickupOrder = catchAsync(async (req, res, next) => {
  req.body.status = 'Out for Delivery';
  return exports.updateOrderStatus(req, res, next);
});

exports.deliverOrder = catchAsync(async (req, res, next) => {
  req.body.status = 'Delivered';
  return exports.updateOrderStatus(req, res, next);
});

// ============ PROFILE ============

exports.getProfile = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;

  const rider = await Rider.findById(riderId)
    .populate('user', 'name email phone avatar')
    .select('-earningsHistory -adminNotes');

  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  res.json({
    success: true,
    data: rider
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;
  const updates = req.body;

  const allowedFields = [
    'phoneNumber', 'alternatePhone', 'emergencyContact',
    'vehicleType', 'vehicleNumber', 'vehicleBrand', 'vehicleModel',
    'vehicleColor', 'preferredAreas', 'maxDeliveryRadius'
  ];

  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});

  const rider = await Rider.findByIdAndUpdate(
    riderId,
    filteredUpdates,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: rider
  });
});

// ============ EARNINGS ============

exports.getEarnings = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;
  const { period, page = 1, limit = 50 } = req.query;

  const rider = await Rider.findById(riderId);
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  let dateFilter = {};
  if (period) {
    const now = new Date();
    switch (period) {
      case 'today':
        dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
        break;
      case 'week':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case 'month':
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
    }
  }

  const earningsQuery = dateFilter.$gte
    ? rider.earningsHistory.filter(e => e.date >= dateFilter.$gte)
    : rider.earningsHistory;

  const paginatedEarnings = earningsQuery
    .slice((page - 1) * limit, page * limit);

  res.json({
    success: true,
    summary: {
      total: rider.earnings.total,
      pending: rider.earnings.pending,
      paid: rider.earnings.paid,
      thisWeek: rider.earnings.thisWeek,
      thisMonth: rider.earnings.thisMonth
    },
    earnings: paginatedEarnings,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(earningsQuery.length / limit),
      total: earningsQuery.length
    }
  });
});

module.exports = exports;