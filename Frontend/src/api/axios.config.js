// ============================================
// Frontend/src/api/axios.config.js
// ✅ FIXED: Routes without /api prefix
// (Because VITE_API_URL = http://localhost:4001/api)
// ============================================
import axios from "axios";
import toast from "react-hot-toast";

// ✅ This already includes /api from .env
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4001/api";

console.log("🔧 API Configuration:", {
  baseURL: API_URL,
  environment: import.meta.env.MODE,
});

// Create axios instance
const api = axios.create({
  baseURL: API_URL, // http://localhost:4001/api
  timeout: 15000,
  withCredentials: true,
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
api.interceptors.request.use(
  (config) => {
    // ✅ UPDATED: Remove /api/ prefix from public endpoints
    const publicEndpoints = [
      "/users/register",
      "/users/login",
      "/users/verify-otp",
      "/users/resend-otp",
      "/password/forgot",
      "/password/reset",
      "/password/resend-otp",
      "/password/verify-otp",
    ];
    
    const isPublic = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );
    
    if (!isPublic) {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      delete config.headers.Authorization;
    }
    
    // Set Content-Type based on data type
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log("📤 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        fullUrl: `${API_URL}${config.url}`, // Show full URL for debugging
        isPublic,
        hasToken: !!config.headers.Authorization,
      });
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log("📥 API Response:", {
        status: response.status,
        url: response.config.url,
        success: response.data?.success,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors
    console.error("❌ API Error:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      fullUrl: error.config?.url ? `${API_URL}${error.config.url}` : 'unknown',
    });

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // ✅ UPDATED: Remove /api/ prefix
          const passwordResetPaths = ['/password/forgot', '/password/reset', '/password/resend-otp', '/password/verify-otp'];
          const isPasswordReset = passwordResetPaths.some(path => originalRequest.url?.includes(path));
          
          if (isPasswordReset) {
            break;
          }
          
          if (!originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
              try {
                // ✅ UPDATED: Remove /api/ prefix
                const response = await axios.post(
                  `${API_URL}/users/refresh-token`,
                  { refreshToken }
                );

                const { authToken } = response.data.data;
                localStorage.setItem("authToken", authToken);

                originalRequest.headers.Authorization = `Bearer ${authToken}`;
                return api(originalRequest);
              } catch (refreshError) {
                console.warn("🔒 Token refresh failed - Logging out");
                localStorage.removeItem("authToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");

                toast.error("Session expired. Please login again.");

                if (!window.location.pathname.includes("/login")) {
                  window.location.href = "/login";
                }
              }
            } else {
              localStorage.removeItem("authToken");
              localStorage.removeItem("user");

              const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
              const isPublicPage = publicPaths.some((path) =>
                window.location.pathname.includes(path)
              );

              if (!isPublicPage) {
                toast.error("Please login to continue");
                window.location.href = "/login";
              }
            }
          }
          break;

        case 403:
          console.warn("🚫 Forbidden:", data?.message || "Insufficient permissions");
          toast.error("Access denied. You do not have permission.");
          break;

        case 404:
          console.warn("🔍 Not Found:", data?.message || "Resource not found");
          break;

        case 400:
          console.warn("⚠️ Bad Request:", data?.message || "Invalid request");
          break;

        case 500:
          console.error("💥 Server Error:", data?.message || "Internal server error");
          toast.error("Server error. Please try again later.");
          break;

        default:
          console.error("❌ Unexpected error:", status, data?.message);
      }
    } else if (error.request) {
      console.error("📡 Network Error: No response from server");
      console.error("Check if backend is running at:", API_URL);
      toast.error("Network error. Please check your connection.");
    } else {
      console.error("⚙️ Request Setup Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;