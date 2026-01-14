// ============================================
// Backend/routes/settings.routes.js
// Perfect Settings Routes - Public Access
// ============================================

const express = require('express');
const router = express.Router();
const Settings = require('../models/settings.model');

// ==========================================
// PUBLIC SETTINGS ENDPOINT
// ==========================================

/**
 * @route   GET /api/settings
 * @desc    Get public settings (no authentication required)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    console.log('📦 Fetching public settings');

    let settings = await Settings.getSettings();
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    // Only expose public fields
    const publicSettings = {
      _id: settings._id,
      storeName: settings.storeName,
      storeLogo: settings.storeLogo || '',
      favicon: settings.favicon || '',
      storeEmail: settings.storeEmail,
      storePhone: settings.storePhone,
      storeAddress: settings.storeAddress,
      storeLocation: settings.storeLocation,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      
      // Currency & Tax
      currency: settings.currency,
      currencyCode: settings.currencyCode,
      currencySymbol: settings.currencySymbol,
      taxRate: settings.taxRate,
      taxEnabled: settings.taxEnabled,
      
      // Order Limits
      minOrderAmount: settings.minOrderAmount,
      maxOrderAmount: settings.maxOrderAmount,
      
      // Delivery Settings
      deliverySettings: {
        shippingFee: settings.deliverySettings?.shippingFee || 100,
        freeShippingThreshold: settings.deliverySettings?.freeShippingThreshold || 2000,
        freeDeliveryDistance: settings.deliverySettings?.freeDeliveryDistance || 5,
        maxDeliveryDistance: settings.deliverySettings?.maxDeliveryDistance || 50,
        perKmCharge: settings.deliverySettings?.perKmCharge || 20,
        estimatedDeliveryDays: settings.deliverySettings?.estimatedDeliveryDays || { min: 3, max: 5 }
      },
      
      // Payment Methods (only enabled ones)
      paymentMethods: settings.getEnabledPaymentMethods(),
      
      // Social Media
      socialMedia: settings.socialMedia,
      
      // Business Hours
      businessHours: settings.businessHours,
      isStoreOpen: settings.isStoreOpen,
      
      // Content Pages
      content: {
        aboutUs: settings.content?.aboutUs || '',
        returnPolicy: settings.content?.returnPolicy || '',
        privacyPolicy: settings.content?.privacyPolicy || '',
        termsAndConditions: settings.content?.termsAndConditions || '',
        shippingPolicy: settings.content?.shippingPolicy || '',
        faq: settings.content?.faq || ''
      },
      
      // SEO
      seo: {
        metaTitle: settings.seo?.metaTitle || '',
        metaDescription: settings.seo?.metaDescription || '',
        metaKeywords: settings.seo?.metaKeywords || [],
        ogImage: settings.seo?.ogImage || '',
        siteName: settings.seo?.siteName || '',
        twitterHandle: settings.seo?.twitterHandle || ''
      },
      
      // Maintenance Mode
      maintenanceMode: {
        enabled: settings.maintenanceMode?.enabled || false,
        message: settings.maintenanceMode?.message || ''
      }
    };
    
    console.log('✅ Public settings fetched');
    console.log('🖼️ Logo URL:', publicSettings.storeLogo || 'No logo set');
    console.log('🏪 Store open:', publicSettings.isStoreOpen);

    res.json({
      success: true,
      message: 'Settings retrieved successfully',
      data: publicSettings
    });
    
  } catch (error) {
    console.error('❌ Error fetching public settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

// ==========================================
// GET STORE LOCATION
// ==========================================

/**
 * @route   GET /api/settings/location
 * @desc    Get store location details
 * @access  Public
 */
router.get('/location', async (req, res) => {
  try {
    console.log('📍 Fetching store location');
    
    const settings = await Settings.findOne({ isActive: true })
      .select('storeLocation storeAddress storeName');
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Store location not found'
      });
    }

    res.json({
      success: true,
      message: 'Store location retrieved successfully',
      data: {
        storeName: settings.storeName,
        storeAddress: settings.storeAddress,
        storeLocation: settings.storeLocation
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching store location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store location',
      error: error.message
    });
  }
});

// ==========================================
// GET DELIVERY SETTINGS
// ==========================================

/**
 * @route   GET /api/settings/delivery
 * @desc    Get delivery settings
 * @access  Public
 */
router.get('/delivery', async (req, res) => {
  try {
    console.log('🚚 Fetching delivery settings');
    
    const settings = await Settings.findOne({ isActive: true })
      .select('deliverySettings');
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Delivery settings not found'
      });
    }

    res.json({
      success: true,
      message: 'Delivery settings retrieved successfully',
      data: {
        deliverySettings: settings.deliverySettings || {
          shippingFee: 100,
          freeShippingThreshold: 2000,
          freeDeliveryDistance: 5,
          maxDeliveryDistance: 50,
          perKmCharge: 20,
          estimatedDeliveryDays: { min: 3, max: 5 }
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching delivery settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery settings',
      error: error.message
    });
  }
});

