// ============================================
// Backend/routes/publicSettings.routes.js - FIXED
// ============================================
const express = require('express');
const router = express.Router();
const publicSettingsController = require('../controllers/publicSettings.controller');

/**
 * Public Settings Routes
 * No authentication required - accessible to everyone
 */

// ✅ MAIN ENDPOINT - Get all public settings
router.get('/', publicSettingsController.getAllPublicSettings);

// Get About Us
router.get('/about', publicSettingsController.getAboutUs);

// Get delivery settings
router.get('/delivery', publicSettingsController.getDeliverySettings);

// ✅ NEW: Get shipping methods
router.get('/shipping', async (req, res) => {
  try {
    const Settings = require('../models/settings.model');
    const settings = await Settings.findOne();
    
    if (!settings || !settings.shippingMethods || settings.shippingMethods.length === 0) {
      return res.json({
        success: true,
        message: 'Shipping methods fetched successfully',
        data: {
          shippingMethods: [
            {
              _id: 'default-1',
              name: 'Standard Delivery',
              description: 'Delivery within 3-5 business days',
              cost: 100,
              estimatedDays: '3-5',
              isActive: true,
              isFreeShippingEligible: true,
              freeShippingThreshold: 2000,
              icon: '📦',
              priority: 0
            }
          ]
        }
      });
    }
    
    const activeMethods = settings.shippingMethods.filter(m => m.isActive);
    
    res.json({
      success: true,
      message: 'Shipping methods fetched successfully',
      data: {
        shippingMethods: activeMethods
      }
    });
  } catch (error) {
    console.error('❌ Error fetching shipping methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipping methods',
      error: error.message
    });
  }
});

// Get payment settings
router.get('/payment', publicSettingsController.getPaymentSettings);

// Get general settings
router.get('/general', publicSettingsController.getGeneralSettings);

// Get store hours
router.get('/store-hours', publicSettingsController.getStoreHours);

// Get contact information
router.get('/contact', publicSettingsController.getContactInfo);

// Get social media links
router.get('/social', publicSettingsController.getSocialLinks);

// Get minimum order value
router.get('/minimum-order', publicSettingsController.getMinimumOrder);

// Get tax settings
router.get('/tax', publicSettingsController.getTaxSettings);

// Get terms and conditions
router.get('/terms', publicSettingsController.getTermsAndConditions);

// Get privacy policy
router.get('/privacy', publicSettingsController.getPrivacyPolicy);

// Get FAQs
router.get('/faqs', publicSettingsController.getFAQs);

// Get shipping policy
router.get('/shipping-policy', publicSettingsController.getShippingPolicy);

// Get return policy
router.get('/return-policy', publicSettingsController.getReturnPolicy);

// Get maintenance status
router.get('/maintenance', publicSettingsController.getMaintenanceStatus);

// Get feature flags
router.get('/features', publicSettingsController.getFeatureFlags);

// Get app version
router.get('/version', publicSettingsController.getAppVersion);

// Get delivery areas
router.get('/delivery-areas', publicSettingsController.getDeliveryAreas);

// Check delivery availability (POST because it accepts location data)
router.post('/delivery/check', publicSettingsController.checkDeliveryAvailability);

// Submit contact form
router.post('/contact', publicSettingsController.submitContactForm);

module.exports = router;