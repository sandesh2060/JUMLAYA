
// ============================================
// 2. Frontend/src/api/address.api.js - FIXED
// ============================================
import api from './axios.config';

export const addressAPI = {
  /**
   * Get all user addresses
   * Backend: GET /api/addresses
   */
  getAll: async () => {
    try {
      console.log('📡 Fetching addresses...');
      const response = await api.get('/addresses');
      console.log('✅ Addresses response:', response.data);
      
      // Backend returns: { success: true, message: "...", data: { count, addresses } }
      const addresses = response.data?.data?.addresses || [];
      
      return {
        data: {
          addresses: addresses
        }
      };
    } catch (error) {
      console.error('❌ Get addresses error:', error.response?.data);
      throw error;
    }
  },

  /**
   * Create new address
   * Backend: POST /api/addresses
   */
  create: async (addressData) => {
    try {
      console.log('📡 Creating address:', addressData);
      
      // Transform frontend format to backend format
      const backendFormat = {
        addressType: addressData.label || 'home',
        label: addressData.label || 'home',
        fullName: addressData.fullName || 'User', // You might want to get this from user context
        phone: addressData.phone,
        addressLine1: addressData.addressLine1,
        addressLine2: addressData.addressLine2 || '',
        city: addressData.city,
        state: addressData.state || 'Bagmati',
        postalCode: addressData.postalCode,
        country: addressData.country || 'Nepal',
        isDefault: addressData.isDefault || false
      };
      
      console.log('📤 Backend format:', backendFormat);
      
      const response = await api.post('/addresses', backendFormat);
      console.log('✅ Create response:', response.data);
      
      // Backend returns the created address in data field
      return {
        data: response.data.data,
        address: response.data.data
      };
    } catch (error) {
      console.error('❌ Create address error:', error.response?.data);
      throw error;
    }
  },

  /**
   * Update address
   * Backend: PUT /api/addresses/:id
   */
  update: async (id, addressData) => {
    try {
      console.log('📡 Updating address:', id, addressData);
      
      const backendFormat = {
        addressType: addressData.label || 'home',
        label: addressData.label,
        phone: addressData.phone,
        addressLine1: addressData.addressLine1,
        addressLine2: addressData.addressLine2 || '',
        city: addressData.city,
        state: addressData.state || 'Bagmati',
        postalCode: addressData.postalCode,
        country: addressData.country || 'Nepal',
        isDefault: addressData.isDefault
      };
      
      const response = await api.put(`/addresses/${id}`, backendFormat);
      console.log('✅ Update response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Update address error:', error.response?.data);
      throw error;
    }
  },
// ============================================
// FIXED: Delete address with better error handling
// ============================================
delete: async (id) => {
  try {
    console.log('📡 Deleting address:', id);
    
    const response = await api.delete(`/addresses/${id}`);
    console.log('✅ Delete response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Delete address error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      addressId: id
    });
    
    // If address not found, treat as successful deletion
    // (it's already gone from the database)
    if (error.response?.status === 404) {
      console.log('⚠️ Address already deleted or not found, treating as success');
      return { 
        success: true, 
        message: 'Address removed'
      };
    }
    
    throw error;
  }
},
  /**
   * Set default address
   * Backend: PATCH /api/addresses/:id/default
   */
  setDefault: async (id) => {
    try {
      console.log('📡 Setting default address:', id);
      const response = await api.patch(`/addresses/${id}/default`);
      console.log('✅ Set default response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Set default error:', error.response?.data);
      throw error;
    }
  },
};

export default addressAPI;