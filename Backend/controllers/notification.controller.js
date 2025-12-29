// ============================================
// notification.controller.js
// Path: Backend/controllers/notification.controller.js
// ============================================

const Notification = require('../models/notification.model');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/response');

// Helper to get user ID
const getUserId = (req) => req.user.id || req.user._id;

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const { page = 1, limit = 20, type, isRead } = req.query;

  const query = { recipient: userId }; // ✅ Filter by recipient (current user)
  
  // Filter by type if provided
  if (type) {
    query.type = type;
  }
  
  // Filter by read status if provided
  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('relatedUser', 'name email')
    .populate('relatedOrder', 'orderNumber')
    .lean();

  const count = await Notification.countDocuments(query);

  return successResponse(res, {
    data: notifications,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    total: count
  }, 'Notifications fetched successfully');
});

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  const count = await Notification.countDocuments({ 
    recipient: userId, 
    isRead: false 
  });

  return successResponse(res, { count }, 'Unread count fetched successfully');
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: userId }, // ✅ Ensure user owns this notification
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  return successResponse(res, notification, 'Notification marked as read');
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return successResponse(res, null, 'All notifications marked as read');
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: userId
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  return successResponse(res, null, 'Notification deleted successfully');
});

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/read/all
// @access  Private
exports.deleteAllRead = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);
  
  const result = await Notification.deleteMany({ 
    recipient: userId, 
    isRead: true 
  });

  return successResponse(
    res, 
    { deletedCount: result.deletedCount },
    `${result.deletedCount} read notifications deleted successfully`
  );
});

// ==========================================
// HELPER FUNCTION: Create Notification
// ==========================================
exports.createNotification = async (data) => {
  try {
    const notification = await Notification.create({
      recipient: data.recipient,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedOrder: data.relatedOrder,
      relatedUser: data.relatedUser,
      relatedProduct: data.relatedProduct,
      metadata: data.metadata,
      priority: data.priority || 'medium'
    });
    
    console.log('✅ Notification created:', notification.title);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};