// ============================================
// Backend/controllers/notification.controller.js
// ✅ FIXED - Proper ObjectId handling
// ============================================

const mongoose = require('mongoose');
const Notification = require('../models/notification.model');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/response');

// ✅ FIXED: Keep as ObjectId, don't convert to string
const getUserId = (req) => {
  const id = req.user._id || req.user.id;
  // Return as-is (ObjectId) for proper MongoDB queries
  return mongoose.Types.ObjectId.isValid(id) ? id : mongoose.Types.ObjectId(id);
};

// ==========================================
// GET ALL NOTIFICATIONS FOR CURRENT USER
// @route GET /api/notifications
// @access Private
// ==========================================
exports.getNotifications = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const { page = 1, limit = 20, filter = 'all' } = req.query;

  console.log('📬 Fetching notifications for user:', userId.toString(), 'Filter:', filter);

  // Build query - Handle notifications without isDeleted field
  const query = { 
    recipient: userId, // ✅ Use ObjectId directly
    $or: [
      { isDeleted: { $exists: false } },
      { isDeleted: false }
    ]
  };
  
  // Apply filter
  if (filter === 'unread') {
    query.isRead = false;
  } else if (filter === 'read') {
    query.isRead = true;
  }

  console.log('🔍 Query:', JSON.stringify(query, null, 2));

  // Fetch notifications
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('relatedUser', 'firstname lastname email avatar')
    .populate('relatedOrder', 'orderId orderStatus totalPrice')
    .populate('relatedProduct', 'name slug images price')
    .lean();

  // Get counts
  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ 
    recipient: userId,
    isRead: false,
    $or: [
      { isDeleted: { $exists: false } },
      { isDeleted: false }
    ]
  });

  console.log(`✅ Found ${notifications.length} notifications (${unreadCount} unread, ${total} total)`);

  return successResponse(res, {
    success: true,
    data: {
      notifications: notifications,
      unreadCount: unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    }
  }, 'Notifications fetched successfully');
});

// ==========================================
// GET UNREAD NOTIFICATIONS COUNT
// @route GET /api/notifications/unread-count
// @access Private
// ==========================================
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  
  console.log('🔍 DEBUG - req.user._id:', req.user._id);
  console.log('🔍 DEBUG - userId (ObjectId):', userId);
  console.log('🔍 DEBUG - userId type:', typeof userId);
  
  // Handle notifications without isDeleted field
  const count = await Notification.countDocuments({ 
    recipient: userId,
    isRead: false,
    $or: [
      { isDeleted: { $exists: false } },
      { isDeleted: false }
    ]
  });

  console.log(`📊 Unread count for user ${userId.toString()}:`, count);

  return successResponse(res, { 
    success: true,
    data: {
      unreadCount: count 
    }
  }, 'Unread count fetched successfully');
});

// ==========================================
// MARK NOTIFICATION AS READ
// @route PATCH /api/notifications/:id/read
// @access Private
// ==========================================
exports.markAsRead = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const { id } = req.params;
  
  console.log('✅ Marking notification as read:', id);

  const notification = await Notification.findOneAndUpdate(
    { 
      _id: id, 
      recipient: userId,
      $or: [
        { isDeleted: { $exists: false } },
        { isDeleted: false }
      ]
    },
    { 
      isRead: true, 
      readAt: new Date() 
    },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  return successResponse(res, {
    success: true,
    data: notification
  }, 'Notification marked as read');
});

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// @route PATCH /api/notifications/mark-all-read
// @access Private
// ==========================================
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  
  console.log('✅ Marking all notifications as read for user:', userId.toString());

  const result = await Notification.updateMany(
    { 
      recipient: userId,
      isRead: false,
      $or: [
        { isDeleted: { $exists: false } },
        { isDeleted: false }
      ]
    },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );

  console.log(`✅ Marked ${result.modifiedCount} notifications as read`);

  return successResponse(res, {
    success: true,
    data: {
      modifiedCount: result.modifiedCount
    }
  }, 'All notifications marked as read');
});

