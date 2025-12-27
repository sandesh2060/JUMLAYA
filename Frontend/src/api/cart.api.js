// ============================================
// FIXED: cart.api.js - MATCHES YOUR BACKEND ROUTES
// Path: Frontend/src/api/cart.api.js
// ============================================
import api from './axios.config';

export const cartAPI = {
  // Get user's cart
  get: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // ✅ FIXED: Add item to cart - Changed from /cart/add to /cart
  add: async (productId, quantity = 1) => {
    const response = await api.post('/cart', { 
      productId, 
      quantity 
    });
    return response.data;
  },

  // ✅ FIXED: Update cart item - Changed from /cart/items/:itemId to /cart/:productId
  update: async (productId, quantity) => {
    const response = await api.put(`/cart/${productId}`, { 
      quantity 
    });
    return response.data;
  },

  // ✅ FIXED: Remove item - Changed from /cart/items/:itemId to /cart/:productId
  remove: async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  },

  // ✅ FIXED: Clear entire cart - Changed from /cart to /cart/clear
  clear: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },

  // Get cart count
  getCount: async () => {
    const response = await api.get('/cart/count');
    return response.data;
  },

  // ✅ FIXED: Apply coupon - Changed from /cart/coupon to /cart/coupon/apply
  applyCoupon: async (couponCode) => {
    const response = await api.post('/cart/coupon/apply', { 
      code: couponCode 
    });
    return response.data;
  },

  // ✅ FIXED: Remove coupon - Changed from /cart/coupon to /cart/coupon/remove
  removeCoupon: async () => {
    const response = await api.delete('/cart/coupon/remove');
    return response.data;
  },

  // Save for later
  saveForLater: async (productId) => {
    const response = await api.post(`/cart/save-for-later/${productId}`);
    return response.data;
  },

  // Move to cart from saved items
  moveToCart: async (productId) => {
    const response = await api.post(`/cart/move-to-cart/${productId}`);
    return response.data;
  },
};