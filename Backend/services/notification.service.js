// ============================================
// Backend/services/notification.service.js
// Complete Notification Service
// ============================================

const Notification = require('../models/notification.model');
const { 
  emitToUser, 
  emitToRider, 
  emitToAdmins 
} = require('./websocket.service');

class NotificationService {
  
  // ============================================
  // CREATE NOTIFICATIONS
  // ============================================

  /**
   * Create notification for a user
   */
  async createUserNotification(userId, type, title, message, data = {}) {
    try {
      const notification = await Notification.create({
        recipient: userId,
        recipientType: 'user',
        type,
        title,
        message,
        data,
        priority: this.getPriority(type)
      });

      // Emit real-time notification
      await emitToUser(userId, 'notification', notification);

      return notification;
    } catch (error) {
      console.error('Error creating user notification:', error);
      throw error;
    }
  }

  /**
   * Create notification for a rider
   */
  async createRiderNotification(riderId, type, title, message, data = {}) {
    try {
      const notification = await Notification.create({
        recipient: riderId,
        recipientType: 'rider',
        type,
        title,
        message,
        data,
        priority: this.getPriority(type)
      });

      // Emit real-time notification
      await emitToRider(riderId, 'notification', notification);

      return notification;
    } catch (error) {
      console.error('Error creating rider notification:', error);
      throw error;
    }
  }

  /**
   * Create notification for admin
   */
  async createAdminNotification(adminId, type, title, message, data = {}) {
    try {
      const notification = await Notification.create({
        recipient: adminId,
        recipientType: 'admin',
        type,
        title,
        message,
        data,
        priority: this.getPriority(type)
      });

      // Emit real-time notification
      await emitToAdmins('notification', notification);

      return notification;
    } catch (error) {
      console.error('Error creating admin notification:', error);
      throw error;
    }
  }

  /**
   * Notify all admins (broadcast)
   */
  async notifyAllAdmins(type, title, message, data = {}) {
    try {
      const User = require('../models/user.model');
      const admins = await User.find({ role: 'admin', isActive: true }).select('_id');

      const notifications = await Promise.all(
        admins.map(admin => 
          this.createAdminNotification(admin._id, type, title, message, data)
        )
      );

      return notifications;
    } catch (error) {
      console.error('Error notifying all admins:', error);
      throw error;
    }
  }

  // ============================================
  // ORDER NOTIFICATIONS
  // ============================================

  /**
   * Notify user about new order placement
   */
  async notifyNewOrder(orderId, userId, orderNumber, totalAmount) {
    return this.createUserNotification(
      userId,
      'order_placed',
      'Order Placed Successfully! 🎉',
      `Your order #${orderNumber} has been placed successfully. Total: ₹${totalAmount}`,
      { orderId, orderNumber, totalAmount }
    );
  }

  /**
   * Notify admins about new order
   */
  async notifyAdminsNewOrder(orderId, orderNumber, totalAmount) {
    return this.notifyAllAdmins(
      'new_order',
      'New Order Received! 🛒',
      `Order #${orderNumber} placed. Amount: ₹${totalAmount}`,
      { orderId, orderNumber, totalAmount }
    );
  }

  /**
   * Notify about order status change
   */
  async notifyOrderStatus(orderId, userId, status, orderNumber) {
    const statusMessages = {
      'Processing': {
        title: 'Order Confirmed ✅',
        message: `Your order #${orderNumber} has been confirmed and is being processed.`
      },
      'Shipped': {
        title: 'Order Shipped 📦',
        message: `Your order #${orderNumber} has been shipped and is on its way!`
      },
      'Out for Delivery': {
        title: 'Out for Delivery 🚚',
        message: `Your order #${orderNumber} is out for delivery. It will arrive soon!`
      },
      'Delivered': {
        title: 'Order Delivered! 🎉',
        message: `Your order #${orderNumber} has been delivered successfully. Enjoy your purchase!`
      },
      'Cancelled': {
        title: 'Order Cancelled ❌',
        message: `Your order #${orderNumber} has been cancelled.`
      },
      'Returned': {
        title: 'Order Returned 🔄',
        message: `Your order #${orderNumber} has been returned.`
      }
    };

    const statusInfo = statusMessages[status] || {
      title: 'Order Status Updated',
      message: `Your order #${orderNumber} status has been updated to ${status}.`
    };

    return this.createUserNotification(
      userId,
      'order_status_update',
      statusInfo.title,
      statusInfo.message,
      { orderId, orderNumber, status }
    );
  }

  /**
   * Notify rider about new order assignment
   */
  async notifyRiderNewOrder(riderId, orderId, orderNumber, deliveryAddress) {
    return this.createRiderNotification(
      riderId,
      'new_order_assignment',
      'New Delivery Assignment! 📦',
      `You have been assigned order #${orderNumber}. Pickup location: ${deliveryAddress}`,
      { orderId, orderNumber, deliveryAddress }
    );
  }

