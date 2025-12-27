// Frontend/src/admin/utils/adminApi.js
import apiClient from '@/api/axios.config';

const adminAPI = {
  // Dashboard APIs
  dashboard: {
    getStats: async () => {
      const response = await apiClient.get('/admin/dashboard/stats');
      return response.data;
    },
    
    getRecentOrders: async (limit = 5) => {
      const response = await apiClient.get('/admin/dashboard/recent-orders', {
        params: { limit }
      });
      return response.data;
    },
    
    getTopProducts: async (limit = 5) => {
      const response = await apiClient.get('/admin/dashboard/top-products', {
        params: { limit }
      });
      return response.data;
    },
    
    getLowStockProducts: async (threshold = 10, limit = 10) => {
      const response = await apiClient.get('/admin/dashboard/low-stock', {
        params: { threshold, limit }
      });
      return response.data;
    },
    
    getSalesChart: async (period = 'week') => {
      const response = await apiClient.get('/admin/dashboard/sales-chart', {
        params: { period }
      });
      return response.data;
    }
  },

  // Category APIs (NEW - THIS WAS MISSING!)
  categories: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/categories', { params });
      return response.data;
    },
    
    getById: async (id) => {
      const response = await apiClient.get(`/categories/${id}`);
      return response.data;
    },
    
    create: async (data) => {
      const response = await apiClient.post('/admin/categories', data);
      return response.data;
    },
    
    update: async (id, data) => {
      const response = await apiClient.put(`/admin/categories/${id}`, data);
      return response.data;
    },
    
    delete: async (id) => {
      const response = await apiClient.delete(`/admin/categories/${id}`);
      return response.data;
    }
  },

  // Product APIs
  products: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/admin/products', { params });
      return response.data;
    },
    
    getById: async (id) => {
      const response = await apiClient.get(`/admin/products/${id}`);
      return response.data;
    },
    
    create: async (data) => {
      const response = await apiClient.post('/admin/products', data);
      return response.data;
    },
    
    update: async (id, data) => {
      const response = await apiClient.put(`/admin/products/${id}`, data);
      return response.data;
    },
    
    delete: async (id) => {
      const response = await apiClient.delete(`/admin/products/${id}`);
      return response.data;
    }
  },

  // Order APIs
  orders: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/admin/orders', { params });
      return response.data;
    },
    
    getById: async (id) => {
      const response = await apiClient.get(`/admin/orders/${id}`);
      return response.data;
    },
    
    updateStatus: async (id, data) => {
      const response = await apiClient.patch(`/admin/orders/${id}/status`, data);
      return response.data;
    },
    
    updatePaymentStatus: async (id, data) => {
      const response = await apiClient.patch(`/admin/orders/${id}/payment-status`, data);
      return response.data;
    }
  },

  // User/Customer APIs
  users: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/admin/users', { params });
      return response.data;
    },
    
    getById: async (id) => {
      const response = await apiClient.get(`/admin/users/${id}`);
      return response.data;
    },
    
    update: async (id, data) => {
      const response = await apiClient.put(`/admin/users/${id}`, data);
      return response.data;
    },
    
    delete: async (id) => {
      const response = await apiClient.delete(`/admin/users/${id}`);
      return response.data;
    }
  }
};

export default adminAPI;