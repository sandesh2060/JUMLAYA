// user.controller.js - COMPLETE FIXED VERSION WITH ADDRESS COLLECTION
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Address = require("../models/address.model"); // ✅ CRITICAL: Added Address import
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Wishlist = require("../models/wishlist.model");
const { uploadImage, deleteImage, extractPublicId } = require('../config/cloudinary');

// ------------------ RELAXED VALIDATORS ------------------
const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isUsername = (u) => /^[a-zA-Z0-9_]{3,30}$/.test(u);
const isPassword = (p) => p.length >= 8 && /[a-zA-Z]/.test(p) && /\d/.test(p);

// ------------------ GENERIC SUCCESS ------------------
const sendSuccess = (res, status, message, data = {}) => {
  res.status(status).json({ success: true, message, data });
};

// ------------------ USER REGISTRATION ------------------
// ✅ NEW: "customer" or "rider"

exports.register = catchAsync(async (req, res, next) => {
  const {
    firstname,
    lastname,
    username,
    email,
    phone,
    password,
    role, // ✅ NEW: "customer" or "rider"
    riderProfile, // ✅ NEW: Rider-specific details
  } = req.body;

  // Basic validation
  if (!firstname || !lastname || !username || !email || !phone || !password) {
    return next(new AppError("All fields are required", 400));
  }

  if (!isEmail(email)) {
    return next(new AppError("Invalid email format", 400));
  }

  if (!isUsername(username)) {
    return next(
      new AppError(
        "Username must be 3-30 characters (letters, numbers, underscore only)",
        400
      )
    );
  }

  if (!isPassword(password)) {
    return next(
      new AppError(
        "Password must be at least 8 characters with letters and numbers",
        400
      )
    );
  }

  // Check existing user
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    if (existingUser.isVerified) {
      return next(
        new AppError(
          existingUser.email === email
            ? "Email already registered"
            : "Username already taken",
          409
        )
      );
    } else {
      await User.findByIdAndDelete(existingUser._id);
    }
  }

  // ✅ Validate and set role
  const allowedRoles = ["customer", "rider"];
  const userRole = role && allowedRoles.includes(role) ? role : "customer";

  // ✅ Validate rider-specific fields
  if (userRole === "rider") {
    if (
      !riderProfile ||
      !riderProfile.vehicleNumber ||
      !riderProfile.licenseNumber
    ) {
      return next(
        new AppError(
          "Vehicle number and license number are required for riders",
          400
        )
      );
    }
  }

  // ✅ Prepare user data
  const userData = {
    firstname,
    lastname,
    username,
    email,
    phone,
    password,
    role: userRole,
    isVerified: false,
    isActive: false,
  };

  // ✅ Add rider profile if registering as rider
  if (userRole === "rider" && riderProfile) {
    userData.riderProfile = {
      vehicleType: riderProfile.vehicleType || "bike",
      vehicleNumber: riderProfile.vehicleNumber,
      licenseNumber: riderProfile.licenseNumber,
      status: "offline",
      isApproved: false, // Requires admin approval
      rating: 0,
      totalDeliveries: 0,
      completedDeliveries: 0,
      earnings: {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
      },
    };
  }

  // Create user
  const user = await User.create(userData);

  // Generate OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = crypto.createHash("sha256").update(otpCode).digest("hex");
  user.verificationCode = hashedOTP;
  user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    const emailMessage =
      userRole === "rider"
        ? `Your OTP code is: ${otpCode}

⚠️ IMPORTANT: Your rider account requires admin approval before you can start accepting deliveries.
You will receive an email once your account is approved.

Valid for 10 minutes.`
        : `Your OTP: ${otpCode}`;

    await sendEmail({
      to: email,
      subject:
        userRole === "rider"
          ? "Rider Registration - Email Verification"
          : "Verify Your Email - OTP Code",
      text: emailMessage,
      html: `<div style="font-family: Arial; padding: 20px;">
        <h2>${userRole === "rider" ? "🚴‍♂️ Rider Registration" : "Email Verification"}</h2>
        <p>Your OTP code is:</p>
        <h1 style="color: #4CAF50; font-size: 32px;">${otpCode}</h1>
        <p>Valid for 10 minutes.</p>
        ${
          userRole === "rider"
            ? `
        <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; color: #856404;"><strong>⚠️ Note:</strong> Your rider account requires admin approval before you can start accepting deliveries.</p>
          <p style="margin: 10px 0 0 0; color: #856404;">You will receive an email once your account is approved.</p>
        </div>
        `
            : ""
        }
      </div>`,
    });

    console.log("============================================");
    console.log(`✅ ${userRole.toUpperCase()} REGISTRATION - OTP SENT`);
    console.log("📧 Email:", email);
    console.log("🔑 OTP Code:", otpCode);
    console.log("👤 Role:", userRole);
    if (userRole === "rider") {
      console.log(
        "🚴 Vehicle:",
        riderProfile.vehicleType,
        "-",
        riderProfile.vehicleNumber
      );
      console.log("📄 License:", riderProfile.licenseNumber);
      console.log("⏳ Approval Status: Pending");
    }
    console.log("⏰ Expires in 10 minutes");
    console.log("============================================");

    sendSuccess(
      res,
      201,
      userRole === "rider"
        ? "Rider registration successful! Please verify your email. Your account will need admin approval."
        : "OTP sent to your email. Please verify to complete registration.",
      {
        email,
        role: userRole,
        requiresApproval: userRole === "rider",
      }
    );
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    await User.findByIdAndDelete(user._id);
    return next(new AppError("Failed to send OTP. Please try again.", 500));
  }
});

