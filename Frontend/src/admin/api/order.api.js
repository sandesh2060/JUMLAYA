import apiClient from '../../api/axios.config';

const ADMIN_ORDER_BASE_URL = '/admin/orders';

export const orderAPI = {
  // Get all orders with filters
  getAllOrders: async (params = {}) => {
    const response = await apiClient.get(ADMIN_ORDER_BASE_URL, { params });
    return response.data;
  },

  // Get single order
  getOrderById: async (orderId) => {
    const response = await apiClient.get(`${ADMIN_ORDER_BASE_URL}/${orderId}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId, data) => {
    const response = await apiClient.patch(
      `${ADMIN_ORDER_BASE_URL}/${orderId}/status`,
      data
    );
    return response.data;
  },

  // Update payment status
  updatePaymentStatus: async (orderId, data) => {
    const response = await apiClient.patch(
      `${ADMIN_ORDER_BASE_URL}/${orderId}/payment-status`,
      data
    );
    return response.data;
  },

  // Update admin notes
  updateAdminNotes: async (orderId, adminNotes) => {
    const response = await apiClient.patch(
      `${ADMIN_ORDER_BASE_URL}/${orderId}/notes`,
      { adminNotes }
    );
    return response.data;
  },

  // Delete order
  deleteOrder: async (orderId) => {
    const response = await apiClient.delete(`${ADMIN_ORDER_BASE_URL}/${orderId}`);
    return response.data;
  },

  // Get order statistics
  getOrderStats: async (params = {}) => {
    const response = await apiClient.get(`${ADMIN_ORDER_BASE_URL}/stats`, { params });
    return response.data;
  },

  // Bulk update status
  bulkUpdateStatus: async (data) => {
    const response = await apiClient.patch(
      `${ADMIN_ORDER_BASE_URL}/bulk-update`,
      data
    );
    return response.data;
  },

  // Export orders
  exportOrders: async (params = {}) => {
    const response = await apiClient.get(`${ADMIN_ORDER_BASE_URL}/export`, { params });
    return response.data;
  }
};

export default orderAPI;