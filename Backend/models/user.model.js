// Backend/models/user.model.js - WITH RIDER ROLE SUPPORT + PASSWORD RESET OTP
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

    // ✅ Rider-specific fields
    riderProfile: {
      vehicleType: {
        type: String,
        enum: ["bike", "scooter", "bicycle", "car"],
      },
      vehicleNumber: String,
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
    },

    verificationCode: String,
    verificationCodeExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // ✅ NEW: Password Reset OTP Fields
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

// Index for rider location queries
userSchema.index({ 'riderProfile.currentLocation.coordinates': '2dsphere' });
userSchema.index({ 'riderProfile.status': 1 });

// Virtual full name
userSchema.virtual("fullName").get(function () {
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
  if (this.role === "rider" && !this.riderProfile.riderCode) {
    const count = await this.constructor.countDocuments({ role: "rider" });
    this.riderProfile.riderCode = `RDR${String(count + 1).padStart(4, "0")}`;
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
  this.riderProfile.currentLocation = {
    type: "Point",
    coordinates: [lng, lat],
    lastUpdated: new Date(),
  };
};

userSchema.methods.updateRiderStatus = function (status) {
  if (this.role !== "rider") return;
  this.riderProfile.status = status;
};

userSchema.methods.completeDelivery = function (earnings) {
  if (this.role !== "rider") return;
  this.riderProfile.completedDeliveries += 1;
  this.riderProfile.totalDeliveries += 1;
  this.riderProfile.earnings.total += earnings;
  this.riderProfile.earnings.today += earnings;
  this.riderProfile.earnings.thisWeek += earnings;
  this.riderProfile.earnings.thisMonth += earnings;
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