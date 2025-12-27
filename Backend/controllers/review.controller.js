const Review = require('../models/review.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

// ✅ Helper function to get user ID (handles both id and _id)
const getUserId = (req) => req.user.id || req.user._id;

// Get reviews for a product
exports.getProductReviews = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, rating, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = {
    product: productId,
    status: 'approved',
    deletedAt: null
  };

  if (rating) query.rating = parseInt(rating);

  const reviews = await Review.find(query)
    .populate('user', 'firstname lastname username avatar email')
    .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  // Transform reviews to add fullName for frontend consistency
  const transformedReviews = reviews.map(review => ({
    ...review,
    user: review.user ? {
      _id: review.user._id,
      firstname: review.user.firstname,
      lastname: review.user.lastname,
      username: review.user.username,
      avatar: review.user.avatar,
      email: review.user.email,
      fullName: `${review.user.firstname || ''} ${review.user.lastname || ''}`.trim() || review.user.username || 'Anonymous'
    } : null
  }));

  const total = await Review.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      reviews: transformedReviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get rating stats
exports.getRatingStats = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const stats = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        status: 'approved',
        deletedAt: null
      }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    }
  ]);

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalReviews = 0;
  let totalRating = 0;

  stats.forEach(stat => {
    ratingDistribution[stat._id] = stat.count;
    totalReviews += stat.count;
    totalRating += stat._id * stat.count;
  });

  const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

  res.status(200).json({
    success: true,
    data: {
      averageRating: parseFloat(averageRating),
      totalReviews,
      distribution: ratingDistribution
    }
  });
});

// Create review
exports.createReview = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { rating, title, comment } = req.body;

  // ✅ FIX: Use helper function to get user ID
  const userId = getUserId(req);

  // Validate productId
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError('Valid Product ID is required', 400));
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    user: userId,
    product: productId,
    deletedAt: null
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this product', 409));
  }

  const review = await Review.create({
    product: productId,
    user: userId,
    rating,
    title,
    comment,
    status: 'approved'
  });

  await review.populate('user', 'firstname lastname username avatar email');

  // Transform the review to include fullName
  const transformedReview = {
    ...review.toObject(),
    user: review.user ? {
      _id: review.user._id,
      firstname: review.user.firstname,
      lastname: review.user.lastname,
      username: review.user.username,
      avatar: review.user.avatar,
      email: review.user.email,
      fullName: `${review.user.firstname || ''} ${review.user.lastname || ''}`.trim() || review.user.username || 'Anonymous'
    } : null
  };

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: { review: transformedReview }
  });
});

// Get single review
exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'firstname lastname username avatar email')
    .lean();

  if (!review || review.deletedAt) {
    return next(new AppError('Review not found', 404));
  }

  // Transform the review
  const transformedReview = {
    ...review,
    user: review.user ? {
      _id: review.user._id,
      firstname: review.user.firstname,
      lastname: review.user.lastname,
      username: review.user.username,
      avatar: review.user.avatar,
      email: review.user.email,
      fullName: `${review.user.firstname || ''} ${review.user.lastname || ''}`.trim() || review.user.username || 'Anonymous'
    } : null
  };

  res.status(200).json({
    success: true,
    data: { review: transformedReview }
  });
});

// Update review
exports.updateReview = catchAsync(async (req, res, next) => {
  const { rating, title, comment } = req.body;

  // ✅ FIX: Use helper function to get user ID
  const userId = getUserId(req);

  const review = await Review.findOne({
    _id: req.params.id,
    user: userId,
    deletedAt: null
  });

  if (!review) {
    return next(new AppError('Review not found or unauthorized', 404));
  }

  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment) review.comment = comment;
  review.isEdited = true;
  review.editedAt = new Date();

  await review.save();
  await review.populate('user', 'firstname lastname username avatar email');

  // Transform the review
  const transformedReview = {
    ...review.toObject(),
    user: review.user ? {
      _id: review.user._id,
      firstname: review.user.firstname,
      lastname: review.user.lastname,
      username: review.user.username,
      avatar: review.user.avatar,
      email: review.user.email,
      fullName: `${review.user.firstname || ''} ${review.user.lastname || ''}`.trim() || review.user.username || 'Anonymous'
    } : null
  };

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: { review: transformedReview }
  });
});

// Delete review
exports.deleteReview = catchAsync(async (req, res, next) => {
  // ✅ FIX: Use helper function to get user ID
  const userId = getUserId(req);

  const review = await Review.findOne({
    _id: req.params.id,
    user: userId
  });

  if (!review) {
    return next(new AppError('Review not found or unauthorized', 404));
  }

  review.deletedAt = new Date();
  await review.save();

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// Vote on review
exports.voteReview = catchAsync(async (req, res, next) => {
  const { voteType } = req.body;

  // ✅ FIX: Use helper function to get user ID
  const userId = getUserId(req);

  if (!['helpful', 'not-helpful'].includes(voteType)) {
    return next(new AppError('Invalid vote type', 400));
  }

  const review = await Review.findById(req.params.id);

  if (!review || review.deletedAt) {
    return next(new AppError('Review not found', 404));
  }

  await review.addHelpfulVote(userId, voteType);

  res.status(200).json({
    success: true,
    message: 'Vote recorded successfully',
    data: {
      helpfulCount: review.helpfulCount,
      notHelpfulCount: review.notHelpfulCount
    }
  });
});