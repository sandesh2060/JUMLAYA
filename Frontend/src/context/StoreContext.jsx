// Frontend/src/context/StoreContext.jsx
// ✅ FIXED VERSION - Prevents infinite re-renders

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/axios.config';
import toast from 'react-hot-toast';

const StoreContext = createContext();

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default settings (fallback if API fails)
  const defaultSettings = {
    storeName: 'JUMLAYA',
    storeEmail: 'support@jumlaya.com',
    storePhone: '+977 9800000000',
    storeAddress: 'Kathmandu, Nepal',
    currency: 'रु',
    currencyCode: 'NPR',
    taxRate: 13,
    shippingFee: 100,
    freeShippingThreshold: 500,
    minOrderAmount: 100,
    maxOrderAmount: 100000,
    paymentMethods: {
      cod: { enabled: true },
      esewa: { enabled: true },
      khalti: { enabled: true }
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: ''
    }
  };

  // Default shipping methods (fallback)
  const defaultShippingMethods = [
    {
      _id: 'default-1',
      name: 'Standard Delivery',
      description: 'Delivery within 3-5 business days',
      cost: 100,
      estimatedDays: '3-5',
      isActive: true,
      isFreeShippingEligible: true,
      freeShippingThreshold: 500,
      icon: '📦',
      priority: 0
    }
  ];

  // ✅ FIX: Wrap fetchSettings in useCallback with no dependencies
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📦 Fetching store settings from /api/public/settings');
      
      const response = await apiClient.get('/public/settings');
      
      console.log('📦 Full API Response:', response);
      console.log('📦 response.data:', response.data);
      
      // Handle multiple possible response formats
      let settingsData = null;
      
      if (response.data?.data?.settings) {
        settingsData = response.data.data.settings;
        console.log('✅ Format 1: response.data.data.settings');
      } else if (response.data?.data) {
        settingsData = response.data.data;
        console.log('✅ Format 2: response.data.data');
      } else if (response.data?.settings) {
        settingsData = response.data.settings;
        console.log('✅ Format 3: response.data.settings');
      } else if (response.data && typeof response.data === 'object' && response.data.storeName) {
        settingsData = response.data;
        console.log('✅ Format 4: Direct settings object');
      }
      
      if (settingsData) {
        setSettings(settingsData);
        setError(null);
        console.log('✅ Store settings loaded successfully:', settingsData);
      } else {
        console.warn('⚠️ Unexpected API response structure:', response.data);
        throw new Error('Invalid response format - settings not found in response');
      }
      
    } catch (err) {
      console.error('❌ Error fetching store settings:', err.message);
      console.error('❌ Full error:', err);
      setError(err.message);
      setSettings(defaultSettings);
      console.warn('⚠️ Using default settings as fallback');
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Empty dependency array - function never changes

  // ✅ FIX: Wrap fetchShippingMethods in useCallback with no dependencies
  const fetchShippingMethods = useCallback(async () => {
    try {
      console.log('🚚 Fetching shipping methods from /api/public/settings/shipping');
      
      const response = await apiClient.get('/public/settings/shipping');
      
      console.log('🚚 Shipping API Response:', response.data);
      
      // Handle multiple possible response formats
      let shippingData = null;
      
      if (response.data?.data?.shippingMethods) {
        shippingData = response.data.data.shippingMethods;
      } else if (response.data?.shippingMethods) {
        shippingData = response.data.shippingMethods;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        shippingData = response.data.data;
      } else if (Array.isArray(response.data)) {
        shippingData = response.data;
      }
      
      if (shippingData && Array.isArray(shippingData) && shippingData.length > 0) {
        const activeMethods = shippingData.filter(method => method.isActive !== false);
        setShippingMethods(activeMethods);
        console.log('✅ Shipping methods loaded:', activeMethods);
      } else {
        console.warn('⚠️ No shipping methods found, using defaults');
        setShippingMethods(defaultShippingMethods);
      }
      
    } catch (err) {
      console.error('❌ Error fetching shipping methods:', err.message);
      setShippingMethods(defaultShippingMethods);
      console.warn('⚠️ Using default shipping methods as fallback');
    }
  }, []); // ✅ Empty dependency array - function never changes

  // ✅ FIX: Only run once on mount
  useEffect(() => {
    const loadData = async () => {
      await fetchSettings();
      await fetchShippingMethods();
    };
    loadData();
  }, [fetchSettings, fetchShippingMethods]); // ✅ Dependencies are stable now

  // Helper: Format currency
  const formatCurrency = useCallback((amount) => {
    if (!amount && amount !== 0) return `${settings?.currency || 'रु'} 0`;
    return `${settings?.currency || 'रु'} ${amount.toLocaleString()}`;
  }, [settings?.currency]);

  // Helper: Calculate tax
  const calculateTax = useCallback((amount) => {
    const taxRate = settings?.taxRate || 13;
    return (amount * taxRate) / 100;
  }, [settings?.taxRate]);

  // Helper: Calculate shipping (Legacy - uses first active method or settings)
  const calculateShipping = useCallback((subtotal) => {
    if (shippingMethods.length > 0) {
      const method = shippingMethods[0];
      if (method.isFreeShippingEligible && 
          method.freeShippingThreshold && 
          subtotal >= method.freeShippingThreshold) {
        return 0;
      }
      return method.cost;
    }
    
    // Fallback to settings
    const threshold = settings?.freeShippingThreshold || 500;
    const fee = settings?.shippingFee || 100;
    return subtotal >= threshold ? 0 : fee;
  }, [shippingMethods, settings?.freeShippingThreshold, settings?.shippingFee]);

  // Helper: Calculate shipping cost for a specific method
  const calculateShippingCost = useCallback((methodId, subtotal) => {
    const method = shippingMethods.find(m => m._id === methodId);
    
    if (!method) {
      return calculateShipping(subtotal);
    }
    
    if (method.isFreeShippingEligible && 
        method.freeShippingThreshold && 
        subtotal >= method.freeShippingThreshold) {
      return 0;
    }
    
    return method.cost;
  }, [shippingMethods, calculateShipping]);

  // Helper: Get available shipping methods with calculated costs
  const getAvailableShippingMethods = useCallback((subtotal) => {
    return shippingMethods.map(method => ({
      ...method,
      finalCost: calculateShippingCost(method._id, subtotal),
      isFree: method.isFreeShippingEligible && 
              method.freeShippingThreshold && 
              subtotal >= method.freeShippingThreshold
    }));
  }, [shippingMethods, calculateShippingCost]);

  // Helper: Get default shipping method (first active one)
  const getDefaultShippingMethod = useCallback(() => {
    return shippingMethods.length > 0 ? shippingMethods[0] : null;
  }, [shippingMethods]);

  // Helper: Get cheapest shipping method
  const getCheapestShippingMethod = useCallback((subtotal) => {
    const methods = getAvailableShippingMethods(subtotal);
    if (methods.length === 0) return null;
    
    return methods.reduce((cheapest, current) => {
      return current.finalCost < cheapest.finalCost ? current : cheapest;
    });
  }, [getAvailableShippingMethods]);

  // Helper: Check if payment method is enabled
  const isPaymentMethodEnabled = useCallback((method) => {
    return settings?.paymentMethods?.[method]?.enabled || false;
  }, [settings?.paymentMethods]);

  // Helper: Get tax rate
  const getTaxRate = useCallback(() => {
    return settings?.taxRate || 13;
  }, [settings?.taxRate]);

  // Helper: Get shipping fee (Legacy)
  const getShippingFee = useCallback(() => {
    return settings?.shippingFee || 100;
  }, [settings?.shippingFee]);

  // Helper: Get free shipping threshold (Legacy)
  const getFreeShippingThreshold = useCallback(() => {
    return settings?.freeShippingThreshold || 500;
  }, [settings?.freeShippingThreshold]);

  // ✅ FIX: Memoize the value object to prevent re-renders
  const value = {
    // State
    settings: settings || defaultSettings,
    shippingMethods,
    loading,
    error,
    
    // Actions
    fetchSettings,
    fetchShippingMethods,
    
    // Helper functions - Settings
    formatCurrency,
    calculateTax,
    isPaymentMethodEnabled,
    getTaxRate,
    getShippingFee,
    getFreeShippingThreshold,
    
    // Helper functions - Shipping
    calculateShipping,
    calculateShippingCost,
    getAvailableShippingMethods,
    getDefaultShippingMethod,
    getCheapestShippingMethod,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};