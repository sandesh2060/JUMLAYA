const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const { generateOrderId } = require('../utils/generateOrderId');
const AppError = require('../utils/AppError');

class OrderService {
  // Create new order
  async createOrder(orderData, userId) {
    const {
      items,
      shippingAddress,
      paymentMethod,
      couponCode,
      shippingPrice = 0,
      taxPrice = 0,
      discountAmount = 0
    } = orderData;

    // Validate items
    if (!items || items.length === 0) {
      throw new AppError('Order must contain at least one item', 400);
    }

    // Validate and get products
    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      throw new AppError('Some products not found', 404);
    }

    // Build order items and calculate total
    let itemsPrice = 0;
    const orderItems = items.map(item => {
      const product = products.find(p => p._id.toString() === item.product.toString());
      
      if (!product) {
        throw new AppError(`Product ${item.product} not found`, 404);
      }

      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }

      const itemTotal = product.price * item.quantity;
      itemsPrice += itemTotal;

      return {
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.images?.[0] || '',
        sku: product.sku
      };
    });

    // Calculate total price
    const totalPrice = itemsPrice + shippingPrice + taxPrice - discountAmount;

    // Generate unique order ID
    const orderId = await generateOrderId();

    // Create order
    const order = await Order.create({
      orderId,
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountAmount,
      totalPrice,
      couponCode,
      orderStatus: 'Pending'
    });

    // Update product stock
    const stockUpdatePromises = items.map(item => {
      return Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity, soldCount: item.quantity } }
      );
    });

    await Promise.all(stockUpdatePromises);

    return order;
  }

  // Get user orders
  async getUserOrders(userId, options = {}) {
    const { page = 1, limit = 10, status } = options;

    const filter = { user: userId };
    if (status) filter.orderStatus = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
    ]);

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        limit
      }
    };
  }

  // Get order by ID
  async getOrderById(orderId, userId = null) {
    const query = userId 
      ? Order.findOne({ _id: orderId, user: userId })
      : Order.findById(orderId);

    const order = await query
      .populate('user', 'name email phone')
      .populate('items.product', 'name images sku')
      .populate('statusHistory.updatedBy', 'name');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  // Cancel order
  async cancelOrder(orderId, userId, reason) {
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Only allow cancellation of pending or confirmed orders
    if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
      throw new AppError('Cannot cancel this order', 400);
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    order.addStatusHistory('Cancelled', reason || 'Cancelled by customer', userId);

    // Restore product stock
    const stockRestorePromises = order.items.map(item => {
      return Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity, soldCount: -item.quantity } }
      );
    });

    await Promise.all([order.save(), ...stockRestorePromises]);

    return order;
  }

  // Calculate order summary
  calculateOrderSummary(items, shippingPrice = 0, couponDiscount = 0) {
    const itemsPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxPrice = itemsPrice * 0.13; // 13% tax
    const totalPrice = itemsPrice + shippingPrice + taxPrice - couponDiscount;

    return {
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountAmount: couponDiscount,
      totalPrice
    };
  }
}

module.exports = new OrderService();