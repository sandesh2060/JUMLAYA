// ============================================
// Frontend/src/rider/utils/riderApi.js
// API utilities for rider dashboard
// ============================================
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

// Create axios instance with auth token
const createAuthRequest = () => {
  const token = localStorage.getItem('authToken');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
};

const riderAPI = {
  // ============================================
  // DASHBOARD & STATS
  // ============================================
  
  /**
   * Get rider dashboard data
   * Returns: stats, pending orders, current location
   */
  getDashboard: async () => {
    try {
      const api = createAuthRequest();
      const response = await api.get('/rider/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get dashboard error:', error);
      throw error;
    }
  },

  /**
   * Get rider earnings and statistics
   */
  getEarnings: async (period = 'today') => {
    try {
      const api = createAuthRequest();
      const response = await api.get(`/rider/earnings?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Get earnings error:', error);
      throw error;
    }
  },

  // ============================================
  // RIDER STATUS & LOCATION
  // ============================================
  
  /**
   * Update rider status (offline/active/on_delivery/inactive)
   */
  updateStatus: async (status) => {
    try {
      const api = createAuthRequest();
      const response = await api.patch('/rider/status', { status });
      return response.data;
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    }
  },

  /**
   * Update rider's current location
   */
updateLocation: async ({ lat, lng }) => {
  try {
    const api = createAuthRequest();
    const response = await api.patch('/rider/location', {
      lat,   // ✅ Fixed
      lng,   // ✅ Fixed
    });
    return response.data;
  } catch (error) {
    console.error('Update location error:', error);
    throw error;
  }
},

  // ============================================
  // ORDER MANAGEMENT
  // ============================================
  
  /**
   * Get all orders assigned to rider
   */
  getOrders: async (status = null) => {
    try {
      const api = createAuthRequest();
      const url = status ? `/rider/orders?status=${status}` : '/rider/orders';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  },

  /**
   * Get single order details
   */
  getOrderById: async (orderId) => {
    try {
      const api = createAuthRequest();
      const response = await api.get(`/rider/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  },

  /**
   * Accept an assigned order
   */
  acceptOrder: async (orderId) => {
    try {
      const api = createAuthRequest();
      const response = await api.post(`/rider/orders/${orderId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Accept order error:', error);
      throw error;
    }
  },

  /**
   * Mark order as picked up from restaurant
   */
  pickupOrder: async (orderId) => {
    try {
      const api = createAuthRequest();
      const response = await api.post(`/rider/orders/${orderId}/pickup`);
      return response.data;
    } catch (error) {
      console.error('Pickup order error:', error);
      throw error;
    }
  },

  /**
   * Mark order as delivered
   */
  deliverOrder: async (orderId, deliveryProof = {}) => {
    try {
      const api = createAuthRequest();
      const response = await api.post(`/rider/orders/${orderId}/deliver`, deliveryProof);
      return response.data;
    } catch (error) {
      console.error('Deliver order error:', error);
      throw error;
    }
  },

  /**
   * Reject an order with reason
   */
  rejectOrder: async (orderId, reason) => {
    try {
      const api = createAuthRequest();
      const response = await api.post(`/rider/orders/${orderId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Reject order error:', error);
      throw error;
    }
  },

  // ============================================
  // NAVIGATION & DIRECTIONS
  // ============================================
  
  /**
   * Get directions from current location to destination
   */
  getDirections: async (orderId) => {
    try {
      const api = createAuthRequest();
      const response = await api.get(`/rider/orders/${orderId}/directions`);
      return response.data;
    } catch (error) {
      console.error('Get directions error:', error);
      throw error;
    }
  },

  /**
   * Get distance and ETA to customer
   */
  getETA: async (orderId) => {
    try {
      const api = createAuthRequest();
      const response = await api.get(`/rider/orders/${orderId}/eta`);
      return response.data;
    } catch (error) {
      console.error('Get ETA error:', error);
      throw error;
    }
  },

  // ============================================
  // RIDER PROFILE
  // ============================================
  
  /**
   * Get rider profile
   */
  getProfile: async () => {
    try {
      const api = createAuthRequest();
      const response = await api.get('/rider/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  /**
   * Update rider profile
   */
  updateProfile: async (profileData) => {
    try {
      const api = createAuthRequest();
      const response = await api.patch('/rider/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  /**
   * Upload rider documents (license, vehicle registration, etc.)
   */
  uploadDocument: async (documentType, file) => {
    try {
      const api = createAuthRequest();
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      
      const response = await api.post('/rider/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  },

  // ============================================
  // ANALYTICS & HISTORY
  // ============================================
  
  /**
   * Get delivery history
   */
  getHistory: async (page = 1, limit = 20) => {
    try {
      const api = createAuthRequest();
      const response = await api.get(`/rider/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get history error:', error);
      throw error;
    }
  },

  /**
   * Get performance metrics
   */
  getPerformance: async (period = 'week') => {
    try {
      const api = createAuthRequest();
      const response = await api.get(`/rider/performance?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Get performance error:', error);
      throw error;
    }
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================
  
  /**
   * Get rider notifications
   */
  getNotifications: async () => {
    try {
      const api = createAuthRequest();
      const response = await api.get('/rider/notifications');
      return response.data;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   */
  markNotificationRead: async (notificationId) => {
    try {
      const api = createAuthRequest();
      const response = await api.patch(`/rider/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Mark notification error:', error);
      throw error;
    }
  },
};

export default riderAPI;