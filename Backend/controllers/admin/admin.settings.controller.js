// ============================================
// Backend/controllers/admin/admin.settings.controller.js
// Perfect Admin Settings Controller - Production Ready
// ============================================

const Settings = require('../../models/settings.model');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const {
  uploadImage,
  deleteImage,
  extractPublicId,
  FOLDERS
} = require('../../config/cloudinary');

// Optional: If you have delivery service
let deliveryFeeService;
try {
  deliveryFeeService = require('../../services/deliveryFee.service');
} catch (err) {
  console.log('ℹ️ Delivery fee service not found, skipping cache clearing');
}

// ==========================================
// GET ALL SETTINGS (Admin View)
// ==========================================
exports.getSettings = catchAsync(async (req, res, next) => {
  console.log('📦 Admin fetching settings');
  
  let settings = await Settings.getSettings();
  
  console.log('✅ Settings fetched successfully');
  
  res.json({
    success: true,
    message: 'Settings retrieved successfully',
    data: { settings }
  });
});

// ==========================================
// UPLOAD LOGO - WITH CLOUDINARY
// ==========================================
exports.uploadLogo = catchAsync(async (req, res, next) => {
  console.log('📤 Uploading store logo to Cloudinary');

  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  // Get existing settings
  let settings = await Settings.findOne({ isActive: true });
  
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
      storeEmail: 'info@jumlaya.com',
      storePhone: '+977-9800000000',
      storeAddress: 'Patan, Nepal',
      updatedBy: req.user._id
    });
  } else {
    settings.storeLogo = result.url;
    settings.updatedBy = req.user._id;
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
});

// ==========================================
// UPLOAD FAVICON - WITH CLOUDINARY
// ==========================================
exports.uploadFavicon = catchAsync(async (req, res, next) => {
  console.log('📤 Uploading favicon to Cloudinary');

  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  let settings = await Settings.findOne({ isActive: true });
  
  // Delete old favicon from Cloudinary if exists
  if (settings && settings.favicon) {
    const oldPublicId = extractPublicId(settings.favicon);
    if (oldPublicId) {
      console.log('🗑️ Deleting old favicon from Cloudinary...');
      await deleteImage(oldPublicId);
    }
  }

  // Upload new favicon to Cloudinary
  const result = await uploadImage(
    req.file.buffer,
    {
      preset: 'favicon',
      folder: FOLDERS.LOGOS
    }
  );

  console.log('✅ Favicon uploaded to Cloudinary:', result.url);

  if (!settings) {
    settings = await Settings.create({ 
      favicon: result.url,
      updatedBy: req.user._id
    });
  } else {
    settings.favicon = result.url;
    settings.updatedBy = req.user._id;
    await settings.save();
  }

  res.json({
    success: true,
    message: 'Favicon uploaded successfully',
    data: { 
      settings,
      faviconUrl: result.url
    }
  });
});

// ==========================================
// DELETE LOGO - FROM CLOUDINARY
// ==========================================
exports.deleteLogo = catchAsync(async (req, res, next) => {
  console.log('🗑️ Deleting store logo from Cloudinary');

  const settings = await Settings.findOne({ isActive: true });
  
  if (!settings || !settings.storeLogo) {
    return next(new AppError('No logo found', 404));
  }

  // Delete from Cloudinary
  const publicId = extractPublicId(settings.storeLogo);
  if (publicId) {
    await deleteImage(publicId);
    console.log('✅ Logo deleted from Cloudinary');
  }

  // Update database
  settings.storeLogo = '';
  settings.updatedBy = req.user._id;
  await settings.save();

  console.log('✅ Logo deleted successfully');
  
  res.json({
    success: true,
    message: 'Logo deleted successfully',
    data: { settings }
  });
});

// ==========================================
// DELETE FAVICON
// ==========================================
exports.deleteFavicon = catchAsync(async (req, res, next) => {
  console.log('🗑️ Deleting favicon from Cloudinary');

  const settings = await Settings.findOne({ isActive: true });
  
  if (!settings || !settings.favicon) {
    return next(new AppError('No favicon found', 404));
  }

  const publicId = extractPublicId(settings.favicon);
  if (publicId) {
    await deleteImage(publicId);
    console.log('✅ Favicon deleted from Cloudinary');
  }

  settings.favicon = '';
  settings.updatedBy = req.user._id;
  await settings.save();

  res.json({
    success: true,
    message: 'Favicon deleted successfully',
    data: { settings }
  });
});