// ==========================================
// DELETE NOTIFICATION (SOFT DELETE)
// @route DELETE /api/notifications/:id
// @access Private
// ==========================================
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const { id } = req.params;
  
  console.log('🗑️ Deleting notification:', id);

  const notification = await Notification.findOneAndUpdate(
    {
      _id: id,
      recipient: userId
    },
    {
      isDeleted: true,
      deletedAt: new Date()
    },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  return successResponse(res, {
    success: true,
    data: null
  }, 'Notification deleted successfully');
});

// ==========================================
// DELETE ALL READ NOTIFICATIONS
// @route DELETE /api/notifications/read/all
// @access Private
// ==========================================
exports.deleteAllRead = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  
  console.log('🗑️ Deleting all read notifications for user:', userId.toString());

  const result = await Notification.updateMany(
    { 
      recipient: userId,
      isRead: true,
      $or: [
        { isDeleted: { $exists: false } },
        { isDeleted: false }
      ]
    },
    {
      isDeleted: true,
      deletedAt: new Date()
    }
  );

  console.log(`✅ Deleted ${result.modifiedCount} read notifications`);

  return successResponse(res, {
    success: true,
    data: { 
      deletedCount: result.modifiedCount 
    }
  }, `${result.modifiedCount} read notifications deleted successfully`);
});

// ==========================================
// GET NOTIFICATIONS BY TYPE
// @route GET /api/notifications/type/:type
// @access Private
// ==========================================
exports.getNotificationsByType = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const { type } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const notifications = await Notification.find({
    recipient: userId,
    type: type,
    $or: [
      { isDeleted: { $exists: false } },
      { isDeleted: false }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit)
  .populate('relatedUser', 'firstname lastname email')
  .populate('relatedOrder', 'orderId orderStatus totalPrice')
  .populate('relatedProduct', 'name slug images')
  .lean();

  const total = await Notification.countDocuments({
    recipient: userId,
    type: type,
    $or: [
      { isDeleted: { $exists: false } },
      { isDeleted: false }
    ]
  });

  return successResponse(res, {
    success: true,
    data: {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    }
  }, 'Notifications fetched successfully');
});

// ==========================================
// GET NOTIFICATION PREFERENCES
// @route GET /api/notifications/preferences
// @access Private
// ==========================================
exports.getPreferences = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const User = require('../models/user.model');
  
  const user = await User.findById(userId).select('notificationPreferences');
  
  const preferences = user?.notificationPreferences || {
    email: true,
    push: true,
    sms: false,
    orderUpdates: true,
    promotions: true,
    newsletter: true
  };

  return successResponse(res, {
    success: true,
    data: preferences
  }, 'Notification preferences fetched successfully');
});

// ==========================================
// UPDATE NOTIFICATION PREFERENCES
// @route PATCH /api/notifications/preferences
// @access Private
// ==========================================
exports.updatePreferences = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const preferences = req.body;
  const User = require('../models/user.model');
  
  const user = await User.findByIdAndUpdate(
    userId,
    { notificationPreferences: preferences },
    { new: true, runValidators: true }
  ).select('notificationPreferences');

  return successResponse(res, {
    success: true,
    data: user.notificationPreferences
  }, 'Notification preferences updated successfully');
});

// ==========================================
// CLEAR ALL NOTIFICATIONS
// @route DELETE /api/notifications/clear-all
// @access Private
// ==========================================
exports.clearAllNotifications = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  
  console.log('🗑️ Clearing all notifications for user:', userId.toString());

  const result = await Notification.updateMany(
    { 
      recipient: userId,
      $or: [
        { isDeleted: { $exists: false } },
        { isDeleted: false }
      ]
    },
    {
      isDeleted: true,
      deletedAt: new Date()
    }
  );

  console.log(`✅ Cleared ${result.modifiedCount} notifications`);

  return successResponse(res, {
    success: true,
    data: { 
      deletedCount: result.modifiedCount 
    }
  }, 'All notifications cleared successfully');
});