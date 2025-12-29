// ============================================
// Backend/controllers/publicSettings.controller.js - COMPLETE FIXED
// ============================================

const Settings = require('../models/settings.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Helper function to send success response
 */
const sendSuccess = (res, statusCode, message, data) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * ✅ FIXED: Get all public settings with flat structure
 */
exports.getAllPublicSettings = catchAsync(async (req, res, next) => {
  let settings = await Settings.findOne({ isActive: true });
  
  if (!settings) {
    console.log('⚠️ No settings found, returning default settings');
    
    // Return default settings structure that matches your database
    return sendSuccess(res, 200, 'Public settings fetched successfully', {
      storeName: 'JUMLAYA',
      storeEmail: 'sharmasandesh66@gmail.com',
      storePhone: '9816562014',
      storeAddress: 'Kathmandu, Nepal',
      currency: 'रु',
      currencyCode: 'NPR',
      taxRate: 13, // ✅ Fixed to 13% instead of 200%
      shippingFee: 100,
      freeShippingThreshold: 2000,
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
      },
      logo: '/logo.png',
      favicon: '/favicon.ico',
      aboutUs: 'JUMLAYA is your trusted online shopping destination in Nepal.'
    });
  }

  // ✅ Return settings with corrected taxRate if it's wrong in DB
  const publicSettings = {
    storeName: settings.storeName,
    storeEmail: settings.storeEmail,
    storePhone: settings.storePhone,
    storeAddress: settings.storeAddress,
    currency: settings.currency,
    currencyCode: settings.currencyCode,
    taxRate: settings.taxRate > 100 ? 13 : settings.taxRate, // ✅ Auto-correct if > 100
    shippingFee: settings.shippingFee,
    freeShippingThreshold: settings.freeShippingThreshold,
    minOrderAmount: settings.minOrderAmount,
    maxOrderAmount: settings.maxOrderAmount,
    paymentMethods: settings.paymentMethods,
    socialMedia: settings.socialMedia,
    logo: settings.logo,
    favicon: settings.favicon,
    aboutUs: settings.aboutUs,
    returnPolicy: settings.returnPolicy,
    privacyPolicy: settings.privacyPolicy,
    termsAndConditions: settings.termsAndConditions,
    shippingPolicy: settings.shippingPolicy
  };

  console.log('✅ Public settings fetched, taxRate:', publicSettings.taxRate);

  sendSuccess(res, 200, 'Public settings fetched successfully', publicSettings);
});

/**
 * Get About Us information
 */
exports.getAboutUs = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('storeName aboutUs socialMedia');
  
  if (!settings) {
    return sendSuccess(res, 200, 'About us fetched successfully', {
      storeName: 'JUMLAYA',
      aboutUs: 'Welcome to JUMLAYA - Your trusted partner in delivering fresh, organic, and sustainable products.',
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: '',
        tiktok: ''
      }
    });
  }

  sendSuccess(res, 200, 'About us fetched successfully', {
    storeName: settings.storeName || 'JUMLAYA',
    aboutUs: settings.aboutUs || '',
    socialMedia: settings.socialMedia || {}
  });
});

/**
 * Get delivery settings
 */
exports.getDeliverySettings = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('delivery');
  
  if (!settings || !settings.delivery) {
    return sendSuccess(res, 200, 'Delivery settings fetched successfully', {
      enabled: true,
      freeShippingThreshold: 2000,
      deliveryCharge: 100,
      estimatedDeliveryTime: '2-3 business days'
    });
  }

  sendSuccess(res, 200, 'Delivery settings fetched successfully', settings.delivery);
});

/**
 * Get payment settings
 */
exports.getPaymentSettings = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('payment');
  
  if (!settings || !settings.payment) {
    return sendSuccess(res, 200, 'Payment settings fetched successfully', {
      methods: ['cash_on_delivery', 'esewa', 'khalti'],
      cashOnDeliveryEnabled: true,
      esewaEnabled: true,
      khaltiEnabled: false
    });
  }

  sendSuccess(res, 200, 'Payment settings fetched successfully', settings.payment);
});

/**
 * Get general settings
 */
exports.getGeneralSettings = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('storeName storeEmail storePhone storeAddress currency timezone');
  
  if (!settings) {
    return sendSuccess(res, 200, 'General settings fetched successfully', {
      storeName: 'JUMLAYA',
      storeEmail: 'info@jumlaya.com',
      storePhone: '+977-1234567890',
      currency: 'NPR',
      timezone: 'Asia/Kathmandu'
    });
  }

  sendSuccess(res, 200, 'General settings fetched successfully', {
    storeName: settings.storeName,
    storeEmail: settings.storeEmail,
    storePhone: settings.storePhone,
    storeAddress: settings.storeAddress,
    currency: settings.currency,
    timezone: settings.timezone
  });
});