// ==========================================
// UPDATE STORE INFORMATION
// ==========================================
exports.updateStoreInfo = catchAsync(async (req, res, next) => {
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

  console.log('📦 Updating store information');

  // Validate required fields
  if (!storeName || !storeEmail || !storePhone || !storeAddress) {
    return next(new AppError('Store name, email, phone, and address are required', 400));
  }

  const settings = await Settings.updateSettings({
    storeName,
    storeEmail,
    storePhone,
    storeAddress,
    supportEmail,
    supportPhone,
    panNumber,
    vatNumber
  }, req.user._id);

  console.log('✅ Store information updated');
  
  res.json({
    success: true,
    message: 'Store information updated successfully',
    data: { settings }
  });
});

// ==========================================
// UPDATE BUSINESS SETTINGS (Combined)
// ==========================================
exports.updateBusinessSettings = catchAsync(async (req, res, next) => {
  const {
    currency,
    currencyCode,
    currencySymbol,
    taxRate,
    taxEnabled,
    businessHours,
    minOrderAmount,
    maxOrderAmount
  } = req.body;

  console.log('🏢 Updating business settings');

  const updateData = {};
  
  // Currency settings
  if (currency !== undefined) updateData.currency = currency;
  if (currencyCode !== undefined) updateData.currencyCode = currencyCode;
  if (currencySymbol !== undefined) updateData.currencySymbol = currencySymbol;
  if (taxRate !== undefined) updateData.taxRate = parseFloat(taxRate);
  if (taxEnabled !== undefined) updateData.taxEnabled = taxEnabled;
  
  // Business hours
  if (businessHours !== undefined) updateData.businessHours = businessHours;
  
  // Pricing
  if (minOrderAmount !== undefined) updateData.minOrderAmount = parseFloat(minOrderAmount);
  if (maxOrderAmount !== undefined) updateData.maxOrderAmount = parseFloat(maxOrderAmount);

  const settings = await Settings.updateSettings(updateData, req.user._id);

  console.log('✅ Business settings updated');
  
  res.json({
    success: true,
    message: 'Business settings updated successfully',
    data: { settings }
  });
});

// ==========================================
// UPDATE STORE LOCATION
// ==========================================
exports.updateStoreLocation = catchAsync(async (req, res, next) => {
  const { latitude, longitude, address, landmark } = req.body;

  console.log('📍 Updating store location');

  // Validate coordinates
  if (latitude === undefined || longitude === undefined) {
    return next(new AppError('Latitude and longitude are required', 400));
  }

  if (latitude < -90 || latitude > 90) {
    return next(new AppError('Invalid latitude (must be between -90 and 90)', 400));
  }

  if (longitude < -180 || longitude > 180) {
    return next(new AppError('Invalid longitude (must be between -180 and 180)', 400));
  }

  let settings = await Settings.findOne({ isActive: true });
  
  if (!settings) {
    return next(new AppError('Settings not found. Please create settings first.', 404));
  }

  settings.storeLocation = {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    address: address || settings.storeLocation?.address || '',
    landmark: landmark || settings.storeLocation?.landmark || ''
  };
  
  settings.updatedBy = req.user._id;
  await settings.save();

  // Clear delivery cache if service exists
  if (deliveryFeeService && deliveryFeeService.clearLocationCache) {
    deliveryFeeService.clearLocationCache();
    console.log('✅ Store location updated and cache cleared');
  } else {
    console.log('✅ Store location updated');
  }

  res.json({
    success: true,
    message: 'Store location updated successfully',
    data: { storeLocation: settings.storeLocation }
  });
});

// ==========================================
// UPDATE CURRENCY & TAX SETTINGS
// ==========================================
exports.updateCurrencyAndTax = catchAsync(async (req, res, next) => {
  const {
    currency,
    currencyCode,
    currencySymbol,
    taxRate,
    taxEnabled
  } = req.body;

  console.log('💰 Updating currency and tax settings');

  const settings = await Settings.updateSettings({
    currency,
    currencyCode,
    currencySymbol,
    taxRate: taxRate !== undefined ? parseFloat(taxRate) : undefined,
    taxEnabled
  }, req.user._id);

  console.log('✅ Currency and tax settings updated');
  
  res.json({
    success: true,
    message: 'Currency and tax settings updated successfully',
    data: { settings }
  });
});

// ==========================================
// UPDATE PRICING SETTINGS
// ==========================================
exports.updatePricingSettings = catchAsync(async (req, res, next) => {
  const {
    minOrderAmount,
    maxOrderAmount
  } = req.body;

  console.log('💵 Updating pricing settings');

  // Validate
  if (minOrderAmount !== undefined && minOrderAmount < 0) {
    return next(new AppError('Minimum order amount cannot be negative', 400));
  }

  if (maxOrderAmount !== undefined && maxOrderAmount < 0) {
    return next(new AppError('Maximum order amount cannot be negative', 400));
  }

  if (minOrderAmount !== undefined && maxOrderAmount !== undefined && maxOrderAmount <= minOrderAmount) {
    return next(new AppError('Maximum order amount must be greater than minimum order amount', 400));
  }

  const settings = await Settings.updateSettings({
    minOrderAmount: minOrderAmount !== undefined ? parseFloat(minOrderAmount) : undefined,
    maxOrderAmount: maxOrderAmount !== undefined ? parseFloat(maxOrderAmount) : undefined
  }, req.user._id);

  console.log('✅ Pricing settings updated');
  
  res.json({
    success: true,
    message: 'Pricing settings updated successfully',
    data: { settings }
  });
});

