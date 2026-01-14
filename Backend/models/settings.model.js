// ============================================
// Backend/models/settings.model.js
// Perfect Settings Model - E-commerce Platform
// ============================================

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // ==========================================
  // STORE INFORMATION
  // ==========================================
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    default: 'JUMLAYA'
  },
  storeLogo: {
    type: String,
    default: ''
  },
  favicon: {
    type: String,
    default: ''
  },
  storeEmail: {
    type: String,
    required: [true, 'Store email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  storePhone: {
    type: String,
    required: [true, 'Store phone is required'],
    trim: true
  },
  storeAddress: {
    type: String,
    required: [true, 'Store address is required'],
    trim: true
  },
  
  // Store Location (for delivery distance calculations)
  storeLocation: {
    latitude: {
      type: Number,
      required: true,
      default: 27.6745, // Patan, Nepal
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      default: 85.3240, // Patan, Nepal
      min: -180,
      max: 180
    },
    address: {
      type: String,
      default: 'Patan, Nepal'
    },
    landmark: {
      type: String,
      default: ''
    }
  },

  // Support Contact
  supportEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid support email']
  },
  supportPhone: {
    type: String,
    trim: true
  },

  // Business Registration
  panNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  vatNumber: {
    type: String,
    trim: true,
    uppercase: true
  },

  // ==========================================
  // CURRENCY & TAX SETTINGS
  // ==========================================
  currency: {
    type: String,
    default: 'रु',
    trim: true
  },
  currencyCode: {
    type: String,
    default: 'NPR',
    uppercase: true,
    trim: true
  },
  currencySymbol: {
    type: String,
    default: 'Rs.',
    trim: true
  },
  taxRate: {
    type: Number,
    default: 13,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%']
  },
  taxEnabled: {
    type: Boolean,
    default: true
  },

  // ==========================================
  // PRICING & ORDER LIMITS
  // ==========================================
  minOrderAmount: {
    type: Number,
    default: 100,
    min: [0, 'Minimum order amount cannot be negative']
  },
  maxOrderAmount: {
    type: Number,
    default: 100000,
    min: [0, 'Maximum order amount cannot be negative']
  },

  // ==========================================
  // DELIVERY SETTINGS
  // ==========================================
  deliverySettings: {
    // Standard shipping fee
    shippingFee: {
      type: Number,
      default: 100,
      min: [0, 'Shipping fee cannot be negative']
    },
    
    // Free shipping threshold (order amount)
    freeShippingThreshold: {
      type: Number,
      default: 2000,
      min: [0, 'Free shipping threshold cannot be negative']
    },
    
    // Free delivery distance (in km)
    freeDeliveryDistance: {
      type: Number,
      default: 5,
      min: [0, 'Free delivery distance cannot be negative']
    },
    
    // Maximum delivery distance (in km)
    maxDeliveryDistance: {
      type: Number,
      default: 50,
      min: [1, 'Maximum delivery distance must be at least 1km']
    },
    
    // Per km delivery charge (beyond free distance)
    perKmCharge: {
      type: Number,
      default: 20,
      min: [0, 'Per km charge cannot be negative']
    },
    
    // Estimated delivery time
    estimatedDeliveryDays: {
      min: {
        type: Number,
        default: 3,
        min: 1
      },
      max: {
        type: Number,
        default: 5,
        min: 1
      }
    }
  },

  // ==========================================
  // PAYMENT METHODS
  // ==========================================
  paymentMethods: {
    cod: {
      enabled: { type: Boolean, default: true },
      name: { type: String, default: 'Cash on Delivery' },
      description: { type: String, default: 'Pay when you receive your order' }
    },
    esewa: {
      enabled: { type: Boolean, default: false },
      merchantId: { type: String, default: '', trim: true },
      secretKey: { type: String, default: '', select: false }
    },
    khalti: {
      enabled: { type: Boolean, default: false },
      publicKey: { type: String, default: '', trim: true },
      secretKey: { type: String, default: '', select: false }
    },
    stripe: {
      enabled: { type: Boolean, default: false },
      publishableKey: { type: String, default: '', trim: true },
      secretKey: { type: String, default: '', select: false }
    },
    bankTransfer: {
      enabled: { type: Boolean, default: false },
      accountDetails: { type: String, default: '' },
      instructions: { type: String, default: '' }
    }
  },

  // ==========================================
  // EMAIL CONFIGURATION
  // ==========================================
  emailSettings: {
    smtpHost: {
      type: String,
      trim: true
    },
    smtpPort: {
      type: Number,
      min: 1,
      max: 65535
    },
    smtpUser: {
      type: String,
      trim: true
    },
    smtpPass: {
      type: String,
      select: false
    },
    fromEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    fromName: {
      type: String,
      trim: true
    },
    replyToEmail: {
      type: String,
      trim: true,
      lowercase: true
    }
  },

  // ==========================================
  // SOCIAL MEDIA LINKS
  // ==========================================
  socialMedia: {
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    twitter: { type: String, trim: true },
    youtube: { type: String, trim: true },
    tiktok: { type: String, trim: true },
    linkedin: { type: String, trim: true }
  },

  // ==========================================
  // BUSINESS HOURS
  // ==========================================
  businessHours: {
    monday: { 
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' }
    },
    tuesday: { 
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' }
    },
    wednesday: { 
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' }
    },
    thursday: { 
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' }
    },
    friday: { 
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' }
    },
    saturday: { 
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' }
    },
    sunday: { 
      isOpen: { type: Boolean, default: false },
      open: { type: String, default: '10:00' },
      close: { type: String, default: '16:00' }
    }
  },

  // ==========================================
  // CONTENT PAGES
  // ==========================================
  content: {
    aboutUs: { type: String, default: '' },
    returnPolicy: { 
      type: String, 
      default: 'Items can be returned within 7 days of delivery in original condition.' 
    },
    privacyPolicy: { type: String, default: '' },
    termsAndConditions: { type: String, default: '' },
    shippingPolicy: { 
      type: String, 
      default: 'Free shipping on orders above threshold. Standard delivery takes 3-5 business days.' 
    },
    faq: { type: String, default: '' }
  },

  // ==========================================
  // SEO SETTINGS
  // ==========================================
  seo: {
    metaTitle: { 
      type: String, 
      maxlength: [60, 'Meta title should not exceed 60 characters']
    },
    metaDescription: { 
      type: String, 
      maxlength: [160, 'Meta description should not exceed 160 characters']
    },
    metaKeywords: {
      type: [String],
      default: []
    },
    ogImage: { type: String },
    siteName: { type: String },
    twitterHandle: { type: String }
  },

  // ==========================================
  // NOTIFICATION SETTINGS
  // ==========================================
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    orderNotifications: { type: Boolean, default: true },
    lowStockAlerts: { type: Boolean, default: true },
    customerMessages: { type: Boolean, default: false },
    marketingEmails: { type: Boolean, default: false },
    smsNotifications: { type: Boolean, default: false }
  },

  // ==========================================
  // MAINTENANCE MODE
  // ==========================================
  maintenanceMode: {
    enabled: { type: Boolean, default: false },
    message: { 
      type: String, 
      default: 'We are currently under maintenance. Please check back soon.' 
    },
    allowedIPs: {
      type: [String],
      default: []
    }
  },

  // ==========================================
  // SYSTEM SETTINGS
  // ==========================================
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==========================================
// INDEXES
// ==========================================
settingsSchema.index({ isActive: 1 });
settingsSchema.index({ createdAt: -1 });