// ==========================================
// GET PAYMENT METHODS
// ==========================================

/**
 * @route   GET /api/settings/payment-methods
 * @desc    Get enabled payment methods
 * @access  Public
 */
router.get('/payment-methods', async (req, res) => {
  try {
    console.log('💳 Fetching payment methods');
    
    const settings = await Settings.findOne({ isActive: true });
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    const enabledPaymentMethods = settings.getEnabledPaymentMethods();

    res.json({
      success: true,
      message: 'Payment methods retrieved successfully',
      data: {
        paymentMethods: enabledPaymentMethods
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods',
      error: error.message
    });
  }
});

// ==========================================
// GET BUSINESS HOURS
// ==========================================

/**
 * @route   GET /api/settings/business-hours
 * @desc    Get business hours and check if store is open
 * @access  Public
 */
router.get('/business-hours', async (req, res) => {
  try {
    console.log('🕐 Fetching business hours');
    
    const settings = await Settings.findOne({ isActive: true })
      .select('businessHours');
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Business hours not found'
      });
    }

    res.json({
      success: true,
      message: 'Business hours retrieved successfully',
      data: {
        businessHours: settings.businessHours,
        isStoreOpen: settings.isStoreOpen
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching business hours:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business hours',
      error: error.message
    });
  }
});

// ==========================================
// GET SPECIFIC CONTENT PAGE
// ==========================================

/**
 * @route   GET /api/settings/content/:page
 * @desc    Get specific content page (about-us, return-policy, etc.)
 * @access  Public
 */
router.get('/content/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const validPages = ['aboutUs', 'returnPolicy', 'privacyPolicy', 'termsAndConditions', 'shippingPolicy', 'faq'];
    
    if (!validPages.includes(page)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page requested'
      });
    }
    
    console.log(`📄 Fetching content page: ${page}`);
    
    const settings = await Settings.findOne({ isActive: true })
      .select('content');
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      message: 'Content retrieved successfully',
      data: {
        page,
        content: settings.content?.[page] || ''
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching content page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message
    });
  }
});

// ==========================================
// CALCULATE DELIVERY CHARGE
// ==========================================

/**
 * @route   POST /api/settings/calculate-delivery
 * @desc    Calculate delivery charge based on distance and order amount
 * @access  Public
 */
router.post('/calculate-delivery', async (req, res) => {
  try {
    const { distanceInKm, orderAmount } = req.body;
    
    if (!distanceInKm || !orderAmount) {
      return res.status(400).json({
        success: false,
        message: 'Distance and order amount are required'
      });
    }
    
    console.log(`🚚 Calculating delivery charge for ${distanceInKm}km, order: Rs ${orderAmount}`);
    
    const settings = await Settings.findOne({ isActive: true });
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    const deliveryCharge = settings.calculateDeliveryCharge(
      parseFloat(distanceInKm),
      parseFloat(orderAmount)
    );
    
    const isDeliveryAvailable = settings.isDeliveryAvailable(parseFloat(distanceInKm));

    if (deliveryCharge === null) {
      return res.json({
        success: false,
        message: 'Delivery not available for this location',
        data: {
          isDeliveryAvailable: false,
          distanceInKm: parseFloat(distanceInKm),
          maxDeliveryDistance: settings.deliverySettings.maxDeliveryDistance
        }
      });
    }

    res.json({
      success: true,
      message: 'Delivery charge calculated successfully',
      data: {
        isDeliveryAvailable,
        deliveryCharge,
        distanceInKm: parseFloat(distanceInKm),
        orderAmount: parseFloat(orderAmount),
        isFreeShipping: deliveryCharge === 0,
        estimatedDeliveryDays: settings.deliverySettings.estimatedDeliveryDays
      }
    });
    
  } catch (error) {
    console.error('❌ Error calculating delivery charge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate delivery charge',
      error: error.message
    });
  }
});

// ==========================================
// CHECK STORE STATUS
// ==========================================

/**
 * @route   GET /api/settings/status
 * @desc    Check if store is open and maintenance mode
 * @access  Public
 */
router.get('/status', async (req, res) => {
  try {
    console.log('🔍 Checking store status');
    
    const settings = await Settings.findOne({ isActive: true })
      .select('maintenanceMode businessHours');
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Store status not found'
      });
    }

    res.json({
      success: true,
      message: 'Store status retrieved successfully',
      data: {
        isStoreOpen: settings.isStoreOpen,
        maintenanceMode: {
          enabled: settings.maintenanceMode?.enabled || false,
          message: settings.maintenanceMode?.message || ''
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking store status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check store status',
      error: error.message
    });
  }
});

module.exports = router;