// ============================================
// Backend/controllers/rider/rider.controller.js
// ✅ COMPLETE FIXED VERSION
// ============================================
const mongoose = require('mongoose');
const Rider = require('../../models/rider.model');
const Order = require('../../models/order.model');
const User = require('../../models/user.model');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

// ============================================
// AUTHENTICATION & REGISTRATION
// ============================================

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

// ============================================
// DASHBOARD
// ============================================

exports.getDashboard = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;

  const rider = await Rider.findById(riderId)
    .populate('user', 'name email')
    .populate('currentOrders');

  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  // ✅ Only show unassigned 'Processing' orders (no rider assigned)
  const pendingOrders = await Order.find({
    orderStatus: 'Processing',
    rider: null, // ✅ CRITICAL: Only orders without a rider
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

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  const weeklyDeliveries = await Order.countDocuments({
    rider: riderId,
    createdAt: { $gte: weekStart },
    orderStatus: 'Delivered'
  });

  const weeklyEarnings = await Order.aggregate([
    {
      $match: {
        rider: new mongoose.Types.ObjectId(riderId),
        createdAt: { $gte: weekStart },
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
        isVerified: rider.verification?.isVerified || false
      },
      status: rider.status,
      stats: {
        todayDeliveries: todayOrders,
        todayEarnings: todayEarnings[0]?.total || 0,
        pendingOrders: pendingOrders.length,
        completedOrders: rider.stats?.completedDeliveries || 0,
        rating: rider.rating?.average || 0,
        totalEarnings: rider.earnings?.total || 0,
        weeklyDeliveries: weeklyDeliveries,
        weeklyEarnings: weeklyEarnings[0]?.total || 0,
        acceptanceRate: rider.stats?.acceptanceRate || 0,
        onTimeRate: rider.stats?.onTimeDeliveryRate || 0
      },
      orders: pendingOrders, // ✅ Only unassigned orders
      currentOrders: rider.currentOrders || []
    }
  });
});

// ============================================
// STATS
// ============================================

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
    averageRating: rider.rating?.average || 0,
    acceptanceRate: rider.stats?.acceptanceRate || 0,
    onTimeRate: rider.stats?.onTimeDeliveryRate || 0
  };

  res.json({
    success: true,
    period,
    stats
  });
});

