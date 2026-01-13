// ============================================
// Frontend/src/api/admin.rider.api.js
// ✅ INDEX 3: PRODUCTION-READY API with Enhanced Error Handling
// ============================================
import api from './axios.config'

export const adminRiderAPI = {
  // ============================================
  // GET ALL RIDERS WITH FILTERS
  // ============================================
  getAllRiders: async (params = {}) => {
    try {
      console.log('📤 [API] getAllRiders:', params)
      const response = await api.get('/admin/riders', { params })
      console.log('📥 [API] getAllRiders response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [API] getAllRiders failed:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      })
      throw error
    }
  },

  // ============================================
  // GET RIDER STATISTICS
  // ============================================
  getRiderStats: async () => {
    try {
      console.log('📤 [API] getRiderStats')
      const response = await api.get('/admin/riders/stats')
      console.log('📥 [API] getRiderStats response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [API] getRiderStats failed:', error.response?.data || error.message)
      throw error
    }
  },

  // ============================================
  // GET SINGLE RIDER DETAILS
  // ============================================
  getRiderDetails: async (riderId) => {
    try {
      console.log('📤 [API] getRiderDetails:', riderId)
      const response = await api.get(`/admin/riders/${riderId}`)
      console.log('📥 [API] getRiderDetails response:', {
        riderId,
        hasData: !!response.data?.data?.rider,
        documents: response.data?.data?.rider?.riderProfile?.documents
      })
      return response.data
    } catch (error) {
      console.error('❌ [API] getRiderDetails failed:', {
        riderId,
        status: error.response?.status,
        message: error.response?.data?.message
      })
      throw error
    }
  },

  // ============================================
  // ✅ VERIFY/REJECT SPECIFIC DOCUMENT - ENHANCED
  // ============================================
  verifyDocument: async (riderId, documentType, verified, rejectionReason = null) => {
    try {
      console.log('📤 [API] verifyDocument REQUEST:', {
        riderId,
        documentType,
        verified,
        rejectionReason: rejectionReason || 'N/A',
        url: `/admin/riders/${riderId}/documents/${documentType}/verify`
      })

      // ✅ Validate inputs before sending
      if (!riderId || !documentType) {
        throw new Error('riderId and documentType are required')
      }

      if (typeof verified !== 'boolean') {
        throw new Error('verified must be a boolean')
      }

      const validDocTypes = ['license', 'vehicleRegistration', 'insurance', 'identityProof', 'profilePhoto']
      if (!validDocTypes.includes(documentType)) {
        throw new Error(`Invalid documentType: ${documentType}`)
      }

      // ✅ Build payload
      const payload = { 
        verified: Boolean(verified) // Ensure boolean
      }

      // Only add rejectionReason if rejecting
      if (!verified && rejectionReason) {
        payload.rejectionReason = rejectionReason
      }

      console.log('📤 [API] verifyDocument PAYLOAD:', payload)

      // ✅ Make API call
      const response = await api.patch(
        `/admin/riders/${riderId}/documents/${documentType}/verify`,
        payload
      )

      console.log('✅ [API] verifyDocument SUCCESS:', {
        documentType,
        verified,
        response: response.data
      })

      return response.data
    } catch (error) {
      console.error('❌ [API] verifyDocument FAILED:', {
        riderId,
        documentType,
        verified,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
        fullError: error.response?.data
      })
      
      // Re-throw with enhanced error message
      const enhancedError = new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to verify document'
      )
      enhancedError.response = error.response
      throw enhancedError
    }
  },

  // ============================================
  // APPROVE RIDER APPLICATION
  // ============================================
  approveRider: async (riderId) => {
    try {
      console.log('📤 [API] approveRider:', riderId)
      const response = await api.patch(`/admin/riders/${riderId}/approve`)
      console.log('✅ [API] approveRider success:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [API] approveRider failed:', {
        riderId,
        status: error.response?.status,
        message: error.response?.data?.message
      })
      throw error
    }
  },

  // ============================================
  // REJECT RIDER APPLICATION
  // ============================================
  rejectRider: async (riderId, reason) => {
    try {
      console.log('📤 [API] rejectRider:', { riderId, reason })
      const response = await api.patch(`/admin/riders/${riderId}/reject`, { reason })
      console.log('✅ [API] rejectRider success:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [API] rejectRider failed:', {
        riderId,
        status: error.response?.status,
        message: error.response?.data?.message
      })
      throw error
    }
  },

  // ============================================
  // SUSPEND RIDER
  // ============================================
  suspendRider: async (riderId, reason, suspendUntil = null) => {
    try {
      const response = await api.patch(`/admin/riders/${riderId}/suspend`, {
        reason,
        suspendUntil
      })
      return response.data
    } catch (error) {
      console.error('❌ [API] suspendRider failed:', error.response?.data || error.message)
      throw error
    }
  },

  // ============================================
  // UNSUSPEND RIDER
  // ============================================
  unsuspendRider: async (riderId) => {
    try {
      const response = await api.patch(`/admin/riders/${riderId}/unsuspend`)
      return response.data
    } catch (error) {
      console.error('❌ [API] unsuspendRider failed:', error.response?.data || error.message)
      throw error
    }
  },

  // ============================================
  // DELETE RIDER ACCOUNT
  // ============================================
  deleteRider: async (riderId) => {
    try {
      const response = await api.delete(`/admin/riders/${riderId}`)
      return response.data
    } catch (error) {
      console.error('❌ [API] deleteRider failed:', error.response?.data || error.message)
      throw error
    }
  },
}

export default adminRiderAPI