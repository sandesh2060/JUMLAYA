// ============================================
// Frontend/src/api/password.api.js
// 🚫 OTP DISABLED TEMPORARILY
// RE-ENABLE OTP: restore otp field in resetPassword
// ============================================

import axios from './axios.config';

const API_URL = '/password';

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/forgot`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to process request' };
  }
};

// 🚫 OTP DISABLED: sends email + newPassword only
// RE-ENABLE OTP: add otp back to the data object: { email, otp, newPassword }
export const resetPassword = async ({ email, newPassword }) => {
  try {
    const response = await axios.post(`${API_URL}/reset`, { email, newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reset password' };
  }
};

// 🚫 OTP DISABLED: kept for future use
export const resendOTP = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/resend-otp`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to resend OTP' };
  }
};

// 🚫 OTP DISABLED: kept for future use
export const verifyOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Invalid OTP' };
  }
};