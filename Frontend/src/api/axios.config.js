// ============================================
// Frontend/src/api/axios.config.js
// ✅ PRODUCTION FIX: Proper FormData Handling
// ============================================
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4001/api";

console.log("🔧 API Configuration:", {
  baseURL: API_URL,
  environment: import.meta.env.MODE,
});

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
});

// ============================================
// REQUEST INTERCEPTOR - ✅ FIXED
// ============================================
api.interceptors.request.use(
  (config) => {
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
    
    // Add auth token for non-public endpoints
    if (!isPublic) {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      delete config.headers.Authorization;
    }
    
    // ✅ CRITICAL FIX: Proper FormData handling
    if (config.data instanceof FormData) {
      // ✅ DO NOT set Content-Type for FormData
      // Browser will automatically set it with correct boundary:
      // Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
      delete config.headers["Content-Type"];
      
      // Debug log
      if (import.meta.env.DEV) {
        console.log("📦 FormData detected - letting browser set Content-Type with boundary");
        // Log FormData entries (for debugging)
        if (config.data.entries) {
          const entries = Array.from(config.data.entries());
          console.log("📦 FormData entries:", entries.map(([key, value]) => ({
            key,
            value: value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value
          })));
        }
      }
    } else if (config.data) {
      // ✅ Only set JSON Content-Type for non-FormData
      config.headers["Content-Type"] = "application/json";
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log("📤 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        fullUrl: `${API_URL}${config.url}`,
        isPublic,
        hasToken: !!config.headers.Authorization,
        contentType: config.headers["Content-Type"] || "auto (FormData)",
        isFormData: config.data instanceof FormData
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

    console.error("❌ API Error:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      fullUrl: error.config?.url ? `${API_URL}${error.config.url}` : 'unknown',
    });

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          const passwordResetPaths = ['/password/forgot', '/password/reset', '/password/resend-otp', '/password/verify-otp'];
          const isPasswordReset = passwordResetPaths.some(path => originalRequest.url?.includes(path));
          
          if (isPasswordReset) break;
          
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");
            
            if (refreshToken) {
              try {
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
          console.warn("🚫 Forbidden:", data?.message);
          toast.error("Access denied. You do not have permission.");
          break;

        case 404:
          console.warn("🔍 Not Found:", data?.message);
          break;

        case 400:
          console.warn("⚠️ Bad Request:", data?.message);
          break;

        case 500:
          console.error("💥 Server Error:", data?.message);
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