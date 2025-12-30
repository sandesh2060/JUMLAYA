// ============================================
// Backend/models/notification.model.js
// COMPLETE NOTIFICATION MODEL WITH i18n SUPPORT
// ============================================
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Who receives this notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Recipient type (for future multi-role support)
  recipientType: {
    type: String,
    enum: ['customer', 'admin', 'vendor', 'rider'],
    default: 'customer'
  },
  
  // Notification type
  type: {
    type: String,
    enum: [
      'order_placed',
      'order_confirmed',
      'order_processing',
      'order_shipped',
      'order_out_for_delivery',
      'order_delivered',
      'order_cancelled',
      'order_returned',
      'payment_received',
      'payment_failed',
      'order_status_change',
      'wishlist_item_available',
      'wishlist_price_drop',
      'new_review',
      'review_reply',
      'low_stock',
      'out_of_stock',
      'new_user',
      'promotion',
      'welcome',
      'account_update',
      'rider_assigned',
      'rider_on_the_way',
      'system_notification'
    ],
    required: true,
    index: true
  },
  
  // ✅ i18n Support - Translation keys
  titleKey: {
    type: String,
    default: null
  },
  
  messageKey: {
    type: String,
    default: null
  },
  
  messageParams: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Legacy fields (backward compatibility)
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  // Related entities
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  
  // Additional metadata (flexible for custom data)
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  readAt: {
    type: Date,
    default: null
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Action URL (for clickable notifications)
  actionUrl: {
    type: String,
    default: null
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: {
    type: Date,
    default: null
  },
  
  // Email sent flag
  emailSent: {
    type: Boolean,
    default: false
  },
  
  emailSentAt: {
    type: Date,
    default: null
  },
  
  // SMS sent flag (for future implementation)
  smsSent: {
    type: Boolean,
    default: false
  },
  
  smsSentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// INDEXES
// ============================================
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isDeleted: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ recipientType: 1, isRead: 1 });
notificationSchema.index({ priority: 1, isRead: 1 });

// Auto-delete after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// ============================================
// VIRTUALS
// ============================================
notificationSchema.virtual('isUnread').get(function() {
  return !this.isRead;
});

notificationSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// ============================================
// INSTANCE METHODS
// ============================================

// Mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Soft delete
notificationSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Mark email as sent
notificationSchema.methods.markEmailSent = function() {
  this.emailSent = true;
  this.emailSentAt = new Date();
  return this.save();
};

// ============================================
// STATIC METHODS
// ============================================

// Create notification with i18n support
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this({
    recipient: data.recipient,
    recipientType: data.recipientType || 'customer',
    type: data.type,
    titleKey: data.titleKey,
    messageKey: data.messageKey,
    messageParams: data.messageParams || {},
    title: data.title,
    message: data.message,
    relatedOrder: data.relatedOrder,
    relatedUser: data.relatedUser,
    relatedProduct: data.relatedProduct,
    metadata: data.metadata || {},
    priority: data.priority || 'medium',
    actionUrl: data.actionUrl
  });
  
  await notification.save();
  console.log('✅ Notification created:', data.titleKey || data.title);
  return notification;
};

// Mark all as read for a user
notificationSchema.statics.markAllAsRead = async function(userId) {
  const result = await this.updateMany(
    { recipient: userId, isRead: false, isDeleted: false },
    { isRead: true, readAt: new Date() }
  );
  return result;
};

// Get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ 
    recipient: userId, 
    isRead: false, 
    isDeleted: false 
  });
};

// Delete all read notifications for a user
notificationSchema.statics.deleteAllRead = async function(userId) {
  const result = await this.updateMany(
    { recipient: userId, isRead: true, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() }
  );
  return result;
};

// Get notifications by type
notificationSchema.statics.getByType = async function(userId, type, limit = 10) {
  return this.find({
    recipient: userId,
    type: type,
    isDeleted: false
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Bulk create notifications
notificationSchema.statics.createBulk = async function(notifications) {
  return this.insertMany(notifications);
};

// ============================================
// PRE-SAVE HOOKS
// ============================================
notificationSchema.pre('save', function(next) {
  // Set action URL based on notification type
  if (!this.actionUrl && this.relatedOrder) {
    this.actionUrl = `/orders/${this.relatedOrder}`;
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);