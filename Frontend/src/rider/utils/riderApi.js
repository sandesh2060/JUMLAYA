import axios from '../../api/axios.config';

export const riderApi = {
  // ============ PROFILE ============
  getProfile: () => axios.get('/api/rider/profile'),
  
  updateProfile: (data) => axios.put('/api/rider/profile', data),
  
  uploadDocuments: (formData) => 
    axios.post('/api/rider/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // ============ LOCATION ============
  updateLocation: (latitude, longitude, address) => 
    axios.post('/api/rider/location', { latitude, longitude, address }),

  // ============ STATUS ============
  updateStatus: (status) => 
    axios.put('/api/rider/status', { status }),
  
  toggleAvailability: () => 
    axios.post('/api/rider/toggle-availability'),

  // ============ ORDERS ============
  orders: {
    getActive: () => axios.get('/api/rider/orders/active'),
    
    getHistory: (page = 1) => 
      axios.get(`/api/rider/orders/history?page=${page}`),
    
    getDetails: (orderId) => 
      axios.get(`/api/rider/orders/${orderId}`),
    
    accept: (orderId) => 
      axios.post(`/api/rider/orders/${orderId}/accept`),
    
    pickup: (orderId) => 
      axios.post(`/api/rider/orders/${orderId}/pickup`),
    
    startDelivery: (orderId) => 
      axios.post(`/api/rider/orders/${orderId}/start-delivery`),
    
    complete: (orderId, data = {}) => 
      axios.post(`/api/rider/orders/${orderId}/complete`, data),
    
    updateStatus: (orderId, status, note) => 
      axios.put(`/api/rider/orders/${orderId}/status`, { status, note }),
    
    reportIssue: (orderId, issueType, description) => 
      axios.post(`/api/rider/orders/${orderId}/report-issue`, { 
        issueType, 
        description 
      }),
  },

  // ============ NOTIFICATIONS ============
  notifications: {
    getAll: (page = 1, filter = 'all') => 
      axios.get('/api/rider/notifications', { 
        params: { page, limit: 20, filter } 
      }),
    
    getById: (notificationId) => 
      axios.get(`/api/rider/notifications/${notificationId}`),
    
    getUnreadCount: () => 
      axios.get('/api/rider/notifications/unread-count'),
    
    markAsRead: (notificationId) => 
      axios.put(`/api/rider/notifications/${notificationId}/read`),
    
    markAllAsRead: () => 
      axios.put('/api/rider/notifications/mark-all-read'),
    
    delete: (notificationId) => 
      axios.delete(`/api/rider/notifications/${notificationId}`),
    
    deleteAll: () => 
      axios.delete('/api/rider/notifications'),
    
    getPreferences: () => 
      axios.get('/api/rider/notifications/preferences/settings'),
    
    updatePreferences: (preferences) => 
      axios.put('/api/rider/notifications/preferences/settings', preferences),
  },

  // ============ EARNINGS ============
  getEarnings: (period = 'all') => 
    axios.get('/api/rider/earnings', { params: { period } }),
  
  getEarningsHistory: (page = 1) => 
    axios.get(`/api/rider/earnings/history?page=${page}`),

  // ============ STATISTICS ============
  getStatistics: () => 
    axios.get('/api/rider/statistics'),

  // ============ NEARBY ORDERS ============
  getNearbyOrders: () => 
    axios.get('/api/rider/nearby-orders'),
};

export default riderApi;