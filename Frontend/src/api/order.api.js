// ============================================
// 🌐 COMPLETE ORDER API SERVICE
// Path: src/api/order.api.js
// ============================================

import api from './axios.config'

export const orderAPI = {
  /**
   * Create new order
   * @param {object} orderData - Order data
   * @returns {Promise} Order response
   */
  createOrder: async (orderData) => {
    try {
      console.log('📤 Creating order:', orderData)
      const response = await api.post('/orders', orderData)
      console.log('✅ Order created:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Create order error:', error)
      throw error
    }
  },

  /**
   * Get user's orders with optional filters
   * @param {object} params - Query parameters (status, page, limit)
   * @returns {Promise} Orders list
   */
  getMyOrders: async (params = {}) => {
    try {
      console.log('📤 Fetching orders with params:', params)
      const response = await api.get('/orders', { params })
      console.log('✅ Orders fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Fetch orders error:', error)
      throw error
    }
  },

  /**
   * Get single order details
   * @param {string} id - Order ID
   * @returns {Promise} Order details
   */
  getOrder: async (id) => {
    try {
      console.log('📤 Fetching order:', id)
      const response = await api.get(`/orders/${id}`)
      console.log('✅ Order fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Fetch order error:', error)
      throw error
    }
  },

  /**
   * Track order status with history
   * @param {string} id - Order ID
   * @returns {Promise} Order tracking info
   */
  trackOrder: async (id) => {
    try {
      console.log('📤 Tracking order:', id)
      const response = await api.get(`/orders/${id}/track`)
      console.log('✅ Order tracking:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Track order error:', error)
      throw error
    }
  },

  /**
   * Get order statistics for current user
   * @returns {Promise} Order statistics
   */
  getMyOrderStats: async () => {
    try {
      console.log('📤 Fetching order stats')
      const response = await api.get('/orders/stats')
      console.log('✅ Stats fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Fetch stats error:', error)
      throw error
    }
  },

  /**
   * Cancel an order
   * @param {string} id - Order ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} Cancellation response
   */
  cancelOrder: async (id, reason = 'Customer request') => {
    try {
      console.log('📤 Cancelling order:', id, 'Reason:', reason)
      const response = await api.post(`/orders/${id}/cancel`, { reason })
      console.log('✅ Order cancelled:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Cancel order error:', error)
      
      // Provide user-friendly error message
      const message = error.response?.data?.message || 'Failed to cancel order'
      throw new Error(message)
    }
  },

  /**
   * Request order return
   * @param {string} id - Order ID
   * @param {string} reason - Return reason
   * @returns {Promise} Return request response
   */
  requestReturn: async (id, reason) => {
    try {
      console.log('📤 Requesting return:', id, 'Reason:', reason)
      const response = await api.post(`/orders/${id}/return`, { reason })
      console.log('✅ Return requested:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Request return error:', error)
      throw error
    }
  },

  /**
   * Reorder - Add items from previous order to cart
   * @param {string} id - Order ID
   * @returns {Promise} Reorder response
   */
  reorder: async (id) => {
    try {
      console.log('📤 Reordering:', id)
      const response = await api.post(`/orders/${id}/reorder`)
      console.log('✅ Reordered:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Reorder error:', error)
      throw error
    }
  },

  /**
   * Download order invoice as PDF
   * @param {string} id - Order ID
   * @returns {Promise} File download
   */
  downloadInvoice: async (id) => {
    try {
      console.log('📤 Downloading invoice:', id)
      const response = await api.get(`/orders/${id}/invoice`, {
        responseType: 'blob',
      })
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      link.remove()
      window.URL.revokeObjectURL(url)
      
      console.log('✅ Invoice downloaded')
      return response.data
    } catch (error) {
      console.error('❌ Download invoice error:', error)
      throw error
    }
  },

  /**
   * Update order payment status (admin only)
   * @param {string} id - Order ID
   * @param {string} status - Payment status
   * @returns {Promise} Update response
   */
  updatePaymentStatus: async (id, status) => {
    try {
      console.log('📤 Updating payment status:', id, status)
      const response = await api.patch(`/orders/${id}/payment`, { status })
      console.log('✅ Payment status updated:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Update payment error:', error)
      throw error
    }
  },

  /**
   * Update order shipping status (admin only)
   * @param {string} id - Order ID
   * @param {string} status - Shipping status
   * @param {string} trackingNumber - Optional tracking number
   * @returns {Promise} Update response
   */
  updateOrderStatus: async (id, status, trackingNumber = null) => {
    try {
      console.log('📤 Updating order status:', id, status)
      const payload = { status }
      if (trackingNumber) payload.trackingNumber = trackingNumber
      
      const response = await api.patch(`/orders/${id}/status`, payload)
      console.log('✅ Order status updated:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Update status error:', error)
      throw error
    }
  },

  /**
   * Get all orders (admin only)
   * @param {object} params - Query parameters
   * @returns {Promise} All orders
   */
  getAllOrders: async (params = {}) => {
    try {
      console.log('📤 Fetching all orders (admin):', params)
      const response = await api.get('/admin/orders', { params })
      console.log('✅ All orders fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Fetch all orders error:', error)
      throw error
    }
  },

  /**
   * Get order analytics (admin only)
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise} Order analytics
   */
  getOrderAnalytics: async (period = 'month') => {
    try {
      console.log('📤 Fetching order analytics:', period)
      const response = await api.get('/admin/orders/analytics', {
        params: { period }
      })
      console.log('✅ Analytics fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Fetch analytics error:', error)
      throw error
    }
  },

  /**
   * Delete order permanently (admin only or user for pending orders)
   * @param {string} id - Order ID
   * @returns {Promise} Delete response
   */
  deleteOrder: async (id) => {
    try {
      console.log('📤 Deleting order:', id)
      const response = await api.delete(`/orders/${id}`)
      console.log('✅ Order deleted:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Delete order error:', error)
      throw error
    }
  },
}

export default orderAPI