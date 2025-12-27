import api from './axios.config'

export const couponAPI = {
  validate: async (code) => {
    const response = await api.post('/coupons/validate', { code })
    return response.data
  },

  getAvailable: async () => {
    const response = await api.get('/coupons/available')
    return response.data
  },
}