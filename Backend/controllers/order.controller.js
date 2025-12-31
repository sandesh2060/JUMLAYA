// ============================================
// Backend/controllers/order.controller.js
// ✅ FIXED: Orders start as "Pending", riders notified when "Processing"
// ============================================
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const Address = require('../models/address.model');
const Cart = require('../models/cart.model');
const Settings = require('../models/settings.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const { generateOrderId } = require('../utils/generateOrderId');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');
const {
  notifyOrderPlaced,
  notifyOrderConfirmed,
  notifyOrderCancelled,
  notifyOrderReturned,
  notifyOrderShipped,
  notifyOrderOutForDelivery,
  notifyOrderDelivered,
  notifyPaymentReceived
} = require('../utils/notificationHelper');

// ✅ IMPORT RIDER NOTIFICATION HELPER
const {
  notifyRidersNewDelivery
} = require('../utils/riderNotificationHelper');

const mongoose = require('mongoose');

// Helper to get user ID
const getUserId = (req) => req.user.id || req.user._id;

// ==========================================
// CREATE ORDER - ✅ FIXED: Starts as "Pending"
// ==========================================
exports.createOrder = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const {
    shippingAddressId,
    paymentMethod,
    items,
    couponCode
  } = req.body;

  console.log('📦 Creating order for user:', userId);

  // Validate payment method
  const normalizedPaymentMethod = paymentMethod.toUpperCase();
  const validPaymentMethods = ['COD', 'ESEWA', 'KHALTI', 'CARD'];
  if (!validPaymentMethods.includes(normalizedPaymentMethod)) {
    return next(new AppError('Invalid payment method', 400));
  }

  // Validate shipping address
  if (!shippingAddressId) {
    return next(new AppError('Shipping address is required', 400));
  }

  const shippingAddress = await Address.findOne({
    _id: shippingAddressId,
    user: userId,
    isActive: true
  });

  if (!shippingAddress) {
    return next(new AppError('Shipping address not found', 404));
  }

  // Get user
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  let orderItems = [];
  
  // Process items (from request or cart)
  if (items && items.length > 0) {
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return next(new AppError(`Product ${item.product} not found`, 404));
      }
      if (!product.isActive) {
        return next(new AppError(`Product ${product.name} is not available`, 400));
      }
      if (product.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for ${product.name}`, 400));
      }
      
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.salePrice || product.price,
        image: product.images?.[0] || '',
        sku: product.sku || `SKU-${product._id.toString().slice(-6)}`
      });
    }
  } else {
    const cart = await Cart.findOne({ user: userId, isActive: true })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return next(new AppError('Cart is empty', 400));
    }

    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return next(new AppError('Some products are no longer available', 400));
      }
      
      if (item.product.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for ${item.product.name}`, 400));
      }

      orderItems.push({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price || item.product.salePrice || item.product.price,
        image: item.product.images?.[0] || '',
        sku: item.product.sku || `SKU-${item.product._id.toString().slice(-6)}`
      });
    }
  }

  // Calculate prices
  const itemsPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxPrice = Math.round(itemsPrice * 0.13);
  const shippingPrice = itemsPrice >= 2000 ? 0 : 100;
  const discountAmount = 0;
  const totalPrice = itemsPrice + taxPrice + shippingPrice - discountAmount;

  // Generate order ID
  const orderId = await generateOrderId();

  // ✅ FIXED: Create order with "Pending" status
  const order = await Order.create({
    orderId,
    user: userId,
    items: orderItems,
    shippingAddress: {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      email: shippingAddress.email || user.email,
      addressLine1: shippingAddress.addressLine1,
      addressLine2: shippingAddress.addressLine2 || '',
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country || 'Nepal'
    },
    paymentMethod: normalizedPaymentMethod,
    paymentStatus: normalizedPaymentMethod === 'COD' ? 'Pending' : 'Pending',
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountAmount,
    totalPrice,
    couponCode: couponCode || undefined,
    orderStatus: 'Pending' // ✅ FIXED: Start as Pending
  });

  console.log('✅ Order created:', order.orderId);

  // Update product stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: -item.quantity, sold: item.quantity } }
    );
  }

  // Clear cart
  if (!items || items.length === 0) {
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], appliedCoupon: undefined, discount: 0 }
    );
  }

  await shippingAddress.markAsUsed();

  // ✅ SEND CUSTOMER NOTIFICATION WITH EMAIL
  try {
    await notifyOrderPlaced(userId, order);
    console.log('✅ Customer order placed notification sent');
  } catch (notifError) {
    console.error('❌ Customer notification error:', notifError);
  }

  // ✅ REMOVED: Don't notify riders yet - wait until admin confirms

  // Generate payment URL if needed
  let paymentUrl = null;
  if (normalizedPaymentMethod === 'ESEWA') {
    paymentUrl = `https://uat.esewa.com.np/epay/main?amt=${totalPrice}&pid=${order.orderId}&scd=EPAYTEST&su=${process.env.FRONTEND_URL}/payment/success&fu=${process.env.FRONTEND_URL}/payment/failure`;
  }

  return successResponse(res, {
    order: {
      _id: order._id,
      orderId: order.orderId,
      total: order.totalPrice,
      totalPrice: order.totalPrice,
      paymentMethod: order.paymentMethod,
      orderStatus: order.orderStatus,
      items: order.items,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt
    },
    paymentUrl
  }, 'Order placed successfully', 201);
});

