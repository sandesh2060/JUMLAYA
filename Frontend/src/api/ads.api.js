// ============================================================================
// FILE: Frontend/src/api/ads.api.js
// API integration for landing page popup ads
// ============================================================================

import api from './axios.config';

export const adsAPI = {
  // ============================================
  // PUBLIC APIs (Customer-facing)
  // ============================================

  /**
   * Get active popup ad for landing page
   * @returns {Promise} Active ad data
   */
  getActiveAd: async () => {
    try {
      const response = await api.get('/ads/active');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch active ad:', error);
      throw error;
    }
  },

  /**
   * Track ad click when user clicks CTA
   * @param {string} adId - Ad ID
   * @returns {Promise} Click tracking response
   */
  trackClick: async (adId) => {
    try {
      const response = await api.post(`/ads/${adId}/click`);
      return response.data;
    } catch (error) {
      console.error('Failed to track click:', error);
      throw error;
    }
  },

  // ============================================
  // ADMIN APIs
  // ============================================

  /**
   * Get all ads with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} List of ads
   */
  getAllAds: async (params = {}) => {
    try {
      const response = await api.get('/ads', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      throw error;
    }
  },

  /**
   * Get single ad by ID
   * @param {string} id - Ad ID
   * @returns {Promise} Ad data
   */
  getAdById: async (id) => {
    try {
      const response = await api.get(`/ads/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch ad:', error);
      throw error;
    }
  },

  /**
   * Create new ad
   * @param {Object} adData - Ad data
   * @returns {Promise} Created ad
   */
  createAd: async (adData) => {
    try {
      const response = await api.post('/ads', adData);
      return response.data;
    } catch (error) {
      console.error('Failed to create ad:', error);
      throw error;
    }
  },

  /**
   * Update ad
   * @param {string} id - Ad ID
   * @param {Object} adData - Updated ad data
   * @returns {Promise} Updated ad
   */
  updateAd: async (id, adData) => {
    try {
      const response = await api.put(`/ads/${id}`, adData);
      return response.data;
    } catch (error) {
      console.error('Failed to update ad:', error);
      throw error;
    }
  },

  /**
   * Delete ad
   * @param {string} id - Ad ID
   * @returns {Promise} Delete confirmation
   */
  deleteAd: async (id) => {
    try {
      const response = await api.delete(`/ads/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete ad:', error);
      throw error;
    }
  },

  /**
   * Toggle ad active status
   * @param {string} id - Ad ID
   * @returns {Promise} Updated status
   */
  toggleAdStatus: async (id) => {
    try {
      const response = await api.patch(`/ads/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Failed to toggle ad status:', error);
      throw error;
    }
  },

  /**
   * Get ad analytics
   * @param {string} id - Ad ID
   * @returns {Promise} Analytics data
   */
  getAdAnalytics: async (id) => {
    try {
      const response = await api.get(`/ads/${id}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  },

  /**
   * Upload ad image
   * @param {File} file - Image file
   * @returns {Promise} Upload response with image URL
   */
  uploadAdImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('adImage', file); // ✅ FIXED: Changed from 'image' to 'adImage'
      
      const response = await api.post('/ads/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  },
};