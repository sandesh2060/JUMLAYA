// ============================================
// Backend/models/settings.model.js - FIXED
// ✅ Now matches your FLAT database structure
// ============================================

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // ============================================
  // ✅ FLAT STRUCTURE - Matches your database
  // ============================================
  
  // Store Information
  storeName: {
    type: String,
    default: 'JUMLAYA',
    trim: true
  },
  storeEmail: {
    type: String,
    default: 'info@jumlaya.com',
    trim: true,
    lowercase: true
  },
  storePhone: {
    type: String,
    default: '+977-1234567890'
  },
  storeAddress: {
    type: String,
    default: 'Kathmandu, Nepal'
  },
  
  // ✅ FLAT FIELDS - Main settings used by cart
  currency: {
    type: String,
    default: 'रु'
  },
  currencyCode: {
    type: String,
    default: 'NPR',
    enum: ['NPR', 'USD', 'EUR', 'INR']
  },
  taxRate: {
    type: Number,
    default: 13,
    min: 0,
    max: 100
  },
  shippingFee: {
    type: Number,
    default: 100,
    min: 0
  },
  freeShippingThreshold: {
    type: Number,
    default: 2000,
    min: 0
  },
  minOrderAmount: {
    type: Number,
    default: 100
  },
  maxOrderAmount: {
    type: Number,
    default: 100000
  },
  
  // Payment Methods
  paymentMethods: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      cod: { enabled: true },
      esewa: { enabled: true },
      khalti: { enabled: true }
    }
  },
  
  // Social Media
  socialMedia: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: ''
    }
  },
  
  // Branding
  logo: {
    type: String,
    default: '/logo.png'
  },
  favicon: {
    type: String,
    default: '/favicon.ico'
  },
  
  // Content
  aboutUs: {
    type: String,
    default: ''
  },
  returnPolicy: {
    type: String,
    default: ''
  },
  privacyPolicy: {
    type: String,
    default: ''
  },
  termsAndConditions: {
    type: String,
    default: ''
  },
  shippingPolicy: {
    type: String,
    default: ''
  },
  
  // Working Hours
  workingHours: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Notifications
  notifications: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // SEO
  seo: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Maintenance Mode
  maintenanceMode: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      enabled: false,
      message: ''
    }
  },
  
  // Active flag
  isActive: {
    type: Boolean,
    default: true
  },
  
  // ============================================
  // Optional: Nested structures (for backward compatibility)
  // ============================================
  
  supportEmail: String,
  supportPhone: String,
  storeHoursText: String,
  
  storeHours: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  timezone: {
    type: String,
    default: 'Asia/Kathmandu'
  },
  
  delivery: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  shippingMethods: [{
    name: String,
    description: String,
    cost: Number,
    estimatedDays: String,
    isActive: Boolean,
    isFreeShippingEligible: Boolean,
    freeShippingThreshold: Number,
    regions: [String],
    icon: String,
    priority: Number
  }],
  
  deliveryAreas: [{
    name: String,
    charge: Number,
    estimatedTime: String,
    isActive: Boolean
  }],
  
  payment: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  minimumOrderValue: Number,
  
  tax: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  faqs: [{
    question: String,
    answer: String,
    order: Number,
    isActive: Boolean
  }],
  
  maintenance: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  features: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  appVersion: String,
  buildNumber: Number,
  
  email: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  strict: false  // ✅ Allow additional fields not in schema
});

// ============================================
// STATIC METHODS
// ============================================

// Get settings (singleton)
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ isActive: true });
  if (!settings) {
    settings = await this.create({
      storeName: 'JUMLAYA',
      currency: 'रु',
      currencyCode: 'NPR',
      taxRate: 13,
      shippingFee: 100,
      freeShippingThreshold: 2000,
      isActive: true
    });
  }
  return settings;
};

// Update settings (singleton)
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

// ============================================
// INSTANCE METHODS
// ============================================

// Get active shipping methods
settingsSchema.methods.getActiveShippingMethods = function() {
  if (!this.shippingMethods || this.shippingMethods.length === 0) {
    return [{
      name: 'Standard Delivery',
      cost: this.shippingFee || 100,
      estimatedDays: '3-5',
      isActive: true,
      isFreeShippingEligible: true,
      freeShippingThreshold: this.freeShippingThreshold || 2000
    }];
  }
  
  return this.shippingMethods
    .filter(method => method.isActive)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0) || a.cost - b.cost);
};

// Calculate shipping cost
settingsSchema.methods.calculateShippingCost = function(methodId, orderAmount) {
  if (!methodId) {
    // Use flat fields
    return orderAmount >= (this.freeShippingThreshold || 2000) 
      ? 0 
      : (this.shippingFee || 100);
  }
  
  const method = this.shippingMethods?.id(methodId);
  
  if (!method || !method.isActive) {
    return null;
  }
  
  if (method.isFreeShippingEligible && 
      method.freeShippingThreshold && 
      orderAmount >= method.freeShippingThreshold) {
    return 0;
  }
  
  return method.cost;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;