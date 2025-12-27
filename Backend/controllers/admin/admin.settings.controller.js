// ============================================
// admin.settings.controller.js - Complete Backend Controller
// Path: Backend/controllers/admin/admin.settings.controller.js
// ============================================
const Settings = require('../../models/settings.model');

// ============================================
// GET ALL SETTINGS
// ============================================
exports.getSettings = async (req, res) => {
  try {
    console.log('📦 Fetching settings');

    let settings = await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      console.log('⚠️ No settings found, creating default settings');
      settings = await Settings.create({
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
          esewa: { enabled: false, merchantId: '' },
          khalti: { enabled: false, publicKey: '' },
          bankTransfer: { enabled: false, accountDetails: '' }
        },
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: '',
          youtube: '',
          tiktok: ''
        },
        aboutUs: '',
        returnPolicy: '',
        privacyPolicy: '',
        termsAndConditions: '',
        shippingPolicy: '',
        seo: {
          metaTitle: 'JUMLAYA - Online Shopping in Nepal',
          metaDescription: 'Shop the latest products online in Nepal',
          metaKeywords: 'online shopping, nepal, ecommerce',
          ogImage: ''
        },
        notifications: {
          emailNotifications: true,
          orderNotifications: true,
          lowStockAlerts: true,
          customerMessages: false
        },
        maintenanceMode: {
          enabled: false,
          message: 'We are currently under maintenance. Please check back soon.'
        }
      });
    }

    console.log('✅ Settings fetched successfully');

    res.json({
      success: true,
      message: 'Settings retrieved successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

// ============================================
// UPDATE STORE INFO
// ============================================
exports.updateStoreInfo = async (req, res) => {
  try {
    const { storeName, storeEmail, storePhone, storeAddress } = req.body;

    console.log('📦 Updating store info');

    const settings = await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          storeName,
          storeEmail,
          storePhone,
          storeAddress
        }
      },
      { new: true, upsert: true }
    );

    console.log('✅ Store info updated');

    res.json({
      success: true,
      message: 'Store information updated successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('❌ Error updating store info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update store info',
      error: error.message
    });
  }
};

// ============================================
// UPDATE BUSINESS SETTINGS
// ============================================
exports.updateBusinessSettings = async (req, res) => {
  try {
    const {
      currency,
      currencyCode,
      taxRate,
      shippingFee,
      freeShippingThreshold,
      minOrderAmount,
      maxOrderAmount
    } = req.body;

    console.log('📦 Updating business settings');

    const settings = await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          currency,
          currencyCode,
          taxRate,
          shippingFee,
          freeShippingThreshold,
          minOrderAmount,
          maxOrderAmount
        }
      },
      { new: true, upsert: true }
    );

    console.log('✅ Business settings updated');

    res.json({
      success: true,
      message: 'Business settings updated successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('❌ Error updating business settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update business settings',
      error: error.message
    });
  }
};

// ============================================
// UPDATE PAYMENT METHODS
// ============================================
exports.updatePaymentMethods = async (req, res) => {
  try {
    const { paymentMethods } = req.body;

    console.log('📦 Updating payment methods');

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: { paymentMethods } },
      { new: true, upsert: true }
    );

    console.log('✅ Payment methods updated');

    res.json({
      success: true,
      message: 'Payment methods updated successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('❌ Error updating payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment methods',
      error: error.message
    });
  }
};

// ============================================
// UPDATE SOCIAL MEDIA
// ============================================
exports.updateSocialMedia = async (req, res) => {
  try {
    const { socialMedia } = req.body;

    console.log('📦 Updating social media links');

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: { socialMedia } },
      { new: true, upsert: true }
    );

    console.log('✅ Social media links updated');

    res.json({
      success: true,
      message: 'Social media links updated successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('❌ Error updating social media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update social media',
      error: error.message
    });
  }
};

// ============================================
// UPDATE CONTENT PAGES
// ============================================
exports.updateContentPages = async (req, res) => {
  try {
    const {
      aboutUs,
      returnPolicy,
      privacyPolicy,
      termsAndConditions,
      shippingPolicy
    } = req.body;

    console.log('📦 Updating content pages');

    const settings = await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          aboutUs,
          returnPolicy,
          privacyPolicy,
          termsAndConditions,
          shippingPolicy
        }
      },
      { new: true, upsert: true }
    );

    console.log('✅ Content pages updated');

    res.json({
      success: true,
      message: 'Content pages updated successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('❌ Error updating content pages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update content pages',
      error: error.message
    });
  }
};

// ============================================
// UPDATE SEO SETTINGS
// ============================================
exports.updateSEO = async (req, res) => {
  try {
    const { seo } = req.body;

    console.log('📦 Updating SEO settings');

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: { seo } },
      { new: true, upsert: true }
    );

    console.log('✅ SEO settings updated');

    res.json({
      success: true,
      message: 'SEO settings updated successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('❌ Error updating SEO:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update SEO',
      error: error.message
    });
  }
};

// ============================================
// UPDATE NOTIFICATION SETTINGS
// ============================================
exports.updateNotificationSettings = async (req, res) => {
  try {
    const {
      emailNotifications,
      orderNotifications,
      lowStockAlerts,
      customerMessages
    } = req.body;

    console.log('📦 Updating notification settings');

    const settings = await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          'notifications.emailNotifications': emailNotifications,
          'notifications.orderNotifications': orderNotifications,
          'notifications.lowStockAlerts': lowStockAlerts,
          'notifications.customerMessages': customerMessages
        }
      },
      { new: true, upsert: true }
    );

    console.log('✅ Notification settings updated');

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('❌ Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification settings',
      error: error.message
    });
  }
};

// ============================================
// UPDATE MAINTENANCE MODE
// ============================================
exports.updateMaintenanceMode = async (req, res) => {
  try {
    const { maintenanceMode } = req.body;

    console.log('📦 Updating maintenance mode');

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: { maintenanceMode } },
      { new: true, upsert: true }
    );

    console.log('✅ Maintenance mode updated');

    res.json({
      success: true,
      message: 'Maintenance mode updated successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('❌ Error updating maintenance mode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update maintenance mode',
      error: error.message
    });
  }
};

// ============================================
// BULK UPDATE ALL SETTINGS
// ============================================
exports.updateAllSettings = async (req, res) => {
  try {
    console.log('📦 Bulk updating settings');

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true }
    );

    console.log('✅ All settings updated');

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('❌ Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};