// ==========================================
// VIRTUAL PROPERTIES
// ==========================================

// Check if store is currently open
settingsSchema.virtual('isStoreOpen').get(function() {
  const now = new Date();
  const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const daySettings = this.businessHours[currentDay];
  
  if (!daySettings || !daySettings.isOpen) return false;
  
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return currentTime >= daySettings.open && currentTime <= daySettings.close;
});

// ==========================================
// INSTANCE METHODS
// ==========================================

// Update store location
settingsSchema.methods.updateStoreLocation = function(latitude, longitude, address, landmark) {
  this.storeLocation = {
    latitude,
    longitude,
    address: address || this.storeLocation.address,
    landmark: landmark || this.storeLocation.landmark
  };
  return this.save();
};

// Calculate delivery charge based on distance
settingsSchema.methods.calculateDeliveryCharge = function(distanceInKm, orderAmount) {
  const { deliverySettings } = this;
  
  // Check if order qualifies for free shipping based on amount
  if (orderAmount >= deliverySettings.freeShippingThreshold) {
    return 0;
  }
  
  // Check if distance is within free delivery range
  if (distanceInKm <= deliverySettings.freeDeliveryDistance) {
    return deliverySettings.shippingFee;
  }
  
  // Check if distance exceeds maximum delivery distance
  if (distanceInKm > deliverySettings.maxDeliveryDistance) {
    return null; // Cannot deliver
  }
  
  // Calculate charge: base fee + (extra distance * per km charge)
  const extraDistance = distanceInKm - deliverySettings.freeDeliveryDistance;
  return deliverySettings.shippingFee + (extraDistance * deliverySettings.perKmCharge);
};

