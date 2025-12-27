// ============================================
// FILE #8: models/coupon.model.js
// ============================================
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Code must be at least 3 characters'],
    maxlength: [20, 'Code cannot exceed 20 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required']
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount cannot be negative']
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: [0, 'Minimum purchase cannot be negative']
  },
  maxDiscount: {
    type: Number,
    min: [0, 'Maximum discount cannot be negative']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [1, 'Usage limit must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  userLimit: {
    type: Number,
    default: 1,
    min: [1, 'User limit must be at least 1']
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    orderTotal: Number
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
couponSchema.index({ endDate: 1 });

// Check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  
  if (!this.isActive) {
    return { valid: false, reason: 'Coupon is inactive' };
  }
  
  if (now < this.startDate) {
    return { valid: false, reason: 'Coupon not yet active' };
  }
  
  if (now > this.endDate) {
    return { valid: false, reason: 'Coupon has expired' };
  }
  
  if (this.usageLimit && this.usageCount >= this.usageLimit) {
    return { valid: false, reason: 'Usage limit reached' };
  }
  
  return { valid: true };
};

// Check if user can use coupon
couponSchema.methods.canUserUse = function(userId) {
  const userUsage = this.usedBy.filter(u => 
    u.user.toString() === userId.toString()
  ).length;
  
  if (userUsage >= this.userLimit) {
    return { canUse: false, reason: 'User usage limit reached' };
  }
  
  return { canUse: true };
};

// Calculate discount amount
couponSchema.methods.calculateDiscount = function(subtotal) {
  if (subtotal < this.minPurchase) {
    return 0;
  }

  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (subtotal * this.discountValue) / 100;
    
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.discountValue;
  }

  return Math.round(discount);
};

// Mark coupon as used
couponSchema.methods.markUsed = async function(userId, orderTotal) {
  this.usedBy.push({
    user: userId,
    usedAt: new Date(),
    orderTotal: orderTotal
  });
  this.usageCount += 1;
  return await this.save();
};

module.exports = mongoose.model('Coupon', couponSchema);