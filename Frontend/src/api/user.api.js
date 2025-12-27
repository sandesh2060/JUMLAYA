// Frontend/src/api/user.api.js
import api from './axios.config'

export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile')
    return response.data
  },

  getStats: async () => {  // ← ADD THIS METHOD
    const response = await api.get('/users/stats')
    return response.data
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData)
    return response.data
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/users/change-password', passwordData)
    return response.data
  },

  deleteAccount: async () => {
    const response = await api.delete('/users/account')
    return response.data
  },
}

