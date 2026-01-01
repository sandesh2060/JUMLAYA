// ============================================================================
// FILE: Backend/models/ads.model.js
// MongoDB schema for landing page popup ads
// ============================================================================

const mongoose = require('mongoose');

const adSchema = new mongoose.Schema(
  {
    // Basic Info
    title: {
      type: String,
      required: [true, 'Ad title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },

    description: {
      type: String,
      required: [true, 'Ad description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },

    type: {
      type: String,
      enum: ['festival', 'discount', 'offer', 'promotion'],
      default: 'promotion',
      required: true
    },

    // Visual Content
    posterImage: {
      type: String,
      required: [true, 'Poster image is required']
    },

    // Offer Details
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Coupon code cannot exceed 20 characters']
    },

    // Scheduling
    validFrom: {
      type: Date,
      required: [true, 'Valid from date is required']
    },

    validUntil: {
      type: Date,
      required: [true, 'Valid until date is required']
    },

    // Priority (1-10, higher = shows first)
    priority: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },

    // CTA Button
    buttonText: {
      type: String,
      trim: true,
      default: 'Shop Now',
      maxlength: [30, 'Button text cannot exceed 30 characters']
    },

    buttonLink: {
      type: String,
      trim: true,
      default: '/products'
    },

    // Status
    isActive: {
      type: Boolean,
      default: true
    },

    // Analytics
    impressionCount: {
      type: Number,
      default: 0,
      min: 0
    },

    clickCount: {
      type: Number,
      default: 0,
      min: 0
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ============================================
// INDEXES
// ============================================

// Compound index for finding active ads efficiently
adSchema.index({ isActive: 1, validFrom: 1, validUntil: 1, priority: -1 });

// Index for analytics queries
adSchema.index({ createdAt: -1 });

// Text search index
adSchema.index({ title: 'text', description: 'text' });

// ============================================
// VIRTUALS
// ============================================

// Check if ad is currently valid based on dates
adSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.validFrom <= now && this.validUntil >= now;
});

// Calculate CTR (Click-Through Rate)
adSchema.virtual('ctr').get(function() {
  if (this.impressionCount === 0) return 0;
  return ((this.clickCount / this.impressionCount) * 100).toFixed(2);
});

// Days remaining
adSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const diffTime = this.validUntil - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// ============================================
// MIDDLEWARE
// ============================================

// Pre-save validation
adSchema.pre('save', function(next) {
  // Ensure validFrom is before validUntil
  if (this.validFrom >= this.validUntil) {
    next(new Error('Valid from date must be before valid until date'));
  }
  
  // Ensure coupon code is uppercase
  if (this.couponCode) {
    this.couponCode = this.couponCode.toUpperCase();
  }
  
  next();
});

// ============================================
// METHODS
// ============================================

// Increment impression count (when ad is shown)
adSchema.methods.incrementImpression = async function() {
  this.impressionCount += 1;
  return await this.save({ validateBeforeSave: false });
};

// Increment click count (when CTA is clicked)
adSchema.methods.incrementClick = async function() {
  this.clickCount += 1;
  return await this.save({ validateBeforeSave: false });
};

// ============================================
// STATIC METHODS
// ============================================

// Get currently active ad (highest priority)
adSchema.statics.getActiveAd = async function() {
  const now = new Date();
  
  return await this.findOne({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  })
    .sort({ priority: -1, createdAt: -1 })
    .select('-__v');
};

// Get all valid ads (for testing/preview)
adSchema.statics.getAllValidAds = async function() {
  const now = new Date();
  
  return await this.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  })
    .sort({ priority: -1 })
    .select('-__v');
};

// Clean up expired ads (can be run as cron job)
adSchema.statics.deactivateExpiredAds = async function() {
  const now = new Date();
  
  const result = await this.updateMany(
    {
      isActive: true,
      validUntil: { $lt: now }
    },
    {
      $set: { isActive: false }
    }
  );
  
  return result;
};

// Get ad analytics summary
adSchema.statics.getAnalyticsSummary = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        totalAds: { $sum: 1 },
        activeAds: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        totalImpressions: { $sum: '$impressionCount' },
        totalClicks: { $sum: '$clickCount' },
        avgPriority: { $avg: '$priority' }
      }
    },
    {
      $project: {
        _id: 0,
        totalAds: 1,
        activeAds: 1,
        totalImpressions: 1,
        totalClicks: 1,
        avgPriority: { $round: ['$avgPriority', 1] },
        overallCTR: {
          $cond: [
            { $eq: ['$totalImpressions', 0] },
            0,
            {
              $round: [
                { $multiply: [{ $divide: ['$totalClicks', '$totalImpressions'] }, 100] },
                2
              ]
            }
          ]
        }
      }
    }
  ]);
};

// ============================================
// EXPORT MODEL
// ============================================

const Ad = mongoose.model('Ad', adSchema);

module.exports = Ad;