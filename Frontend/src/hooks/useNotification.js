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
      
      console.log('🔍 Full API Response:', response);
      
      // ✅ FIXED: Correct path based on your backend structure
      // Backend returns: { success: true, data: { notifications, unreadCount, pagination } }
      // axios returns: { data: { success: true, data: { notifications, unreadCount, pagination } } }
      const responseData = response.data || response;
      const actualData = responseData.data || responseData;
      
      setNotifications(actualData.notifications || []);
      setPagination(actualData.pagination);
      setUnreadCount(actualData.unreadCount || 0);
      
      console.log('✅ useNotification - Fetched:', {
        notifications: actualData.notifications?.length || 0,
        unreadCount: actualData.unreadCount || 0,
        pagination: actualData.pagination
      });
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      console.error('❌ Error response:', error.response?.data);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      console.log('🔔 Fetching unread count...');
      const response = await notificationApi.getUnreadCount();
      
      console.log('🔍 Unread Count - Full Response:', response);
      
      // ✅ FIXED: Correct path based on your backend structure
      // Backend returns: { success: true, data: { unreadCount: 5 } }
      // axios returns: { data: { success: true, data: { unreadCount: 5 } } }
      const responseData = response.data || response;
      const actualData = responseData.data || responseData;
      const count = actualData.unreadCount ?? responseData.unreadCount ?? 0;
      
      setUnreadCount(count);
      console.log('✅ useNotification - Unread count set to:', count);
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      console.error('❌ Error response:', error.response?.data);
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
      await notificationApi.clearAll();
      
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