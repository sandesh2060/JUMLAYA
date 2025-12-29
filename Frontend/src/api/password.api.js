// ============================================
// Frontend/src/api/password.api.js
// Password Reset API Functions
// ============================================

import axios from './axios.config';

// ✅ FIXED: Removed /api prefix since axios baseURL doesn't include it
const API_URL = '/password';

// =====================================================
// Request Password Reset (Send OTP)
// =====================================================
export const forgotPassword = async (email) => {
  try {
    // This now becomes: http://localhost:4001/password/forgot
    const response = await axios.post(`${API_URL}/forgot`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send OTP' };
  }
};

// =====================================================
// Reset Password with OTP
// =====================================================
export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/reset`, {
      email,
      otp,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reset password' };
  }
};

// =====================================================
// Resend OTP
// =====================================================
export const resendOTP = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/resend-otp`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to resend OTP' };
  }
};

// =====================================================
// Verify OTP (Optional - for UI validation)
// =====================================================
export const verifyOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Invalid OTP' };
  }
};