// ------------------ VERIFY OTP ------------------
exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError("Email and OTP required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found. Please register again.", 404));
  }

  if (user.isVerified) {
    return next(new AppError("Email already verified. Please login.", 400));
  }

  if (!user.verificationCode || !user.verificationCodeExpires) {
    return next(new AppError("No OTP found. Please request a new one.", 400));
  }

  if (user.verificationCodeExpires < Date.now()) {
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("OTP has expired. Please request a new one.", 400)
    );
  }

  const hashedOTP = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");

  if (user.verificationCode !== hashedOTP) {
    return next(new AppError("Invalid OTP", 400));
  }

  user.isVerified = true;
  user.isActive = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;

  const authToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  user.password = undefined;

  console.log("✅ Email verified successfully:", email);

  sendSuccess(res, 200, "Email verified! Registration complete.", {
    user,
    authToken,
    refreshToken,
  });
});

// ------------------ RESEND OTP ------------------
exports.resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.isVerified) {
    return next(new AppError("Already verified", 400));
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = crypto.createHash("sha256").update(otpCode).digest("hex");
  user.verificationCode = hashedOTP;
  user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      to: email,
      subject: "Resend OTP",
      text: `Your new OTP: ${otpCode}`,
      html: `<div style="font-family: Arial; padding: 20px;">
        <h2>OTP Resend Request</h2>
        <p>Your new OTP code is:</p>
        <h1 style="color: #4CAF50; font-size: 32px;">${otpCode}</h1>
        <p>Valid for 10 minutes.</p>
      </div>`,
    });

    console.log("🔄 OTP RESENT:", email, "| Code:", otpCode);
  } catch (err) {
    console.error("❌ Resend failed:", err);
    return next(new AppError("Failed to send OTP", 500));
  }

  sendSuccess(res, 200, "OTP resent successfully");
});

// ------------------ LOGIN ------------------

