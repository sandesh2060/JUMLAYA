// Frontend/src/api/rider.location.api.js

import axios from './axios.config';

const BASE_URL = '/api/rider/location';

export const riderLocationApi = {
  /**
   * Update rider's current location
   */
  updateLocation: async (locationData) => {
    const response = await axios.post(`${BASE_URL}/update`, locationData);
    return response.data;
  },

  /**
   * Get optimal route to destination
   */
  getRoute: async (orderId) => {
    const response = await axios.get(`${BASE_URL}/route/${orderId}`);
    return response.data;
  },

  /**
   * Mark arrival at location
   */
  markArrival: async (arrivalData) => {
    const response = await axios.post(`${BASE_URL}/arrival`, arrivalData);
    return response.data;
  },

  /**
   * Toggle online/offline status
   */
  toggleStatus: async (isOnline) => {
    const response = await axios.patch(`${BASE_URL}/status`, { isOnline });
    return response.data;
  },

  /**
   * Get location history for order
   */
  getLocationHistory: async (orderId) => {
    const response = await axios.get(`${BASE_URL}/history/${orderId}`);
    return response.data;
  }
};

// Export for backward compatibility
export default riderLocationApi;