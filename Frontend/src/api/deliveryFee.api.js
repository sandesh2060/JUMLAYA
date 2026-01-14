// ============================================
// Frontend/src/api/deliveryFee.api.js
// Delivery fee estimation API calls
// ============================================

import api from './axios.config';

export const deliveryFeeAPI = {
  /**
   * Estimate delivery fee for a location
   * @param {number} latitude - Delivery latitude
   * @param {number} longitude - Delivery longitude
   * @param {number} orderTotal - Optional order total to check free delivery
   * @returns {Promise} Fee estimation
   */
  estimateFee: async (latitude, longitude, orderTotal = 0) => {
    try {
      console.log('📤 Estimating delivery fee for:', { latitude, longitude, orderTotal });
      const response = await api.post('/delivery/estimate-fee', {
        latitude,
        longitude,
        orderTotal
      });
      console.log('✅ Delivery fee estimated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Estimate fee error:', error);
      throw error;
    }
  },

  /**
   * Get pricing tiers
   * @returns {Promise} Pricing tiers
   */
  getPricingTiers: async () => {
    try {
      console.log('📤 Fetching pricing tiers');
      const response = await api.get('/delivery/pricing-tiers');
      console.log('✅ Pricing tiers fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Fetch pricing tiers error:', error);
      throw error;
    }
  },

  /**
   * Get nearby riders
   * @param {number} latitude - Location latitude
   * @param {number} longitude - Location longitude
   * @param {number} radius - Search radius in km (default: 10)
   * @returns {Promise} Nearby riders
   */
  getNearbyRiders: async (latitude, longitude, radius = 10) => {
    try {
      console.log('📤 Finding nearby riders:', { latitude, longitude, radius });
      const response = await api.post('/delivery/nearby-riders', {
        latitude,
        longitude,
        radius
      });
      console.log('✅ Nearby riders found:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Find riders error:', error);
      throw error;
    }
  },

  /**
   * Calculate fee for specific rider
   * @param {number} latitude - Delivery latitude
   * @param {number} longitude - Delivery longitude
   * @param {string} riderId - Specific rider ID
   * @param {number} orderTotal - Optional order total to check free delivery
   * @returns {Promise} Fee calculation
   */
  calculateFeeForRider: async (latitude, longitude, riderId, orderTotal = 0) => {
    try {
      console.log('📤 Calculating fee for rider:', riderId);
      const response = await api.post('/delivery/calculate-fee', {
        latitude,
        longitude,
        riderId,
        orderTotal
      });
      console.log('✅ Fee calculated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Calculate fee error:', error);
      throw error;
    }
  }
};

export default deliveryFeeAPI;