// ==========================================
// ✅ NEW: CONFIRM ORDER - Admin/System confirms and notifies riders
// ==========================================
exports.confirmOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const adminId = getUserId(req);

  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.orderStatus !== 'Pending') {
    return next(new AppError('Only pending orders can be confirmed', 400));
  }

  // Update order status to Processing
  order.orderStatus = 'Processing';
  order.addStatusHistory('Processing', 'Order confirmed and ready for delivery', adminId);
  await order.save();

  // ✅ NOTIFY ALL ACTIVE RIDERS ABOUT NEW DELIVERY
  try {
    await notifyRidersNewDelivery(order);
    console.log('✅ All active riders notified about order:', order.orderId);
  } catch (riderNotifError) {
    console.error('❌ Rider notification error:', riderNotifError);
  }

  // ✅ NOTIFY CUSTOMER
  try {
    await notifyOrderConfirmed(order.user, order);
    console.log('✅ Customer notified about order confirmation');
  } catch (notifError) {
    console.error('❌ Customer notification error:', notifError);
  }

  return successResponse(res, { order }, 'Order confirmed successfully');
});

// ==========================================
// ✅ NEW: ASSIGN ORDER TO RIDER
// ==========================================
exports.assignOrderToRider = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { riderId } = req.body;
  const adminId = getUserId(req);

  if (!riderId) {
    return next(new AppError('Rider ID is required', 400));
  }

  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const rider = await User.findOne({ _id: riderId, role: 'rider' });
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  if (!['Pending', 'Processing'].includes(order.orderStatus)) {
    return next(new AppError('Order cannot be assigned at this stage', 400));
  }

  // Assign rider using model method
  order.assignRider(riderId, adminId);
  await order.save();

  // ✅ NOTIFY RIDER
  try {
    const Notification = require('../models/notification.model');
    await Notification.create({
      user: riderId,
      type: 'new_order_assignment',
      title: 'New Delivery Assignment',
      message: `You have been assigned order #${order.orderId}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderId,
        deliveryAddress: `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}`,
        amount: order.totalPrice
      }
    });
    console.log('✅ Rider notified about assignment');
  } catch (notifError) {
    console.error('❌ Rider notification error:', notifError);
  }

  return successResponse(res, { order }, 'Order assigned to rider successfully');
});

// ==========================================
// CANCEL ORDER - WITH NOTIFICATIONS
// ==========================================
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const { id } = req.params;
  const { reason } = req.body;

  const order = await Order.findOne({
    _id: id,
    user: userId
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (!['Pending', 'Confirmed', 'Processing'].includes(order.orderStatus)) {
    return next(new AppError('Order cannot be cancelled at this stage', 400));
  }

  const cancellationReason = reason || 'Cancelled by customer';

  order.orderStatus = 'Cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = cancellationReason;
  order.addStatusHistory('Cancelled', cancellationReason, userId);
  await order.save();

  // Restore product stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { 
        $inc: { 
          stock: item.quantity,
          sold: -item.quantity 
        } 
      }
    );
  }

  // ✅ SEND NOTIFICATION WITH EMAIL
  try {
    await notifyOrderCancelled(userId, order, cancellationReason);
    console.log('✅ Order cancelled notification sent');
  } catch (notifError) {
    console.error('❌ Notification error:', notifError);
  }

  return successResponse(res, { order }, 'Order cancelled successfully');
});

// ==========================================
// REQUEST RETURN - WITH NOTIFICATIONS
// ==========================================
exports.requestReturn = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Return reason is required', 400));
  }

  const order = await Order.findOne({
    _id: id,
    user: userId
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.orderStatus !== 'Delivered') {
    return next(new AppError('Only delivered orders can be returned', 400));
  }

  const daysSinceDelivery = Math.floor(
    (Date.now() - order.deliveredAt) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceDelivery > 7) {
    return next(new AppError('Return window has expired (7 days)', 400));
  }

  order.orderStatus = 'Returned';
  order.addStatusHistory('Returned', reason, userId);
  await order.save();

  // ✅ SEND NOTIFICATION WITH EMAIL
  try {
    await notifyOrderReturned(userId, order);
    console.log('✅ Order returned notification sent');
  } catch (notifError) {
    console.error('❌ Notification error:', notifError);
  }

  return successResponse(res, { order }, 'Return request submitted successfully');
});

// ==========================================
// GET MY ORDERS
// ==========================================
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const { status, page = 1, limit = 10 } = req.query;

  const query = { user: userId };
  if (status) {
    query.orderStatus = status;
  }

  const orders = await Order.find(query)
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Order.countDocuments(query);

  return successResponse(res, {
    orders,
    pagination: {
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalOrders: count
    }
  }, 'Orders retrieved successfully');
});

// ==========================================
// GET SINGLE ORDER
// ==========================================
exports.getOrder = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const { id } = req.params;

  const order = await Order.findOne({
    _id: id,
    user: userId
  })
    .populate('items.product', 'name images price salePrice')
    .populate('rider', 'firstname lastname email phone riderProfile.vehicleType riderProfile.vehicleNumber riderProfile.rating')
    .lean();

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  return successResponse(res, order, 'Order retrieved successfully');
});

// ==========================================
// GET ORDER STATS
// ==========================================
exports.getMyOrderStats = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);

  const stats = await Order.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalPrice' }
      }
    }
  ]);

  const totalOrders = await Order.countDocuments({ user: userId });
  const totalSpent = await Order.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), orderStatus: 'Delivered' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);

  return successResponse(res, {
    totalOrders,
    totalSpent: totalSpent[0]?.total || 0,
    byStatus: stats
  }, 'Order statistics retrieved');
});

// ==========================================
// TRACK ORDER
// ==========================================
exports.trackOrder = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const { id } = req.params;

  const order = await Order.findOne({
    _id: id,
    user: userId
  }).select('orderId orderStatus statusHistory deliveredAt estimatedDelivery trackingNumber');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  return successResponse(res, {
    orderId: order.orderId,
    currentStatus: order.orderStatus,
    statusHistory: order.statusHistory,
    trackingNumber: order.trackingNumber,
    estimatedDelivery: order.estimatedDelivery,
    deliveredAt: order.deliveredAt
  }, 'Order tracking info retrieved');
});

// ==========================================
// REORDER
// ==========================================
exports.reorder = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const { id } = req.params;

  const order = await Order.findOne({
    _id: id,
    user: userId
  }).populate('items.product');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  let cart = await Cart.findOne({ user: userId, isActive: true });
  if (!cart) {
    cart = await Cart.create({ user: userId });
  }

  for (const item of order.items) {
    if (item.product && item.product.isActive && item.product.stock > 0) {
      await cart.addItem(
        item.product._id,
        Math.min(item.quantity, item.product.stock),
        item.product.salePrice || item.product.price
      );
    }
  }

  return successResponse(res, { 
    cart,
    message: 'Items added to cart successfully' 
  }, 'Items added to cart successfully');
});

// ==========================================
// DOWNLOAD INVOICE
// ==========================================
exports.downloadInvoice = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const { id } = req.params;

  console.log('📄 Generating invoice for order:', id);

  const order = await Order.findOne({
    _id: id,
    user: userId
  }).lean();

  if (!order) {
    console.log('❌ Order not found:', id);
    return next(new AppError('Order not found', 404));
  }

  console.log('✅ Order found:', order.orderId);

  let settings = {};
  try {
    const storeSettings = await Settings.findOne({ isActive: true });
    if (storeSettings) {
      settings = {
        storeName: storeSettings.storeName,
        storeEmail: storeSettings.storeEmail,
        storePhone: storeSettings.storePhone,
        storeAddress: storeSettings.storeAddress,
        currency: storeSettings.currency,
        taxRate: storeSettings.taxRate
      };
      console.log('✅ Settings loaded:', settings.storeName);
    }
  } catch (error) {
    console.log('⚠️ Using default settings:', error.message);
  }

  try {
    const doc = generateInvoicePDF(order, settings);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderId}.pdf`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    doc.pipe(res);
    doc.end();

    console.log('✅ Invoice PDF generated successfully');
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    return next(new AppError('Failed to generate invoice PDF', 500));
  }
});