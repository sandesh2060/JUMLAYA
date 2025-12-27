// ============================================
// Store Settings Context
// Path: Frontend/src/context/StoreContext.jsx
// ============================================

import { createContext, useContext, useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default settings (fallback if API fails)
  const defaultSettings = {
    storeName: 'JUMLAYA',
    storeEmail: 'support@jumlaya.com',
    storePhone: '+977 9800000000',
    storeAddress: 'Kathmandu, Nepal',
    currency: 'Rs.',
    currencyCode: 'NPR',
    taxRate: 13,
    shippingFee: 100,
    freeShippingThreshold: 5000,
    minOrderAmount: 500,
    maxOrderAmount: 100000,
    paymentMethods: {
      cod: { enabled: true },
      esewa: { enabled: true },
      khalti: { enabled: true },
      card: { enabled: false }
    },
    socialMedia: {
      facebook: 'https://facebook.com/jumlaya',
      instagram: 'https://instagram.com/jumlaya',
      twitter: 'https://twitter.com/jumlaya',
      youtube: '',
      tiktok: ''
    },
    logo: '/logo.png',
    favicon: '/favicon.ico'
  };

  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/settings');
      
      if (response.data?.success) {
        setSettings(response.data.data.settings);
        setError(null);
      } else {
        throw new Error('Failed to load settings');
      }
    } catch (err) {
      console.error('❌ Error fetching store settings:', err);
      setError(err.message);
      // Use default settings as fallback
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  // Update settings (admin only)
  const updateSettings = async (updates) => {
    try {
      const response = await apiClient.put('/admin/settings', updates);
      
      if (response.data?.success) {
        setSettings(response.data.data.settings);
        toast.success('Settings updated successfully');
        return response.data.data.settings;
      }
    } catch (err) {
      console.error('❌ Error updating settings:', err);
      toast.error(err.response?.data?.message || 'Failed to update settings');
      throw err;
    }
  };

  // Update specific section (admin only)
  const updateSettingSection = async (section, updates) => {
    try {
      const response = await apiClient.patch(`/admin/settings/${section}`, updates);
      
      if (response.data?.success) {
        setSettings(response.data.data.settings);
        toast.success(`${section} settings updated`);
        return response.data.data.settings;
      }
    } catch (err) {
      console.error(`❌ Error updating ${section} settings:`, err);
      toast.error(err.response?.data?.message || `Failed to update ${section} settings`);
      throw err;
    }
  };

  // Helper: Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return `${settings?.currency || 'Rs.'} 0`;
    return `${settings?.currency || 'Rs.'} ${amount.toLocaleString()}`;
  };

  // Helper: Calculate tax
  const calculateTax = (amount) => {
    const taxRate = settings?.taxRate || 13;
    return (amount * taxRate) / 100;
  };

  // Helper: Calculate shipping
  const calculateShipping = (subtotal) => {
    const threshold = settings?.freeShippingThreshold || 5000;
    const fee = settings?.shippingFee || 100;
    return subtotal >= threshold ? 0 : fee;
  };

  // Helper: Check if payment method is enabled
  const isPaymentMethodEnabled = (method) => {
    return settings?.paymentMethods?.[method]?.enabled || false;
  };

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const value = {
    settings: settings || defaultSettings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    updateSettingSection,
    
    // Helper functions
    formatCurrency,
    calculateTax,
    calculateShipping,
    isPaymentMethodEnabled,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};