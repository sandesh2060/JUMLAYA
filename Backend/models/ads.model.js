// ============================================================================
// FILE: Backend/models/ads.model.js
// ============================================================================

const mongoose = require('mongoose');

const adsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Ad title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['offer', 'festival', 'greeting', 'promotion'],
    required: [true, 'Ad type is required']
  },
  posterImage: {
    type: String,
    required: [true, 'Poster image is required']
  },
  cardImage: {
    type: String
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  discount: {
    type: Number,
    min: 0,
    max: 100
  },
  couponCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required']
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  targetAudience: {
    type: String,
    enum: ['all', 'new_users', 'existing_users', 'premium_users'],
    default: 'all'
  },
  clickCount: {
    type: Number,
    default: 0
  },
  impressionCount: {
    type: Number,
    default: 0
  },
  buttonText: {
    type: String,
    default: 'Shop Now'
  },
  buttonLink: {
    type: String,
    default: '/products'
  },
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  textColor: {
    type: String,
    default: '#000000'
  }
}, {
  timestamps: true
});

adsSchema.index({ isActive: 1, validFrom: 1, validUntil: 1, priority: -1 });

adsSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validUntil >= now;
});

adsSchema.methods.incrementImpression = async function() {
  this.impressionCount += 1;
  return this.save();
};

adsSchema.methods.incrementClick = async function() {
  this.clickCount += 1;
  return this.save();
};

adsSchema.statics.getActiveAds = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  }).sort({ priority: -1, createdAt: -1 });
};

module.exports = mongoose.model('Ad', adsSchema);