// ============================================
// STATUS MANAGEMENT
// ============================================

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

  if (status === 'offline' && rider.currentOrders && rider.currentOrders.length > 0) {
    return next(new AppError('Cannot go offline while on delivery', 400));
  }

  if (status === 'active' && rider.verification && !rider.verification.isVerified) {
    return next(new AppError('Account not verified. Please complete verification.', 403));
  }

  // Update status
  rider.status = status;
  if (rider.availability) {
    rider.availability.isAvailable = (status === 'active');
  }
  
  await rider.save();

  res.json({
    success: true,
    message: `Status updated to ${status}`,
    status: rider.status,
    isAvailable: rider.availability?.isAvailable || false
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
    address: address || rider.currentLocation?.address || '',
    lastUpdated: new Date()
  };
  
  if (rider.activity) {
    rider.activity.lastLocationUpdate = new Date();
  }

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

// ============================================
// ORDER MANAGEMENT
// ============================================

exports.getOrders = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;
  const { status, page = 1, limit = 20 } = req.query;

  // ✅ Only show THIS rider's orders
  const query = { rider: riderId };
  if (status) query.orderStatus = status;

  const orders = await Order.find(query)
    .populate('user', 'name phone email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    data: {
      orders,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getPendingOrders = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;
  const rider = await Rider.findById(riderId);

  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  // ✅ Only unassigned orders
  const orders = await Order.find({
    orderStatus: 'Processing',
    rider: null // ✅ CRITICAL: No rider assigned
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

  // ✅ Only THIS rider's active orders
  const orders = await Order.find({
    rider: riderId, // ✅ Only this rider's orders
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

exports.getOrderHistory = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const orders = await Order.find({
    rider: riderId,
    orderStatus: 'Delivered'
  })
    .sort({ deliveredAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('user', 'name email phone')
    .populate('items.product', 'name images');

  const total = await Order.countDocuments({
    rider: riderId,
    orderStatus: 'Delivered'
  });

  res.status(200).json({
    success: true,
    data: {
      orders,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
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

  // ✅ Allow access to unassigned orders OR rider's own orders
  if (order.rider && order.rider.toString() !== riderId.toString()) {
    return next(new AppError('Access denied - Order assigned to another rider', 403));
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

  // Check if rider can accept orders
  if (rider.status !== 'active') {
    return next(new AppError('You must be active to accept orders', 400));
  }

  const order = await Order.findById(orderId);
  
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // ✅ CRITICAL: Check if order is already assigned
  if (order.rider) {
    return next(new AppError('Order already assigned to another rider', 400));
  }

  if (order.orderStatus !== 'Processing') {
    return next(new AppError('Order not available for acceptance', 400));
  }

  // ✅ Assign rider to order
  order.rider = riderId;
  order.orderStatus = 'Shipped';
  order.riderAcceptedAt = Date.now();
  
  // Add status history
  if (order.statusHistory) {
    order.statusHistory.push({
      status: 'Shipped',
      note: `Order accepted by rider ${rider.riderCode}`,
      updatedBy: riderId,
      timestamp: new Date()
    });
  }
  
  await order.save();

  // Update rider's current orders
  if (!rider.currentOrders) {
    rider.currentOrders = [];
  }
  rider.currentOrders.push(orderId);
  await rider.save();

  res.json({
    success: true,
    message: 'Order accepted successfully',
    order: {
      id: order._id,
      orderId: order.orderId,
      status: order.orderStatus,
      totalPrice: order.totalPrice,
      shippingPrice: order.shippingPrice,
      rider: riderId
    }
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { status, note } = req.body;
  const riderId = req.rider._id;

  const order = await Order.findById(orderId);
  
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // ✅ Verify rider owns this order
  if (!order.rider || order.rider.toString() !== riderId.toString()) {
    return next(new AppError('Access denied - You are not assigned to this order', 403));
  }

  const validTransitions = {
    'Shipped': ['Out for Delivery', 'Cancelled'],
    'Out for Delivery': ['Delivered', 'Cancelled']
  };

  if (!validTransitions[order.orderStatus]?.includes(status)) {
    return next(new AppError(`Cannot change status from ${order.orderStatus} to ${status}`, 400));
  }

  order.orderStatus = status;
  
  // Add status history
  if (order.statusHistory) {
    order.statusHistory.push({
      status,
      note: note || `Order ${status} by rider`,
      updatedBy: riderId,
      timestamp: new Date()
    });
  }
  
  if (status === 'Out for Delivery') {
    order.riderPickedUpAt = Date.now();
  } else if (status === 'Delivered') {
    order.riderDeliveredAt = Date.now();
    order.deliveredAt = Date.now();
  }
  
  await order.save();

  if (status === 'Delivered') {
    const rider = await Rider.findById(riderId);
    
    // Remove from current orders
    if (rider.currentOrders) {
      rider.currentOrders = rider.currentOrders.filter(
        id => id.toString() !== orderId.toString()
      );
    }
    
    // Update stats
    if (!rider.stats) {
      rider.stats = {};
    }
    rider.stats.completedDeliveries = (rider.stats.completedDeliveries || 0) + 1;
    
    // Add earnings
    if (!rider.earnings) {
      rider.earnings = { total: 0, pending: 0, paid: 0 };
    }
    rider.earnings.total = (rider.earnings.total || 0) + (order.shippingPrice || 0);
    rider.earnings.pending = (rider.earnings.pending || 0) + (order.shippingPrice || 0);
    
    await rider.save();
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
  const { orderId } = req.params;
  const { note, deliveredAt } = req.body; // ✅ Accept both note and deliveredAt
  const riderId = req.rider._id;

  const order = await Order.findById(orderId);
  
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // ✅ Verify rider owns this order
  if (!order.rider || order.rider.toString() !== riderId.toString()) {
    return next(new AppError('Access denied - You are not assigned to this order', 403));
  }

  // ✅ Check valid transition
  if (order.orderStatus !== 'Out for Delivery') {
    return next(new AppError(`Cannot deliver order with status: ${order.orderStatus}`, 400));
  }

  // ✅ Update order status
  order.orderStatus = 'Delivered';
  order.deliveryNotes = note || 'Delivered successfully';
  order.riderDeliveredAt = deliveredAt || Date.now();
  order.deliveredAt = deliveredAt || Date.now();
  order.actualDeliveryTime = Date.now();
  
  // Add status history
  if (order.statusHistory) {
    order.statusHistory.push({
      status: 'Delivered',
      comment: note || 'Order delivered by rider',
      updatedBy: riderId,
      updatedAt: new Date()
    });
  }
  
  await order.save();

  // ✅ Update rider stats
  const rider = await Rider.findById(riderId);
  
  if (rider) {
    // Remove from current orders
    if (rider.currentOrders) {
      rider.currentOrders = rider.currentOrders.filter(
        id => id.toString() !== orderId.toString()
      );
    }
    
    // Update stats
    if (!rider.stats) rider.stats = {};
    rider.stats.completedDeliveries = (rider.stats.completedDeliveries || 0) + 1;
    rider.stats.todayDeliveries = (rider.stats.todayDeliveries || 0) + 1;
    rider.stats.weeklyDeliveries = (rider.stats.weeklyDeliveries || 0) + 1;
    rider.stats.monthlyDeliveries = (rider.stats.monthlyDeliveries || 0) + 1;
    
    // Add earnings
    if (!rider.earnings) {
      rider.earnings = { total: 0, pending: 0, paid: 0, thisWeek: 0, thisMonth: 0 };
    }
    const shippingAmount = order.shippingPrice || 0;
    rider.earnings.total = (rider.earnings.total || 0) + shippingAmount;
    rider.earnings.pending = (rider.earnings.pending || 0) + shippingAmount;
    rider.earnings.thisWeek = (rider.earnings.thisWeek || 0) + shippingAmount;
    rider.earnings.thisMonth = (rider.earnings.thisMonth || 0) + shippingAmount;
    
    // Update today's earnings
    rider.stats.todayEarnings = (rider.stats.todayEarnings || 0) + shippingAmount;
    rider.stats.weeklyEarnings = (rider.stats.weeklyEarnings || 0) + shippingAmount;
    rider.stats.monthlyEarnings = (rider.stats.monthlyEarnings || 0) + shippingAmount;
    
    // Update activity
    if (!rider.activity) rider.activity = {};
    rider.activity.lastDelivery = new Date();
    
    // ✅ CRITICAL: Update status based on remaining orders
    if (rider.currentOrders.length === 0) {
      rider.status = 'active'; // ✅ Back to active when no more deliveries
    }
    
    await rider.save();
    
    console.log('✅ Rider updated after delivery:', {
      riderId,
      completedDeliveries: rider.stats.completedDeliveries,
      currentOrders: rider.currentOrders.length,
      status: rider.status
    });
  }

  res.json({
    success: true,
    message: 'Order delivered successfully',
    data: {
      order: {
        id: order._id,
        orderId: order.orderId,
        status: order.orderStatus,
        deliveredAt: order.deliveredAt
      },
      rider: {
        status: rider?.status,
        activeOrders: rider?.currentOrders?.length || 0
      }
    }
  });
});

// ============================================
// PROFILE
// ============================================

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

  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: rider
  });
});

// ============================================
// EARNINGS
// ============================================

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

  const earningsQuery = dateFilter.$gte && rider.earningsHistory
    ? rider.earningsHistory.filter(e => e.date >= dateFilter.$gte)
    : rider.earningsHistory || [];

  const paginatedEarnings = earningsQuery
    .slice((page - 1) * limit, page * limit);

  res.json({
    success: true,
    summary: {
      total: rider.earnings?.total || 0,
      pending: rider.earnings?.pending || 0,
      paid: rider.earnings?.paid || 0,
      thisWeek: rider.earnings?.thisWeek || 0,
      thisMonth: rider.earnings?.thisMonth || 0
    },
    earnings: paginatedEarnings,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(earningsQuery.length / limit),
      total: earningsQuery.length
    }
  });
});

module.exports = exports;