exports.login = async (req, res, next) => {
  try {
    console.log("🔐 LOGIN ATTEMPT:", req.body.email);

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log("❌ Missing credentials");
      return next(new AppError("Email and password are required", 400));
    }

    // Find user with password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.log("❌ User not found:", email);
      return next(new AppError("Invalid email or password", 401));
    }

    console.log("✅ User found:", {
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
    });

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log("❌ Invalid password");
      return next(new AppError("Invalid email or password", 401));
    }

    console.log("✅ Password valid");

    // Check if verified
    if (!user.isVerified) {
      console.log("❌ Email not verified");
      return next(new AppError("Please verify your email first", 403));
    }

    // Check if active
    if (!user.isActive) {
      console.log("❌ Account deactivated");
      return next(new AppError("Your account has been deactivated", 403));
    }

    // ✅ Check if rider is approved
    if (user.role === "rider" && user.riderProfile?.isApproved === false) {
      console.log("❌ Rider account pending approval");
      return next(
        new AppError(
          "Your rider account is pending admin approval. Please wait for approval email.",
          403
        )
      );
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const authToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Remove sensitive fields
    user.password = undefined;
    user.refreshToken = undefined;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    // ✅ Build response with rider profile
    const responseData = {
      success: true,
      message: "Login successful",
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
          // ✅ Include rider profile for riders
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
            },
          }),
        },
        authToken,
        refreshToken,
      },
    };

    console.log("✅ LOGIN SUCCESS - Response:", {
      email: user.email,
      role: user.role,
      isAdmin: responseData.data.user.isAdmin,
      isRider: user.role === "rider",
      riderApproved: user.riderProfile?.isApproved,
      hasToken: !!authToken,
    });

    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    next(error);
  }
};

// ============================================
// ✅ FIXED: GET PROFILE - Uses Address Collection
// ============================================
// ✅ FIXED: GET PROFILE - Now includes fullName
// ============================================
exports.getProfile = catchAsync(async (req, res, next) => {
  console.log("📋 getProfile - req.user:", req.user);
  
  if (!req.user || !req.user.id) {
    console.log("❌ req.user or req.user.id is undefined");
    return next(new AppError("User not authenticated", 401));
  }
  
  // Get user basic info
  const user = await User.findById(req.user.id);
  if (!user) {
    console.log("❌ User not found in database");
    return next(new AppError("User not found", 404));
  }
  
  // Fetch ONLY active addresses from Address collection
  const activeAddresses = await Address.find({
    user: req.user.id,
    isActive: true
  }).sort({ isDefault: -1, createdAt: -1 });
  
  console.log("✅ Profile found:", user.email);
  console.log("📍 Active addresses from Address collection:", activeAddresses.length);
  
  // ✅ FIX: Build response WITH fullName
  const userProfile = {
    _id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    fullName: `${user.firstname} ${user.lastname}`, // ✅ ADD THIS
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
// ✅ FIXED: GET STATS - Counts from Address Collection
// ============================================
exports.getStats = catchAsync(async (req, res, next) => {
  console.log("📊 getStats - req.user:", req.user);
  
  if (!req.user || !req.user.id) {
    console.log("❌ req.user or req.user.id is undefined");
    return next(new AppError("User not authenticated", 401));
  }

  const userId = req.user.id;

  // ✅ CRITICAL FIX: Count active addresses from Address collection
  const [ordersCount, wishlist, addressesCount] = await Promise.all([
    Order.countDocuments({ user: userId }),
    Wishlist.findOne({ user: userId }),
    Address.countDocuments({ user: userId, isActive: true }) // ← Use Address collection
  ]);

  const stats = {
    orders: ordersCount,
    wishlist: wishlist ? wishlist.items.length : 0,
    addresses: addressesCount // ← Use count from Address collection, NOT embedded
  };

  console.log("✅ Stats retrieved:", stats);
  sendSuccess(res, 200, "Stats retrieved successfully", stats);
});

// ------------------ UPDATE PROFILE (FIXED PATH) ------------------
exports.updateProfile = catchAsync(async (req, res, next) => {
  console.log("📝 Update Profile Request:");
  console.log("Body:", req.body);
  console.log("File:", req.file);

  const { firstname, lastname, phone } = req.body;
  
  const updates = {};
  if (firstname) updates.firstname = firstname;
  if (lastname) updates.lastname = lastname;
  if (phone) updates.phone = phone;
  
  // ✅ CLOUDINARY: Handle avatar upload
  if (req.file && req.file.buffer) {
    try {
      console.log("📤 Uploading avatar to Cloudinary...");
      
      // Get current user to find old avatar
      const currentUser = await User.findById(req.user.id);
      
      // Upload new avatar to Cloudinary
      const uploadResult = await uploadImage(req.file.buffer, {
        folder: 'jumlaya/avatars',
        preset: 'avatar'
      });
      
      // Save Cloudinary URL
      updates.avatar = uploadResult.url;
      
      console.log("✅ Avatar uploaded successfully!");
      console.log("🔗 Cloudinary URL:", uploadResult.url);
      console.log("📊 Image details:", {
        publicId: uploadResult.publicId,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        size: `${(uploadResult.size / 1024).toFixed(2)} KB`
      });
      
      // Delete old avatar from Cloudinary if exists
      if (currentUser.avatar && currentUser.avatar.includes('cloudinary.com')) {
        const oldPublicId = extractPublicId(currentUser.avatar);
        if (oldPublicId) {
          console.log("🗑️ Deleting old avatar:", oldPublicId);
          await deleteImage(oldPublicId).catch(err => 
            console.log('⚠️ Could not delete old avatar:', err.message)
          );
        }
      }
    } catch (error) {
      console.error("❌ Cloudinary upload failed:", error);
      return next(new AppError("Failed to upload image. Please try again.", 500));
    }
  }

  // Check if there's anything to update
  if (Object.keys(updates).length === 0) {
    return next(new AppError("No data provided for update", 400));
  }

  console.log("Updates to apply:", updates);

  // Update user
  const user = await User.findByIdAndUpdate(
    req.user.id, 
    updates, 
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Remove sensitive fields
  user.password = undefined;
  user.refreshToken = undefined;

  console.log("✅ Profile updated successfully");
  sendSuccess(res, 200, "Profile updated successfully", user);
});


// ------------------ CHANGE PASSWORD ------------------
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError("Passwords required", 400));
  }

  if (!isPassword(newPassword)) {
    return next(
      new AppError(
        "Password must be at least 8 characters with letters and numbers",
        400
      )
    );
  }

  const user = await User.findById(req.user.id).select("+password");
  if (!user) return next(new AppError("User not found", 404));

  const match = await user.comparePassword(currentPassword);
  if (!match) return next(new AppError("Current password incorrect", 401));

  user.password = newPassword;
  await user.save();

  sendSuccess(res, 200, "Password changed");
});

