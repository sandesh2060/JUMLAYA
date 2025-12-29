// ============================================
// Frontend/src/api/rider.api.js
// FIXED - Remove /api prefix (axios.config already has it)
// ============================================
import api from './axios.config';

export const riderAPI = {
  // ============================================
  // DASHBOARD & PROFILE
  // ============================================
  
  getDashboard: async () => {
    const response = await api.get('/rider/dashboard'); // ✅ FIXED: Removed /api
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/rider/profile'); // ✅ FIXED
    return response.data;
  },
  
  updateProfile: async (data) => {
    const response = await api.put('/rider/profile', data); // ✅ FIXED
    return response.data;
  },
  
  uploadDocuments: async (formData) => {
    const response = await api.post('/rider/documents/upload', formData, { // ✅ FIXED
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/rider/stats'); // ✅ FIXED
    return response.data;
  },

  // ============================================
  // LOCATION & STATUS
  // ============================================
  
  updateLocation: async (latitude, longitude, address) => {
    const response = await api.patch('/rider/location', { // ✅ FIXED
      lat: latitude, 
      lng: longitude, 
      address 
    });
    return response.data;
  },

  updateStatus: async (status) => {
    const response = await api.patch('/rider/status', { status }); // ✅ FIXED
    return response.data;
  },
  
  toggleAvailability: async () => {
    const response = await api.post('/rider/toggle-availability'); // ✅ FIXED
    return response.data;
  },

  // ============================================
  // ORDERS
  // ============================================
  
  orders: {
    getAll: async (params = {}) => {
      const response = await api.get('/rider/orders', { params }); // ✅ FIXED
      return response.data;
    },

    getActive: async () => {
      const response = await api.get('/rider/orders/active'); // ✅ FIXED
      return response.data;
    },

    getPending: async () => {
      const response = await api.get('/rider/orders/pending'); // ✅ FIXED
      return response.data;
    },
    
    getHistory: async (page = 1) => {
      const response = await api.get('/rider/orders/history', { // ✅ FIXED
        params: { page, limit: 20 } 
      });
      return response.data;
    },
    
    getDetails: async (orderId) => {
      const response = await api.get(`/rider/orders/${orderId}`); // ✅ FIXED
      return response.data;
    },
    
    accept: async (orderId) => {
      const response = await api.post(`/rider/orders/${orderId}/accept`); // ✅ FIXED
      return response.data;
    },
    
    pickup: async (orderId) => {
      const response = await api.post(`/rider/orders/${orderId}/pickup`); // ✅ FIXED
      return response.data;
    },
    
    startDelivery: async (orderId) => {
      const response = await api.post(`/rider/orders/${orderId}/start-delivery`); // ✅ FIXED
      return response.data;
    },
    
    complete: async (orderId, data = {}) => {
      const response = await api.post(`/rider/orders/${orderId}/deliver`, data); // ✅ FIXED
      return response.data;
    },
    
    updateStatus: async (orderId, status, note) => {
      const response = await api.patch(`/rider/orders/${orderId}/status`, { // ✅ FIXED
        status, 
        note 
      });
      return response.data;
    },
    
    reportIssue: async (orderId, issueType, description) => {
      const response = await api.post(`/rider/orders/${orderId}/report-issue`, { // ✅ FIXED
        issueType, 
        description 
      });
      return response.data;
    },
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================
  
  notifications: {
    getAll: async (page = 1, filter = 'all') => {
      const response = await api.get('/rider/notifications', { // ✅ FIXED
        params: { page, limit: 20, filter } 
      });
      return response.data;
    },
    
    getById: async (notificationId) => {
      const response = await api.get(`/rider/notifications/${notificationId}`); // ✅ FIXED
      return response.data;
    },
    
    getUnreadCount: async () => {
      const response = await api.get('/rider/notifications/unread-count'); // ✅ FIXED
      return response.data;
    },
    
    markAsRead: async (notificationId) => {
      const response = await api.put(`/rider/notifications/${notificationId}/read`); // ✅ FIXED
      return response.data;
    },
    
    markAllAsRead: async () => {
      const response = await api.put('/rider/notifications/mark-all-read'); // ✅ FIXED
      return response.data;
    },
    
    delete: async (notificationId) => {
      const response = await api.delete(`/rider/notifications/${notificationId}`); // ✅ FIXED
      return response.data;
    },
    
    deleteAll: async () => {
      const response = await api.delete('/rider/notifications'); // ✅ FIXED
      return response.data;
    },
    
    getPreferences: async () => {
      const response = await api.get('/rider/notifications/preferences/settings'); // ✅ FIXED
      return response.data;
    },
    
    updatePreferences: async (preferences) => {
      const response = await api.put('/rider/notifications/preferences/settings', preferences); // ✅ FIXED
      return response.data;
    },
  },

  // ============================================
  // EARNINGS
  // ============================================
  
  getEarnings: async (period = 'all') => {
    const response = await api.get('/rider/earnings', { // ✅ FIXED
      params: { period } 
    });
    return response.data;
  },
  
  getEarningsHistory: async (page = 1) => {
    const response = await api.get('/rider/earnings/history', { // ✅ FIXED
      params: { page, limit: 50 } 
    });
    return response.data;
  },

  // ============================================
  // NEARBY ORDERS
  // ============================================
  
  getNearbyOrders: async () => {
    const response = await api.get('/rider/nearby-orders'); // ✅ FIXED
    return response.data;
  },
};

export default riderAPI;