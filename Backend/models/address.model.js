// models/address.model.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  
  // Address Type
  addressType: {
    type: String,
    enum: ['home', 'office', 'other'],
    default: 'home'
  },
  
  label: {
    type: String,
    trim: true,
    maxlength: [50, 'Label cannot exceed 50 characters']
  },

  // Contact Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^(\+977)?[0-9]{10}$/.test(v.replace(/[\s-]/g, ''));
      },
      message: 'Please enter a valid phone number'
    }
  },
  
  alternatePhone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^(\+977)?[0-9]{10}$/.test(v.replace(/[\s-]/g, ''));
      },
      message: 'Please enter a valid phone number'
    }
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },

  // Address Details
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true,
    minlength: [5, 'Address must be at least 5 characters'],
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  
  addressLine2: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  
  landmark: {
    type: String,
    trim: true,
    maxlength: [100, 'Landmark cannot exceed 100 characters']
  },

  // Location
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  
  state: {
    type: String,
    required: [true, 'State/Province is required'],
    trim: true
  },
  
  postalCode: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^[0-9]{5}$/.test(v);
      },
      message: 'Please enter a valid postal code (5 digits)'
    }
  },
  
  country: {
    type: String,
    default: 'Nepal',
    trim: true
  },

  // Coordinates (for delivery optimization)
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },

  // Flags
  isDefault: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },

  // Delivery Instructions
  deliveryInstructions: {
    type: String,
    maxlength: [500, 'Delivery instructions cannot exceed 500 characters']
  },

  // Usage Statistics
  lastUsed: {
    type: Date
  },
  
  usageCount: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
addressSchema.index({ user: 1, isDefault: 1 });
addressSchema.index({ user: 1, isActive: 1 });
addressSchema.index({ city: 1 });
addressSchema.index({ state: 1 });

// Virtual for full address
addressSchema.virtual('fullAddress').get(function() {
  let address = this.addressLine1;
  if (this.addressLine2) address += ', ' + this.addressLine2;
  if (this.landmark) address += ', Near ' + this.landmark;
  address += ', ' + this.city;
  if (this.state) address += ', ' + this.state;
  if (this.postalCode) address += ' - ' + this.postalCode;
  address += ', ' + this.country;
  return address;
});

// Virtual for short address
addressSchema.virtual('shortAddress').get(function() {
  return `${this.addressLine1}, ${this.city}`;
});

// Pre-save middleware to ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { 
        user: this.user, 
        _id: { $ne: this._id } 
      },
      { isDefault: false }
    );
  }
});

// Post-save middleware to set as default if it's the first address
addressSchema.post('save', async function(doc) {
  const count = await this.constructor.countDocuments({ 
    user: doc.user,
    isActive: true 
  });
  
  if (count === 1 && !doc.isDefault) {
    doc.isDefault = true;
    await doc.save();
  }
});

// Instance Methods

// Mark as used
addressSchema.methods.markAsUsed = async function() {
  this.lastUsed = new Date();
  this.usageCount += 1;
  return await this.save();
};

// Set as default
addressSchema.methods.setAsDefault = async function() {
  await this.constructor.updateMany(
    { user: this.user },
    { isDefault: false }
  );
  this.isDefault = true;
  return await this.save();
};

// Validate Nepal address
addressSchema.methods.validateNepalAddress = function() {
  const validProvinces = [
    'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 
    'Lumbini', 'Karnali', 'Sudurpashchim'
  ];
  
  return validProvinces.includes(this.state);
};

// Calculate distance from coordinates (Haversine formula)
addressSchema.methods.calculateDistance = function(lat, lon) {
  if (!this.coordinates || !this.coordinates.latitude || !this.coordinates.longitude) {
    return null;
  }

  const R = 6371; // Earth's radius in km
  const dLat = (lat - this.coordinates.latitude) * Math.PI / 180;
  const dLon = (lon - this.coordinates.longitude) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.coordinates.latitude * Math.PI / 180) * 
            Math.cos(lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};

// Static Methods

// Get user's default address
addressSchema.statics.getDefaultAddress = function(userId) {
  return this.findOne({ 
    user: userId, 
    isDefault: true,
    isActive: true 
  });
};

// Get all user addresses
addressSchema.statics.getUserAddresses = function(userId) {
  return this.find({ 
    user: userId,
    isActive: true 
  }).sort({ isDefault: -1, lastUsed: -1 });
};

// Get most used address
addressSchema.statics.getMostUsedAddress = function(userId) {
  return this.findOne({ 
    user: userId,
    isActive: true 
  }).sort({ usageCount: -1 });
};

// Get recently used addresses
addressSchema.statics.getRecentAddresses = function(userId, limit = 3) {
  return this.find({ 
    user: userId,
    isActive: true,
    lastUsed: { $exists: true }
  })
  .sort({ lastUsed: -1 })
  .limit(limit);
};

// Find addresses by city
addressSchema.statics.findByCity = function(city) {
  return this.find({ 
    city: new RegExp(city, 'i'),
    isActive: true 
  });
};

// Get address statistics
addressSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalAddresses: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' },
        addressesByType: {
          $push: '$addressType'
        },
        topCities: {
          $push: '$city'
        }
      }
    },
    {
      $project: {
        totalAddresses: 1,
        uniqueUsersCount: { $size: '$uniqueUsers' },
        avgAddressesPerUser: { 
          $divide: ['$totalAddresses', { $size: '$uniqueUsers' }] 
        }
      }
    }
  ]);

  return stats[0] || {
    totalAddresses: 0,
    uniqueUsersCount: 0,
    avgAddressesPerUser: 0
  };
};

// Get delivery zones (cities with most addresses)
addressSchema.statics.getDeliveryZones = async function(limit = 10) {
  return await this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$city',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;