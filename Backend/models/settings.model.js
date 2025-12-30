// ============================================
// STEP 1: Update Settings Model
// Backend/models/settings.model.js
// ============================================

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Store Information
  storeName: { type: String, required: true, default: 'JUMLAYA' },
  storeLogo: { type: String, default: '' }, // NEW: Store logo path
  storeEmail: { type: String, required: true },
  storePhone: { type: String, required: true },
  storeAddress: { type: String, required: true },
  
  // Support Contact
  supportEmail: { type: String, default: '' },
  supportPhone: { type: String, default: '' },
  
  // Business Registration
  panNumber: { type: String, default: '' },
  vatNumber: { type: String, default: '' },
  
  // Currency & Pricing
  currency: { type: String, default: 'रु' },
  currencyCode: { type: String, default: 'NPR' },
  taxRate: { type: Number, default: 13 },
  shippingFee: { type: Number, default: 100 },
  freeShippingThreshold: { type: Number, default: 2000 },
  minOrderAmount: { type: Number, default: 100 },
  maxOrderAmount: { type: Number, default: 100000 },
  
  // Payment Methods
  paymentMethods: {
    cod: {
      enabled: { type: Boolean, default: true },
      name: { type: String, default: 'Cash on Delivery' }
    },
    esewa: {
      enabled: { type: Boolean, default: false },
      merchantId: { type: String, default: '' }
    },
    khalti: {
      enabled: { type: Boolean, default: false },
      publicKey: { type: String, default: '' }
    },
    bankTransfer: {
      enabled: { type: Boolean, default: false },
      accountDetails: { type: String, default: '' }
    }
  },
  
  // Social Media
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
    tiktok: { type: String, default: '' }
  },
  
  // Content Pages
  aboutUs: { type: String, default: '' },
  returnPolicy: { type: String, default: '' },
  privacyPolicy: { type: String, default: '' },
  termsAndConditions: { type: String, default: '' },
  shippingPolicy: { type: String, default: '' },
  
  // SEO
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    metaKeywords: { type: String, default: '' },
    ogImage: { type: String, default: '' }
  },
  
  // Notifications
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    orderNotifications: { type: Boolean, default: true },
    lowStockAlerts: { type: Boolean, default: true },
    customerMessages: { type: Boolean, default: false }
  },
  
  // Maintenance Mode
  maintenanceMode: {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// ============================================
// STATIC METHODS
// ============================================

settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ isActive: true });
  if (!settings) {
    settings = await this.create({
      storeName: 'JUMLAYA',
      storeEmail: 'info@jumlaya.com',
      storePhone: '+977-9800000000',
      storeAddress: 'Kathmandu, Nepal',
      supportEmail: 'support@jumlaya.com',
      supportPhone: '+977-9800000000',
      currency: 'रु',
      currencyCode: 'NPR',
      taxRate: 13,
      shippingFee: 100,
      freeShippingThreshold: 2000,
      isActive: true,
      returnPolicy: 'Items can be returned within 7 days of delivery in original condition.',
      shippingPolicy: 'Free shipping on orders above रु 2000. Standard delivery takes 3-5 business days.'
    });
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function(updates) {
  let settings = await this.findOne({ isActive: true });
  if (!settings) {
    settings = await this.create(updates);
  } else {
    Object.assign(settings, updates);
    await settings.save();
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;