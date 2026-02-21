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
 * ✅ FIXED: Get all public settings with correct field names
 */
exports.getAllPublicSettings = catchAsync(async (req, res, next) => {
  let settings = await Settings.findOne({ isActive: true });
  
  if (!settings) {
    console.log('⚠️ No settings found, returning default settings');
    
    return sendSuccess(res, 200, 'Public settings fetched successfully', {
      storeName: 'JUMLAYA',
      storeEmail: 'sharmasandesh66@gmail.com',
      storePhone: '9816562014',
      storeAddress: 'Kathmandu, Nepal',
      currency: 'रु',
      currencyCode: 'NPR',
      taxRate: 13,
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
      // ✅ FIX: Always send both field names for compatibility, fallback to local logo
      storeLogo: '/logo.png',
      logo: '/logo.png',
      favicon: '/favicon.ico',
      aboutUs: 'JUMLAYA is your trusted online shopping destination in Nepal.'
    });
  }

  // ✅ FIX: Use settings.storeLogo (correct model field name)
  // Fall back to local /logo.png if Cloudinary URL is missing or empty
  const resolvedLogo = settings.storeLogo || '/logo.png';

  const publicSettings = {
    storeName: settings.storeName,
    storeEmail: settings.storeEmail,
    storePhone: settings.storePhone,
    storeAddress: settings.storeAddress,
    currency: settings.currency,
    currencyCode: settings.currencyCode,
    taxRate: settings.taxRate > 100 ? 13 : settings.taxRate,
    shippingFee: settings.deliverySettings?.shippingFee || settings.shippingFee || 100,
    freeShippingThreshold: settings.deliverySettings?.freeShippingThreshold || settings.freeShippingThreshold || 2000,
    minOrderAmount: settings.minOrderAmount,
    maxOrderAmount: settings.maxOrderAmount,
    paymentMethods: settings.paymentMethods,
    socialMedia: settings.socialMedia,
    // ✅ FIX: Send both field names so Navbar works regardless of which it checks
    storeLogo: resolvedLogo,
    logo: resolvedLogo,
    favicon: settings.favicon || '/favicon.ico',
    aboutUs: settings.content?.aboutUs || settings.aboutUs || '',
    returnPolicy: settings.content?.returnPolicy || settings.returnPolicy || '',
    privacyPolicy: settings.content?.privacyPolicy || settings.privacyPolicy || '',
    termsAndConditions: settings.content?.termsAndConditions || settings.termsAndConditions || '',
    shippingPolicy: settings.content?.shippingPolicy || settings.shippingPolicy || ''
  };

  console.log('✅ Public settings fetched, storeLogo:', publicSettings.storeLogo);
  sendSuccess(res, 200, 'Public settings fetched successfully', publicSettings);
});

/**
 * Get About Us information
 */
exports.getAboutUs = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('storeName content aboutUs socialMedia');
  
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
    aboutUs: settings.content?.aboutUs || settings.aboutUs || '',
    socialMedia: settings.socialMedia || {}
  });
});

/**
 * Get delivery settings
 */
exports.getDeliverySettings = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('deliverySettings');
  
  if (!settings || !settings.deliverySettings) {
    return sendSuccess(res, 200, 'Delivery settings fetched successfully', {
      enabled: true,
      freeShippingThreshold: 2000,
      deliveryCharge: 100,
      estimatedDeliveryTime: '2-3 business days'
    });
  }

  sendSuccess(res, 200, 'Delivery settings fetched successfully', settings.deliverySettings);
});

/**
 * Get payment settings
 */
exports.getPaymentSettings = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('paymentMethods');
  
  if (!settings || !settings.paymentMethods) {
    return sendSuccess(res, 200, 'Payment settings fetched successfully', {
      methods: ['cash_on_delivery', 'esewa', 'khalti'],
      cashOnDeliveryEnabled: true,
      esewaEnabled: true,
      khaltiEnabled: false
    });
  }

  sendSuccess(res, 200, 'Payment settings fetched successfully', settings.paymentMethods);
});

/**
 * Get general settings
 */
exports.getGeneralSettings = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('storeName storeEmail storePhone storeAddress currency');
  
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
    timezone: 'Asia/Kathmandu'
  });
});

/**
 * Get store hours
 */
exports.getStoreHours = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('businessHours');
  
  if (!settings || !settings.businessHours) {
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

  sendSuccess(res, 200, 'Store hours fetched successfully', settings.businessHours);
});

/**
 * Get contact information
 */
exports.getContactInfo = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('storeName storeEmail storePhone storeAddress supportEmail supportPhone socialMedia');
  
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
    storeHoursText: 'Mon - Sat: 9AM - 6PM',
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
  const settings = await Settings.findOne().select('minOrderAmount');
  
  const minimumOrder = settings?.minOrderAmount || 200;
  
  sendSuccess(res, 200, 'Minimum order fetched successfully', {
    value: minimumOrder,
    currency: 'NPR'
  });
});

