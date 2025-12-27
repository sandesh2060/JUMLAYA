// ============================================
// Backend/controllers/cart.controller.js - FIXED VERSION
// ============================================
const User = require("../models/user.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { successResponse } = require("../utils/response");

// Helper to get user ID
const getUserId = (req) => req.user.id || req.user._id;

exports.getCart = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);

  let cart = await Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      select: "name images price stock isActive",
    })
    .populate({
      path: "savedForLater.product",
      select: "name images price",
    });

  // Create cart if doesn't exist
  if (!cart) {
    cart = await Cart.create({ user: userId });
  }

  // Filter out items with deleted/inactive products
  cart.items = cart.items.filter(
    (item) => item.product && item.product.isActive
  );
  cart.savedForLater = cart.savedForLater.filter((item) => item.product);

  // Save if items were filtered out
  if (cart.isModified("items") || cart.isModified("savedForLater")) {
    await cart.save();
  }

  // ✅ FIXED: Changed parameter order
  return successResponse(
    res,
    { items: cart.items },
    "Cart fetched successfully"
  );
});

exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;
  const userId = getUserId(req);

  // Validate input
  if (!productId) {
    return next(new AppError("Product ID is required", 400));
  }

  if (quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }

  // Check if product exists and is active
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (!product.isActive) {
    return next(new AppError("This product is no longer available", 400));
  }

  if (product.stock < quantity) {
    return next(
      new AppError(`Only ${product.stock} items available in stock`, 400)
    );
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId });
  }

  // Add item using schema method
  await cart.addItem(productId, quantity, product.price);

  // Populate and return
  await cart.populate({
    path: "items.product",
    select: "name images price stock isActive",
  });

  // ✅ FIXED: Changed parameter order
  return successResponse(
    res,
    { items: cart.items },
    "Product added to cart successfully"
  );
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = getUserId(req);

  if (!productId || quantity === undefined) {
    return next(new AppError("Product ID and quantity are required", 400));
  }

  if (quantity < 0) {
    return next(new AppError("Quantity cannot be negative", 400));
  }

  // Get product to check stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (product.stock < quantity) {
    return next(new AppError(`Only ${product.stock} items available`, 400));
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  // Update quantity (will remove if 0)
  await cart.updateItemQuantity(productId, quantity);

  await cart.populate({
    path: "items.product",
    select: "name images price stock isActive",
  });

  // ✅ FIXED: Changed parameter order
  return successResponse(
    res,
    { items: cart.items },
    "Cart updated successfully"
  );
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const userId = getUserId(req);

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  console.log("🔍 Cart found, items:", cart.items.length);
  console.log("🔍 About to call cart.removeItem...");

  await cart.removeItem(productId);

  console.log("🔍 removeItem completed");

  await cart.populate({
    path: "items.product",
    select: "name images price stock isActive",
  });

  // ✅ FIXED: Changed parameter order
  return successResponse(
    res,
    { items: cart.items },
    "Item removed from cart"
  );
});

exports.clearCart = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  await cart.clearCart();

  // ✅ FIXED: Changed parameter order
  return successResponse(
    res,
    { items: cart.items },
    "Cart cleared successfully"
  );
});

exports.applyCoupon = catchAsync(async (req, res, next) => {
  const { couponCode } = req.body;
  const userId = getUserId(req);

  if (!couponCode) {
    return next(new AppError("Coupon code is required", 400));
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  if (cart.items.length === 0) {
    return next(new AppError("Cart is empty", 400));
  }

  // TODO: Validate coupon from Coupon model
  // For now, applying a dummy 10% discount
  await cart.applyCoupon(couponCode, 10, "percentage");

  await cart.populate({
    path: "items.product",
    select: "name images price stock isActive",
  });

  // ✅ FIXED: Changed parameter order
  return successResponse(res, cart, "Coupon applied successfully");
});

exports.removeCoupon = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  await cart.removeCoupon();

  await cart.populate({
    path: "items.product",
    select: "name images price stock isActive",
  });

  // ✅ FIXED: Changed parameter order
  return successResponse(res, cart, "Coupon removed successfully");
});

exports.saveForLater = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const userId = getUserId(req);

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  await cart.saveForLater(productId);

  await cart.populate({
    path: "items.product",
    select: "name images price stock isActive",
  });
  await cart.populate({
    path: "savedForLater.product",
    select: "name images price",
  });

  // ✅ FIXED: Changed parameter order
  return successResponse(res, cart, "Item saved for later");
});

exports.moveToCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const userId = getUserId(req);

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (!product.isActive) {
    return next(new AppError("Product is no longer available", 400));
  }

  if (product.stock < 1) {
    return next(new AppError("Product is out of stock", 400));
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  await cart.moveToCart(productId, product.price);

  await cart.populate({
    path: "items.product",
    select: "name images price stock isActive",
  });
  await cart.populate({
    path: "savedForLater.product",
    select: "name images price",
  });

  // ✅ FIXED: Changed parameter order
  return successResponse(res, cart, "Item moved to cart");
});

exports.debugCart = catchAsync(async (req, res, next) => {
  const userId = getUserId(req);

  const cart = await Cart.findOne({ user: userId });
  const user = await User.findById(userId).select("cart");

  return res.json({
    message: "Debug info",
    cartModel: cart,
    userCart: user?.cart,
    userId: userId,
    authenticated: !!req.user,
  });
});