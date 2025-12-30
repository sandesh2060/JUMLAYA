// ============================================
// Frontend/src/api/password.api.js
// Password Reset API Functions
// ============================================

import axios from './axios.config';

const API_URL = '/password';

// =====================================================
// Request Password Reset (Send OTP)
// =====================================================
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/forgot`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send OTP' };
  }
};

// =====================================================
// Reset Password with OTP
// ✅ FIXED: Changed to accept object parameter
// =====================================================
export const resetPassword = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/reset`, data);
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