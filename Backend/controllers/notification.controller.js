// ============================================
// Backend/controllers/notification.controller.js
// ✅ FIXED - Admin notifications support
// ============================================

const mongoose = require('mongoose');
const Notification = require('../models/notification.model');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/response');

// ✅ Get user ID and role
const getUserInfo = (req) => {
  const id = req.user._id || req.user.id;
  const role = req.user.role;
  const userId = mongoose.Types.ObjectId.isValid(id) ? id : mongoose.Types.ObjectId(id);
  
  return { userId, role };
};

// ==========================================
// GET ALL NOTIFICATIONS FOR CURRENT USER
// @route GET /api/notifications
// @access Private
// ==========================================
exports.getNotifications = catchAsync(async (req, res, next) => {
  const { userId, role } = getUserInfo(req);
  const { page = 1, limit = 20, filter = 'all' } = req.query;

  console.log('📬 Fetching notifications for user:', userId.toString(), 'Role:', role, 'Filter:', filter);

  // ✅ Build query based on user role
  const query = { 
    recipient: userId,
    $or: [
      { isDeleted: { $exists: false } },
      { isDeleted: false }
    ]
  };

  // ✅ If admin, fetch admin-type notifications
  if (role === 'admin') {
    query.recipientType = 'admin';
    console.log('👨‍💼 Admin user - fetching admin notifications');
  } else {
    // For customers, fetch customer notifications
    query.recipientType = { $in: ['customer', 'user'] };
    console.log('👤 Customer user - fetching customer notifications');
  }
  
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
  
  const unreadQuery = { 
    recipient: userId,
    isRead: false,
    $or: [
      { isDeleted: { $exists: false } },
      { isDeleted: false }
    ]
  };
  
  // ✅ Add recipientType filter for unread count too
  if (role === 'admin') {
    unreadQuery.recipientType = 'admin';
  } else {
    unreadQuery.recipientType = { $in: ['customer', 'user'] };
  }
  
  const unreadCount = await Notification.countDocuments(unreadQuery);

  console.log(`✅ Found ${notifications.length} notifications (${unreadCount} unread, ${total} total) for ${role}`);

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
  const { userId, role } = getUserInfo(req);
  
  console.log('🔍 Fetching unread count for user:', userId.toString(), 'Role:', role);
  
  // ✅ Build query based on role
  const query = { 
    recipient: userId,
    isRead: false,
    $or: [
      { isDeleted: { $exists: false } },
      { isDeleted: false }
    ]
  };

  // ✅ Filter by recipientType based on role
  if (role === 'admin') {
    query.recipientType = 'admin';
    console.log('👨‍💼 Admin - counting admin notifications');
  } else {
    query.recipientType = { $in: ['customer', 'user'] };
    console.log('👤 Customer - counting customer notifications');
  }

  const count = await Notification.countDocuments(query);

  console.log(`📊 Unread count for ${role} ${userId.toString()}:`, count);

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
  const { userId } = getUserInfo(req);
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
  const { userId, role } = getUserInfo(req);
  
  console.log('✅ Marking all notifications as read for user:', userId.toString(), 'Role:', role);

  // ✅ Build query based on role
  const query = { 
    recipient: userId,
    isRead: false,
    $or: [
      { isDeleted: { $exists: false } },
      { isDeleted: false }
    ]
  };

  if (role === 'admin') {
    query.recipientType = 'admin';
  } else {
    query.recipientType = { $in: ['customer', 'user'] };
  }

  const result = await Notification.updateMany(
    query,
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );

  console.log(`✅ Marked ${result.modifiedCount} notifications as read for ${role}`);

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
  const { userId } = getUserInfo(req);
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
  const { userId, role } = getUserInfo(req);
  
  console.log('🗑️ Deleting all read notifications for user:', userId.toString());

  // ✅ Build query based on role
  const query = { 
    recipient: userId,
    isRead: true,
    $or: [
      { isDeleted: { $exists: false } },
      { isDeleted: false }
    ]
  };

  if (role === 'admin') {
    query.recipientType = 'admin';
  } else {
    query.recipientType = { $in: ['customer', 'user'] };
  }

  const result = await Notification.updateMany(
    query,
    {
      isDeleted: true,
      deletedAt: new Date()
    }
  );

  console.log(`✅ Deleted ${result.modifiedCount} read notifications for ${role}`);

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
  const { userId, role } = getUserInfo(req);
  const { type } = req.params;
  const { page = 1, limit = 20 } = req.query;

  // ✅ Build query based on role
  const query = {
    recipient: userId,
    type: type,
    $or: [
      { isDeleted: { $exists: false } },
      { isDeleted: false }
    ]
  };

  if (role === 'admin') {
    query.recipientType = 'admin';
  } else {
    query.recipientType = { $in: ['customer', 'user'] };
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('relatedUser', 'firstname lastname email')
    .populate('relatedOrder', 'orderId orderStatus totalPrice')
    .populate('relatedProduct', 'name slug images')
    .lean();

  const total = await Notification.countDocuments(query);

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
  const { userId } = getUserInfo(req);
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
  const { userId } = getUserInfo(req);
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
  const { userId, role } = getUserInfo(req);
  
  console.log('🗑️ Clearing all notifications for user:', userId.toString(), 'Role:', role);

  // ✅ Build query based on role
  const query = { 
    recipient: userId,
    $or: [
      { isDeleted: { $exists: false } },
      { isDeleted: false }
    ]
  };

  if (role === 'admin') {
    query.recipientType = 'admin';
  } else {
    query.recipientType = { $in: ['customer', 'user'] };
  }

  const result = await Notification.updateMany(
    query,
    {
      isDeleted: true,
      deletedAt: new Date()
    }
  );

  console.log(`✅ Cleared ${result.modifiedCount} notifications for ${role}`);

  return successResponse(res, {
    success: true,
    data: { 
      deletedCount: result.modifiedCount 
    }
  }, 'All notifications cleared successfully');
});