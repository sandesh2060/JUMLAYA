// ============================================
// Backend/controllers/admin/admin.order.controller.js
// ✅ FIXED: Added notifications for ALL order status changes
// ============================================
const Order = require('../../models/order.model');
const User = require('../../models/user.model');
const Product = require('../../models/product.model');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const { successResponse } = require('../../utils/response');

// ✅ IMPORT NOTIFICATION HELPERS
const {
  notifyOrderConfirmed,
  notifyOrderCancelled,
  notifyOrderShipped,
  notifyOrderOutForDelivery,
  notifyOrderDelivered,
  notifyPaymentReceived
} = require('../../utils/notificationHelper');

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

  return successResponse(res, { order }, 'Order retrieved successfully');
});

// ✅ FIXED: Update order status WITH NOTIFICATIONS
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
  const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid order status', 400));
  }

  // Store old status for comparison
  const oldStatus = order.orderStatus;

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

  // ✅ SEND NOTIFICATIONS BASED ON STATUS CHANGE
  try {
    const userId = order.user._id || order.user;

    // Only send notification if status actually changed
    if (oldStatus !== status) {
      console.log(`📧 Sending notification for status change: ${oldStatus} → ${status}`);

      switch (status) {
        case 'Confirmed':
        case 'Processing':
          await notifyOrderConfirmed(userId, order);
          console.log('✅ Order confirmed notification sent');
          break;

        case 'Shipped':
          await notifyOrderShipped(userId, order);
          console.log('✅ Order shipped notification sent');
          break;

        case 'Out for Delivery':
          await notifyOrderOutForDelivery(userId, order);
          console.log('✅ Out for delivery notification sent');
          break;

        case 'Delivered':
          await notifyOrderDelivered(userId, order);
          console.log('✅ Order delivered notification sent');
          break;

        case 'Cancelled':
          await notifyOrderCancelled(userId, order, comment || 'Order cancelled by admin');
          console.log('✅ Order cancelled notification sent');
          break;

        default:
          console.log(`ℹ️ No notification handler for status: ${status}`);
      }
    } else {
      console.log('ℹ️ Status unchanged, no notification sent');
    }
  } catch (notifError) {
    console.error('❌ Notification error:', notifError);
    // Don't fail the status update if notification fails
  }

  // Populate for response
  await order.populate([
    { path: 'user', select: 'name email phone' },
    { path: 'statusHistory.updatedBy', select: 'name email' }
  ]);

  return successResponse(res, { order }, 'Order status updated successfully');
});

// ✅ FIXED: Update payment status WITH NOTIFICATIONS
exports.updatePaymentStatus = catchAsync(async (req, res, next) => {
  const { paymentStatus, transactionId } = req.body;

  if (!paymentStatus) {
    return next(new AppError('Payment status is required', 400));
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const oldPaymentStatus = order.paymentStatus;
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

  // ✅ SEND PAYMENT NOTIFICATION
  try {
    const userId = order.user._id || order.user;
    
    if (oldPaymentStatus !== paymentStatus && paymentStatus === 'Paid') {
      await notifyPaymentReceived(userId, order);
      console.log('✅ Payment received notification sent');
    }
  } catch (notifError) {
    console.error('❌ Notification error:', notifError);
  }

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
    totalCustomers
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
    totalCustomers: totalCustomers[0]?.total || 0,
    ordersByStatus,
    ordersByPaymentMethod,
    recentOrders
  };

  return successResponse(res, stats, 'Order statistics retrieved successfully');
});

// ✅ FIXED: Bulk update with notifications
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
      const oldStatus = order.orderStatus;
      order.orderStatus = status;
      order.addStatusHistory(status, comment || 'Bulk update', req.user._id);
      await order.save();

      // ✅ Send notification for each order
      try {
        const userId = order.user._id || order.user;
        
        if (oldStatus !== status) {
          switch (status) {
            case 'Confirmed':
            case 'Processing':
              await notifyOrderConfirmed(userId, order);
              break;
            case 'Shipped':
              await notifyOrderShipped(userId, order);
              break;
            case 'Out for Delivery':
              await notifyOrderOutForDelivery(userId, order);
              break;
            case 'Delivered':
              await notifyOrderDelivered(userId, order);
              break;
            case 'Cancelled':
              await notifyOrderCancelled(userId, order, comment || 'Bulk cancellation');
              break;
          }
        }
      } catch (notifError) {
        console.error('❌ Bulk notification error:', notifError);
      }

      return order;
    }
  });

  await Promise.all(updatePromises);

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

  return successResponse(res, { orders }, 'Orders exported successfully');
});