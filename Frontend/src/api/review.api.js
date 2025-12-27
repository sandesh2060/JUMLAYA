// api/review.api.js
import api from "./axios.config";

export const reviewAPI = {
  // Get reviews for a specific product
  getByProduct: async (productId, params = {}) => {
    const response = await api.get(`/products/${productId}/reviews`, {
      params,
    });
    return response.data;
  },

  // Get rating statistics for a product
  getRatingStats: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews/stats`);
    return response.data;
  },

  // Create a new review
  create: async (productId, reviewData) => {
    const response = await api.post(
      `/products/${productId}/reviews`,
      reviewData
    );
    return response.data;
  },

  // Update an existing review (Changed from PATCH to PUT)
  update: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  delete: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Vote on a review (helpful/not-helpful)
  markHelpful: async (reviewId, voteType) => {
    const response = await api.post(`/reviews/${reviewId}/helpful`, {
      voteType,
    });
    return response.data;
  },

  // Get a single review by ID
  getById: async (reviewId) => {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
  },
};
