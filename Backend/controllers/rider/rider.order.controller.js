// ============================================
// Backend/controllers/rider/rider.order.controller.js
// ✅ COMPLETE & PRODUCTION READY
// Handles all rider order operations with admin notifications
// ============================================

const Order = require('../../models/order.model');
const Rider = require('../../models/rider.model');
const riderService = require('../../services/rider.service');
const notificationService = require('../../services/notification.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const { successResponse } = require('../../utils/response');

// ✅ IMPORT NOTIFICATION HELPER
const { notifyRiderAcceptedOrder } = require('../../utils/notificationHelper');

// ==========================================
// GET ACTIVE ORDERS (FOR NAVIGATION)
// @route GET /api/rider/orders/active
// ==========================================
exports.getActiveOrders = catchAsync(async (req, res, next) => {
  const riderId = req.user._id;

  // Find rider - supports both service and direct model query
  let rider;
  try {
    rider = await riderService.getRiderByUserId(riderId);
  } catch (err) {
    rider = await Rider.findOne({ user: riderId });
  }
  
  if (!rider) {
    return next(new AppError('Rider profile not found', 404));
  }

  // Get orders that are actively being delivered
  const activeOrders = await Order.find({
    rider: rider._id,
    status: { 
      $in: ['confirmed', 'preparing', 'picked_up', 'out_for_delivery'] 
    }
  })
  .populate('user', 'firstname lastname name phone avatar')
  .populate('restaurant', 'name location phone address')
  .populate('deliveryAddress')
  .populate('items.product', 'name price images')
  .sort({ createdAt: -1 })
  .limit(5); // Limit to 5 active orders

  res.status(200).json({
    status: 'success',
    results: activeOrders.length,
    data: activeOrders
  });
});

// ==========================================
// GET ORDER HISTORY
// @route GET /api/rider/orders/history
// ==========================================
exports.getOrderHistory = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  const rider = await riderService.getRiderByUserId(req.user._id);
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  const result = await riderService.getRiderOrderHistory(rider._id, page, limit);

  successResponse(res, result, 'Order history fetched successfully');
});

// ==========================================
// GET ORDER DETAILS
// @route GET /api/rider/orders/:orderId
// ==========================================
exports.getOrderDetails = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const riderId = req.user._id;

  // Find rider - supports both methods
  let rider;
  try {
    rider = await riderService.getRiderByUserId(riderId);
  } catch (err) {
    rider = await Rider.findOne({ user: riderId });
  }
  
  if (!rider) {
    return next(new AppError('Rider profile not found', 404));
  }

  const order = await Order.findOne({
    _id: orderId,
    rider: rider._id
  })
  .populate('user', 'firstname lastname name email phone avatar')
  .populate('restaurant', 'name phone location address')
  .populate('deliveryAddress')
  .populate('items.product', 'name price images');

  if (!order) {
    return next(new AppError('Order not found or access denied', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// ==========================================
// ACCEPT ORDER - WITH ADMIN NOTIFICATION
// @route POST /api/rider/orders/:orderId/accept
// ==========================================
exports.acceptOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  console.log('🏍️ Rider attempting to accept order:', orderId);

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

  console.log('✅ Order assigned to rider successfully');

  // ✅ CRITICAL: Notify admins about rider accepting order
  try {
    console.log('📧 Sending admin notification for rider acceptance...');
    await notifyRiderAcceptedOrder(order, req.user);
    console.log('✅ Admin notified about rider accepting order');
  } catch (notifError) {
    console.error('❌ Admin notification error:', notifError);
    // Don't fail the acceptance if notification fails
  }

  // Send notification to customer
  try {
    await notificationService.notifyOrderStatus(
      order._id,
      order.user,
      'confirmed',
      order.orderNumber
    );
    console.log('✅ Customer notified about order confirmation');
  } catch (notifError) {
    console.error('❌ Customer notification error:', notifError);
  }

  successResponse(res, order, 'Order accepted successfully');
});

// ==========================================
// UPDATE ORDER STATUS
// @route PATCH /api/rider/orders/:orderId/status
// ==========================================
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
    
    // Calculate delivery earnings
    const deliveryEarnings = order.deliveryFee || 50;
    
    await riderService.completeDelivery(rider._id, orderId, deliveryEarnings);
  }

  await order.save();

  // Send notification to user
  try {
    await notificationService.notifyOrderStatus(
      order._id,
      order.user,
      status,
      order.orderNumber
    );
  } catch (notifError) {
    console.error('❌ Notification error:', notifError);
  }

  successResponse(res, order, 'Order status updated successfully');
});

// ==========================================
// MARK ORDER AS PICKED UP
// @route POST /api/rider/orders/:orderId/pickup
// ==========================================
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
  try {
    await notificationService.createUserNotification(
      order.user,
      'order_picked_up',
      'Order Picked Up',
      `Your order #${order.orderNumber} has been picked up by ${req.user.name || req.user.firstname}`,
      { orderId: order._id, riderName: req.user.name || req.user.firstname }
    );
  } catch (notifError) {
    console.error('❌ Notification error:', notifError);
  }

  successResponse(res, order, 'Order marked as picked up');
});

// ==========================================
// START DELIVERY (OUT FOR DELIVERY)
// @route POST /api/rider/orders/:orderId/start-delivery
// ==========================================
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
  try {
    await notificationService.notifyOrderStatus(
      order._id,
      order.user,
      'out_for_delivery',
      order.orderNumber
    );
  } catch (notifError) {
    console.error('❌ Notification error:', notifError);
  }

  successResponse(res, order, 'Delivery started');
});

// ==========================================
// COMPLETE DELIVERY
// @route POST /api/rider/orders/:orderId/complete
// ==========================================
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
  try {
    await notificationService.notifyOrderStatus(
      order._id,
      order.user,
      'delivered',
      order.orderNumber
    );
  } catch (notifError) {
    console.error('❌ Customer notification error:', notifError);
  }

  // Notify admin
  try {
    await notificationService.notifyAllAdmins(
      'order_delivered',
      'Delivery Completed',
      `Order #${order.orderNumber} delivered by ${req.user.name || req.user.firstname}`,
      { orderId: order._id, riderId: rider._id }
    );
  } catch (notifError) {
    console.error('❌ Admin notification error:', notifError);
  }

  successResponse(res, order, 'Delivery completed successfully');
});

// ==========================================
// REPORT ISSUE WITH ORDER
// @route POST /api/rider/orders/:orderId/report-issue
// ==========================================
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
  try {
    await notificationService.notifyAllAdmins(
      'system_notification',
      'Order Issue Reported',
      `Rider ${req.user.name || req.user.firstname} reported an issue with order #${order.orderNumber}: ${issueType}`,
      { orderId: order._id, riderId: rider._id, issueType, description }
    );
  } catch (notifError) {
    console.error('❌ Admin notification error:', notifError);
  }

  successResponse(res, null, 'Issue reported successfully');
});