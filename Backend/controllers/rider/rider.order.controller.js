const Order = require('../../models/order.model');
const riderService = require('../../services/rider.service');
const notificationService = require('../../services/notification.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const { successResponse } = require('../../utils/response');

// Get rider active orders
exports.getActiveOrders = catchAsync(async (req, res, next) => {
  const rider = await riderService.getRiderByUserId(req.user._id);
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  const activeOrders = await riderService.getRiderActiveOrders(rider._id);

  successResponse(res, activeOrders, 'Active orders fetched successfully');
});

// Get order history
exports.getOrderHistory = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  const rider = await riderService.getRiderByUserId(req.user._id);
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  const result = await riderService.getRiderOrderHistory(rider._id, page, limit);

  successResponse(res, result, 'Order history fetched successfully');
});

// Get order details
exports.getOrderDetails = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  const rider = await riderService.getRiderByUserId(req.user._id);
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  const order = await Order.findOne({
    _id: orderId,
    rider: rider._id
  })
    .populate('user', 'name email phone')
    .populate('items.product')
    .populate('deliveryAddress');

  if (!order) {
    return next(new AppError('Order not found or not assigned to you', 404));
  }

  successResponse(res, order, 'Order details fetched successfully');
});

// Accept order
exports.acceptOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  const rider = await riderService.getRiderByUserId(req.user._id);
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  // Check if rider can accept more orders
  if (!rider.canAcceptOrders) {
    return next(new AppError('You cannot accept more orders at this time', 400));
  }

  const order = await Order.findById(orderId);
  
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.rider) {
    return next(new AppError('Order already assigned to another rider', 400));
  }

  // Assign order to rider
  order.rider = rider._id;
  order.status = 'confirmed';
  order.statusHistory.push({
    status: 'confirmed',
    timestamp: new Date(),
    note: 'Rider accepted the order'
  });

  await order.save();
  await rider.acceptOrder(orderId);

  // Send notifications
  await notificationService.notifyOrderStatus(
    order._id,
    order.user,
    'confirmed',
    order.orderNumber
  );

  successResponse(res, order, 'Order accepted successfully');
});

// Update order status (picked up, out for delivery, etc.)
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { status, note } = req.body;

  const validStatuses = ['picked_up', 'out_for_delivery', 'delivered'];
  
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const rider = await riderService.getRiderByUserId(req.user._id);
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  const order = await Order.findOne({
    _id: orderId,
    rider: rider._id
  });

  if (!order) {
    return next(new AppError('Order not found or not assigned to you', 404));
  }

  // Update order status
  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    note: note || `Order ${status.replace('_', ' ')}`
  });

  if (status === 'delivered') {
    order.deliveredAt = new Date();
    
    // Calculate delivery earnings (you can adjust this logic)
    const deliveryEarnings = order.deliveryFee || 50;
    
    await riderService.completeDelivery(rider._id, orderId, deliveryEarnings);
  }

  await order.save();

  // Send notification to user
  await notificationService.notifyOrderStatus(
    order._id,
    order.user,
    status,
    order.orderNumber
  );

  successResponse(res, order, 'Order status updated successfully');
});

// Mark order as picked up
exports.pickupOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  const rider = await riderService.getRiderByUserId(req.user._id);
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  const order = await Order.findOne({
    _id: orderId,
    rider: rider._id
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  order.status = 'picked_up';
  order.pickedUpAt = new Date();
  order.statusHistory.push({
    status: 'picked_up',
    timestamp: new Date(),
    note: 'Order picked up by rider'
  });

  await order.save();

  // Notify user
  await notificationService.createUserNotification(
    order.user,
    'order_picked_up',
    'Order Picked Up',
    `Your order #${order.orderNumber} has been picked up by ${req.user.name}`,
    { orderId: order._id, riderName: req.user.name }
  );

  successResponse(res, order, 'Order marked as picked up');
});

// Mark order as out for delivery
exports.startDelivery = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  const rider = await riderService.getRiderByUserId(req.user._id);
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  const order = await Order.findOne({
    _id: orderId,
    rider: rider._id
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  order.status = 'out_for_delivery';
  order.statusHistory.push({
    status: 'out_for_delivery',
    timestamp: new Date(),
    note: 'Order out for delivery'
  });

  await order.save();

  // Notify user
  await notificationService.notifyOrderStatus(
    order._id,
    order.user,
    'out_for_delivery',
    order.orderNumber
  );

  successResponse(res, order, 'Delivery started');
});

// Complete delivery
exports.completeDelivery = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { deliveryProof, customerSignature } = req.body;

  const rider = await riderService.getRiderByUserId(req.user._id);
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  const order = await Order.findOne({
    _id: orderId,
    rider: rider._id
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  order.status = 'delivered';
  order.deliveredAt = new Date();
  order.deliveryProof = deliveryProof;
  order.customerSignature = customerSignature;
  order.statusHistory.push({
    status: 'delivered',
    timestamp: new Date(),
    note: 'Order delivered successfully'
  });

  await order.save();

  // Calculate earnings
  const deliveryEarnings = order.deliveryFee || 50;
  await riderService.completeDelivery(rider._id, orderId, deliveryEarnings);

  // Notify user
  await notificationService.notifyOrderStatus(
    order._id,
    order.user,
    'delivered',
    order.orderNumber
  );

  // Notify admin
  await notificationService.notifyAllAdmins(
    'delivery_completed',
    'Delivery Completed',
    `Order #${order.orderNumber} delivered by ${req.user.name}`,
    { orderId: order._id, riderId: rider._id }
  );

  successResponse(res, order, 'Delivery completed successfully');
});

// Report issue with order
exports.reportIssue = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { issueType, description } = req.body;

  const rider = await riderService.getRiderByUserId(req.user._id);
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  const order = await Order.findOne({
    _id: orderId,
    rider: rider._id
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Add incident to rider profile
  rider.incidents.push({
    type: issueType,
    description,
    orderId: order._id,
    reportedAt: new Date(),
    status: 'open'
  });

  await rider.save();

  // Notify admins
  await notificationService.notifyAllAdmins(
    'system_alert',
    'Order Issue Reported',
    `Rider ${req.user.name} reported an issue with order #${order.orderNumber}: ${issueType}`,
    { orderId: order._id, riderId: rider._id, issueType, description }
  );

  successResponse(res, null, 'Issue reported successfully');
});