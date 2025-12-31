// ============================================
// FILE 2: Frontend/src/admin/api/notification.api.js
// ✅ FIXED - Export both named and default
// ============================================
import api from './axios.config';

export const notificationAPI = {
  // Get all notifications with pagination and filters
  getNotifications: async (page = 1, limit = 20, filter = 'all') => {
    console.log(`📡 API Call: GET /notifications?page=${page}&limit=${limit}&filter=${filter}`);
    const response = await api.get('/notifications', { 
      params: { page, limit, filter } 
    });
    console.log('📡 API Response:', response.data);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    console.log('📡 API Call: GET /notifications/unread-count');
    const response = await api.get('/notifications/unread-count');
    console.log('📡 API Response:', response.data);
    return response.data;
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    console.log(`📡 API Call: PATCH /notifications/${notificationId}/read`);
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    console.log('📡 API Call: PATCH /notifications/mark-all-read');
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  // Delete single notification
  deleteNotification: async (notificationId) => {
    console.log(`📡 API Call: DELETE /notifications/${notificationId}`);
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Delete all read notifications
  deleteAllRead: async () => {
    console.log('📡 API Call: DELETE /notifications/read/all');
    const response = await api.delete('/notifications/read/all');
    return response.data;
  },

  // Clear all notifications
  clearAll: async () => {
    console.log('📡 API Call: DELETE /notifications/clear-all');
    const response = await api.delete('/notifications/clear-all');
    return response.data;
  },

  // Legacy methods (for backward compatibility)
  getAll: async (params = {}) => {
    return notificationAPI.getNotifications(
      params.page || 1, 
      params.limit || 20, 
      params.filter || 'all'
    );
  },

  delete: async (notificationId) => {
    return notificationAPI.deleteNotification(notificationId);
  }
};

// ✅ Export both named and default
export default notificationAPI;