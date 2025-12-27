// controllers/coupon.controller.js
const Coupon = require('../models/coupon.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

// Validate and apply coupon
exports.validateCoupon = catchAsync(async (req, res, next) => {
  const { code, subtotal } = req.body;

  if (!code || !subtotal) {
    return next(new AppError('Coupon code and subtotal are required', 400));
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  
  if (!coupon) {
    return next(new AppError('Invalid coupon code', 404));
  }

  // Check if coupon is valid
  const validity = coupon.isValid();
  if (!validity.valid) {
    return next(new AppError(validity.reason, 400));
  }

  // Check if user can use this coupon
  const userCanUse = coupon.canUserUse(req.user._id);
  if (!userCanUse.canUse) {
    return next(new AppError(userCanUse.reason, 400));
  }

  // Check minimum purchase requirement
  if (subtotal < coupon.minPurchase) {
    return next(new AppError(
      `Minimum purchase of NPR ${coupon.minPurchase} required`,
      400
    ));
  }

  // Calculate discount
  const discount = coupon.calculateDiscount(subtotal);

  return successResponse(res, {
    code: coupon.code,
    discount: discount,
    discountType: coupon.discountType,
    description: coupon.description,
    minPurchase: coupon.minPurchase,
    maxDiscount: coupon.maxDiscount
  }, 'Coupon applied successfully');
});

// Get all active coupons (public)
exports.getActiveCoupons = catchAsync(async (req, res, next) => {
  const now = new Date();
  
  const coupons = await Coupon.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).select('code description discountType discountValue minPurchase maxDiscount');

  return successResponse(res, coupons);
});

// Get coupon by code
exports.getCouponByCode = catchAsync(async (req, res, next) => {
  const { code } = req.params;

  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase(),
    isActive: true 
  });

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  return successResponse(res, {
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minPurchase: coupon.minPurchase,
    maxDiscount: coupon.maxDiscount,
    startDate: coupon.startDate,
    endDate: coupon.endDate
  });
});

// ===== ADMIN ONLY =====

// Create coupon
exports.createCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.create(req.body);
  return successResponse(res, coupon, 'Coupon created successfully', 201);
});

// Get all coupons (admin)
exports.getAllCoupons = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status } = req.query;

  const query = {};
  if (status) query.isActive = status === 'active';

  const coupons = await Coupon.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Coupon.countDocuments(query);

  return successResponse(res, {
    coupons,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get single coupon (admin)
exports.getCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id)
    .populate('usedBy.user', 'fullName email')
    .populate('applicableCategories', 'name')
    .populate('applicableProducts', 'name');

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  return successResponse(res, coupon);
});

// Update coupon
exports.updateCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  return successResponse(res, coupon, 'Coupon updated successfully');
});

// Delete coupon
exports.deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  return successResponse(res, null, 'Coupon deleted successfully');
});

// Toggle coupon status
exports.toggleCouponStatus = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  return successResponse(res, coupon, `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`);
});

// Get coupon statistics
exports.getCouponStats = catchAsync(async (req, res, next) => {
  const stats = await Coupon.aggregate([
    {
      $group: {
        _id: null,
        totalCoupons: { $sum: 1 },
        activeCoupons: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        totalUsage: { $sum: '$usageCount' },
        averageDiscount: { $avg: '$discountValue' }
      }
    }
  ]);

  return successResponse(res, stats[0] || {
    totalCoupons: 0,
    activeCoupons: 0,
    totalUsage: 0,
    averageDiscount: 0
  });
});