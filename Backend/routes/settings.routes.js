// ============================================
// settings.routes.js - Public Settings Routes
// Path: Backend/routes/settings.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const Settings = require('../models/settings.model');

// ============================================
// PUBLIC SETTINGS ENDPOINT
// ============================================

// GET /api/settings - Get public settings (no auth required)
router.get('/', async (req, res) => {
  try {
    console.log('📦 Fetching public settings');

    let settings = await Settings.findOne().select(
      'storeName storeEmail storePhone storeAddress currency currencyCode ' +
      'taxRate shippingFee freeShippingThreshold minOrderAmount maxOrderAmount ' +
      'paymentMethods socialMedia seo maintenanceMode'
    );

    // Create default settings if none exist
    if (!settings) {
      console.log('⚠️ No settings found, using defaults');
      settings = {
        storeName: 'JUMLAYA',
        storeEmail: 'admin@jumlaya.com',
        storePhone: '+977-9800000000',
        storeAddress: 'Kathmandu, Nepal',
        currency: 'रु',
        currencyCode: 'NPR',
        taxRate: 13,
        shippingFee: 100,
        freeShippingThreshold: 2000,
        minOrderAmount: 100,
        maxOrderAmount: 100000,
        paymentMethods: {
          cod: { enabled: true, name: 'Cash on Delivery' },
          esewa: { enabled: false },
          khalti: { enabled: false },
          bankTransfer: { enabled: false }
        },
        socialMedia: {},
        seo: {
          metaTitle: 'JUMLAYA - Online Shopping in Nepal',
          metaDescription: 'Shop the latest products online in Nepal',
          metaKeywords: 'online shopping, nepal, ecommerce'
        },
        maintenanceMode: {
          enabled: false,
          message: 'We are currently under maintenance. Please check back soon.'
        }
      };
    }

    console.log('✅ Public settings fetched');

    res.json({
      success: true,
      message: 'Settings retrieved successfully',
      data: { settings }
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

module.exports = router;