// Check if delivery is available to a location
settingsSchema.methods.isDeliveryAvailable = function(distanceInKm) {
  return distanceInKm <= this.deliverySettings.maxDeliveryDistance;
};

// Get enabled payment methods
settingsSchema.methods.getEnabledPaymentMethods = function() {
  const enabled = [];
  for (const [key, value] of Object.entries(this.paymentMethods)) {
    if (value.enabled) {
      enabled.push({
        id: key,
        name: value.name || key.toUpperCase(),
        description: value.description || ''
      });
    }
  }
  return enabled;
};

// ==========================================
// STATIC METHODS
// ==========================================

// Get active settings (or create default)
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ isActive: true });
  
  if (!settings) {
    settings = await this.create({
      storeName: 'JUMLAYA',
      storeEmail: 'info@jumlaya.com',
      storePhone: '+977-9800000000',
      storeAddress: 'Patan, Nepal',
      supportEmail: 'support@jumlaya.com',
      supportPhone: '+977-9800000000',
      storeLocation: {
        latitude: 27.6745,
        longitude: 85.3240,
        address: 'Patan, Nepal'
      },
      currency: 'रु',
      currencyCode: 'NPR',
      taxRate: 13,
      deliverySettings: {
        shippingFee: 100,
        freeShippingThreshold: 2000,
        freeDeliveryDistance: 5,
        maxDeliveryDistance: 50,
        perKmCharge: 20
      },
      isActive: true
    });
  }
  
  return settings;
};

// Update settings
settingsSchema.statics.updateSettings = async function(updates, userId) {
  let settings = await this.findOne({ isActive: true });
  
  if (!settings) {
    settings = await this.create({ ...updates, updatedBy: userId });
  } else {
    // Don't allow updating sensitive fields directly
    delete updates.isActive;
    delete updates._id;
    
    Object.assign(settings, updates);
    settings.updatedBy = userId;
    await settings.save();
  }
  
  return settings;
};

// ==========================================
// MIDDLEWARE
// ==========================================

// Pre-save validation
settingsSchema.pre('save', function(next) {
  // Ensure max order amount is greater than min order amount
  if (this.maxOrderAmount <= this.minOrderAmount) {
    return next(new Error('Maximum order amount must be greater than minimum order amount'));
  }
  
  // Ensure free delivery distance is less than max delivery distance
  if (this.deliverySettings.freeDeliveryDistance >= this.deliverySettings.maxDeliveryDistance) {
    return next(new Error('Free delivery distance must be less than maximum delivery distance'));
  }
  
  next();
});

// ==========================================
// MODEL EXPORT
// ==========================================

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;