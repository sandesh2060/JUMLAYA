// ============================================
// Frontend/src/api/admin.rider.api.js
// ✅ WITH SINGLE DOCUMENT VERIFICATION
// ============================================
import api from './axios.config'

export const adminRiderAPI = {
  getAllRiders: async (params = {}) => {
    const response = await api.get('/admin/riders', { params })
    return response.data
  },

  getRiderStats: async () => {
    const response = await api.get('/admin/riders/stats')
    return response.data
  },

  getRiderDetails: async (riderId) => {
    const response = await api.get(`/admin/riders/${riderId}`)
    return response.data
  },

  approveRider: async (riderId) => {
    const response = await api.patch(`/admin/riders/${riderId}/approve`)
    return response.data
  },

  rejectRider: async (riderId, reason) => {
    const response = await api.patch(`/admin/riders/${riderId}/reject`, { reason })
    return response.data
  },

  // ✅ NEW: Verify single document
  verifyDocument: async (riderId, documentType, verified, rejectionReason = null) => {
    const response = await api.patch(
      `/admin/riders/${riderId}/documents/${documentType}/verify`,
      { verified, rejectionReason }
    )
    return response.data
  },
}

export default adminRiderAPI