// ==========================================
// UPDATE DELIVERY SETTINGS
// ==========================================
exports.updateDeliverySettings = catchAsync(async (req, res, next) => {
  const {
    shippingFee,
    freeShippingThreshold,
    freeDeliveryDistance,
    maxDeliveryDistance,
    perKmCharge,
    estimatedDeliveryDays
  } = req.body;

  console.log('🚚 Updating delivery settings');

  let settings = await Settings.findOne({ isActive: true });
  
  if (!settings) {
    return next(new AppError('Settings not found. Please create settings first.', 404));
  }

  // Validate values
  if (shippingFee !== undefined && shippingFee < 0) {
    return next(new AppError('Shipping fee must be positive', 400));
  }

  if (freeShippingThreshold !== undefined && freeShippingThreshold < 0) {
    return next(new AppError('Free shipping threshold must be positive', 400));
  }

  if (freeDeliveryDistance !== undefined && freeDeliveryDistance < 0) {
    return next(new AppError('Free delivery distance must be positive', 400));
  }

  if (maxDeliveryDistance !== undefined && maxDeliveryDistance < 1) {
    return next(new AppError('Max delivery distance must be at least 1km', 400));
  }

  if (perKmCharge !== undefined && perKmCharge < 0) {
    return next(new AppError('Per km charge must be positive', 400));
  }

  // Update delivery settings
  settings.deliverySettings = {
    shippingFee: shippingFee !== undefined 
      ? parseFloat(shippingFee) 
      : settings.deliverySettings?.shippingFee || 100,
    freeShippingThreshold: freeShippingThreshold !== undefined 
      ? parseFloat(freeShippingThreshold) 
      : settings.deliverySettings?.freeShippingThreshold || 2000,
    freeDeliveryDistance: freeDeliveryDistance !== undefined 
      ? parseFloat(freeDeliveryDistance) 
      : settings.deliverySettings?.freeDeliveryDistance || 5,
    maxDeliveryDistance: maxDeliveryDistance !== undefined 
      ? parseFloat(maxDeliveryDistance) 
      : settings.deliverySettings?.maxDeliveryDistance || 50,
    perKmCharge: perKmCharge !== undefined 
      ? parseFloat(perKmCharge) 
      : settings.deliverySettings?.perKmCharge || 20,
    estimatedDeliveryDays: estimatedDeliveryDays || settings.deliverySettings?.estimatedDeliveryDays || { min: 3, max: 5 }
  };
  
  settings.updatedBy = req.user._id;
  await settings.save();

  // Clear delivery cache if service exists
  if (deliveryFeeService && deliveryFeeService.clearLocationCache) {
    deliveryFeeService.clearLocationCache();
  }

  console.log('✅ Delivery settings updated:', settings.deliverySettings);
  
  res.json({
    success: true,
    message: 'Delivery settings updated successfully',
    data: { deliverySettings: settings.deliverySettings }
  });
});

// ==========================================
// UPDATE PAYMENT METHODS
// ==========================================
exports.updatePaymentMethods = catchAsync(async (req, res, next) => {
  const { paymentMethods } = req.body;
  
  console.log('💳 Updating payment methods');

  if (!paymentMethods) {
    return next(new AppError('Payment methods data is required', 400));
  }

  const settings = await Settings.updateSettings({
    paymentMethods
  }, req.user._id);

  console.log('✅ Payment methods updated');
  
  res.json({
    success: true,
    message: 'Payment methods updated successfully',
    data: { settings }
  });
});

// ==========================================
// UPDATE EMAIL SETTINGS
// ==========================================
exports.updateEmailSettings = catchAsync(async (req, res, next) => {
  const { emailSettings } = req.body;
  
  console.log('📧 Updating email settings');

  if (!emailSettings) {
    return next(new AppError('Email settings data is required', 400));
  }

  const settings = await Settings.updateSettings({
    emailSettings
  }, req.user._id);

  console.log('✅ Email settings updated');
  
  res.json({
    success: true,
    message: 'Email settings updated successfully',
    data: { settings }
  });
});

