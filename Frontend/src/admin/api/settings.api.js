// ============================================
// settings.api.js - Complete Settings API
// Path: Frontend/src/admin/api/settings.api.js
// ============================================
import apiClient from '@/api/axios.config'

const settingsAPI = {
  // ============================================
  // GET SETTINGS
  // ============================================
  getSettings: async () => {
    try {
      const response = await apiClient.get('/admin/settings')
      return response.data
    } catch (error) {
      console.error('❌ Error fetching settings:', error)
      throw error.response?.data || { message: 'Failed to fetch settings' }
    }
  },

  // ============================================
  // UPDATE STORE INFO
  // ============================================
  updateStoreInfo: async (data) => {
    try {
      const response = await apiClient.put('/admin/settings/store-info', data)
      return response.data
    } catch (error) {
      console.error('❌ Error updating store info:', error)
      throw error.response?.data || { message: 'Failed to update store info' }
    }
  },

  // ============================================
  // UPDATE BUSINESS SETTINGS
  // ============================================
  updateBusinessSettings: async (data) => {
    try {
      const response = await apiClient.put('/admin/settings/business', data)
      return response.data
    } catch (error) {
      console.error('❌ Error updating business settings:', error)
      throw error.response?.data || { message: 'Failed to update business settings' }
    }
  },

  // ============================================
  // UPDATE PAYMENT METHODS
  // ============================================
  updatePaymentMethods: async (data) => {
    try {
      const response = await apiClient.put('/admin/settings/payment-methods', data)
      return response.data
    } catch (error) {
      console.error('❌ Error updating payment methods:', error)
      throw error.response?.data || { message: 'Failed to update payment methods' }
    }
  },

  // ============================================
  // UPDATE SOCIAL MEDIA
  // ============================================
  updateSocialMedia: async (data) => {
    try {
      const response = await apiClient.put('/admin/settings/social-media', data)
      return response.data
    } catch (error) {
      console.error('❌ Error updating social media:', error)
      throw error.response?.data || { message: 'Failed to update social media' }
    }
  },

  // ============================================
  // UPDATE CONTENT PAGES
  // ============================================
  updateContentPages: async (data) => {
    try {
      const response = await apiClient.put('/admin/settings/content-pages', data)
      return response.data
    } catch (error) {
      console.error('❌ Error updating content pages:', error)
      throw error.response?.data || { message: 'Failed to update content pages' }
    }
  },

  // ============================================
  // UPDATE SEO SETTINGS
  // ============================================
  updateSEO: async (data) => {
    try {
      const response = await apiClient.put('/admin/settings/seo', data)
      return response.data
    } catch (error) {
      console.error('❌ Error updating SEO:', error)
      throw error.response?.data || { message: 'Failed to update SEO' }
    }
  },

  // ============================================
  // UPDATE NOTIFICATION SETTINGS
  // ============================================
  updateNotificationSettings: async (data) => {
    try {
      const response = await apiClient.put('/admin/settings/notifications', data)
      return response.data
    } catch (error) {
      console.error('❌ Error updating notifications:', error)
      throw error.response?.data || { message: 'Failed to update notifications' }
    }
  },

  // ============================================
  // UPDATE MAINTENANCE MODE
  // ============================================
  updateMaintenanceMode: async (data) => {
    try {
      const response = await apiClient.put('/admin/settings/maintenance', data)
      return response.data
    } catch (error) {
      console.error('❌ Error updating maintenance mode:', error)
      throw error.response?.data || { message: 'Failed to update maintenance mode' }
    }
  },

  // ============================================
  // BULK UPDATE ALL SETTINGS
  // ============================================
  updateAllSettings: async (data) => {
    try {
      const response = await apiClient.put('/admin/settings', data)
      return response.data
    } catch (error) {
      console.error('❌ Error updating all settings:', error)
      throw error.response?.data || { message: 'Failed to update settings' }
    }
  },

  // ============================================
  // NEW: UPLOAD LOGO
  // ============================================
  uploadLogo: async (formData) => {
    try {
      const response = await apiClient.post('/admin/settings/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('❌ Error uploading logo:', error)
      throw error.response?.data || { message: 'Failed to upload logo' }
    }
  },

  // ============================================
  // NEW: DELETE LOGO
  // ============================================
  deleteLogo: async () => {
    try {
      const response = await apiClient.delete('/admin/settings/logo')
      return response.data
    } catch (error) {
      console.error('❌ Error deleting logo:', error)
      throw error.response?.data || { message: 'Failed to delete logo' }
    }
  }
}

export default settingsAPI