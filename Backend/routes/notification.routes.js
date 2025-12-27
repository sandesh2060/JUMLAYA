const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');

// Mock notifications - Replace with database in production
const mockNotifications = [];

// GET /api/notifications - Get all notifications
router.get('/', protect, async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    
    // Filter by user ID
    const userNotifications = mockNotifications
      .filter(n => n.userId === req.user._id.toString())
      .slice(parseInt(skip), parseInt(skip) + parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        notifications: userNotifications,
        total: userNotifications.length
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notifications',
      error: error.message 
    });
  }
});

// GET /api/notifications/unread/count - Get unread count
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = mockNotifications
      .filter(n => n.userId === req.user._id.toString() && !n.isRead)
      .length;

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch unread count',
      error: error.message 
    });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = mockNotifications.find(
      n => n._id === id && n.userId === req.user._id.toString()
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    notification.isRead = true;

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notification as read',
      error: error.message 
    });
  }
});

// PATCH /api/notifications/read-all - Mark all notifications as read
router.patch('/read-all', protect, async (req, res) => {
  try {
    mockNotifications
      .filter(n => n.userId === req.user._id.toString())
      .forEach(n => n.isRead = true);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark all as read',
      error: error.message 
    });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const index = mockNotifications.findIndex(
      n => n._id === id && n.userId === req.user._id.toString()
    );
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    mockNotifications.splice(index, 1);

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete notification',
      error: error.message 
    });
  }
});

// DELETE /api/notifications/clear-all - Clear all notifications
router.delete('/clear-all', protect, async (req, res) => {
  try {
    const initialLength = mockNotifications.length;
    
    // Remove all notifications for this user
    for (let i = mockNotifications.length - 1; i >= 0; i--) {
      if (mockNotifications[i].userId === req.user._id.toString()) {
        mockNotifications.splice(i, 1);
      }
    }

    res.status(200).json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear notifications',
      error: error.message 
    });
  }
});

module.exports = router;