// ------------------ ADDRESS MANAGEMENT (LEGACY - For backward compatibility) ------------------
exports.getAddresses = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));
  sendSuccess(res, 200, "Addresses retrieved", user.addresses);
});

exports.addAddress = catchAsync(async (req, res, next) => {
  const { label, street, city, state, zip, country, phone, isDefault } = req.body;
  
  if (!street || !city || !zip) {
    return next(new AppError("Street, city, ZIP required", 400));
  }

  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));

  if (isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  const address = {
    label: label || "home",
    street,
    city,
    state,
    zip,
    country: country || "Nepal",
    phone,
    isDefault: isDefault || user.addresses.length === 0,
  };

  user.addresses.push(address);
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

  if (isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
    address.isDefault = true;
  }

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
  if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
    user.addresses[0].isDefault = true;
  }

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

  if (!productId) {
    return next(new AppError("Product ID required", 400));
  }

  const Product = require("../models/product.model");
  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (!product.isActive) {
    return next(new AppError("Product not found", 404));
  }

  if (product.stock < quantity) {
    return next(new AppError("Insufficient stock", 400));
  }

  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));

  const existing = user.cart.find(
    (c) => c.product?.toString() === productId.toString()
  );

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock);
    existing.priceSnapshot = product.price;
  } else {
    user.cart.push({
      product: product._id,
      quantity,
      priceSnapshot: product.price,
    });
  }

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
  
  if (quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }
  if (product.stock < quantity) {
    return next(new AppError("Insufficient stock", 400));
  }

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
  console.log('🚪 LOGOUT ATTEMPT:', req.user?.email || req.user?.id);
  
  try {
    // If user is authenticated, clear their refresh token
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      
      if (user) {
        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });
        console.log('✅ Refresh token cleared for user:', user.email);
      }
    }

    // Send success response
    sendSuccess(res, 200, "Logged out successfully", {
      message: "Please clear your auth tokens on the client side"
    });

    console.log('✅ LOGOUT SUCCESS');
  } catch (error) {
    console.error('❌ LOGOUT ERROR:', error);
    // Even if there's an error, we should allow logout
    sendSuccess(res, 200, "Logged out successfully");
  }
});