// ============================================
// Backend/utils/notificationHelper.js
// Helper functions for creating notifications with i18n support
// ============================================

const Notification = require('../models/notification.model');

/**
 * Create a notification for a user
 * Now stores i18n keys instead of hardcoded text
 */
const createNotification = async (data) => {
  try {
    const notification = await Notification.create({
      recipient: data.recipient,
      type: data.type,
      titleKey: data.titleKey, // ✅ Store translation key
      messageKey: data.messageKey, // ✅ Store translation key
      messageParams: data.messageParams || {}, // ✅ Store dynamic values
      title: data.title, // Keep for backward compatibility
      message: data.message, // Keep for backward compatibility
      relatedOrder: data.relatedOrder || null,
      relatedUser: data.relatedUser || null,
      relatedProduct: data.relatedProduct || null,
      metadata: data.metadata || {},
      priority: data.priority || 'medium'
    });
    
    console.log('✅ Notification created:', data.titleKey || data.title, 'for user:', data.recipient);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return null;
  }
};

/**
 * Create order placed notification
 */
const notifyOrderPlaced = async (userId, order) => {
  return createNotification({
    recipient: userId,
    type: 'new_order',
    titleKey: 'notifications.orders.placed.title',
    messageKey: 'notifications.orders.placed.message',
    messageParams: {
      orderId: order.orderId,
      total: order.totalPrice
    },
    title: '🎉 Order Placed Successfully!',
    message: `Your order #${order.orderId} has been placed successfully. Total: NPR ${order.totalPrice}. We'll notify you once it's confirmed.`,
    relatedOrder: order._id,
    priority: 'high'
  });
};

/**
 * Create order confirmed notification
 */
const notifyOrderConfirmed = async (userId, order) => {
  return createNotification({
    recipient: userId,
    type: 'order_status_change',
    titleKey: 'notifications.orders.confirmed.title',
    messageKey: 'notifications.orders.confirmed.message',
    messageParams: {
      orderId: order.orderId
    },
    title: '✅ Order Confirmed',
    message: `Your order #${order.orderId} has been confirmed and is being prepared for shipping.`,
    relatedOrder: order._id,
    priority: 'high'
  });
};

/**
 * Create order shipped notification
 */
const notifyOrderShipped = async (userId, order) => {
  return createNotification({
    recipient: userId,
    type: 'order_status_change',
    titleKey: 'notifications.orders.shipped.title',
    messageKey: 'notifications.orders.shipped.message',
    messageParams: {
      orderId: order.orderId
    },
    title: '📦 Order Shipped',
    message: `Your order #${order.orderId} has been shipped! Track your package for delivery updates.`,
    relatedOrder: order._id,
    priority: 'high'
  });
};

/**
 * Create order delivered notification
 */
const notifyOrderDelivered = async (userId, order) => {
  return createNotification({
    recipient: userId,
    type: 'order_delivered',
    titleKey: 'notifications.orders.delivered.title',
    messageKey: 'notifications.orders.delivered.message',
    messageParams: {
      orderId: order.orderId
    },
    title: '🎊 Order Delivered',
    message: `Your order #${order.orderId} has been delivered! Thank you for shopping with us.`,
    relatedOrder: order._id,
    priority: 'high'
  });
};

/**
 * Create order cancelled notification
 */
const notifyOrderCancelled = async (userId, order, reason) => {
  return createNotification({
    recipient: userId,
    type: 'order_cancelled',
    titleKey: 'notifications.orders.cancelled.title',
    messageKey: 'notifications.orders.cancelled.message',
    messageParams: {
      orderId: order.orderId,
      reason: reason || ''
    },
    title: '❌ Order Cancelled',
    message: `Your order #${order.orderId} has been cancelled. ${reason || 'If you have any questions, please contact support.'}`,
    relatedOrder: order._id,
    priority: 'medium'
  });
};

/**
 * Create order returned notification
 */
const notifyOrderReturned = async (userId, order) => {
  return createNotification({
    recipient: userId,
    type: 'order_returned',
    titleKey: 'notifications.orders.returned.title',
    messageKey: 'notifications.orders.returned.message',
    messageParams: {
      orderId: order.orderId
    },
    title: '↩️ Return Request Received',
    message: `Your return request for order #${order.orderId} has been received. We'll process it within 2-3 business days.`,
    relatedOrder: order._id,
    priority: 'medium'
  });
};

/**
 * Create payment received notification
 */
const notifyPaymentReceived = async (userId, order) => {
  return createNotification({
    recipient: userId,
    type: 'payment_received',
    titleKey: 'notifications.orders.payment.title',
    messageKey: 'notifications.orders.payment.message',
    messageParams: {
      amount: order.totalPrice,
      orderId: order.orderId
    },
    title: '💳 Payment Received',
    message: `Payment of NPR ${order.totalPrice} for order #${order.orderId} has been received successfully.`,
    relatedOrder: order._id,
    priority: 'high'
  });
};

/**
 * Create wishlist item back in stock notification
 */
const notifyWishlistItemInStock = async (userId, product) => {
  return createNotification({
    recipient: userId,
    type: 'wishlist_item_available',
    titleKey: 'notifications.wishlist.backInStock.title',
    messageKey: 'notifications.wishlist.backInStock.message',
    messageParams: {
      productName: product.name
    },
    title: '🎯 Wishlist Item Available',
    message: `Good news! ${product.name} from your wishlist is now back in stock.`,
    relatedProduct: product._id,
    priority: 'medium'
  });
};

/**
 * Create price drop notification
 */
const notifyPriceDrop = async (userId, product, oldPrice, newPrice) => {
  return createNotification({
    recipient: userId,
    type: 'price_drop',
    titleKey: 'notifications.products.priceDrop.title',
    messageKey: 'notifications.products.priceDrop.message',
    messageParams: {
      productName: product.name,
      oldPrice: oldPrice,
      newPrice: newPrice,
      discount: Math.round(((oldPrice - newPrice) / oldPrice) * 100)
    },
    title: '💰 Price Drop Alert',
    message: `${product.name} price dropped from NPR ${oldPrice} to NPR ${newPrice}!`,
    relatedProduct: product._id,
    priority: 'medium'
  });
};

/**
 * Create welcome notification for new users
 */
const notifyWelcome = async (userId, userName) => {
  return createNotification({
    recipient: userId,
    type: 'welcome',
    titleKey: 'notifications.account.welcome.title',
    messageKey: 'notifications.account.welcome.message',
    messageParams: {
      userName: userName
    },
    title: '🎉 Welcome to JUMLAYA!',
    message: `Welcome ${userName}! Thank you for joining us. Start exploring our organic products today.`,
    priority: 'medium'
  });
};

/**
 * Create promotional notification
 */
const notifyPromotion = async (userId, promoDetails) => {
  return createNotification({
    recipient: userId,
    type: 'promotion',
    titleKey: 'notifications.promotions.special.title',
    messageKey: 'notifications.promotions.special.message',
    messageParams: {
      discount: promoDetails.discount,
      code: promoDetails.code
    },
    title: '🎁 Special Offer Just for You!',
    message: `Get ${promoDetails.discount}% off on your next purchase! Use code: ${promoDetails.code}`,
    metadata: promoDetails,
    priority: 'low'
  });
};

module.exports = {
  createNotification,
  notifyOrderPlaced,
  notifyOrderConfirmed,
  notifyOrderShipped,
  notifyOrderDelivered,
  notifyOrderCancelled,
  notifyOrderReturned,
  notifyPaymentReceived,
  notifyWishlistItemInStock,
  notifyPriceDrop,
  notifyWelcome,
  notifyPromotion
};