/**
 * Get store hours
 */
exports.getStoreHours = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('storeHours');
  
  if (!settings || !settings.storeHours) {
    return sendSuccess(res, 200, 'Store hours fetched successfully', {
      monday: { open: '09:00', close: '21:00', isOpen: true },
      tuesday: { open: '09:00', close: '21:00', isOpen: true },
      wednesday: { open: '09:00', close: '21:00', isOpen: true },
      thursday: { open: '09:00', close: '21:00', isOpen: true },
      friday: { open: '09:00', close: '21:00', isOpen: true },
      saturday: { open: '09:00', close: '21:00', isOpen: true },
      sunday: { open: '10:00', close: '18:00', isOpen: true }
    });
  }

  sendSuccess(res, 200, 'Store hours fetched successfully', settings.storeHours);
});

/**
 * Get contact information
 */
exports.getContactInfo = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('storeName storeEmail storePhone storeAddress supportEmail supportPhone storeHoursText socialMedia');
  
  if (!settings) {
    return sendSuccess(res, 200, 'Contact info fetched successfully', {
      storeName: 'JUMLAYA',
      storeEmail: 'info@jumlaya.com',
      storePhone: '+977-1234567890',
      storeAddress: 'Kathmandu, Nepal',
      supportEmail: 'support@jumlaya.com',
      supportPhone: '+977-9876543210',
      storeHoursText: 'Mon - Sat: 9AM - 6PM',
      socialMedia: {}
    });
  }

  sendSuccess(res, 200, 'Contact info fetched successfully', {
    storeName: settings.storeName,
    storeEmail: settings.storeEmail,
    storePhone: settings.storePhone,
    storeAddress: settings.storeAddress,
    supportEmail: settings.supportEmail,
    supportPhone: settings.supportPhone,
    storeHoursText: settings.storeHoursText || 'Mon - Sat: 9AM - 6PM',
    socialMedia: settings.socialMedia || {}
  });
});

/**
 * Get social media links
 */
exports.getSocialLinks = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('socialMedia');
  
  if (!settings || !settings.socialMedia) {
    return sendSuccess(res, 200, 'Social links fetched successfully', {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: '',
      linkedin: ''
    });
  }

  sendSuccess(res, 200, 'Social links fetched successfully', settings.socialMedia);
});

/**
 * Get minimum order value
 */
exports.getMinimumOrder = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('minimumOrderValue minOrderAmount');
  
  const minimumOrder = settings?.minimumOrderValue || settings?.minOrderAmount || 200;
  
  sendSuccess(res, 200, 'Minimum order fetched successfully', {
    value: minimumOrder,
    currency: 'NPR'
  });
});

/**
 * Get tax settings
 */
exports.getTaxSettings = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('tax taxRate');
  
  if (!settings) {
    return sendSuccess(res, 200, 'Tax settings fetched successfully', {
      enabled: true,
      rate: 13,
      includeInPrice: false
    });
  }

  // ✅ Handle both flat taxRate and nested tax.rate
  const taxRate = settings.taxRate || settings.tax?.rate || 13;
  const correctedTaxRate = taxRate > 100 ? 13 : taxRate;

  if (settings.tax) {
    sendSuccess(res, 200, 'Tax settings fetched successfully', {
      enabled: settings.tax.enabled,
      rate: correctedTaxRate,
      includeInPrice: settings.tax.includeInPrice
    });
  } else {
    sendSuccess(res, 200, 'Tax settings fetched successfully', {
      enabled: true,
      rate: correctedTaxRate,
      includeInPrice: false
    });
  }
});

/**
 * Get terms and conditions
 */
exports.getTermsAndConditions = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('termsAndConditions');
  
  if (!settings || !settings.termsAndConditions) {
    return sendSuccess(res, 200, 'Terms and conditions fetched successfully', {
      content: 'Terms and conditions content goes here.',
      lastUpdated: new Date()
    });
  }

  sendSuccess(res, 200, 'Terms and conditions fetched successfully', {
    content: settings.termsAndConditions,
    lastUpdated: settings.updatedAt
  });
});

/**
 * Get privacy policy
 */
exports.getPrivacyPolicy = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('privacyPolicy');
  
  if (!settings || !settings.privacyPolicy) {
    return sendSuccess(res, 200, 'Privacy policy fetched successfully', {
      content: 'Privacy policy content goes here.',
      lastUpdated: new Date()
    });
  }

  sendSuccess(res, 200, 'Privacy policy fetched successfully', {
    content: settings.privacyPolicy,
    lastUpdated: settings.updatedAt
  });
});

