// ============================================
// Frontend/src/api/admin.rider.api.js
// Admin Rider Management API
// ============================================
import api from './axios.config'

export const adminRiderAPI = {
  // Get all riders with filters
  getAllRiders: async (params = {}) => {
    const response = await api.get('/admin/riders', { params })
    return response.data
  },

  // Get single rider
  getRider: async (riderId) => {
    const response = await api.get(`/admin/riders/${riderId}`)
    return response.data
  },

  // Get rider statistics
  getRiderStats: async () => {
    const response = await api.get('/admin/riders/stats')
    return response.data
  },

  // Approve rider
  approveRider: async (riderId) => {
    const response = await api.patch(`/admin/riders/${riderId}/approve`)
    return response.data
  },

  // Reject rider
  rejectRider: async (riderId, reason) => {
    const response = await api.post(`/admin/riders/${riderId}/reject`, { reason })
    return response.data
  },
}