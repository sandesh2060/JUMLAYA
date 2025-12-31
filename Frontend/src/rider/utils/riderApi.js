// ============================================
// Frontend/src/rider/utils/riderApi.js
// ✅ FIXED: Routes without /api prefix
// (Because baseURL already includes /api)
// ============================================
import axios from '../../api/axios.config';

export const riderApi = {
  // ============ PROFILE ============
  getProfile: () => axios.get('/rider/profile'),
  
updateProfile: (data) => axios.patch('/rider/profile', data),
  
  uploadDocuments: (formData) => 
    axios.post('/rider/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // ============ LOCATION ============
  updateLocation: (latitude, longitude, address) => 
    axios.post('/rider/location', { latitude, longitude, address }),

  // ============ STATUS ============
  updateStatus: (status) => 
    axios.put('/rider/status', { status }),
  
  toggleAvailability: () => 
    axios.post('/rider/toggle-availability'),

  // ============ ORDERS ============
  orders: {
    getActive: () => axios.get('/rider/orders/active'),
    
    getHistory: (page = 1) => 
      axios.get(`/rider/orders/history?page=${page}`),
    
    getDetails: (orderId) => 
      axios.get(`/rider/orders/${orderId}`),
    
    accept: (orderId) => 
      axios.post(`/rider/orders/${orderId}/accept`),
    
    pickup: (orderId) => 
      axios.post(`/rider/orders/${orderId}/pickup`),
    
    startDelivery: (orderId) => 
      axios.post(`/rider/orders/${orderId}/start-delivery`),
    
    complete: (orderId, data = {}) => 
      axios.post(`/rider/orders/${orderId}/complete`, data),
    
    updateStatus: (orderId, status, note) => 
      axios.put(`/rider/orders/${orderId}/status`, { status, note }),
    
    reportIssue: (orderId, issueType, description) => 
      axios.post(`/rider/orders/${orderId}/report-issue`, { 
        issueType, 
        description 
      }),
  },

  // ============ NOTIFICATIONS ============
  notifications: {
    getAll: (page = 1, filter = 'all') => 
      axios.get('/rider/notifications', { 
        params: { page, limit: 20, filter } 
      }),
    
    getById: (notificationId) => 
      axios.get(`/rider/notifications/${notificationId}`),
    
    getUnreadCount: () => 
      axios.get('/rider/notifications/unread-count'),
    
    markAsRead: (notificationId) => 
      axios.put(`/rider/notifications/${notificationId}/read`),
    
    markAllAsRead: () => 
      axios.put('/rider/notifications/mark-all-read'),
    
    delete: (notificationId) => 
      axios.delete(`/rider/notifications/${notificationId}`),
    
    deleteAll: () => 
      axios.delete('/rider/notifications'),
    
    getPreferences: () => 
      axios.get('/rider/notifications/preferences/settings'),
    
    updatePreferences: (preferences) => 
      axios.put('/rider/notifications/preferences/settings', preferences),
  },

  // ============ EARNINGS ============
  getEarnings: (period = 'all') => 
    axios.get('/rider/earnings', { params: { period } }),
  
  getEarningsHistory: (page = 1) => 
    axios.get(`/rider/earnings/history?page=${page}`),

  // ============ STATISTICS ============
  getStatistics: () => 
    axios.get('/rider/statistics'),

  // ============ NEARBY ORDERS ============
  getNearbyOrders: () => 
    axios.get('/rider/nearby-orders'),
};

export default riderApi;