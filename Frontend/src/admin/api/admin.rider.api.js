// ============================================
// Frontend/src/api/admin.rider.api.js
// ✅ Complete Admin Rider API Service with Document Verification
// ============================================
import api from './axios.config'

export const adminRiderAPI = {
  // ============================================
  // GET ALL RIDERS WITH FILTERS
  // ============================================
  getAllRiders: async (params = {}) => {
    const response = await api.get('/admin/riders', { params })
    return response.data
  },

  // ============================================
  // GET RIDER STATISTICS
  // ============================================
  getRiderStats: async () => {
    const response = await api.get('/admin/riders/stats')
    return response.data
  },

  // ============================================
  // GET SINGLE RIDER DETAILS
  // ============================================
  getRiderDetails: async (riderId) => {
    const response = await api.get(`/admin/riders/${riderId}`)
    return response.data
  },

  // ============================================
  // APPROVE RIDER APPLICATION
  // ============================================
  approveRider: async (riderId) => {
    const response = await api.patch(`/admin/riders/${riderId}/approve`)
    return response.data
  },

  // ============================================
  // REJECT RIDER APPLICATION
  // ============================================
  rejectRider: async (riderId, reason) => {
    const response = await api.patch(`/admin/riders/${riderId}/reject`, { reason })
    return response.data
  },

  // ============================================
  // VERIFY/REJECT SPECIFIC DOCUMENT
  // ✅ NEW: Individual document verification
  // ============================================
  verifyDocument: async (riderId, documentType, verified, rejectionReason = null) => {
    const payload = { verified }
    if (!verified && rejectionReason) {
      payload.rejectionReason = rejectionReason
    }
    
    const response = await api.patch(
      `/admin/riders/${riderId}/documents/${documentType}/verify`,
      payload
    )
    return response.data
  },

  // ============================================
  // SUSPEND RIDER
  // ============================================
  suspendRider: async (riderId, reason, suspendUntil = null) => {
    const response = await api.patch(`/admin/riders/${riderId}/suspend`, {
      reason,
      suspendUntil
    })
    return response.data
  },

  // ============================================
  // UNSUSPEND RIDER
  // ============================================
  unsuspendRider: async (riderId) => {
    const response = await api.patch(`/admin/riders/${riderId}/unsuspend`)
    return response.data
  },

  // ============================================
  // DELETE RIDER ACCOUNT
  // ============================================
  deleteRider: async (riderId) => {
    const response = await api.delete(`/admin/riders/${riderId}`)
    return response.data
  },

  // ============================================
  // UPDATE RIDER STATUS (ACTIVE/INACTIVE)
  // ============================================
  updateRiderStatus: async (riderId, status) => {
    const response = await api.patch(`/admin/riders/${riderId}/status`, { status })
    return response.data
  },

  // ============================================
  // ADD ADMIN NOTE TO RIDER PROFILE
  // ============================================
  addAdminNote: async (riderId, note) => {
    const response = await api.post(`/admin/riders/${riderId}/notes`, { note })
    return response.data
  },

  // ============================================
  // GET RIDER'S DELIVERY HISTORY
  // ============================================
  getRiderDeliveryHistory: async (riderId, params = {}) => {
    const response = await api.get(`/admin/riders/${riderId}/deliveries`, { params })
    return response.data
  },

  // ============================================
  // GET RIDER'S EARNINGS
  // ============================================
  getRiderEarnings: async (riderId, params = {}) => {
    const response = await api.get(`/admin/riders/${riderId}/earnings`, { params })
    return response.data
  },
}

export default adminRiderAPI