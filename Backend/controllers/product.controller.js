const Product = require("../models/product.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
// Get all products
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    productType,
    minPrice,
    maxPrice,
    isOrganic,
    isFeatured,
    sort = 'newest', // Add sort parameter with default value
  } = req.query;

  // Build filter
  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category) filter.category = category;
  if (productType) filter.productType = productType;
  if (isOrganic === "true") filter.isOrganic = true;
  if (isFeatured === "true") filter.isFeatured = true;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Determine sort order
  let sortOption = "-createdAt"; // Default: newest first
  
  switch (sort) {
    case 'newest':
    case 'newest_first':
      sortOption = "-createdAt";
      break;
    case 'oldest':
      sortOption = "createdAt";
      break;
    case 'price_low':
    case 'price_low_to_high':
      sortOption = "price";
      break;
    case 'price_high':
    case 'price_high_to_low':
      sortOption = "-price";
      break;
    case 'name_asc':
    case 'a_to_z':
      sortOption = "name";
      break;
    case 'name_desc':
    case 'z_to_a':
      sortOption = "-name";
      break;
    case 'rating':
    case 'most_rated':
    case 'highest_rated':
      sortOption = "-rating -reviewCount";
      break;
    case 'popular':
    case 'most_popular':
      sortOption = "-sold -views -rating";
      break;
    case 'discount':
      sortOption = "-discount";
      break;
    default:
      sortOption = "-createdAt";
  }

  // Execute query
  const skip = (page - 1) * limit;
  const products = await Product.find(filter)
    .populate("category", "name slug")
    .skip(skip)
    .limit(Number(limit))
    .sort(sortOption); // Use dynamic sort option

  const total = await Product.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    data: products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});
// Get product by ID
exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug");
    
  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({
    success: true,
    message: "Product fetched successfully",
    data: product,
  });
});

// Get product by slug
exports.getProductBySlug = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate("category", "name slug");
    
  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({
    success: true,
    message: "Product fetched successfully",
    data: product,
  });
});

// Search products
exports.searchProducts = catchAsync(async (req, res, next) => {
  const { q, limit = 10 } = req.query;
  if (!q) return next(new AppError("Search query is required", 400));

  const products = await Product.find({
    isActive: true,
    $or: [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ],
  })
    .populate("category", "name slug")
    .limit(Number(limit))
    .sort("-rating");

  res.status(200).json({
    success: true,
    message: "Search results fetched successfully",
    data: products,
  });
});

// Featured products
exports.getFeaturedProducts = catchAsync(async (req, res, next) => {
  const { limit = 8 } = req.query;
  
  const products = await Product.find({ 
    isFeatured: true, 
    isActive: true,
    stock: { $gt: 0 }
  })
    .populate("category", "name slug")
    .limit(Number(limit))
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    message: "Featured products fetched successfully",
    data: products,
  });
});

// Products on sale
exports.getOnSaleProducts = catchAsync(async (req, res, next) => {
  const { limit = 12 } = req.query;
  
  const products = await Product.find({ 
    discount: { $gt: 0 },
    isActive: true,
    stock: { $gt: 0 }
  })
    .populate("category", "name slug")
    .limit(Number(limit))
    .sort("-discount");

  res.status(200).json({
    success: true,
    message: "Products on sale fetched successfully",
    data: products,
  });
});

// Bestsellers
exports.getBestsellers = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const products = await Product.find({ isActive: true, stock: { $gt: 0 } })
    .populate("category", "name slug")
    .sort("-sold -rating")
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    message: "Bestsellers fetched successfully",
    data: products,
  });
});

// Organic products
exports.getOrganicProducts = catchAsync(async (req, res, next) => {
  const { limit = 12 } = req.query;
  
  const products = await Product.find({ 
    isOrganic: true, 
    isActive: true,
    stock: { $gt: 0 }
  })
    .populate("category", "name slug")
    .limit(Number(limit))
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    message: "Organic products fetched successfully",
    data: products,
  });
});

// Seasonal products
exports.getSeasonalProducts = catchAsync(async (req, res, next) => {
  const { limit = 12 } = req.query;
  
  const products = await Product.find({ 
    isSeasonal: true, 
    isActive: true,
    stock: { $gt: 0 }
  })
    .populate("category", "name slug")
    .limit(Number(limit))
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    message: "Seasonal products fetched successfully",
    data: products,
  });
});

// Products by type
exports.getProductsByType = catchAsync(async (req, res, next) => {
  const { limit = 12, page = 1 } = req.query;
  const skip = (page - 1) * limit;
  
  const products = await Product.find({ 
    productType: req.params.productType,
    isActive: true 
  })
    .populate("category", "name slug")
    .skip(skip)
    .limit(Number(limit))
    .sort("-createdAt");

  const total = await Product.countDocuments({ 
    productType: req.params.productType,
    isActive: true 
  });

  res.status(200).json({
    success: true,
    message: `Products of type ${req.params.productType} fetched successfully`,
    data: products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// Products by category
exports.getProductsByCategory = catchAsync(async (req, res, next) => {
  const { limit = 12, page = 1 } = req.query;
  const skip = (page - 1) * limit;
  
  const products = await Product.find({ 
    category: req.params.categoryId,
    isActive: true 
  })
    .populate("category", "name slug")
    .skip(skip)
    .limit(Number(limit))
    .sort("-createdAt");

  const total = await Product.countDocuments({ 
    category: req.params.categoryId,
    isActive: true 
  });

  res.status(200).json({
    success: true,
    message: "Products by category fetched successfully",
    data: products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// Increment product view
exports.incrementProductView = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({
    success: true,
    message: "Product view incremented",
    data: product,
  });
});
// ============================================
// PART 2: Backend/controllers/product.controller.js
// ADD THIS TO YOUR EXISTING FILE (append to end)
// ============================================

// Increment Product View (IMPROVED VERSION)
exports.incrementProductView = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Track unique views using session/IP (optional)
  // For now, just increment on every view
  const product = await Product.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('category', 'name slug');

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Don't send full product, just confirmation
  res.status(200).json({
    success: true,
    message: 'Product view recorded',
    data: {
      views: product.views
    }
  });
});

// Get Product Statistics (NEW)
exports.getProductStats = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id).select('rating reviewCount views sold');
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Get rating breakdown
  const ratingBreakdown = await Review.aggregate([
    { 
      $match: { 
        product: product._id, 
        status: 'approved', 
        deletedAt: null 
      } 
    },
    { 
      $group: { 
        _id: '$rating', 
        count: { $sum: 1 } 
      } 
    },
    { $sort: { _id: -1 } }
  ]);

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratingBreakdown.forEach(item => {
    breakdown[item._id] = item.count;
  });

  res.status(200).json({
    success: true,
    data: {
      rating: product.rating,
      reviewCount: product.reviewCount,
      views: product.views,
      sold: product.sold,
      ratingBreakdown: breakdown
    }
  });
});

module.exports = exports;