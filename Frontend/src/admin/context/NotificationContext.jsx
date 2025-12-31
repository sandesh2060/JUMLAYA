import { createContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import notificationAPI from '../api/notification.api';
import { useAuth } from "@/hooks/useAuth";
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (params = {}) => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔔 Fetching notifications...');
      const response = await notificationAPI.getAll(params);
      
      const notificationList = response?.data?.notifications || response?.data || [];
      setNotifications(notificationList);
      setError(null);
      console.log('✅ Notifications fetched:', notificationList.length);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
      setError(err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch unread count
// Fetch unread count
const fetchUnreadCount = useCallback(async () => {
  if (!isAuthenticated) {
    setUnreadCount(0);
    return;
  }

  try {
    console.log("🔢 Fetching unread count...");

    const response = await notificationApi.getUnreadCount();
    console.log("FULL RESPONSE:", response);

    // ✅ FIXED: Use "unreadCount" instead of "count"
    const count = response?.data?.unreadCount || response?.unreadCount || 0;

    setUnreadCount(count);
    console.log("✅ Unread count:", count);
  } catch (err) {
    console.error("❌ Error fetching unread count:", err);
    setUnreadCount(0);
  }
}, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated) return false;

    try {
      console.log('✓ Marking as read:', notificationId);
      await notificationAPI.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error('❌ Error marking as read:', err);
      toast.error('Failed to mark as read');
      return false;
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!isAuthenticated) return false;

    try {
      console.log('✓ Marking all as read...');
      await notificationAPI.markAllAsRead();
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      setUnreadCount(0);
      toast.success('All notifications marked as read');
      return true;
    } catch (err) {
      console.error('❌ Error marking all as read:', err);
      toast.error('Failed to mark all as read');
      return false;
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!isAuthenticated) return false;

    try {
      console.log('🗑️ Deleting notification:', notificationId);
      await notificationAPI.delete(notificationId);
      
      const deletedNotif = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
      return true;
    } catch (err) {
      console.error('❌ Error deleting notification:', err);
      toast.error('Failed to delete notification');
      return false;
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    if (!isAuthenticated) return false;

    try {
      console.log('🧹 Clearing all notifications...');
      await notificationAPI.clearAll();
      
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
      return true;
    } catch (err) {
      console.error('❌ Error clearing notifications:', err);
      toast.error('Failed to clear notifications');
      return false;
    }
  };

  // Auto-fetch on mount and auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext, NotificationProvider };