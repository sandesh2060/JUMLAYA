import api from "./axios.config";

export const productAPI = {
  // Get all products with filters
  getAll: async (params = {}) => {
    const response = await api.get("/products", { params });
    // Backend returns { success, message, data: [...] }
    return {
      products: response.data.data || [],
      ...response.data
    };
  },

  // Get product by ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return {
      product: response.data.data,
      ...response.data
    };
  },

  // Get product by slug
  getBySlug: async (slug) => {
    const response = await api.get(`/products/slug/${slug}`);
    return {
      product: response.data.data,
      ...response.data
    };
  },

  // Search products
  search: async (query) => {
    const response = await api.get("/products/search", {
      params: { q: query },
    });
    return {
      products: response.data.data || [],
      ...response.data
    };
  },

  // Get featured products
  getFeatured: async () => {
    const response = await api.get("/products/featured");
    return {
      products: response.data.data || [],
      ...response.data
    };
  },

  // Get products on sale
  getOnSale: async () => {
    const response = await api.get("/products/on-sale");
    return {
      products: response.data.data || [],
      ...response.data
    };
  },

  // Get bestsellers
  getBestsellers: async (limit = 10) => {
    const response = await api.get("/products/bestsellers", {
      params: { limit },
    });
    return {
      products: response.data.data || [],
      ...response.data
    };
  },

  // Get organic products
  getOrganic: async () => {
    const response = await api.get("/products/organic");
    return {
      products: response.data.data || [],
      ...response.data
    };
  },

  // Get seasonal products
  getSeasonal: async () => {
    const response = await api.get("/products/seasonal");
    return {
      products: response.data.data || [],
      ...response.data
    };
  },

  // Get products by category
  getByCategory: async (categoryId) => {
    const response = await api.get(`/products/category/${categoryId}`);
    return {
      products: response.data.data || [],
      ...response.data
    };
  },

  // Get products by type
  getByType: async (type) => {
    const response = await api.get(`/products/type/${type}`);
    return {
      products: response.data.data || [],
      ...response.data
    };
  },

  // Increment product view
  incrementView: async (id) => {
    const response = await api.post(`/products/${id}/view`);
    return response.data;
  },
};