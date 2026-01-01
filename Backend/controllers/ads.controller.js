// ============================================================================
// FILE: Backend/controllers/ads.controller.js
// Handles all ad-related operations for landing page popups
// ============================================================================

const Ad = require('../models/ads.model');

// Helper function to wrap async functions (replaces asyncHandler)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper class for custom errors (replaces ErrorResponse)
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// ============================================
// PUBLIC ROUTES (Customer-facing)
// ============================================

/**
 * @desc    Get active popup ad for landing page
 * @route   GET /api/ads/active
 * @access  Public
 */
exports.getActiveAds = asyncHandler(async (req, res, next) => {
  const now = new Date();

  // Find the highest priority active ad
  const ad = await Ad.findOne({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  })
    .sort({ priority: -1, createdAt: -1 })
    .select('-__v -impressionCount -clickCount');

  if (!ad) {
    return res.status(200).json({
      success: true,
      message: 'No active ads available',
      data: { ad: null }
    });
  }

  // Increment impression count asynchronously (don't wait)
  ad.incrementImpression().catch(err => 
    console.error('Failed to increment impression:', err)
  );

  res.status(200).json({
    success: true,
    message: 'Active ad retrieved successfully',
    data: { ad }
  });
});

/**
 * @desc    Get single ad by ID
 * @route   GET /api/ads/:id
 * @access  Public
 */
exports.getAdById = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id).select('-__v');

  if (!ad) {
    return next(new ErrorResponse('Ad not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Ad retrieved successfully',
    data: { ad }
  });
});

/**
 * @desc    Track ad click (when user clicks CTA)
 * @route   POST /api/ads/:id/click
 * @access  Public
 */
exports.trackClick = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    return next(new ErrorResponse('Ad not found', 404));
  }

  // Increment click count
  await ad.incrementClick();

  res.status(200).json({
    success: true,
    message: 'Click tracked successfully',
    data: { 
      clickCount: ad.clickCount,
      buttonLink: ad.buttonLink 
    }
  });
});

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @desc    Get all ads (with filters and pagination)
 * @route   GET /api/ads (admin)
 * @access  Private/Admin
 */
exports.getAllAds = asyncHandler(async (req, res, next) => {
  // Filtering
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(field => delete queryObj[field]);

  // Build query
  let query = Ad.find(queryObj);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-priority -createdAt');
  }

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Ad.countDocuments(queryObj);

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const ads = await query;

  // Pagination result
  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalAds: total,
    limit
  };

  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    message: 'Ads retrieved successfully',
    count: ads.length,
    pagination,
    data: { ads }
  });
});

/**
 * @desc    Create new ad
 * @route   POST /api/ads (admin)
 * @access  Private/Admin
 */
exports.createAd = asyncHandler(async (req, res, next) => {
  // Validate dates
  const { validFrom, validUntil } = req.body;
  
  if (new Date(validFrom) >= new Date(validUntil)) {
    return next(new ErrorResponse('Valid from date must be before valid until date', 400));
  }

  // Add created by admin
  req.body.createdBy = req.user?.id;

  const ad = await Ad.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Ad created successfully',
    data: { ad }
  });
});

/**
 * @desc    Update ad
 * @route   PUT /api/ads/:id (admin)
 * @access  Private/Admin
 */
exports.updateAd = asyncHandler(async (req, res, next) => {
  let ad = await Ad.findById(req.params.id);

  if (!ad) {
    return next(new ErrorResponse('Ad not found', 404));
  }

  // Validate dates if provided
  const validFrom = req.body.validFrom || ad.validFrom;
  const validUntil = req.body.validUntil || ad.validUntil;

  if (new Date(validFrom) >= new Date(validUntil)) {
    return next(new ErrorResponse('Valid from date must be before valid until date', 400));
  }

  ad = await Ad.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Ad updated successfully',
    data: { ad }
  });
});

/**
 * @desc    Delete ad
 * @route   DELETE /api/ads/:id (admin)
 * @access  Private/Admin
 */
exports.deleteAd = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    return next(new ErrorResponse('Ad not found', 404));
  }

  await ad.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Ad deleted successfully',
    data: {}
  });
});

/**
 * @desc    Toggle ad active status
 * @route   PATCH /api/ads/:id/toggle-status (admin)
 * @access  Private/Admin
 */
exports.toggleAdStatus = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    return next(new ErrorResponse('Ad not found', 404));
  }

  ad.isActive = !ad.isActive;
  await ad.save();

  res.status(200).json({
    success: true,
    message: `Ad ${ad.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { 
      ad,
      isActive: ad.isActive 
    }
  });
});

/**
 * @desc    Get ad analytics
 * @route   GET /api/ads/:id/analytics (admin)
 * @access  Private/Admin
 */
exports.getAdAnalytics = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    return next(new ErrorResponse('Ad not found', 404));
  }

  const analytics = {
    impressions: ad.impressionCount,
    clicks: ad.clickCount,
    conversionRate: ad.impressionCount > 0 
      ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2) 
      : 0,
    isCurrentlyActive: ad.isValid,
    daysRemaining: Math.max(
      0, 
      Math.ceil((ad.validUntil - new Date()) / (1000 * 60 * 60 * 24))
    )
  };

  res.status(200).json({
    success: true,
    message: 'Analytics retrieved successfully',
    data: { analytics }
  });
});