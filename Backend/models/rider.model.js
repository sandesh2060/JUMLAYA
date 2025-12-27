// Backend/models/rider.model.js
const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  // ============ BASIC INFO ============
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  riderCode: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },

  // ============ VEHICLE INFO ============
  vehicleType: {
    type: String,
    enum: ['bike', 'scooter', 'bicycle', 'car', 'van'],
    default: 'bike',
    required: true
  },

  vehicleNumber: {
    type: String,
    trim: true,
    uppercase: true,
    sparse: true // Allows multiple null values
  },

  vehicleBrand: {
    type: String,
    trim: true
  },

  vehicleModel: {
    type: String,
    trim: true
  },

  vehicleColor: {
    type: String,
    trim: true
  },

  // ============ LICENSE & DOCUMENTS ============
  licenseNumber: {
    type: String,
    trim: true,
    uppercase: true
  },

  licenseExpiry: {
    type: Date
  },

  documents: {
    license: {
      url: String,
      uploadedAt: Date,
      verified: { type: Boolean, default: false },
      verifiedAt: Date,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    vehicleRegistration: {
      url: String,
      uploadedAt: Date,
      verified: { type: Boolean, default: false },
      verifiedAt: Date,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    insurance: {
      url: String,
      uploadedAt: Date,
      verified: { type: Boolean, default: false },
      verifiedAt: Date,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    profilePhoto: {
      url: String,
      uploadedAt: Date
    },
    identityProof: {
      url: String,
      uploadedAt: Date,
      verified: { type: Boolean, default: false },
      verifiedAt: Date,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  },

  // ============ CONTACT INFO ============
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
  },

  alternatePhone: {
    type: String,
    trim: true
  },

  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },

  // ============ STATUS ============
  status: {
    type: String,
    enum: ['offline', 'active', 'on_delivery', 'inactive', 'suspended'],
    default: 'offline',
    index: true
  },

  availability: {
    isAvailable: { type: Boolean, default: false },
    lastStatusChange: { type: Date, default: Date.now },
    onlineHoursToday: { type: Number, default: 0 },
    totalOnlineHours: { type: Number, default: 0 }
  },

  // ============ LOCATION ============
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String,
    lastUpdated: { type: Date, default: Date.now }
  },

  homeLocation: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    },
    address: String
  },

  // ============ DELIVERY ZONE ============
  deliveryZones: [{
    name: String,
    coordinates: [[Number]], // Polygon coordinates
    isActive: { type: Boolean, default: true }
  }],

  preferredAreas: [String], // City names or area names

  maxDeliveryRadius: {
    type: Number,
    default: 10, // kilometers
    min: 1,
    max: 50
  },

  // ============ PERFORMANCE METRICS ============
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
    breakdown: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },

  stats: {
    totalDeliveries: { type: Number, default: 0 },
    completedDeliveries: { type: Number, default: 0 },
    cancelledDeliveries: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 100 }, // Percentage
    onTimeDeliveryRate: { type: Number, default: 100 }, // Percentage
    averageDeliveryTime: { type: Number, default: 0 }, // Minutes
    totalDistance: { type: Number, default: 0 }, // Kilometers
    
    // Daily stats
    todayDeliveries: { type: Number, default: 0 },
    todayEarnings: { type: Number, default: 0 },
    
    // Weekly stats
    weeklyDeliveries: { type: Number, default: 0 },
    weeklyEarnings: { type: Number, default: 0 },
    
    // Monthly stats
    monthlyDeliveries: { type: Number, default: 0 },
    monthlyEarnings: { type: Number, default: 0 }
  },

  // ============ EARNINGS ============
  earnings: {
    total: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    
    thisWeek: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    
    lastPayout: {
      amount: Number,
      date: Date,
      method: String,
      transactionId: String
    }
  },

  // Earnings breakdown
  earningsHistory: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    amount: Number,
    type: { type: String, enum: ['delivery', 'bonus', 'tip', 'incentive'] },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' }
  }],

  // ============ BANKING INFO ============
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    branchName: String,
    ifscCode: String,
    verified: { type: Boolean, default: false }
  },

  // Payment methods (for receiving payments)
  paymentMethods: [{
    type: { type: String, enum: ['bank', 'esewa', 'khalti', 'paypal'] },
    details: mongoose.Schema.Types.Mixed,
    isDefault: { type: Boolean, default: false }
  }],

  // ============ VERIFICATION ============
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    identityVerified: { type: Boolean, default: false },
    documentVerified: { type: Boolean, default: false },
    backgroundCheckDone: { type: Boolean, default: false },
    backgroundCheckDate: Date,
    
    rejectionReason: String,
    rejectedAt: Date
  },

  // ============ PREFERENCES ============
  preferences: {
    notificationsEnabled: { type: Boolean, default: true },
    smsEnabled: { type: Boolean, default: true },
    emailEnabled: { type: Boolean, default: true },
    
    acceptCashOrders: { type: Boolean, default: true },
    acceptOnlineOrders: { type: Boolean, default: true },
    
    autoAcceptOrders: { type: Boolean, default: false },
    maxConcurrentOrders: { type: Number, default: 3, min: 1, max: 5 },
    
    workingHours: {
      monday: { start: String, end: String, isActive: Boolean },
      tuesday: { start: String, end: String, isActive: Boolean },
      wednesday: { start: String, end: String, isActive: Boolean },
      thursday: { start: String, end: String, isActive: Boolean },
      friday: { start: String, end: String, isActive: Boolean },
      saturday: { start: String, end: String, isActive: Boolean },
      sunday: { start: String, end: String, isActive: Boolean }
    }
  },

  // ============ ACTIVITY TRACKING ============
  activity: {
    lastOnline: Date,
    lastOffline: Date,
    lastDelivery: Date,
    lastLocationUpdate: Date,
    
    sessionsToday: { type: Number, default: 0 },
    
    loginHistory: [{
      timestamp: Date,
      device: String,
      ipAddress: String
    }]
  },

  // ============ CURRENT ASSIGNMENTS ============
  currentOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],

  // Order limits
  maxActiveOrders: {
    type: Number,
    default: 3,
    min: 1,
    max: 10
  },

  // ============ INCIDENTS & ISSUES ============
  incidents: [{
    type: { type: String, enum: ['accident', 'complaint', 'late_delivery', 'other'] },
    description: String,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    reportedAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' }
  }],

  // ============ TRAINING & CERTIFICATION ============
  training: {
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    modules: [{
      name: String,
      completedAt: Date,
      score: Number
    }]
  },

  // ============ ADMIN NOTES ============
  adminNotes: [{
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],

  // ============ REFERRAL ============
  referral: {
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
    referralCode: { type: String, unique: true, sparse: true },
    referredRiders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rider' }],
    referralEarnings: { type: Number, default: 0 }
  },

  // ============ METADATA ============
  isActive: {
    type: Boolean,
    default: true
  },

  isSuspended: {
    type: Boolean,
    default: false
  },

  suspensionReason: String,
  suspendedAt: Date,
  suspendedUntil: Date,

  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: Date,

  joinedAt: {
    type: Date,
    default: Date.now
  },

  // App version (for tracking rider app version)
  appVersion: String,

  // Device info
  deviceInfo: {
    platform: String, // ios, android, web
    deviceModel: String,
    osVersion: String
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============ INDEXES ============
riderSchema.index({ currentLocation: '2dsphere' }); // Geospatial queries
riderSchema.index({ user: 1, status: 1 });
riderSchema.index({ riderCode: 1 });
riderSchema.index({ phoneNumber: 1 });
riderSchema.index({ 'verification.isVerified': 1, status: 1 });
riderSchema.index({ createdAt: -1 });
riderSchema.index({ 'rating.average': -1 });

// ============ VIRTUALS ============

// Full name from user
riderSchema.virtual('fullName').get(function() {
  return this.user?.name || 'Unknown';
});

// Is currently online
riderSchema.virtual('isOnline').get(function() {
  return this.status === 'active' || this.status === 'on_delivery';
});

// Can accept new orders
riderSchema.virtual('canAcceptOrders').get(function() {
  return this.status === 'active' && 
         this.verification.isVerified && 
         !this.isSuspended &&
         this.currentOrders.length < this.maxActiveOrders;
});

// ============ METHODS ============

// Generate unique rider code
riderSchema.statics.generateRiderCode = async function() {
  const prefix = 'RDR';
  let code;
  let exists = true;

  while (exists) {
    const random = Math.floor(100000 + Math.random() * 900000);
    code = `${prefix}${random}`;
    exists = await this.exists({ riderCode: code });
  }

  return code;
};

// Update location
riderSchema.methods.updateLocation = function(lat, lng) {
  this.currentLocation = {
    type: 'Point',
    coordinates: [lng, lat],
    lastUpdated: new Date()
  };
  this.activity.lastLocationUpdate = new Date();
  return this.save();
};

// Update status
riderSchema.methods.updateStatus = function(newStatus) {
  const oldStatus = this.status;
  this.status = newStatus;
  this.availability.lastStatusChange = new Date();

  if (newStatus === 'active') {
    this.availability.isAvailable = true;
    this.activity.lastOnline = new Date();
  } else if (newStatus === 'offline') {
    this.availability.isAvailable = false;
    this.activity.lastOffline = new Date();
  }

  return this.save();
};

// Calculate rating
riderSchema.methods.updateRating = function(newRating) {
  const breakdown = this.rating.breakdown;
  breakdown[newRating] = (breakdown[newRating] || 0) + 1;
  
  const totalRatings = this.rating.count + 1;
  const totalScore = (this.rating.average * this.rating.count) + newRating;
  
  this.rating.count = totalRatings;
  this.rating.average = totalScore / totalRatings;
  this.rating.breakdown = breakdown;
  
  return this.save();
};

// Add earnings
riderSchema.methods.addEarnings = function(amount, orderId, type = 'delivery') {
  this.earnings.total += amount;
  this.earnings.pending += amount;
  this.earnings.thisWeek += amount;
  this.earnings.thisMonth += amount;
  
  this.stats.todayEarnings += amount;
  this.stats.weeklyEarnings += amount;
  this.stats.monthlyEarnings += amount;

  this.earningsHistory.push({
    orderId,
    amount,
    type,
    date: new Date(),
    status: 'pending'
  });

  return this.save();
};

// Accept order
riderSchema.methods.acceptOrder = function(orderId) {
  if (this.currentOrders.length >= this.maxActiveOrders) {
    throw new Error('Maximum active orders reached');
  }
  
  this.currentOrders.push(orderId);
  this.stats.totalDeliveries += 1;
  
  if (this.status === 'active') {
    this.status = 'on_delivery';
  }
  
  return this.save();
};

// Complete order
riderSchema.methods.completeOrder = function(orderId) {
  this.currentOrders = this.currentOrders.filter(
    id => id.toString() !== orderId.toString()
  );
  
  this.stats.completedDeliveries += 1;
  this.stats.todayDeliveries += 1;
  this.stats.weeklyDeliveries += 1;
  this.stats.monthlyDeliveries += 1;
  
  this.activity.lastDelivery = new Date();
  
  if (this.currentOrders.length === 0 && this.status === 'on_delivery') {
    this.status = 'active';
  }
  
  return this.save();
};

// ============ PRE-SAVE MIDDLEWARE ============
riderSchema.pre('save', function(next) {
  // Update acceptance rate
  if (this.stats.totalDeliveries > 0) {
    this.stats.acceptanceRate = 
      (this.stats.completedDeliveries / this.stats.totalDeliveries) * 100;
  }
  
  next();
});

// ============ MODEL ============
const Rider = mongoose.model('Rider', riderSchema);

module.exports = Rider;