  /**
   * Notify rider about order pickup
   */
  async notifyRiderPickup(riderId, orderId, orderNumber) {
    return this.createRiderNotification(
      riderId,
      'pickup_reminder',
      'Ready for Pickup 📦',
      `Order #${orderNumber} is ready for pickup.`,
      { orderId, orderNumber }
    );
  }

  // ============================================
  // RIDER NOTIFICATIONS
  // ============================================

  /**
   * Notify rider about earnings
   */
  async notifyRiderEarnings(riderId, amount, orderId, orderNumber) {
    return this.createRiderNotification(
      riderId,
      'earnings_added',
      'Earnings Added! 💰',
      `You earned ₹${amount} from order #${orderNumber}`,
      { amount, orderId, orderNumber }
    );
  }

  /**
   * Notify rider about bonus
   */
  async notifyRiderBonus(riderId, bonusAmount, reason) {
    return this.createRiderNotification(
      riderId,
      'bonus_received',
      'Bonus Received! 🎁',
      `You received a bonus of ₹${bonusAmount}. ${reason}`,
      { bonusAmount, reason }
    );
  }

  /**
   * Notify rider about rating
   */
  async notifyRiderRating(riderId, rating, orderId, orderNumber) {
    const stars = '⭐'.repeat(rating);
    return this.createRiderNotification(
      riderId,
      'new_rating',
      `New Rating: ${stars}`,
      `You received ${rating} stars for order #${orderNumber}`,
      { rating, orderId, orderNumber }
    );
  }

  /**
   * Notify rider about account verification
   */
  async notifyRiderVerification(riderId, isVerified, reason = '') {
    if (isVerified) {
      return this.createRiderNotification(
        riderId,
        'verification_approved',
        'Account Verified! ✅',
        'Congratulations! Your rider account has been verified. You can now start accepting orders.',
        { isVerified }
      );
    } else {
      return this.createRiderNotification(
        riderId,
        'verification_rejected',
        'Verification Failed ❌',
        `Your verification was not approved. Reason: ${reason}. Please update your documents and try again.`,
        { isVerified, reason }
      );
    }
  }

  // ============================================
  // ADMIN NOTIFICATIONS
  // ============================================

  /**
   * Notify admins about low stock
   */
  async notifyLowStock(productId, productName, currentStock, minStock) {
    return this.notifyAllAdmins(
      'low_stock_alert',
      'Low Stock Alert! ⚠️',
      `${productName} is running low on stock. Current: ${currentStock}, Minimum: ${minStock}`,
      { productId, productName, currentStock, minStock }
    );
  }

  /**
   * Notify admins about new user registration
   */
  async notifyNewUserRegistration(userId, userName, userEmail) {
    return this.notifyAllAdmins(
      'new_user_registration',
      'New User Registered! 👤',
      `${userName} (${userEmail}) just registered.`,
      { userId, userName, userEmail }
    );
  }

  /**
   * Notify admins about new rider application
   */
  async notifyNewRiderApplication(riderId, riderName, riderCode) {
    return this.notifyAllAdmins(
      'new_rider_application',
      'New Rider Application! 🏍️',
      `${riderName} (${riderCode}) has applied to become a rider.`,
      { riderId, riderName, riderCode }
    );
  }

  /**
   * Notify admins about payment received
   */
  async notifyPaymentReceived(orderId, orderNumber, amount, paymentMethod) {
    return this.notifyAllAdmins(
      'payment_received',
      'Payment Received! 💳',
      `Payment of ₹${amount} received for order #${orderNumber} via ${paymentMethod}`,
      { orderId, orderNumber, amount, paymentMethod }
    );
  }

  /**
   * Notify admins about system alerts
   */
  async notifySystemAlert(title, message, data = {}) {
    return this.notifyAllAdmins(
      'system_alert',
      title,
      message,
      data
    );
  }

  // ============================================
  // NOTIFICATION MANAGEMENT
  // ============================================

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({
        recipient: userId,
        isDeleted: false
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Notification.countDocuments({
        recipient: userId,
        isDeleted: false
      });

      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        isRead: false,
        isDeleted: false
      });

      return {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      
      if (!notification) {
        return null;
      }

      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
      }

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { 
          recipient: userId, 
          isRead: false,
          isDeleted: false 
        },
        { 
          isRead: true, 
          readAt: new Date() 
        }
      );

      return result;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification (soft delete)
   */
  async deleteNotification(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      
      if (!notification) {
        return null;
      }

      notification.isDeleted = true;
      notification.deletedAt = new Date();
      await notification.save();

      return notification;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({
        recipient: userId,
        isRead: false,
        isDeleted: false
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get priority level based on notification type
   */
  getPriority(type) {
    const highPriority = [
      'order_placed',
      'order_cancelled',
      'payment_failed',
      'verification_approved',
      'verification_rejected',
      'system_alert',
      'urgent_delivery'
    ];

    const mediumPriority = [
      'order_status_update',
      'new_order_assignment',
      'earnings_added',
      'low_stock_alert',
      'new_rating'
    ];

    if (highPriority.includes(type)) {
      return 'high';
    } else if (mediumPriority.includes(type)) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        isRead: true
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result;
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new NotificationService();