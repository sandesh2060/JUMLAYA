// controllers/wishlist.controller.js
const mongoose = require("mongoose"); // Add this
const Wishlist = require("../models/wishlist.model");
const Product = require("../models/product.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { successResponse } = require("../utils/response");

// Helper to get user ID as ObjectId
const getUserId = (req) => {
  const userId = req.user._id || req.user.id;
  // Convert to ObjectId if it's a string
  return mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;
};

// Get user's wishlist
exports.getWishlist = catchAsync(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: getUserId(req) }).populate({
    path: "items.product",
    select:
      "name slug images price originalPrice discount stock isActive rating reviewCount",
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: getUserId(req) });
  }

  // Filter out inactive products
  if (wishlist.items) {
    wishlist.items = wishlist.items.filter(
      (item) => item.product && item.product.isActive
    );
    await wishlist.save();
  }

  return successResponse(
    res,
    { items: wishlist.items },
    "Wishlist fetched successfully"
  );
});

// Add product to wishlist
exports.addToWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return next(new AppError("Product ID is required", 400));
  }

  // Check if product exists and is active
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (!product.isActive) {
    return next(new AppError("Product is not available", 400));
  }

  // Get or create wishlist
  let wishlist = await Wishlist.findOne({ user: getUserId(req) });
  if (!wishlist) {
    wishlist = new Wishlist({ user: getUserId(req) });
  }

  // Check if product already in wishlist
  const exists = wishlist.items.some(
    (item) => item.product.toString() === productId.toString()
  );

  if (exists) {
    return next(new AppError("Product already in wishlist", 400));
  }

  // Add to wishlist
  await wishlist.addItem(productId);

  // Populate and return
  await wishlist.populate({
    path: "items.product",
    select:
      "name slug images price originalPrice discount stock isActive rating reviewCount",
  });

  return successResponse(
    res,
    { items: wishlist.items },
    "Product added to wishlist",
    201
  );
});

// Remove product from wishlist
exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: getUserId(req) });

  if (!wishlist) {
    return next(new AppError("Wishlist not found", 404));
  }

  const itemExists = wishlist.items.some(
    (item) => item.product.toString() === productId.toString()
  );

  if (!itemExists) {
    return next(new AppError("Product not in wishlist", 404));
  }

  await wishlist.removeItem(productId);

  await wishlist.populate({
    path: "items.product",
    select:
      "name slug images price originalPrice discount stock isActive rating reviewCount",
  });

  return successResponse(
    res,
    { items: wishlist.items },
    "Product removed from wishlist"
  );
});

// Clear entire wishlist
exports.clearWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: getUserId(req) });

  if (!wishlist) {
    return next(new AppError("Wishlist not found", 404));
  }

  await wishlist.clearWishlist();

  return successResponse(
    res,
    { items: wishlist.items },
    "Wishlist cleared successfully"
  );
});

// Check if product is in wishlist
exports.checkWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: getUserId(req) });

  const inWishlist = wishlist
    ? wishlist.items.some(
        (item) => item.product.toString() === productId.toString()
      )
    : false;

  return successResponse(res, {
    inWishlist,
    productId,
  });
});

// Move item from wishlist to cart
exports.moveToCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const Cart = require("../models/cart.model");

  // Get wishlist
  const wishlist = await Wishlist.findOne({ user: getUserId(req) });
  if (!wishlist) {
    return next(new AppError("Wishlist not found", 404));
  }

  // Check if product in wishlist
  const itemExists = wishlist.items.some(
    (item) => item.product.toString() === productId.toString()
  );

  if (!itemExists) {
    return next(new AppError("Product not in wishlist", 404));
  }

  // Get product details
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (!product.isActive) {
    return next(new AppError("Product is not available", 400));
  }

  if (product.stock < 1) {
    return next(new AppError("Product is out of stock", 400));
  }

  // Add to cart
  let cart = await Cart.findOne({ user: getUserId(req) });
  if (!cart) {
    cart = new Cart({ user: getUserId(req) });
  }

  await cart.addItem(productId, 1, product.price, {
    name: product.name,
    image: product.images[0]?.url,
    sku: product.sku,
  });

  // Remove from wishlist
  await wishlist.removeItem(productId);

  return successResponse(
    res,
    {
      cart,
      wishlist,
    },
    "Product moved to cart"
  );
});

// Get wishlist count
exports.getWishlistCount = catchAsync(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: getUserId(req) });

  const count = wishlist ? wishlist.items.length : 0;

  return successResponse(res, { count });
});
