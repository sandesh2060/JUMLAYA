// Frontend/src/api/publicSetting.api.js

import axios from './axios.config';

/**
 * Public Settings API
 * Handles public configuration and settings that don't require authentication
 */

// Base URL for public settings
// ✅ FIXED: Remove /api prefix since axios.config already has it
const BASE_URL = '/public/settings';

/**
 * Get all public settings
 * @returns {Promise} - Public settings data
 */
export const getPublicSettings = async () => {
  try {
    const response = await axios.get(`${BASE_URL}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public settings:', error);
    throw error;
  }
};

/**
 * Get specific setting by key
 * @param {string} key - Setting key (e.g., 'delivery', 'payment', 'general')
 * @returns {Promise} - Setting data
 */
export const getSettingByKey = async (key) => {
  try {
    const response = await axios.get(`${BASE_URL}/${key}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    throw error;
  }
};

/**
 * Get delivery settings
 * @returns {Promise} - Delivery configuration
 */
export const getDeliverySettings = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/delivery`);
    return response.data;
  } catch (error) {
    console.error('Error fetching delivery settings:', error);
    throw error;
  }
};

/**
 * Get payment settings
 * @returns {Promise} - Available payment methods and configuration
 */
export const getPaymentSettings = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/payment`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    throw error;
  }
};

/**
 * Get general app settings
 * @returns {Promise} - General app configuration
 */
export const getGeneralSettings = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/general`);
    return response.data;
  } catch (error) {
    console.error('Error fetching general settings:', error);
    throw error;
  }
};

/**
 * Get store operating hours
 * @returns {Promise} - Store hours and status
 */
export const getStoreHours = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/store-hours`);
    return response.data;
  } catch (error) {
    console.error('Error fetching store hours:', error);
    throw error;
  }
};

/**
 * Get available delivery areas/zones
 * @returns {Promise} - Delivery zones data
 */
export const getDeliveryAreas = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/delivery-areas`);
    return response.data;
  } catch (error) {
    console.error('Error fetching delivery areas:', error);
    throw error;
  }
};

/**
 * Check if delivery is available for a location
 * @param {Object} location - { latitude, longitude } or { address, city }
 * @returns {Promise} - Availability status and details
 */
export const checkDeliveryAvailability = async (location) => {
  try {
    const response = await axios.post(`${BASE_URL}/delivery/check`, location);
    return response.data;
  } catch (error) {
    console.error('Error checking delivery availability:', error);
    throw error;
  }
};

/**
 * Get app maintenance status
 * @returns {Promise} - Maintenance mode status
 */
export const getMaintenanceStatus = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/maintenance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching maintenance status:', error);
    throw error;
  }
};

/**
 * Get app feature flags
 * @returns {Promise} - Enabled/disabled features
 */
export const getFeatureFlags = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/features`);
    return response.data;
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    throw error;
  }
};

/**
 * Get contact information
 * @returns {Promise} - Contact details
 */
export const getContactInfo = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/contact`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contact info:', error);
    throw error;
  }
};

/**
 * Get social media links
 * @returns {Promise} - Social media URLs
 */
export const getSocialLinks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/social`);
    return response.data;
  } catch (error) {
    console.error('Error fetching social links:', error);
    throw error;
  }
};

/**
 * Get minimum order value
 * @returns {Promise} - Minimum order configuration
 */
export const getMinimumOrder = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/minimum-order`);
    return response.data;
  } catch (error) {
    console.error('Error fetching minimum order:', error);
    throw error;
  }
};

/**
 * Get tax configuration
 * @returns {Promise} - Tax rates and settings
 */
export const getTaxSettings = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/tax`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tax settings:', error);
    throw error;
  }
};

/**
 * Get app version and update info
 * @returns {Promise} - Version information
 */
export const getAppVersion = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/version`);
    return response.data;
  } catch (error) {
    console.error('Error fetching app version:', error);
    throw error;
  }
};

/**
 * Get terms and conditions
 * @returns {Promise} - Terms content
 */
export const getTermsAndConditions = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/terms`);
    return response.data;
  } catch (error) {
    console.error('Error fetching terms:', error);
    throw error;
  }
};

/**
 * Get privacy policy
 * @returns {Promise} - Privacy policy content
 */
export const getPrivacyPolicy = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/privacy`);
    return response.data;
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    throw error;
  }
};

/**
 * Get About Us content
 * @returns {Promise} - About us data including store name, description, and social media
 */
export const getAboutUs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/about`);
    return response.data;
  } catch (error) {
    console.error('Error fetching about us:', error);
    throw error;
  }
};

/**
 * Get FAQs
 * @returns {Promise} - Frequently asked questions
 */
export const getFAQs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/faqs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    throw error;
  }
};

/**
 * Get shipping policy
 * @returns {Promise} - Shipping policy content
 */
export const getShippingPolicy = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/shipping-policy`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shipping policy:', error);
    throw error;
  }
};

/**
 * Get return policy
 * @returns {Promise} - Return/refund policy content
 */
export const getReturnPolicy = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/return-policy`);
    return response.data;
  } catch (error) {
    console.error('Error fetching return policy:', error);
    throw error;
  }
};
export const getSettings = async () => {
  const response = await axios.get(`${BASE_URL}/settings`);
  return response.data
}
/**
 * Submit contact form
 * @param {Object} formData - Contact form data
 * @returns {Promise} - Submission result
 */
export const submitContactForm = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/contact`, formData);
    return response.data;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
};

export default {
  getPublicSettings,
  getSettingByKey,
  getDeliverySettings,
  getPaymentSettings,
  getGeneralSettings,
  getStoreHours,
  getDeliveryAreas,
  checkDeliveryAvailability,
  getMaintenanceStatus,
  getFeatureFlags,
  getContactInfo,
  getSocialLinks,
  getMinimumOrder,
  getTaxSettings,
  getAppVersion,
  getTermsAndConditions,
  getPrivacyPolicy,
  getAboutUs,
  getFAQs,
  getShippingPolicy,
  getReturnPolicy,
  submitContactForm,
};