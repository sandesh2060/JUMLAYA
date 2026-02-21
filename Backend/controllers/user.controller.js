// ============================================
// Backend/controllers/user.controller.js
// 🚫 OTP/EMAIL DISABLED TEMPORARILY
// RE-ENABLE: search "RE-ENABLE OTP" comments
// ============================================
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Address = require("../models/address.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
// const sendEmail = require("../utils/sendEmail"); // 🚫 RE-ENABLE OTP: uncomment
const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Wishlist = require("../models/wishlist.model");
const { uploadImage, deleteImage, extractPublicId } = require('../config/cloudinary');

const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isUsername = (u) => /^[a-zA-Z0-9_]{3,30}$/.test(u);
const isPassword = (p) => p.length >= 8 && /[a-zA-Z]/.test(p) && /\d/.test(p);

const sendSuccess = (res, status, message, data = {}) => {
  res.status(status).json({ success: true, message, data });
};

// ------------------ USER REGISTRATION ------------------
exports.register = catchAsync(async (req, res, next) => {
  const { firstname, lastname, username, email, phone, password, role, riderProfile } = req.body;

  if (!firstname || !lastname || !username || !email || !phone || !password) {
    return next(new AppError("All fields are required", 400));
  }
  if (!isEmail(email)) return next(new AppError("Invalid email format", 400));
  if (!isUsername(username)) return next(new AppError("Username must be 3-30 characters (letters, numbers, underscore only)", 400));
  if (!isPassword(password)) return next(new AppError("Password must be at least 8 characters with letters and numbers", 400));

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    if (existingUser.isVerified) {
      return next(new AppError(existingUser.email === email ? "Email already registered" : "Username already taken", 409));
    } else {
      await User.findByIdAndDelete(existingUser._id);
    }
  }

  const allowedRoles = ["customer", "rider"];
  const userRole = role && allowedRoles.includes(role) ? role : "customer";

  if (userRole === "rider") {
    if (!riderProfile || !riderProfile.vehicleNumber || !riderProfile.licenseNumber) {
      return next(new AppError("Vehicle number and license number are required for riders", 400));
    }
  }

  const userData = {
    firstname, lastname, username, email, phone, password,
    role: userRole,
    // 🚫 OTP DISABLED: auto-verify on register
    isVerified: true,
    isActive: true,
    // RE-ENABLE OTP: change both back to false
  };

  if (userRole === "rider" && riderProfile) {
    userData.riderProfile = {
      vehicleType: riderProfile.vehicleType || "bike",
      vehicleNumber: riderProfile.vehicleNumber,
      licenseNumber: riderProfile.licenseNumber,
      status: "offline",
      isApproved: false,
      rating: 0,
      totalDeliveries: 0,
      completedDeliveries: 0,
      earnings: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
    };
  }

  const user = await User.create(userData);

  // 🚫 OTP/EMAIL DISABLED - no OTP generation or email sending
  // RE-ENABLE OTP: uncomment everything below up to sendSuccess
  //
  // const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  // const hashedOTP = crypto.createHash("sha256").update(otpCode).digest("hex");
  // user.verificationCode = hashedOTP;
  // user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
  // await user.save({ validateBeforeSave: false });
  // try {
  //   await sendEmail({ to: email, subject: "Verify Your Email", text: `Your OTP: ${otpCode}` });
  // } catch (err) {
  //   await User.findByIdAndDelete(user._id);
  //   return next(new AppError("Failed to send OTP. Please try again.", 500));
  // }

  console.log(`✅ [OTP DISABLED] User registered & auto-verified: ${email} | Role: ${userRole}`);

  sendSuccess(res, 201,
    userRole === "rider"
      ? "Rider registration successful! Please login. Your account will need admin approval."
      : "Registration successful! Please login.",
    {
      email,
      role: userRole,
      requiresApproval: userRole === "rider",
    }
  );
});

// ------------------ VERIFY OTP (kept for future use) ------------------
exports.verifyOTP = catchAsync(async (req, res, next) => {
  // 🚫 OTP DISABLED - this endpoint is not active
  // RE-ENABLE OTP: this function is fully intact, just re-wire the routes
  const { email, otp } = req.body;
  if (!email || !otp) return next(new AppError("Email and OTP required", 400));
  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found. Please register again.", 404));
  if (user.isVerified) return next(new AppError("Email already verified. Please login.", 400));
  if (!user.verificationCode || !user.verificationCodeExpires) return next(new AppError("No OTP found. Please request a new one.", 400));
  if (user.verificationCodeExpires < Date.now()) {
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("OTP has expired. Please request a new one.", 400));
  }
  const hashedOTP = crypto.createHash("sha256").update(otp.toString()).digest("hex");
  if (user.verificationCode !== hashedOTP) return next(new AppError("Invalid OTP", 400));
  user.isVerified = true;
  user.isActive = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  const authToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  user.password = undefined;
  sendSuccess(res, 200, "Email verified! Registration complete.", { user, authToken, refreshToken });
});

