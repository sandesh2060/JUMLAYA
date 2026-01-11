// ============================================
// FILE 5: Frontend/src/api/settings.api.js
// CREATE THIS NEW FILE (Optional - for consistency)
// ============================================

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

export const settingsAPI = {
  // Get public settings
  getSettings: async () => {
    const response = await axios.get(`${API_URL}/settings`);
    return response.data;
  },

  // Admin: Upload logo
  uploadLogo: async (file, token) => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await axios.post(
      `${API_URL}/admin/settings/logo`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  // Admin: Delete logo
  deleteLogo: async (token) => {
    const response = await axios.delete(
      `${API_URL}/admin/settings/logo`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Admin: Get all settings
  getAdminSettings: async (token) => {
    const response = await axios.get(
      `${API_URL}/admin/settings`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Admin: Update store info
  updateStoreInfo: async (data, token) => {
    const response = await axios.put(
      `${API_URL}/admin/settings/store-info`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
};