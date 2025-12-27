// ============================================
// API Configuration
// Path: Frontend/src/config/api.js
// ============================================

// Get API URL from environment variables or use default
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

// API endpoints configuration
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    LOGOUT: '/users/logout',
    REFRESH_TOKEN: '/users/refresh-token',
    VERIFY_OTP: '/otp/verify',
    RESEND_OTP: '/otp/resend',
    FORGOT_PASSWORD: '/users/forgot-password',
    RESET_PASSWORD: '/users/reset-password',
  },
  
  // User endpoints
  USER: {
    PROFILE: '/users/profile',
    STATS: '/users/stats',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    DELETE_ACCOUNT: '/users/account',
  },
  
  // Product endpoints
  PRODUCTS: {
    LIST: '/products',
    DETAILS: (id) => `/products/${id}`,
    REVIEWS: (id) => `/products/${id}/reviews`,
  },
  
  // Cart endpoints
  CART: {
    GET: '/cart',
    ADD: '/cart',
    UPDATE: (itemId) => `/cart/${itemId}`,
    REMOVE: (itemId) => `/cart/${itemId}`,
    CLEAR: '/cart/clear',
  },
  
  // Order endpoints
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAILS: (id) => `/orders/${id}`,
    CANCEL: (id) => `/orders/${id}/cancel`,
  },
  
  // Address endpoints
  ADDRESSES: {
    LIST: '/addresses',
    CREATE: '/addresses',
    UPDATE: (id) => `/addresses/${id}`,
    DELETE: (id) => `/addresses/${id}`,
    SET_DEFAULT: (id) => `/addresses/${id}/default`,
  },
  
  // Wishlist endpoints
  WISHLIST: {
    GET: '/wishlist',
    ADD: '/wishlist',
    REMOVE: (productId) => `/wishlist/${productId}`,
  },
  
  // Notification endpoints
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
  },
};

// Export configuration object
export default {
  baseURL: API_BASE_URL,
  endpoints: API_ENDPOINTS,
  timeout: 15000,
  withCredentials: true,
};