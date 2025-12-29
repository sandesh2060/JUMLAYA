const Notification = require('../../models/notification.model');
const notificationService = require('../../services/notification.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const { successResponse } = require('../../utils/response');

// Get all notifications for rider
exports.getNotifications = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, filter } = req.query;

  const query = {
    recipient: req.user._id,
    recipientType: 'rider',
    isDeleted: false
  };

  // Filter by read/unread
  if (filter === 'unread') {
    query.isRead = false;
  } else if (filter === 'read') {
    query.isRead = true;
  }

  const skip = (page - 1) * limit;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('data.orderId', 'orderNumber status totalAmount')
    .lean();

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.getUnreadCount(req.user._id);

  successResponse(res, {
    notifications,
    unreadCount,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }, 'Notifications fetched successfully');
});

// Get notification by ID
exports.getNotificationById = catchAsync(async (req, res, next) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: req.user._id,
    recipientType: 'rider'
  }).populate('data.orderId');

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  // Mark as read if not already
  if (!notification.isRead) {
    await notification.markAsRead();
  }

  successResponse(res, notification, 'Notification fetched successfully');
});

// Mark notification as read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: req.user._id,
    recipientType: 'rider'
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  await notification.markAsRead();

  successResponse(res, notification, 'Notification marked as read');
});

// Mark all notifications as read
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  const result = await Notification.updateMany(
    {
      recipient: req.user._id,
      recipientType: 'rider',
      isRead: false,
      isDeleted: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  successResponse(res, {
    modifiedCount: result.modifiedCount
  }, 'All notifications marked as read');
});

// Delete notification
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: req.user._id,
    recipientType: 'rider'
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  await notification.softDelete();

  successResponse(res, null, 'Notification deleted successfully');
});

// Delete all notifications
exports.deleteAllNotifications = catchAsync(async (req, res, next) => {
  const result = await Notification.updateMany(
    {
      recipient: req.user._id,
      recipientType: 'rider',
      isDeleted: false
    },
    {
      isDeleted: true,
      deletedAt: new Date()
    }
  );

  successResponse(res, {
    deletedCount: result.modifiedCount
  }, 'All notifications deleted successfully');
});

// Get unread count
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    recipientType: 'rider',
    isRead: false,
    isDeleted: false
  });

  successResponse(res, { unreadCount }, 'Unread count fetched successfully');
});

// Get notification preferences
exports.getPreferences = catchAsync(async (req, res, next) => {
  const Rider = require('../../models/rider.model');
  
  const rider = await Rider.findOne({ user: req.user._id });
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  const preferences = rider.preferences || {};

  successResponse(res, {
    notificationsEnabled: preferences.notificationsEnabled !== false,
    smsEnabled: preferences.smsEnabled !== false,
    emailEnabled: preferences.emailEnabled !== false,
    pushEnabled: true // Always enabled for mobile
  }, 'Notification preferences fetched successfully');
});

// Update notification preferences
exports.updatePreferences = catchAsync(async (req, res, next) => {
  const { notificationsEnabled, smsEnabled, emailEnabled } = req.body;

  const Rider = require('../../models/rider.model');
  
  const rider = await Rider.findOne({ user: req.user._id });
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  if (!rider.preferences) {
    rider.preferences = {};
  }

  if (notificationsEnabled !== undefined) {
    rider.preferences.notificationsEnabled = notificationsEnabled;
  }
  if (smsEnabled !== undefined) {
    rider.preferences.smsEnabled = smsEnabled;
  }
  if (emailEnabled !== undefined) {
    rider.preferences.emailEnabled = emailEnabled;
  }

  await rider.save();

  successResponse(res, rider.preferences, 'Notification preferences updated successfully');
});