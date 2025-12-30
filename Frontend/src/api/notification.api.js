// ============================================
// Frontend/src/api/notification.api.js
// ✅ FIXED - Routes without /api prefix
// (Because VITE_API_URL already includes /api)
// ============================================
import api from './axios.config';

export const notificationApi = {
  // Get all notifications with pagination and filters
  getNotifications: async (page = 1, limit = 20, filter = 'all') => {
    const response = await api.get('/notifications', { 
      params: { page, limit, filter } 
    });
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  // Delete single notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Delete all read notifications
  deleteAllRead: async () => {
    const response = await api.delete('/notifications/read/all');
    return response.data;
  },

  // Clear all notifications
  clearAll: async () => {
    const response = await api.delete('/notifications/clear-all');
    return response.data;
  },

  // Legacy methods (for backward compatibility)
  getAll: async (params = {}) => {
    return notificationApi.getNotifications(
      params.page || 1, 
      params.limit || 20, 
      params.filter || 'all'
    );
  },

  delete: async (notificationId) => {
    return notificationApi.deleteNotification(notificationId);
  }
};

export default notificationApi;