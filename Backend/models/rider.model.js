// Backend/models/rider.model.js - UPDATED WITH LIVE LOCATION

const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  
  riderCode: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    trim: true,
  },

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
    sparse: true
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

  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    index: true,
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

  status: {
    type: String,
    enum: ['offline', 'active', 'on_delivery', 'inactive', 'suspended'],
    default: 'offline',
    index: true,
  },

  availability: {
    isAvailable: { type: Boolean, default: false },
    lastStatusChange: { type: Date, default: Date.now },
    onlineHoursToday: { type: Number, default: 0 },
    totalOnlineHours: { type: Number, default: 0 }
  },

  // ==================== LIVE LOCATION TRACKING ====================
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [85.3240, 27.7172] // Default to Kathmandu
    },
    address: String,
    lastUpdated: { type: Date, default: Date.now }
  },

  // Real-time navigation data
  heading: {
    type: Number, // Direction in degrees (0-360)
    min: 0,
    max: 360,
    default: 0
  },

  speed: {
    type: Number, // Speed in km/h
    min: 0,
    default: 0
  },

  // Location history for tracking (limited to last 50 points)
  locationHistory: [{
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    speed: Number,
    heading: Number
  }],

  // Last known location update timestamp
  lastLocationUpdate: {
    type: Date
  },
  // ================================================================

  homeLocation: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number]
    },
    address: String
  },

  deliveryZones: [{
    name: String,
    coordinates: [[Number]],
    isActive: { type: Boolean, default: true }
  }],

  preferredAreas: [String],

  maxDeliveryRadius: {
    type: Number,
    default: 10,
    min: 1,
    max: 50
  },

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
    acceptanceRate: { type: Number, default: 100 },
    onTimeDeliveryRate: { type: Number, default: 100 },
    averageDeliveryTime: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 }, // Total distance traveled
    todayDeliveries: { type: Number, default: 0 },
    todayEarnings: { type: Number, default: 0 },
    weeklyDeliveries: { type: Number, default: 0 },
    weeklyEarnings: { type: Number, default: 0 },
    monthlyDeliveries: { type: Number, default: 0 },
    monthlyEarnings: { type: Number, default: 0 }
  },

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

  earningsHistory: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    amount: Number,
    type: { type: String, enum: ['delivery', 'bonus', 'tip', 'incentive'] },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' }
  }],

  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    branchName: String,
    ifscCode: String,
    verified: { type: Boolean, default: false }
  },

  paymentMethods: [{
    type: { type: String, enum: ['bank', 'esewa', 'khalti', 'paypal'] },
    details: mongoose.Schema.Types.Mixed,
    isDefault: { type: Boolean, default: false }
  }],

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

  currentOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],

  maxActiveOrders: {
    type: Number,
    default: 3,
    min: 1,
    max: 10
  },

  incidents: [{
    type: { type: String, enum: ['accident', 'complaint', 'late_delivery', 'other'] },
    description: String,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    reportedAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' }
  }],

  training: {
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    modules: [{
      name: String,
      completedAt: Date,
      score: Number
    }]
  },

  adminNotes: [{
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],

  referral: {
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
    referralCode: { type: String, unique: true, sparse: true },
    referredRiders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rider' }],
    referralEarnings: { type: Number, default: 0 }
  },

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

  appVersion: String,

  deviceInfo: {
    platform: String,
    deviceModel: String,
    osVersion: String
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============ INDEXES ============
riderSchema.index({ 'currentLocation.coordinates': '2dsphere' }); // For nearby rider queries
riderSchema.index({ 'verification.isVerified': 1, status: 1 });
riderSchema.index({ createdAt: -1 });
riderSchema.index({ 'rating.average': -1 });
riderSchema.index({ status: 1, 'verification.isVerified': 1 }); // For finding available riders

// ============ VIRTUALS ============
riderSchema.virtual('fullName').get(function() {
  return this.user?.name || 'Unknown';
});

riderSchema.virtual('isOnline').get(function() {
  return this.status === 'active' || this.status === 'on_delivery';
});

riderSchema.virtual('canAcceptOrders').get(function() {
  return this.status === 'active' && 
         this.verification.isVerified && 
         !this.isSuspended &&
         this.currentOrders.length < this.maxActiveOrders;
});

// ============ METHODS ============
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

// ==================== LIVE LOCATION METHODS ====================
/**
 * Update rider's current location with history tracking
 */
riderSchema.methods.updateLocation = async function(lat, lng, heading, speed) {
  // Update current location
  this.currentLocation = {
    type: 'Point',
    coordinates: [lng, lat],
    lastUpdated: new Date()
  };
  
  this.lastLocationUpdate = new Date();
  this.activity.lastLocationUpdate = new Date();
  
  // Update heading and speed if provided
  if (heading !== undefined) this.heading = heading;
  if (speed !== undefined) this.speed = speed;

  // Add to location history (limit to last 50 points)
  if (this.locationHistory.length >= 50) {
    this.locationHistory.shift();
  }
  
  this.locationHistory.push({
    location: {
      type: 'Point',
      coordinates: [lng, lat]
    },
    timestamp: new Date(),
    speed: speed || this.speed,
    heading: heading || this.heading
  });

  return this.save();
};

/**
 * Calculate distance traveled today
 */
riderSchema.methods.calculateTodayDistance = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayHistory = this.locationHistory.filter(
    loc => new Date(loc.timestamp) >= today
  );
  
  let totalDistance = 0;
  for (let i = 1; i < todayHistory.length; i++) {
    const prev = todayHistory[i - 1].location.coordinates;
    const curr = todayHistory[i].location.coordinates;
    totalDistance += this.calculateDistanceBetween(
      prev[1], prev[0], curr[1], curr[0]
    );
  }
  
  return totalDistance;
};

/**
 * Calculate distance between two points (Haversine)
 */
riderSchema.methods.calculateDistanceBetween = function(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
// ================================================================

riderSchema.methods.updateStatus = function(newStatus) {
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
  if (this.stats.totalDeliveries > 0) {
    this.stats.acceptanceRate = 
      (this.stats.completedDeliveries / this.stats.totalDeliveries) * 100;
  }
  
  next();
});

// ============ MODEL ============
const Rider = mongoose.model('Rider', riderSchema);

module.exports = Rider;