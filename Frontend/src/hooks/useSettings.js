// ============================================
// Frontend/src/hooks/useSettings.js
// Complete Settings Hook for JUMLAYA - FIXED VERSION
// ============================================

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import apiClient from "@/api/axios.config";

/**
 * Custom hook to manage all application settings
 * Fetches and caches public settings from the backend
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Auto-fetch settings on mount (default: true)
 * @param {boolean} options.cache - Cache settings in localStorage (default: true)
 * @param {number} options.cacheExpiry - Cache expiry time in minutes (default: 30)
 * @returns {Object} Settings state and methods
 */
export const useSettings = (options = {}) => {
  const {
    autoFetch = true,
    cache = true,
    cacheExpiry = 30, // minutes
  } = options;

  // State management
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  // ✅ FIX: Use ref to track if we've already fetched
  const hasFetchedRef = useRef(false);

  // Cache keys
  const CACHE_KEY = "jumlaya_settings";
  const CACHE_TIMESTAMP_KEY = "jumlaya_settings_timestamp";

  // ✅ FIX: Move defaultSettings outside to prevent recreation
  const defaultSettings = useMemo(() => ({
    storeName: "JUMLAYA",
    storeEmail: "support@jumlaya.com",
    storePhone: "+977 9800000000",
    storeAddress: "Kathmandu, Nepal",
    currency: "रु",
    currencyCode: "NPR",
    taxRate: 13,
    shippingFee: 100,
    freeShippingThreshold: 2000,
    minOrderAmount: 100,
    maxOrderAmount: 100000,
    paymentMethods: {
      cod: { enabled: true },
      esewa: { enabled: true },
      khalti: { enabled: true },
    },
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
      tiktok: "",
    },
  }), []);

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback(() => {
    if (!cache) return false;

    try {
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (!cachedTimestamp) return false;

      const cacheAge = (Date.now() - parseInt(cachedTimestamp)) / (1000 * 60); // minutes
      return cacheAge < cacheExpiry;
    } catch (error) {
      console.error("❌ Cache validation error:", error);
      return false;
    }
  }, [cache, cacheExpiry]);

  /**
   * Get cached settings
   */
  const getCachedSettings = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("❌ Error reading cached settings:", error);
      return null;
    }
  }, []);

  /**
   * Save settings to cache
   */
  const cacheSettings = useCallback(
    (data) => {
      if (!cache) return;

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      } catch (error) {
        console.error("❌ Error caching settings:", error);
      }
    },
    [cache]
  );

  /**
   * Clear settings cache
   */
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      console.log("✅ Settings cache cleared");
    } catch (error) {
      console.error("❌ Error clearing cache:", error);
    }
  }, []);

  /**
   * Fetch all public settings - FIXED ENDPOINT
   */
  const fetchAllSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Fetching all public settings from /api/public/settings");

      const response = await apiClient.get("/public/settings");

      console.log("📦 Settings API Response:", response.data);

      // Handle multiple possible response formats
      let settingsData = null;

      if (response.data?.data) {
        settingsData = response.data.data;
      } else if (response.data?.settings) {
        settingsData = response.data.settings;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        response.data.storeName
      ) {
        settingsData = response.data;
      }

      if (settingsData) {
        setSettings(settingsData);
        cacheSettings(settingsData);
        setLastFetched(new Date());
        console.log("✅ Settings fetched successfully");
        return settingsData;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("❌ Error fetching settings:", err);
      setError(err.message || "Failed to fetch settings");

      // Try to use cached data as fallback
      const cached = getCachedSettings();
      if (cached) {
        setSettings(cached);
        return cached;
      }

      // Use default settings as last resort
      setSettings(defaultSettings);
      return defaultSettings;
    } finally {
      setLoading(false);
    }
  }, [cacheSettings, getCachedSettings, defaultSettings]);

  /**
   * Refresh settings (bypass cache)
   */
  const refreshSettings = useCallback(async () => {
    console.log("🔄 Refreshing settings...");
    clearCache();
    hasFetchedRef.current = false; // ✅ Reset fetch flag
    return await fetchAllSettings();
  }, [clearCache, fetchAllSettings]);

  /**
   * Get setting value by path (e.g., 'paymentMethods.cod.enabled')
   */
  const getSetting = useCallback(
    (path, defaultValue = null) => {
      if (!settings) return defaultValue;

      try {
        const keys = path.split(".");
        let value = settings;

        for (const key of keys) {
          if (value && typeof value === "object" && key in value) {
            value = value[key];
          } else {
            return defaultValue;
          }
        }

        return value !== undefined ? value : defaultValue;
      } catch (error) {
        console.error("❌ Error getting setting:", error);
        return defaultValue;
      }
    },
    [settings]
  );

  // ✅ FIX: Initialize settings - only run once
  useEffect(() => {
    // Skip if already fetched
    if (hasFetchedRef.current) {
      return;
    }

    const initSettings = async () => {
      // Check cache first
      if (isCacheValid()) {
        const cached = getCachedSettings();
        if (cached) {
          setSettings(cached);
          setLoading(false);
          hasFetchedRef.current = true;
          return;
        }
      }

      // Fetch fresh data
      if (autoFetch) {
        await fetchAllSettings();
        hasFetchedRef.current = true;
      } else {
        setLoading(false);
      }
    };

    initSettings();
  }, []); // ✅ Empty dependency array - only run once on mount

  // Computed values
  const computed = useMemo(() => {
    const activeSettings = settings || defaultSettings;

    return {
      // Store info
      storeName: activeSettings.storeName || "JUMLAYA",
      storeEmail: activeSettings.storeEmail || "",
      storePhone: activeSettings.storePhone || "",
      storeAddress: activeSettings.storeAddress || "",
      logo: activeSettings.logo || activeSettings.storeLogo || "/logo.png",

      // Currency
      currency: activeSettings.currency || "रु",
      currencyCode: activeSettings.currencyCode || "NPR",

      // Pricing
      taxRate: activeSettings.taxRate || 13,
      shippingFee: activeSettings.shippingFee || 100,
      freeShippingThreshold: activeSettings.freeShippingThreshold || 2000,
      minOrderAmount: activeSettings.minOrderAmount || 100,
      maxOrderAmount: activeSettings.maxOrderAmount || 100000,

      // Payment methods
      isCODEnabled: activeSettings.paymentMethods?.cod?.enabled || true,
      isEsewaEnabled: activeSettings.paymentMethods?.esewa?.enabled || false,
      isKhaltiEnabled: activeSettings.paymentMethods?.khalti?.enabled || false,

      // Social media
      socialMedia: activeSettings.socialMedia || {},
      hasSocialMedia:
        activeSettings.socialMedia &&
        Object.values(activeSettings.socialMedia).some((link) => link),

      // Policies
      aboutUs: activeSettings.aboutUs || "",
      returnPolicy: activeSettings.returnPolicy || "",
      privacyPolicy: activeSettings.privacyPolicy || "",
      termsAndConditions: activeSettings.termsAndConditions || "",
      shippingPolicy: activeSettings.shippingPolicy || "",
    };
  }, [settings, defaultSettings]);

  // Helper methods
  const helpers = useMemo(
    () => ({
      /**
       * Format price with currency
       */
      formatPrice: (price) => {
        if (typeof price !== "number") return `${computed.currency} 0`;
        return `${computed.currency} ${price.toLocaleString("en-NP")}`;
      },

      /**
       * Calculate tax amount
       */
      calculateTax: (amount) => {
        return (amount * computed.taxRate) / 100;
      },

      /**
       * Calculate shipping fee
       */
      calculateShipping: (orderAmount) => {
        if (orderAmount >= computed.freeShippingThreshold) return 0;
        return computed.shippingFee;
      },

      /**
       * Check if free shipping is available
       */
      isFreeShippingEligible: (orderAmount) => {
        return orderAmount >= computed.freeShippingThreshold;
      },

      /**
       * Validate order amount
       */
      isValidOrderAmount: (amount) => {
        return (
          amount >= computed.minOrderAmount && amount <= computed.maxOrderAmount
        );
      },

      /**
       * Check if payment method is available
       */
      isPaymentMethodAvailable: (method) => {
        const methodMap = {
          cod: computed.isCODEnabled,
          esewa: computed.isEsewaEnabled,
          khalti: computed.isKhaltiEnabled,
        };
        return methodMap[method.toLowerCase()] || false;
      },
    }),
    [computed]
  );

  return {
    // State
    settings: settings || defaultSettings,
    loading,
    error,
    lastFetched,
    isLoaded: settings !== null,

    // Computed values
    ...computed,

    // Methods
    fetchAllSettings,
    refreshSettings,
    getSetting,
    clearCache,

    // Helpers
    ...helpers,
  };
};

export default useSettings;