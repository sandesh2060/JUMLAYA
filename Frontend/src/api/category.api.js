import api from './axios.config'

export const categoryAPI = {
  getAll: async () => {
    const response = await api.get('/categories')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  getTree: async () => {
    const response = await api.get('/categories/tree')
    return response.data
  },

  getProducts: async (categoryId, params = {}) => {
    const response = await api.get(`/categories/${categoryId}/products`, { params })
    return response.data
  },
}