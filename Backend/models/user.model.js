// Backend/models/user.model.js - FIXED WITH DOCUMENTS FIELD
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{10,15}$/, "Please provide a valid phone number"],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ["customer", "admin", "vendor", "rider"],
      default: "customer",
    },
    avatar: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Rider-specific fields
    riderProfile: {
      vehicleType: {
        type: String,
        enum: ["bike", "scooter", "bicycle", "car"],
      },
      vehicleNumber: String,
      vehicleBrand: String,
      vehicleModel: String,
      licenseNumber: String,
      status: {
        type: String,
        enum: ["offline", "active", "on_delivery", "inactive"],
        default: "offline",
      },
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalDeliveries: {
        type: Number,
        default: 0,
      },
      completedDeliveries: {
        type: Number,
        default: 0,
      },
      earnings: {
        total: { type: Number, default: 0 },
        today: { type: Number, default: 0 },
        thisWeek: { type: Number, default: 0 },
        thisMonth: { type: Number, default: 0 },
      },
      currentLocation: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: [Number],
        lastUpdated: Date,
      },
      isApproved: {
        type: Boolean,
        default: false,
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      approvedAt: Date,
      riderCode: String,
      
      // ✅ ADDED: Documents field for storing uploaded files
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
        identityProof: {
          url: String,
          uploadedAt: Date,
          verified: { type: Boolean, default: false },
          verifiedAt: Date,
          verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        },
        profilePhoto: {
          url: String,
          uploadedAt: Date
        }
      },
      
      // ✅ ADDED: Verification details
      verification: {
        isVerified: { type: Boolean, default: false },
        verifiedAt: Date,
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        identityVerified: { type: Boolean, default: false },
        documentVerified: { type: Boolean, default: false },
        backgroundCheckDone: { type: Boolean, default: false },
        rejectionReason: String,
        rejectedAt: Date
      },
      
      // ✅ ADDED: Additional rider fields
      phoneNumber: String,
      alternatePhone: String,
      stats: {
        completedDeliveries: { type: Number, default: 0 },
        cancelledDeliveries: { type: Number, default: 0 },
        acceptanceRate: { type: Number, default: 100 },
        onTimeDeliveryRate: { type: Number, default: 100 }
      }
    },

    verificationCode: String,
    verificationCodeExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // Password Reset OTP Fields
    resetPasswordOTP: String,
    resetPasswordOTPExpires: Date,
    
    refreshToken: String,
    lastLogin: Date,

    addresses: [
      {
        label: {
          type: String,
          enum: ["home", "office", "other"],
          default: "home",
        },
        street: { 
          type: String, 
          required: function() {
            return this.isNew || this.isModified('addresses');
          },
          trim: true 
        },
        city: { 
          type: String, 
          required: function() {
            return this.isNew || this.isModified('addresses');
          },
          trim: true 
        },
        state: { type: String, trim: true },
        zip: { 
          type: String, 
          required: function() {
            return this.isNew || this.isModified('addresses');
          },
          trim: true 
        },
        country: { type: String, default: "Nepal" },
        phone: String,
        isDefault: { type: Boolean, default: false },
      },
    ],

    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1, min: 1 },
        priceSnapshot: { type: Number, min: 0 },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ✅ INDEXES (removed duplicates)
// Index for rider location queries
userSchema.index({ 'riderProfile.currentLocation.coordinates': '2dsphere' });
userSchema.index({ 'riderProfile.status': 1 });

// Virtual full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstname} ${this.lastname}`;
});

// Virtual for rider name compatibility
userSchema.virtual("name").get(function () {
  return `${this.firstname} ${this.lastname}`;
});

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate unique rider code
userSchema.pre("save", async function (next) {
  if (this.role === "rider" && !this.riderProfile?.riderCode) {
    const count = await this.constructor.countDocuments({ role: "rider" });
    const riderCode = `RDR${String(count + 1).padStart(6, "0")}`;
    
    if (!this.riderProfile) {
      this.riderProfile = {};
    }
    this.riderProfile.riderCode = riderCode;
  }
  next();
});

// Pre-save hook to handle address validation
userSchema.pre("save", function (next) {
  if (this.isModified('cart') && !this.isModified('addresses')) {
    this.$__.skipAddressValidation = true;
  }
  
  if (this.addresses?.length > 0) {
    const defaults = this.addresses.filter((a) => a.isDefault);
    if (defaults.length > 1) {
      this.addresses.forEach((addr, i) => {
        addr.isDefault = i === 0;
      });
    }
  }
  
  next();
});

// Safe cart item removal method
userSchema.methods.removeCartItemSafe = async function (productId) {
  if (!this.cart) return;
  this.cart = this.cart.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  await this.save({ validateBeforeSave: false });
};

// Rider methods
userSchema.methods.updateRiderLocation = function (lat, lng) {
  if (this.role !== "rider") return;
  if (!this.riderProfile) this.riderProfile = {};
  this.riderProfile.currentLocation = {
    type: "Point",
    coordinates: [lng, lat],
    lastUpdated: new Date(),
  };
};

userSchema.methods.updateRiderStatus = function (status) {
  if (this.role !== "rider") return;
  if (!this.riderProfile) this.riderProfile = {};
  this.riderProfile.status = status;
};

userSchema.methods.completeDelivery = function (earnings) {
  if (this.role !== "rider") return;
  if (!this.riderProfile) this.riderProfile = { earnings: {} };
  if (!this.riderProfile.earnings) this.riderProfile.earnings = {};
  
  this.riderProfile.completedDeliveries = (this.riderProfile.completedDeliveries || 0) + 1;
  this.riderProfile.totalDeliveries = (this.riderProfile.totalDeliveries || 0) + 1;
  this.riderProfile.earnings.total = (this.riderProfile.earnings.total || 0) + earnings;
  this.riderProfile.earnings.today = (this.riderProfile.earnings.today || 0) + earnings;
  this.riderProfile.earnings.thisWeek = (this.riderProfile.earnings.thisWeek || 0) + earnings;
  this.riderProfile.earnings.thisMonth = (this.riderProfile.earnings.thisMonth || 0) + earnings;
};

// JWT token methods
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// Compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// OTP methods
userSchema.methods.createVerificationCode = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = crypto.createHash("sha256").update(otp).digest("hex");
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
  return otp;
};

// Password reset token (old method - kept for backward compatibility)
userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

module.exports = mongoose.model("User", userSchema);