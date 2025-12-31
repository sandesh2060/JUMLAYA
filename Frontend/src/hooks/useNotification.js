import { useState, useCallback } from 'react';
import { notificationApi } from '../api/notification.api';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);

  const fetchNotifications = useCallback(async (page = 1, limit = 20, filter = 'all') => {
    try {
      setLoading(true);
      const response = await notificationApi.getNotifications(page, limit, filter);
      
      // ✅ FIXED: Handle double nesting
      const data = response.data?.data || response.data || {};
      
      setNotifications(data.notifications || []);
      setPagination(data.pagination);
      setUnreadCount(data.unreadCount || 0);
      
      console.log('✅ useNotification - Fetched:', {
        notifications: data.notifications?.length || 0,
        unreadCount: data.unreadCount || 0
      });
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      
      // ✅ FIXED: Handle double nesting
      const count = response.data?.unreadCount || response.unreadCount || 0;
      
      setUnreadCount(count);
      console.log('✅ useNotification - Unread count:', count);
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      setUnreadCount(0);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      console.log('✅ Marked as read:', notificationId);
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      console.log('✅ Marked all as read');
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      // Get the notification before deleting to check if it was unread
      const notification = notifications.find(n => n._id === notificationId);
      
      await notificationApi.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      // Decrease unread count if the deleted notification was unread
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      console.log('✅ Deleted notification:', notificationId);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  }, [notifications]);

  const deleteAllNotifications = useCallback(async () => {
    try {
      await notificationApi.deleteAllNotifications();
      
      setNotifications([]);
      setUnreadCount(0);
      
      console.log('✅ Deleted all notifications');
    } catch (error) {
      console.error('❌ Error deleting all notifications:', error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    pagination,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  };
};