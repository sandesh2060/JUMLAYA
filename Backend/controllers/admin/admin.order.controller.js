const Order = require('../../models/order.model');
const User = require('../../models/user.model');
const Product = require('../../models/product.model');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const { successResponse } = require('../../utils/response');

// Get all orders with filtering, sorting, and pagination
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
    paymentMethod,
    search,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter query
  const filter = {};

  if (status) {
    filter.orderStatus = status;
  }

  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  }

  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  if (search) {
    filter.$or = [
      { orderId: { $regex: search, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
      { 'shippingAddress.email': { $regex: search, $options: 'i' } }
    ];
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (page - 1) * limit;
  
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Order.countDocuments(filter)
  ]);

  // ✅ FIXED: Changed parameter order
  return successResponse(res, {
    orders,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
      limit: parseInt(limit)
    }
  }, 'Orders retrieved successfully');
});

// Get single order details
exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone avatar')
    .populate('items.product', 'name images sku')
    .populate('statusHistory.updatedBy', 'name email');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // ✅ FIXED: Changed parameter order
  return successResponse(res, { order }, 'Order retrieved successfully');
});

// Update order status
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, comment, trackingNumber, carrier, estimatedDelivery } = req.body;

  if (!status) {
    return next(new AppError('Status is required', 400));
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Validate status transition
  const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid order status', 400));
  }

  // Update order status
  order.orderStatus = status;

  // Add to status history
  order.addStatusHistory(status, comment || '', req.user._id);

  // Update additional fields based on status
  if (status === 'Shipped') {
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);
  }

  if (status === 'Delivered') {
    order.deliveredAt = new Date();
    order.paymentStatus = 'Paid'; // Auto-mark as paid when delivered
  }

  if (status === 'Cancelled') {
    order.cancelledAt = new Date();
    if (comment) order.cancellationReason = comment;
  }

  await order.save();

  // Populate for response
  await order.populate([
    { path: 'user', select: 'name email phone' },
    { path: 'statusHistory.updatedBy', select: 'name email' }
  ]);

  // ✅ FIXED: Changed parameter order
  return successResponse(res, { order }, 'Order status updated successfully');
});

// Update payment status
exports.updatePaymentStatus = catchAsync(async (req, res, next) => {
  const { paymentStatus, transactionId } = req.body;

  if (!paymentStatus) {
    return next(new AppError('Payment status is required', 400));
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  order.paymentStatus = paymentStatus;

  if (paymentStatus === 'Paid' && !order.paymentDetails.paidAt) {
    order.paymentDetails.paidAt = new Date();
    if (transactionId) {
      order.paymentDetails.transactionId = transactionId;
    }
  }

  if (paymentStatus === 'Refunded') {
    order.paymentDetails.refundedAt = new Date();
    order.paymentDetails.refundAmount = order.totalPrice;
  }

  await order.save();

  // ✅ FIXED: Changed parameter order
  return successResponse(res, { order }, 'Payment status updated successfully');
});

// Update admin notes
exports.updateAdminNotes = catchAsync(async (req, res, next) => {
  const { adminNotes } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { adminNotes },
    { new: true, runValidators: true }
  );

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // ✅ FIXED: Changed parameter order
  return successResponse(res, { order }, 'Admin notes updated successfully');
});

// Delete order (soft delete - mark as cancelled)
exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Only allow deletion of pending or cancelled orders
  if (!['Pending', 'Cancelled'].includes(order.orderStatus)) {
    return next(new AppError('Cannot delete orders that are confirmed or in progress', 400));
  }

  await Order.findByIdAndDelete(req.params.id);

  // ✅ FIXED: Changed parameter order (null data is fine)
  return successResponse(res, null, 'Order deleted successfully');
});

// Get order statistics
exports.getOrderStats = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  const [
    totalOrders,
    pendingOrders,
    confirmedOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
    ordersByStatus,
    ordersByPaymentMethod,
    recentOrders,
    totalCustomers  // ✅ ADD THIS LINE
  ] = await Promise.all([
    Order.countDocuments(dateFilter),
    Order.countDocuments({ ...dateFilter, orderStatus: 'Pending' }),
    Order.countDocuments({ ...dateFilter, orderStatus: 'Confirmed' }),
    Order.countDocuments({ ...dateFilter, orderStatus: 'Shipped' }),
    Order.countDocuments({ ...dateFilter, orderStatus: 'Delivered' }),
    Order.countDocuments({ ...dateFilter, orderStatus: 'Cancelled' }),
    Order.aggregate([
      { $match: { ...dateFilter, orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]),
    Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]),
    Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
    ]),
    Order.find(dateFilter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    // ✅ ADD THIS QUERY - Count unique customers who placed orders
    Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$user' } },
      { $count: 'total' }
    ])
  ]);

  const stats = {
    totalOrders,
    pendingOrders,
    confirmedOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalCustomers: totalCustomers[0]?.total || 0,  // ✅ ADD THIS LINE
    ordersByStatus,
    ordersByPaymentMethod,
    recentOrders
  };

  // ✅ Change parameter order: (res, data, message)
  return successResponse(res, stats, 'Order statistics retrieved successfully');
});
// Bulk update order status
exports.bulkUpdateStatus = catchAsync(async (req, res, next) => {
  const { orderIds, status, comment } = req.body;

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return next(new AppError('Order IDs array is required', 400));
  }

  if (!status) {
    return next(new AppError('Status is required', 400));
  }

  const updatePromises = orderIds.map(async (orderId) => {
    const order = await Order.findById(orderId);
    if (order) {
      order.orderStatus = status;
      order.addStatusHistory(status, comment || 'Bulk update', req.user._id);
      return order.save();
    }
  });

  await Promise.all(updatePromises);

  // ✅ FIXED: Changed parameter order
  return successResponse(res, {
    updatedCount: orderIds.length
  }, 'Orders updated successfully');
});

// Export orders to CSV
exports.exportOrders = catchAsync(async (req, res, next) => {
  const { startDate, endDate, status } = req.query;

  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  if (status) filter.orderStatus = status;

  const orders = await Order.find(filter)
    .populate('user', 'name email phone')
    .lean();

  // ✅ FIXED: Changed parameter order
  return successResponse(res, { orders }, 'Orders exported successfully');
});