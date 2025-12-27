// ============================================
// settings.model.js - Settings Schema
// Path: Backend/models/settings.model.js
// ============================================
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    // ============================================
    // STORE INFORMATION
    // ============================================
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      default: 'JUMLAYA'
    },
    storeEmail: {
      type: String,
      required: [true, 'Store email is required'],
      lowercase: true,
      default: 'admin@jumlaya.com'
    },
    storePhone: {
      type: String,
      required: [true, 'Store phone is required'],
      default: '+977-9800000000'
    },
    storeAddress: {
      type: String,
      required: [true, 'Store address is required'],
      default: 'Kathmandu, Nepal'
    },

    // ============================================
    // BUSINESS SETTINGS
    // ============================================
    currency: {
      type: String,
      default: 'रु'
    },
    currencyCode: {
      type: String,
      default: 'NPR'
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
      default: 100,
      min: 0
    },
    maxOrderAmount: {
      type: Number,
      default: 100000,
      min: 0
    },

    // ============================================
    // PAYMENT METHODS
    // ============================================
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

    // ============================================
    // SOCIAL MEDIA
    // ============================================
    socialMedia: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
      tiktok: { type: String, default: '' }
    },

    // ============================================
    // CONTENT PAGES
    // ============================================
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

    // ============================================
    // SEO SETTINGS
    // ============================================
    seo: {
      metaTitle: {
        type: String,
        default: 'JUMLAYA - Online Shopping in Nepal'
      },
      metaDescription: {
        type: String,
        default: 'Shop the latest products online in Nepal'
      },
      metaKeywords: {
        type: String,
        default: 'online shopping, nepal, ecommerce'
      },
      ogImage: {
        type: String,
        default: ''
      }
    },

    // ============================================
    // NOTIFICATION SETTINGS
    // ============================================
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      orderNotifications: { type: Boolean, default: true },
      lowStockAlerts: { type: Boolean, default: true },
      customerMessages: { type: Boolean, default: false }
    },

    // ============================================
    // MAINTENANCE MODE
    // ============================================
    maintenanceMode: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default: 'We are currently under maintenance. Please check back soon.'
      }
    }
  },
  {
    timestamps: true
  }
);

// ============================================
// ENSURE SINGLE SETTINGS DOCUMENT
// ============================================
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);