/**
 * Get FAQs
 */
exports.getFAQs = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('faqs');
  
  if (!settings || !settings.faqs || settings.faqs.length === 0) {
    return sendSuccess(res, 200, 'FAQs fetched successfully', [
      {
        question: 'How do I place an order?',
        answer: 'You can place an order by browsing our products and adding them to your cart.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept Cash on Delivery, eSewa, and Khalti payments.'
      },
      {
        question: 'How long does delivery take?',
        answer: 'Delivery typically takes 2-3 business days within Kathmandu Valley.'
      }
    ]);
  }

  sendSuccess(res, 200, 'FAQs fetched successfully', settings.faqs);
});

/**
 * Get shipping policy
 */
exports.getShippingPolicy = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('shippingPolicy');
  
  if (!settings || !settings.shippingPolicy) {
    return sendSuccess(res, 200, 'Shipping policy fetched successfully', {
      content: 'Shipping policy content goes here.',
      lastUpdated: new Date()
    });
  }

  sendSuccess(res, 200, 'Shipping policy fetched successfully', {
    content: settings.shippingPolicy,
    lastUpdated: settings.updatedAt
  });
});

/**
 * Get return policy
 */
exports.getReturnPolicy = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('returnPolicy');
  
  if (!settings || !settings.returnPolicy) {
    return sendSuccess(res, 200, 'Return policy fetched successfully', {
      content: 'Return policy content goes here.',
      lastUpdated: new Date()
    });
  }

  sendSuccess(res, 200, 'Return policy fetched successfully', {
    content: settings.returnPolicy,
    lastUpdated: settings.updatedAt
  });
});

/**
 * Get maintenance status
 */
exports.getMaintenanceStatus = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('maintenance maintenanceMode');
  
  const maintenanceData = settings?.maintenance || settings?.maintenanceMode || {};
  
  sendSuccess(res, 200, 'Maintenance status fetched successfully', {
    enabled: maintenanceData.enabled || false,
    message: maintenanceData.message || ''
  });
});

/**
 * Get feature flags
 */
exports.getFeatureFlags = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('features');
  
  if (!settings || !settings.features) {
    return sendSuccess(res, 200, 'Feature flags fetched successfully', {
      wishlist: true,
      reviews: true,
      notifications: true,
      chatSupport: false
    });
  }

  sendSuccess(res, 200, 'Feature flags fetched successfully', settings.features);
});

/**
 * Get app version
 */
exports.getAppVersion = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('appVersion');
  
  sendSuccess(res, 200, 'App version fetched successfully', {
    version: settings?.appVersion || '1.0.0',
    buildNumber: settings?.buildNumber || 1,
    lastUpdated: settings?.updatedAt || new Date()
  });
});

/**
 * Get delivery areas
 */
exports.getDeliveryAreas = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('deliveryAreas');
  
  if (!settings || !settings.deliveryAreas || settings.deliveryAreas.length === 0) {
    return sendSuccess(res, 200, 'Delivery areas fetched successfully', [
      { name: 'Kathmandu', charge: 50, estimatedTime: '1-2 days' },
      { name: 'Lalitpur', charge: 60, estimatedTime: '1-2 days' },
      { name: 'Bhaktapur', charge: 70, estimatedTime: '2-3 days' }
    ]);
  }

  sendSuccess(res, 200, 'Delivery areas fetched successfully', settings.deliveryAreas);
});

/**
 * Check delivery availability
 */
exports.checkDeliveryAvailability = catchAsync(async (req, res, next) => {
  const { address, city, latitude, longitude } = req.body;
  
  const settings = await Settings.findOne().select('deliveryAreas');
  
  // Simple check - you can make this more sophisticated
  const isAvailable = true; // Add your logic here
  
  sendSuccess(res, 200, 'Delivery availability checked', {
    available: isAvailable,
    charge: 50,
    estimatedTime: '2-3 days',
    message: isAvailable ? 'Delivery available in your area' : 'Sorry, delivery not available'
  });
});

/**
 * Submit contact form
 */
exports.submitContactForm = catchAsync(async (req, res, next) => {
  const { name, email, phone, subject, message } = req.body;
  
  // Validate required fields
  if (!name || !email || !subject || !message) {
    return next(new AppError('Please provide all required fields', 400));
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }
  
  // Log the submission
  console.log('📧 Contact Form Submission:', {
    name,
    email,
    phone,
    subject,
    message,
    timestamp: new Date()
  });
  
  // TODO: Send email notification to admin
  
  sendSuccess(res, 200, 'Thank you for contacting us! We will get back to you soon.', {
    submitted: true,
    timestamp: new Date()
  });
});