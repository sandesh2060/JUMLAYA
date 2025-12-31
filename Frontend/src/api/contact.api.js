// ============================================
// FILE 5: Frontend/src/api/contact.api.js
// ============================================
import api from './axios.config'

const contactAPI = {
  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  // Submit contact form
  submitContactForm: async (formData) => {
    try {
      console.log('📧 Submitting contact form:', {
        name: formData.name,
        email: formData.email,
        subject: formData.subject
      })

      const response = await api.post('/contact/submit', formData)
      
      console.log('✅ Contact form submitted:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Contact form error:', error.response?.data || error.message)
      throw error
    }
  },

  // Get contact information
  getContactInfo: async () => {
    try {
      const response = await api.get('/contact/info')
      return response.data
    } catch (error) {
      console.error('❌ Error fetching contact info:', error)
      throw error
    }
  },

  // ============================================
  // ADMIN ENDPOINTS (if needed later)
  // ============================================

  // Get all contact messages (Admin)
  getAllMessages: async (params = {}) => {
    try {
      const { status, page = 1, limit = 10, sort = '-createdAt' } = params
      const queryParams = new URLSearchParams({
        ...(status && { status }),
        page: page.toString(),
        limit: limit.toString(),
        sort
      })

      const response = await api.get(`/contact/messages?${queryParams}`)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching messages:', error)
      throw error
    }
  },

  // Get single message (Admin)
  getMessageById: async (id) => {
    try {
      const response = await api.get(`/contact/messages/${id}`)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching message:', error)
      throw error
    }
  },

  // Update message status (Admin)
  updateMessageStatus: async (id, status, adminNotes) => {
    try {
      const response = await api.patch(`/contact/messages/${id}/status`, {
        status,
        adminNotes
      })
      return response.data
    } catch (error) {
      console.error('❌ Error updating message status:', error)
      throw error
    }
  },

  // Delete message (Admin)
  deleteMessage: async (id) => {
    try {
      const response = await api.delete(`/contact/messages/${id}`)
      return response.data
    } catch (error) {
      console.error('❌ Error deleting message:', error)
      throw error
    }
  }
}

export default contactAPI