// ------------------ RESEND OTP (kept for future use) ------------------
exports.resendOTP = catchAsync(async (req, res, next) => {
  // 🚫 OTP DISABLED - this endpoint is not active
  // RE-ENABLE OTP: re-wire the routes to use this
  const { email } = req.body;
  if (!email) return next(new AppError("Email required", 400));
  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));
  if (user.isVerified) return next(new AppError("Already verified", 400));
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = crypto.createHash("sha256").update(otpCode).digest("hex");
  user.verificationCode = hashedOTP;
  user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  // RE-ENABLE OTP: uncomment sendEmail call below
  // await sendEmail({ to: email, subject: "Resend OTP", text: `Your new OTP: ${otpCode}` });
  console.log(`🔄 [OTP DISABLED] Resend OTP for ${email}: ${otpCode}`);
  sendSuccess(res, 200, "OTP resent successfully");
});

// ------------------ LOGIN ------------------
exports.login = async (req, res, next) => {
  try {
    console.log("🔐 LOGIN ATTEMPT:", req.body.email);
    const { email, password } = req.body;
    if (!email || !password) return next(new AppError("Email and password are required", 400));

    const user = await User.findOne({ email }).select("+password");
    if (!user) return next(new AppError("Invalid email or password", 401));

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return next(new AppError("Invalid email or password", 401));
    if (!user.isVerified) return next(new AppError("Please verify your email first", 403));
    if (!user.isActive) return next(new AppError("Your account has been deactivated", 403));

    const isRiderPendingApproval = user.role === 'rider' && user.riderProfile && user.riderProfile.isApproved === false;

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const authToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    user.password = undefined;
    user.refreshToken = undefined;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    res.status(200).json({
      success: true,
      message: isRiderPendingApproval ? "Login successful. Your rider account is pending approval." : "Login successful",
      data: {
        user: {
          _id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isAdmin: user.role === "admin" || user.role === "superadmin",
          avatar: user.avatar,
          isVerified: user.isVerified,
          isActive: user.isActive,
          addresses: user.addresses || [],
          lastLogin: user.lastLogin,
          ...(user.role === "rider" && {
            riderProfile: {
              vehicleType: user.riderProfile?.vehicleType,
              vehicleNumber: user.riderProfile?.vehicleNumber,
              licenseNumber: user.riderProfile?.licenseNumber,
              status: user.riderProfile?.status,
              rating: user.riderProfile?.rating,
              totalDeliveries: user.riderProfile?.totalDeliveries,
              completedDeliveries: user.riderProfile?.completedDeliveries,
              isApproved: user.riderProfile?.isApproved,
              riderCode: user.riderProfile?.riderCode,
              earnings: user.riderProfile?.earnings,
              documents: user.riderProfile?.documents,
            },
          }),
        },
        authToken,
        refreshToken,
        pendingApproval: isRiderPendingApproval,
      },
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    next(error);
  }
};

// ============================================
// GET PROFILE
// ============================================
exports.getProfile = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) return next(new AppError("User not authenticated", 401));
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));
  const activeAddresses = await Address.find({ user: req.user.id, isActive: true }).sort({ isDefault: -1, createdAt: -1 });
  const userProfile = {
    _id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    fullName: `${user.firstname} ${user.lastname}`,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    isVerified: user.isVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    addresses: activeAddresses,
    cart: user.cart || []
  };
  sendSuccess(res, 200, "Profile retrieved", userProfile);
});

// ============================================
// GET STATS
// ============================================
exports.getStats = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) return next(new AppError("User not authenticated", 401));
  const userId = req.user.id;
  const [ordersCount, wishlist, addressesCount] = await Promise.all([
    Order.countDocuments({ user: userId }),
    Wishlist.findOne({ user: userId }),
    Address.countDocuments({ user: userId, isActive: true })
  ]);
  sendSuccess(res, 200, "Stats retrieved successfully", {
    orders: ordersCount,
    wishlist: wishlist ? wishlist.items.length : 0,
    addresses: addressesCount
  });
});

// ------------------ UPDATE PROFILE ------------------
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { firstname, lastname, phone } = req.body;
  const updates = {};
  if (firstname) updates.firstname = firstname;
  if (lastname) updates.lastname = lastname;
  if (phone) updates.phone = phone;

  if (req.file && req.file.buffer) {
    try {
      const currentUser = await User.findById(req.user.id);
      const uploadResult = await uploadImage(req.file.buffer, { folder: 'jumlaya/avatars', preset: 'avatar' });
      updates.avatar = uploadResult.url;
      if (currentUser.avatar && currentUser.avatar.includes('cloudinary.com')) {
        const oldPublicId = extractPublicId(currentUser.avatar);
        if (oldPublicId) await deleteImage(oldPublicId).catch(err => console.log('⚠️ Could not delete old avatar:', err.message));
      }
    } catch (error) {
      return next(new AppError("Failed to upload image. Please try again.", 500));
    }
  }

  if (Object.keys(updates).length === 0) return next(new AppError("No data provided for update", 400));

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
  if (!user) return next(new AppError("User not found", 404));
  user.password = undefined;
  user.refreshToken = undefined;
  sendSuccess(res, 200, "Profile updated successfully", user);
});

