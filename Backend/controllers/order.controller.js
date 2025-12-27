// Backend/controllers/order.controller.js - PRODUCTION READY
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const Address = require('../models/address.model'); // ✅ ADD THIS
const Cart = require('../models/cart.model'); // ✅ ADD THIS
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const { generateOrderId } = require('../utils/generateOrderId');
const mongoose = require('mongoose');

// Helper to get user ID
const getUserId = (req) => req.user.id || req.user._id;

// ==========================================
// CREATE ORDER - FULLY FIXED
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

  // ✅ Normalize payment method to uppercase
  const normalizedPaymentMethod = paymentMethod.toUpperCase();
  
  // Validate payment method
  const validPaymentMethods = ['COD', 'ESEWA', 'KHALTI', 'CARD'];
  if (!validPaymentMethods.includes(normalizedPaymentMethod)) {
    return next(new AppError('Invalid payment method', 400));
  }

  // ✅ Get shipping address from Address model
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

  console.log('✅ Shipping address found:', shippingAddress.addressLine1);

  // Get user
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // ✅ Get cart from Cart model
  let orderItems = [];
  
  if (items && items.length > 0) {
    // Use provided items (for direct checkout)
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
    // ✅ Use cart from Cart model
    const cart = await Cart.findOne({ user: userId, isActive: true })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return next(new AppError('Cart is empty', 400));
    }

    // Validate stock and prepare order items
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

  console.log('✅ Order items prepared:', orderItems.length);

  // Calculate totals
  const itemsPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxPrice = Math.round(itemsPrice * 0.13); // 13% VAT
  const shippingPrice = itemsPrice >= 2000 ? 0 : 100;
  
  let discountAmount = 0;
  // TODO: Validate and apply coupon if provided
  
  const totalPrice = itemsPrice + taxPrice + shippingPrice - discountAmount;

  // ✅ Generate orderId
  const orderId = await generateOrderId();
  console.log('✅ Generated order ID:', orderId);

  // ✅ Create order with proper address format
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
    paymentStatus: 'Pending',
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountAmount,
    totalPrice,
    couponCode: couponCode || undefined,
    orderStatus: 'Pending'
  });

  console.log('✅ Order created:', order.orderId);

  // Update product stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: -item.quantity, sold: item.quantity } }
    );
  }

  // ✅ Clear cart from Cart model
  if (!items || items.length === 0) {
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], appliedCoupon: undefined, discount: 0 }
    );
    console.log('✅ Cart cleared');
  }

  // ✅ Mark address as used
  await shippingAddress.markAsUsed();

  // For eSewa/Khalti, return payment URL
  let paymentUrl = null;
  if (normalizedPaymentMethod === 'ESEWA') {
    paymentUrl = `https://uat.esewa.com.np/epay/main?amt=${totalPrice}&pid=${order.orderId}&scd=EPAYTEST&su=${process.env.FRONTEND_URL}/payment/success&fu=${process.env.FRONTEND_URL}/payment/failure`;
  } else if (normalizedPaymentMethod === 'KHALTI') {
    // TODO: Implement Khalti payment integration
    paymentUrl = null;
  }

  // ✅ Return response in correct format
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

  console.log('✅ Found orders:', orders.length);

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
// GET ORDER BY ID
// ==========================================
exports.getOrder = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const { id } = req.params;

  const order = await Order.findOne({
    _id: id,
    user: userId
  }).populate('items.product', 'name images price');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  return successResponse(res, { order }, 'Order retrieved successfully');
});

// ==========================================
// GET ORDER STATISTICS
// ==========================================
exports.getMyOrderStats = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);

  console.log('📊 Getting stats for user:', userId);

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

  console.log('✅ Stats:', { totalOrders, byStatus: stats });

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
// CANCEL ORDER
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

  // Can only cancel pending or confirmed orders
  if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
    return next(new AppError('Order cannot be cancelled at this stage', 400));
  }

  // Update order status
  order.orderStatus = 'Cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = reason || 'Cancelled by customer';
  order.addStatusHistory('Cancelled', reason || 'Cancelled by customer', userId);
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

  return successResponse(res, { order }, 'Order cancelled successfully');
});

// ==========================================
// REQUEST RETURN
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

  // Can only return delivered orders
  if (order.orderStatus !== 'Delivered') {
    return next(new AppError('Only delivered orders can be returned', 400));
  }

  // Check if within return window (7 days)
  const daysSinceDelivery = Math.floor(
    (Date.now() - order.deliveredAt) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceDelivery > 7) {
    return next(new AppError('Return window has expired (7 days)', 400));
  }

  order.orderStatus = 'Returned';
  order.addStatusHistory('Returned', reason, userId);
  await order.save();

  return successResponse(res, { order }, 'Return request submitted successfully');
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

  // Get or create cart
  let cart = await Cart.findOne({ user: userId, isActive: true });
  if (!cart) {
    cart = await Cart.create({ user: userId });
  }

  // Add items from order to cart
  for (const item of order.items) {
    if (item.product && item.product.isActive && item.product.stock > 0) {
      await cart.addItem(
        item.product._id,
        Math.min(item.quantity, item.product.stock),
        item.product.salePrice || item.product.price
      );
    }
  }

  console.log('✅ Items added to cart from order:', order.orderId);

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

  const order = await Order.findOne({
    _id: id,
    user: userId
  }).populate('items.product', 'name');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // TODO: Generate PDF invoice using a library like pdfkit or puppeteer
  // For now, return order data
  
  return successResponse(res, {
    invoice: {
      orderNumber: order.orderId,
      date: order.createdAt,
      items: order.items,
      subtotal: order.itemsPrice,
      tax: order.taxPrice,
      shipping: order.shippingPrice,
      discount: order.discountAmount,
      total: order.totalPrice,
      customer: {
        name: order.shippingAddress.fullName,
        email: order.shippingAddress.email,
        phone: order.shippingAddress.phone
      },
      address: order.shippingAddress
    }
  }, 'Invoice data retrieved');
});