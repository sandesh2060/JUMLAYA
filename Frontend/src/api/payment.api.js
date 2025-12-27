import api from './axios.config'

export const paymentAPI = {
  initializeEsewa: async (orderId) => {
    const response = await api.post('/payments/esewa/initialize', { orderId })
    return response.data
  },

  verifyEsewa: async (data) => {
    const response = await api.post('/payments/esewa/verify', data)
    return response.data
  },
}