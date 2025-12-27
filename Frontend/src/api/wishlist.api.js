import api from './axios.config'

export const wishlistAPI = {
  get: async () => {
    const response = await api.get('/wishlist')
    return response.data
  },

  add: async (productId) => {
    const response = await api.post('/wishlist', { productId }) // Changed from /wishlist/add
    return response.data
  },

  remove: async (productId) => {
    const response = await api.delete(`/wishlist/${productId}`)
    return response.data
  },

  check: async (productId) => {
    const response = await api.get(`/wishlist/check/${productId}`)
    return response.data
  },

  clear: async () => {
    const response = await api.delete('/wishlist') // Changed from /wishlist/clear
    return response.data
  },
  
  getCount: async () => {
    const response = await api.get('/wishlist/count')
    return response.data
  },

  moveToCart: async (productId) => {
    const response = await api.post(`/wishlist/move/${productId}`)
    return response.data
  },
}