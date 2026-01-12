// ============================================
// INDEX 2A: Frontend/src/api/rider.api.js
// ✅ ENHANCED - Complete with Better Error Handling
// ============================================
import api from "./axios.config";

export const riderAPI = {
  // ============================================
  // DASHBOARD & PROFILE
  // ============================================
  getDashboard: async () => {
    try {
      const response = await api.get("/riders/dashboard");
      console.log("📊 Dashboard response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Dashboard error:", error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get("/riders/profile");
      return response.data;
    } catch (error) {
      console.error("❌ Profile error:", error);
      throw error;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await api.patch("/riders/profile", data);
      return response.data;
    } catch (error) {
      console.error("❌ Update profile error:", error);
      throw error;
    }
  },

  // ============================================
  // LOCATION & STATUS
  // ============================================
  updateLocation: async (latitude, longitude, address) => {
    try {
      const response = await api.patch("/riders/location", {
        lat: latitude,
        lng: longitude,
        address,
      });
      return response.data;
    } catch (error) {
      // Don't log to avoid console spam
      throw error;
    }
  },

  updateStatus: async (status) => {
    try {
      const response = await api.patch("/riders/status", { status });
      return response.data;
    } catch (error) {
      console.error("❌ Status update error:", error);
      throw error;
    }
  },

  // ============================================
  // FILE UPLOADS - ✅ ENHANCED WITH VALIDATION
  // ============================================
  uploadAvatar: async (file) => {
    try {
      if (!file) throw new Error("No file provided");
      if (file.size > 5 * 1024 * 1024) throw new Error("Image must be less than 5MB");
      if (!file.type.startsWith("image/")) throw new Error("Only image files allowed");

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.post("/riders/avatar/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("✅ Avatar uploaded:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Avatar upload error:", error);
      throw error;
    }
  },

  uploadDocument: async (file, documentType) => {
    try {
      if (!file) throw new Error("No file provided");
      if (file.size > 5 * 1024 * 1024) throw new Error("File must be less than 5MB");

      const validTypes = ['license', 'vehicleRegistration', 'insurance', 'identityProof'];
      if (!validTypes.includes(documentType)) throw new Error("Invalid document type");

      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", documentType);

      const response = await api.post("/riders/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log(`✅ ${documentType} uploaded:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ ${documentType} upload error:`, error);
      throw error;
    }
  },

  /**
   * ✅ FIXED: Unwrap nested data structure
   * Backend returns: { success: true, data: { license: {...}, ... } }
   */
  getDocuments: async () => {
    try {
      const response = await api.get("/riders/documents");
      console.log("🔍 Documents API response:", response.data);

      // ✅ Unwrap nested structure
      const documents = response.data?.data || response.data || {};
      
      return {
        success: response.data?.success ?? true,
        data: documents
      };
    } catch (error) {
      console.error("❌ Get documents error:", error);
      throw error;
    }
  },

  deleteDocument: async (documentType) => {
    try {
      const response = await api.delete(`/riders/documents/${documentType}`);
      console.log(`✅ ${documentType} deleted`);
      return response.data;
    } catch (error) {
      console.error(`❌ Delete ${documentType} error:`, error);
      throw error;
    }
  },

  // ============================================
  // ORDERS - ✅ ENHANCED
  // ============================================
  orders: {
    getAll: async (params = {}) => {
      try {
        const response = await api.get("/riders/orders", { params });
        return response.data;
      } catch (error) {
        console.error("❌ Get all orders error:", error);
        throw error;
      }
    },

    getActive: async () => {
      try {
        const response = await api.get("/riders/orders/active");
        return response.data;
      } catch (error) {
        console.error("❌ Get active orders error:", error);
        throw error;
      }
    },

    getPending: async () => {
      try {
        const response = await api.get("/riders/orders/pending");
        return response.data;
      } catch (error) {
        console.error("❌ Get pending orders error:", error);
        throw error;
      }
    },

    getHistory: async (page = 1) => {
      try {
        const response = await api.get("/riders/orders/history", {
          params: { page, limit: 20 },
        });
        return response.data;
      } catch (error) {
        console.error("❌ Get order history error:", error);
        throw error;
      }
    },

    getDetails: async (orderId) => {
      try {
        const response = await api.get(`/riders/orders/${orderId}`);
        console.log(`📦 Order ${orderId} details:`, response.data);
        return response.data;
      } catch (error) {
        console.error(`❌ Get order ${orderId} error:`, error);
        throw error;
      }
    },

    accept: async (orderId) => {
      try {
        const response = await api.post(`/riders/orders/${orderId}/accept`);
        console.log(`✅ Order ${orderId} accepted`);
        return response.data;
      } catch (error) {
        console.error(`❌ Accept order ${orderId} error:`, error);
        throw error;
      }
    },

    pickup: async (orderId) => {
      try {
        const response = await api.post(`/riders/orders/${orderId}/pickup`);
        console.log(`✅ Order ${orderId} picked up`);
        return response.data;
      } catch (error) {
        console.error(`❌ Pickup order ${orderId} error:`, error);
        throw error;
      }
    },

    complete: async (orderId, data = {}) => {
      try {
        const response = await api.post(`/riders/orders/${orderId}/deliver`, data);
        console.log(`✅ Order ${orderId} delivered`);
        return response.data;
      } catch (error) {
        console.error(`❌ Complete order ${orderId} error:`, error);
        throw error;
      }
    },

    updateStatus: async (orderId, status, note) => {
      try {
        const response = await api.patch(`/riders/orders/${orderId}/status`, {
          status,
          note,
        });
        console.log(`✅ Order ${orderId} status updated to ${status}`);
        return response.data;
      } catch (error) {
        console.error(`❌ Update status ${orderId} error:`, error);
        throw error;
      }
    },
  },

  // ============================================
  // EARNINGS
  // ============================================
  getEarnings: async (period = "all") => {
    try {
      const response = await api.get("/riders/earnings", { params: { period } });
      return response.data;
    } catch (error) {
      console.error("❌ Get earnings error:", error);
      throw error;
    }
  },

  getEarningsHistory: async (page = 1) => {
    try {
      const response = await api.get("/riders/earnings/history", {
        params: { page, limit: 50 },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Get earnings history error:", error);
      throw error;
    }
  },

  // ============================================
  // REGISTRATION (PUBLIC)
  // ============================================
  register: async (data) => {
    try {
      const response = await api.post("/riders/register", data);
      console.log("✅ Rider registered:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Registration error:", error);
      throw error;
    }
  },
};

export default riderAPI;

