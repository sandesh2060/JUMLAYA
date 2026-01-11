// ============================================
// ADMIN SETTINGS CONTROLLER - WITH CLOUDINARY
// Path: Backend/controllers/admin/admin.settings.controller.js
// REPLACE YOUR EXISTING FILE WITH THIS
// ============================================

const Settings = require('../../models/settings.model');
const {
  uploadImage,
  deleteImage,
  extractPublicId,
  FOLDERS
} = require('../../config/cloudinary');

// ============================================
// GET ALL SETTINGS
// ============================================
exports.getSettings = async (req, res) => {
  try {
    console.log('📦 Fetching settings');
    let settings = await Settings.findOne();

    if (!settings) {
      console.log('⚠️ No settings found, creating default settings');
      settings = await Settings.create({
        storeName: 'JUMLAYA',
        storeLogo: '',
        storeEmail: 'info@jumlaya.com',
        storePhone: '+977-9800000000',
        storeAddress: 'Kathmandu, Nepal',
        supportEmail: 'support@jumlaya.com',
        supportPhone: '+977-9800000000',
        panNumber: '',
        vatNumber: '',
        currency: 'रु',
        currencyCode: 'NPR',
        taxRate: 13,
        shippingFee: 100,
        freeShippingThreshold: 2000,
        minOrderAmount: 100,
        maxOrderAmount: 100000,
        returnPolicy: 'Items can be returned within 7 days of delivery in original condition.',
        shippingPolicy: 'Free shipping on orders above रु 2000. Standard delivery takes 3-5 business days.'
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
// UPLOAD LOGO - WITH CLOUDINARY
// ============================================
exports.uploadLogo = async (req, res) => {
  try {
    console.log('📤 Uploading store logo to Cloudinary');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get existing settings
    let settings = await Settings.findOne();
    
    // Delete old logo from Cloudinary if exists
    if (settings && settings.storeLogo) {
      const oldPublicId = extractPublicId(settings.storeLogo);
      if (oldPublicId) {
        console.log('🗑️ Deleting old logo from Cloudinary...');
        await deleteImage(oldPublicId);
      }
    }

    // Upload new logo to Cloudinary
    const result = await uploadImage(
      req.file.buffer,
      {
        preset: 'logo',
        folder: FOLDERS.LOGOS
      }
    );

    console.log('✅ Logo uploaded to Cloudinary:', result.url);

    // Update or create settings
    if (!settings) {
      settings = await Settings.create({ 
        storeName: 'JUMLAYA',
        storeLogo: result.url,
        storeLogoPublicId: result.publicId,
        storeEmail: 'info@jumlaya.com',
        storePhone: '+977-9800000000',
        storeAddress: 'Kathmandu, Nepal'
      });
    } else {
      settings.storeLogo = result.url;
      settings.storeLogoPublicId = result.publicId;
      await settings.save();
    }

    console.log('✅ Logo uploaded successfully');
    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { 
        settings,
        logoUrl: result.url
      }
    });
  } catch (error) {
    console.error('❌ Error uploading logo:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: error.message
    });
  }
};

// ============================================
// DELETE LOGO - FROM CLOUDINARY
// ============================================
exports.deleteLogo = async (req, res) => {
  try {
    console.log('🗑️ Deleting store logo from Cloudinary');

    const settings = await Settings.findOne();
    if (!settings || !settings.storeLogo) {
      return res.status(404).json({
        success: false,
        message: 'No logo found'
      });
    }

    // Delete from Cloudinary
    const publicId = extractPublicId(settings.storeLogo);
    if (publicId) {
      await deleteImage(publicId);
      console.log('✅ Logo deleted from Cloudinary');
    }

    // Update database
    settings.storeLogo = '';
    settings.storeLogoPublicId = '';
    await settings.save();

    console.log('✅ Logo deleted successfully');
    res.json({
      success: true,
      message: 'Logo deleted successfully',
      data: { settings }
    });
  } catch (error) {
    console.error('❌ Error deleting logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete logo',
      error: error.message
    });
  }
};

// ============================================
// UPDATE STORE INFO
// ============================================
exports.updateStoreInfo = async (req, res) => {
  try {
    const {
      storeName,
      storeEmail,
      storePhone,
      storeAddress,
      supportEmail,
      supportPhone,
      panNumber,
      vatNumber
    } = req.body;

    console.log('📦 Updating store info');

    const settings = await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          storeName,
          storeEmail,
          storePhone,
          storeAddress,
          supportEmail,
          supportPhone,
          panNumber,
          vatNumber
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