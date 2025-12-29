// ============================================
// cart.api.js - FIXED
// Path: Frontend/src/api/cart.api.js
// ============================================
import apiClient from './axios.config';

export const cartAPI = {
  // Get user's cart
  get: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  // Add item to cart
  // Backend expects: { productId, quantity }
  add: async (productId, quantity = 1) => {
    const response = await apiClient.post('/cart', {
      productId,
      quantity
    });
    return response.data;
  },

  // ✅ FIXED: Update cart item
  // Backend expects: { productId, quantity } in request body
  update: async (productId, quantity) => {
    console.log('📤 cart.api.update called with:', { productId, quantity });
    
    const response = await apiClient.put('/cart', {
      productId,  // ✅ Send productId (not itemId)
      quantity
    });
    return response.data;
  },

  // ✅ FIXED: Remove item from cart
  // Backend expects: productId in URL params
  remove: async (productId) => {
    console.log('📤 cart.api.remove called with productId:', productId);
    
    const response = await apiClient.delete(`/cart/${productId}`);
    return response.data;
  },

  // Clear entire cart
  clear: async () => {
    const response = await apiClient.delete('/cart');
    return response.data;
  },

  // Apply coupon
  applyCoupon: async (couponCode) => {
    const response = await apiClient.post('/cart/coupon', {
      couponCode
    });
    return response.data;
  },

  // Remove coupon
  removeCoupon: async () => {
    const response = await apiClient.delete('/cart/coupon');
    return response.data;
  },

  // Save item for later
  saveForLater: async (productId) => {
    const response = await apiClient.post(`/cart/save-for-later/${productId}`);
    return response.data;
  },

  // Move item back to cart
  moveToCart: async (productId) => {
    const response = await apiClient.post(`/cart/move-to-cart/${productId}`);
    return response.data;
  }
};

export default cartAPI;