/**
 * Get tax settings
 */
exports.getTaxSettings = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('taxRate taxEnabled');
  
  if (!settings) {
    return sendSuccess(res, 200, 'Tax settings fetched successfully', {
      enabled: true,
      rate: 13,
      includeInPrice: false
    });
  }

  const taxRate = settings.taxRate || 13;
  const correctedTaxRate = taxRate > 100 ? 13 : taxRate;

  sendSuccess(res, 200, 'Tax settings fetched successfully', {
    enabled: settings.taxEnabled !== false,
    rate: correctedTaxRate,
    includeInPrice: false
  });
});

/**
 * Get terms and conditions
 */
exports.getTermsAndConditions = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('content');
  
  if (!settings || !settings.content?.termsAndConditions) {
    return sendSuccess(res, 200, 'Terms and conditions fetched successfully', {
      content: 'Terms and conditions content goes here.',
      lastUpdated: new Date()
    });
  }

  sendSuccess(res, 200, 'Terms and conditions fetched successfully', {
    content: settings.content.termsAndConditions,
    lastUpdated: settings.updatedAt
  });
});

/**
 * Get privacy policy
 */
exports.getPrivacyPolicy = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('content');
  
  if (!settings || !settings.content?.privacyPolicy) {
    return sendSuccess(res, 200, 'Privacy policy fetched successfully', {
      content: 'Privacy policy content goes here.',
      lastUpdated: new Date()
    });
  }

  sendSuccess(res, 200, 'Privacy policy fetched successfully', {
    content: settings.content.privacyPolicy,
    lastUpdated: settings.updatedAt
  });
});

/**
 * Get FAQs
 */
exports.getFAQs = catchAsync(async (req, res, next) => {
  sendSuccess(res, 200, 'FAQs fetched successfully', [
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
});

/**
 * Get shipping policy
 */
exports.getShippingPolicy = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('content');
  
  if (!settings || !settings.content?.shippingPolicy) {
    return sendSuccess(res, 200, 'Shipping policy fetched successfully', {
      content: 'Free shipping on orders above threshold. Standard delivery takes 3-5 business days.',
      lastUpdated: new Date()
    });
  }

  sendSuccess(res, 200, 'Shipping policy fetched successfully', {
    content: settings.content.shippingPolicy,
    lastUpdated: settings.updatedAt
  });
});

/**
 * Get return policy
 */
exports.getReturnPolicy = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('content');
  
  if (!settings || !settings.content?.returnPolicy) {
    return sendSuccess(res, 200, 'Return policy fetched successfully', {
      content: 'Items can be returned within 7 days of delivery in original condition.',
      lastUpdated: new Date()
    });
  }

  sendSuccess(res, 200, 'Return policy fetched successfully', {
    content: settings.content.returnPolicy,
    lastUpdated: settings.updatedAt
  });
});

/**
 * Get maintenance status
 */
exports.getMaintenanceStatus = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().select('maintenanceMode');
  
  const maintenanceData = settings?.maintenanceMode || {};
  
  sendSuccess(res, 200, 'Maintenance status fetched successfully', {
    enabled: maintenanceData.enabled || false,
    message: maintenanceData.message || ''
  });
});

/**
 * Get feature flags
 */
exports.getFeatureFlags = catchAsync(async (req, res, next) => {
  sendSuccess(res, 200, 'Feature flags fetched successfully', {
    wishlist: true,
    reviews: true,
    notifications: true,
    chatSupport: false
  });
});

/**
 * Get app version
 */
exports.getAppVersion = catchAsync(async (req, res, next) => {
  sendSuccess(res, 200, 'App version fetched successfully', {
    version: '1.0.0',
    buildNumber: 1,
    lastUpdated: new Date()
  });
});

/**
 * Get delivery areas
 */
exports.getDeliveryAreas = catchAsync(async (req, res, next) => {
  sendSuccess(res, 200, 'Delivery areas fetched successfully', [
    { name: 'Kathmandu', charge: 50, estimatedTime: '1-2 days' },
    { name: 'Lalitpur', charge: 60, estimatedTime: '1-2 days' },
    { name: 'Bhaktapur', charge: 70, estimatedTime: '2-3 days' }
  ]);
});

/**
 * Check delivery availability
 */
exports.checkDeliveryAvailability = catchAsync(async (req, res, next) => {
  const isAvailable = true;
  
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
  
  if (!name || !email || !subject || !message) {
    return next(new AppError('Please provide all required fields', 400));
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }
  
  console.log('📧 Contact Form Submission:', {
    name, email, phone, subject, message, timestamp: new Date()
  });
  
  sendSuccess(res, 200, 'Thank you for contacting us! We will get back to you soon.', {
    submitted: true,
    timestamp: new Date()
  });
});