// ==========================================
// UPDATE SOCIAL MEDIA LINKS
// ==========================================
exports.updateSocialMedia = catchAsync(async (req, res, next) => {
  const { socialMedia } = req.body;
  
  console.log('📱 Updating social media links');

  if (!socialMedia) {
    return next(new AppError('Social media data is required', 400));
  }

  const settings = await Settings.updateSettings({
    socialMedia
  }, req.user._id);

  console.log('✅ Social media links updated');
  
  res.json({
    success: true,
    message: 'Social media links updated successfully',
    data: { settings }
  });
});

// ==========================================
// UPDATE BUSINESS HOURS
// ==========================================
exports.updateBusinessHours = catchAsync(async (req, res, next) => {
  const { businessHours } = req.body;
  
  console.log('🕐 Updating business hours');

  if (!businessHours) {
    return next(new AppError('Business hours data is required', 400));
  }

  const settings = await Settings.updateSettings({
    businessHours
  }, req.user._id);

  console.log('✅ Business hours updated');
  
  res.json({
    success: true,
    message: 'Business hours updated successfully',
    data: { settings }
  });
});

// ==========================================
// UPDATE CONTENT PAGES
// ==========================================
exports.updateContentPages = catchAsync(async (req, res, next) => {
  const {
    aboutUs,
    returnPolicy,
    privacyPolicy,
    termsAndConditions,
    shippingPolicy,
    faq
  } = req.body;

  console.log('📄 Updating content pages');

  let settings = await Settings.findOne({ isActive: true });
  
  if (!settings) {
    return next(new AppError('Settings not found', 404));
  }

  settings.content = {
    aboutUs: aboutUs !== undefined ? aboutUs : settings.content?.aboutUs || '',
    returnPolicy: returnPolicy !== undefined ? returnPolicy : settings.content?.returnPolicy || '',
    privacyPolicy: privacyPolicy !== undefined ? privacyPolicy : settings.content?.privacyPolicy || '',
    termsAndConditions: termsAndConditions !== undefined ? termsAndConditions : settings.content?.termsAndConditions || '',
    shippingPolicy: shippingPolicy !== undefined ? shippingPolicy : settings.content?.shippingPolicy || '',
    faq: faq !== undefined ? faq : settings.content?.faq || ''
  };
  
  settings.updatedBy = req.user._id;
  await settings.save();

  console.log('✅ Content pages updated');
  
  res.json({
    success: true,
    message: 'Content pages updated successfully',
    data: { settings }
  });
});

// ==========================================
// UPDATE SEO SETTINGS
// ==========================================
exports.updateSEO = catchAsync(async (req, res, next) => {
  const { seo } = req.body;
  
  console.log('🔍 Updating SEO settings');

  if (!seo) {
    return next(new AppError('SEO data is required', 400));
  }

  const settings = await Settings.updateSettings({
    seo
  }, req.user._id);

  console.log('✅ SEO settings updated');
  
  res.json({
    success: true,
    message: 'SEO settings updated successfully',
    data: { settings }
  });
});

// ==========================================
// UPDATE NOTIFICATION SETTINGS
// ==========================================
exports.updateNotificationSettings = catchAsync(async (req, res, next) => {
  const { notifications } = req.body;
  
  console.log('🔔 Updating notification settings');

  if (!notifications) {
    return next(new AppError('Notification settings data is required', 400));
  }

  const settings = await Settings.updateSettings({
    notifications
  }, req.user._id);

  console.log('✅ Notification settings updated');
  
  res.json({
    success: true,
    message: 'Notification settings updated successfully',
    data: { settings }
  });
});

// ==========================================
// UPDATE MAINTENANCE MODE
// ==========================================
exports.updateMaintenanceMode = catchAsync(async (req, res, next) => {
  const { maintenanceMode } = req.body;
  
  console.log('🔧 Updating maintenance mode');

  if (!maintenanceMode) {
    return next(new AppError('Maintenance mode data is required', 400));
  }

  const settings = await Settings.updateSettings({
    maintenanceMode
  }, req.user._id);

  console.log('✅ Maintenance mode updated');
  
  res.json({
    success: true,
    message: 'Maintenance mode updated successfully',
    data: { settings }
  });
});

// ==========================================
// BULK UPDATE SETTINGS
// ==========================================
exports.bulkUpdateSettings = catchAsync(async (req, res, next) => {
  const updateData = req.body;
  
  console.log('📦 Bulk updating settings');

  // Remove sensitive fields that shouldn't be updated this way
  delete updateData.isActive;
  delete updateData._id;
  delete updateData.createdAt;
  delete updateData.updatedAt;

  const settings = await Settings.updateSettings(updateData, req.user._id);

  // Clear delivery cache if service exists
  if (deliveryFeeService && deliveryFeeService.clearLocationCache) {
    deliveryFeeService.clearLocationCache();
  }

  console.log('✅ Settings bulk updated successfully');
  
  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: { settings }
  });
});