// ------------------ CHANGE PASSWORD ------------------
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return next(new AppError("Passwords required", 400));
  if (!isPassword(newPassword)) return next(new AppError("Password must be at least 8 characters with letters and numbers", 400));
  const user = await User.findById(req.user.id).select("+password");
  if (!user) return next(new AppError("User not found", 404));
  const match = await user.comparePassword(currentPassword);
  if (!match) return next(new AppError("Current password incorrect", 401));
  user.password = newPassword;
  await user.save();
  sendSuccess(res, 200, "Password changed");
});

// ------------------ ADDRESS MANAGEMENT ------------------
exports.getAddresses = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));
  sendSuccess(res, 200, "Addresses retrieved", user.addresses);
});

exports.addAddress = catchAsync(async (req, res, next) => {
  const { label, street, city, state, zip, country, phone, isDefault } = req.body;
  if (!street || !city || !zip) return next(new AppError("Street, city, ZIP required", 400));
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));
  if (isDefault) user.addresses.forEach((addr) => (addr.isDefault = false));
  user.addresses.push({ label: label || "home", street, city, state, zip, country: country || "Nepal", phone, isDefault: isDefault || user.addresses.length === 0 });
  await user.save();
  sendSuccess(res, 201, "Address added", user.addresses);
});

exports.updateAddress = catchAsync(async (req, res, next) => {
  const { addressId } = req.params;
  const { label, street, city, state, zip, country, phone, isDefault } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));
  const address = user.addresses.id(addressId);
  if (!address) return next(new AppError("Address not found", 404));
  if (label) address.label = label;
  if (street) address.street = street;
  if (city) address.city = city;
  if (state) address.state = state;
  if (zip) address.zip = zip;
  if (country) address.country = country;
  if (phone) address.phone = phone;
  if (isDefault) { user.addresses.forEach((a) => (a.isDefault = false)); address.isDefault = true; }
  await user.save();
  sendSuccess(res, 200, "Address updated", user.addresses);
});

exports.deleteAddress = catchAsync(async (req, res, next) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));
  const address = user.addresses.id(addressId);
  if (!address) return next(new AppError("Address not found", 404));
  address.deleteOne();
  if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) user.addresses[0].isDefault = true;
  await user.save();
  sendSuccess(res, 200, "Address deleted", user.addresses);
});

// ------------------ CART ------------------
exports.getCart = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("cart.product");
  if (!user) return next(new AppError("User not found", 404));
  sendSuccess(res, 200, "Cart retrieved", { items: user.cart });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return next(new AppError("Product ID required", 400));
  const Product = require("../models/product.model");
  const product = await Product.findById(productId);
  if (!product || !product.isActive) return next(new AppError("Product not found", 404));
  if (product.stock < quantity) return next(new AppError("Insufficient stock", 400));
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));
  const existing = user.cart.find((c) => c.product?.toString() === productId.toString());
  if (existing) { existing.quantity = Math.min(existing.quantity + quantity, product.stock); existing.priceSnapshot = product.price; }
  else user.cart.push({ product: product._id, quantity, priceSnapshot: product.price });
  await user.save();
  await user.populate("cart.product");
  sendSuccess(res, 200, "Added to cart", { items: user.cart });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  if (!itemId) return next(new AppError("Cart item id required", 400));
  if (quantity == null) return next(new AppError("Quantity required", 400));
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));
  const item = user.cart.id(itemId);
  if (!item) return next(new AppError("Cart item not found", 404));
  const Product = require("../models/product.model");
  const product = await Product.findById(item.product);
  if (!product) return next(new AppError("Product not found", 404));
  if (quantity < 1) return next(new AppError("Quantity must be at least 1", 400));
  if (product.stock < quantity) return next(new AppError("Insufficient stock", 400));
  item.quantity = quantity;
  item.priceSnapshot = product.price;
  await user.save();
  await user.populate("cart.product");
  sendSuccess(res, 200, "Cart item updated", { items: user.cart });
});

exports.removeCartItem = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  if (!itemId) return next(new AppError("Cart item id required", 400));
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));
  const item = user.cart.id(itemId);
  if (!item) return next(new AppError("Cart item not found", 404));
  item.deleteOne();
  await user.save();
  await user.populate("cart.product");
  sendSuccess(res, 200, "Cart item removed", { items: user.cart });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));
  user.cart = [];
  await user.save();
  sendSuccess(res, 200, "Cart cleared", { items: [] });
});

// ------------------ LOGOUT ------------------
exports.logout = catchAsync(async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (user) { user.refreshToken = undefined; await user.save({ validateBeforeSave: false }); }
    }
    sendSuccess(res, 200, "Logged out successfully", { message: "Please clear your auth tokens on the client side" });
  } catch (error) {
    sendSuccess(res, 200, "Logged out successfully");
  }
});