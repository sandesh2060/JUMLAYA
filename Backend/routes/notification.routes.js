// ============================================
// Backend/routes/notification.routes.js
// ✅ FIXED - Correct route ordering
// ============================================

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authenticate);

// ⚠️ IMPORTANT: Specific routes MUST come BEFORE parameterized routes
// Otherwise /unread-count will be treated as /:id

// Get unread count (MUST be before /:id routes)
router.get('/unread-count', notificationController.getUnreadCount);

// Mark all as read (MUST be before /:id routes)
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Delete all read notifications (MUST be before /:id routes)
router.delete('/read/all', notificationController.deleteAllRead);

// Clear all notifications (MUST be before /:id routes)
router.delete('/clear-all', notificationController.clearAllNotifications);

// Get notification preferences (MUST be before /:id routes)
router.get('/preferences', notificationController.getPreferences);

// Update notification preferences (MUST be before /:id routes)
router.patch('/preferences', notificationController.updatePreferences);

// Get all notifications for current user
router.get('/', notificationController.getNotifications);

// Get notifications by type
router.get('/type/:type', notificationController.getNotificationsByType);

// Get notification preferences
router.get('/preferences', notificationController.getPreferences);

// Update notification preferences
router.patch('/preferences', notificationController.updatePreferences);

// Mark single notification as read (parameterized route comes AFTER specific routes)
router.patch('/:id/read', notificationController.markAsRead);

// Delete notification (parameterized route comes AFTER specific routes)
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;