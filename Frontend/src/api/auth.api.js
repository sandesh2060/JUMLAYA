// ============================================
// FILE 3: Frontend/src/api/auth.api.js
// ============================================
import api from './axios.config'

export const authAPI = {
  login: async (credentials) => {
    try {
      console.log('🔐 authAPI.login: Sending request...')
      const response = await api.post('/users/login', credentials)
      
      console.log('📥 authAPI.login: Response received:', {
        status: response.status,
        success: response.data?.success,
        hasToken: !!response.data?.data?.authToken,
        hasUser: !!response.data?.data?.user,
      })

      // ✅ Save tokens immediately
      if (response.data?.success && response.data?.data) {
        const { authToken, refreshToken, user } = response.data.data

        if (authToken) {
          localStorage.setItem('authToken', authToken)
          console.log('✅ authToken saved')
        }
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
          console.log('✅ refreshToken saved')
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user))
          console.log('✅ User saved:', {
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin
          })
        }
      }

      return response.data
    } catch (error) {
      console.error('❌ authAPI.login error:', error.response?.data || error.message)
      throw error
    }
  },

  register: async (userData) => {
    const response = await api.post('/users/register', userData)
    return response.data
  },

  verifyOTP: async (email, otp) => {
    const response = await api.post('/users/verify-otp', { email, otp })
    
    if (response.data?.success && response.data?.data) {
      const { authToken, refreshToken, user } = response.data.data
      if (authToken) localStorage.setItem('authToken', authToken)
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      if (user) localStorage.setItem('user', JSON.stringify(user))
    }
    
    return response.data
  },

  resendOTP: async (email) => {
    const response = await api.post('/users/resend-otp', { email })
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me')
    if (response.data?.success && response.data?.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data))
    }
    return response.data
  },

  logout: async () => {
    try {
      await api.post('/users/logout')
    } catch (error) {
      console.warn('⚠️ Logout API warning:', error.message)
    } finally {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      console.log('✅ All tokens cleared')
    }
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/users/refresh-token', { refreshToken })
    if (response.data?.success && response.data?.data?.authToken) {
      localStorage.setItem('authToken', response.data.data.authToken)
    }
    return response.data
  },

  forgotPassword: async (email) => {
    const response = await api.post('/users/forgot-password', { email })
    return response.data
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/users/reset-password', { token, newPassword })
    return response.data
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/users/change-password', { currentPassword, newPassword })
    return response.data
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData)
    if (response.data?.success && response.data?.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data))
    }
    return response.data
  },
}

export default authAPI
