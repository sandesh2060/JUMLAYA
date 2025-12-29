// ============================================
// Frontend/src/api/notification.api.js
// ✅ FIXED - Matches backend routes exactly
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

  // Get notification by ID
  getById: async (notificationId) => {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data;
  },

  // ✅ FIXED: Changed to '/notifications/unread-count' (with DASH, not slash)
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // ✅ CORRECT: Mark single notification as read
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // ✅ FIXED: Changed to '/notifications/mark-all-read' (with DASH)
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  // Delete single notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // ✅ FIXED: Changed to '/notifications/read/all' to match backend route
  deleteAllRead: async () => {
    const response = await api.delete('/notifications/read/all');
    return response.data;
  },

  // Delete all notifications (clear all)
  deleteAllNotifications: async () => {
    const response = await api.delete('/notifications/read/all');
    return response.data;
  },

  // Legacy methods (for backward compatibility)
  getAll: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  delete: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  clearAll: async () => {
    const response = await api.delete('/notifications/read/all');
    return response.data;
  }
};

export default notificationApi;