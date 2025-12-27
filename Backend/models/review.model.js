// models/review.model.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number'
    }
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  images: [{
    url: { type: String, required: true },
    alt: String,
    publicId: String
  }],
  isVerifiedPurchase: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: Date,
  rejectionReason: { type: String, maxlength: [500, 'Rejection reason cannot exceed 500 characters'] },
  helpfulCount: { type: Number, default: 0, min: 0 },
  notHelpfulCount: { type: Number, default: 0, min: 0 },
  helpfulVotes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vote: { type: String, enum: ['helpful', 'not-helpful'] },
    votedAt: { type: Date, default: Date.now }
  }],
  adminResponse: {
    comment: { type: String, maxlength: [500, 'Admin response cannot exceed 500 characters'] },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    respondedAt: Date
  },
  isFeatured: { type: Boolean, default: false },
  isReported: { type: Boolean, default: false },
  reportCount: { type: Number, default: 0 },
  editedAt: Date,
  isEdited: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes - FIXED: Added partial filter to unique index for soft deletes
reviewSchema.index(
  { product: 1, user: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { deletedAt: null }
  }
);
reviewSchema.index({ product: 1, status: 1, rating: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ isVerifiedPurchase: 1 });
reviewSchema.index({ deletedAt: 1 });

// Virtual for helpfulness ratio
reviewSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.helpfulCount + this.notHelpfulCount;
  return total === 0 ? 0 : (this.helpfulCount / total) * 100;
});

// Verify purchase on save
reviewSchema.pre('save', async function(next) {
  if (this.isNew && !this.isVerifiedPurchase && this.order) {
    const Order = mongoose.model('Order');
    const order = await Order.findOne({
      _id: this.order,
      user: this.user,
      orderStatus: 'delivered',
      'items.product': this.product
    });
    if (order) this.isVerifiedPurchase = true;
  }
  next();
});

// Update product rating after save/update/delete
async function updateProductRating(productId) {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { product: productId, status: 'approved', deletedAt: null } },
    { $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
    }}
  ]);
  const Product = mongoose.model('Product');
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].totalReviews
    });
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });
  }
}

reviewSchema.post('save', async function(doc) {
  if (doc.status === 'approved') await updateProductRating(doc.product);
});

reviewSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.status === 'approved') await updateProductRating(doc.product);
});

reviewSchema.post('remove', async function(doc) {
  if (doc) await updateProductRating(doc.product);
});

// Instance Methods

reviewSchema.methods.approve = async function(moderatorId) {
  this.status = 'approved';
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  await this.save();
  await updateProductRating(this.product);
};

reviewSchema.methods.reject = async function(moderatorId, reason) {
  this.status = 'rejected';
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  this.rejectionReason = reason;
  await this.save();
  await updateProductRating(this.product);
};

reviewSchema.methods.addHelpfulVote = async function(userId, voteType) {
  const existingIndex = this.helpfulVotes.findIndex(v => v.user.toString() === userId.toString());
  if (existingIndex > -1) {
    const oldVote = this.helpfulVotes[existingIndex].vote;
    if (oldVote === voteType) {
      // Remove vote
      this.helpfulVotes.splice(existingIndex, 1);
      if (voteType === 'helpful') this.helpfulCount--;
      else this.notHelpfulCount--;
    } else {
      // Switch vote
      this.helpfulVotes[existingIndex].vote = voteType;
      if (voteType === 'helpful') { this.helpfulCount++; this.notHelpfulCount--; }
      else { this.helpfulCount--; this.notHelpfulCount++; }
    }
  } else {
    this.helpfulVotes.push({ user: userId, vote: voteType, votedAt: new Date() });
    if (voteType === 'helpful') this.helpfulCount++;
    else this.notHelpfulCount++;
  }
  await this.save();
};

reviewSchema.methods.addAdminResponse = async function(comment, adminId) {
  this.adminResponse = { comment, respondedBy: adminId, respondedAt: new Date() };
  await this.save();
};

reviewSchema.methods.report = async function() {
  this.isReported = true;
  this.reportCount++;
  await this.save();
};

reviewSchema.methods.feature = async function() {
  this.isFeatured = true;
  await this.save();
};

reviewSchema.methods.edit = async function(updates) {
  if (updates.rating) this.rating = updates.rating;
  if (updates.title) this.title = updates.title;
  if (updates.comment) this.comment = updates.comment;
  this.isEdited = true;
  this.editedAt = new Date();
  await this.save();
  if (updates.rating) await updateProductRating(this.product);
};

reviewSchema.methods.softDelete = async function() {
  this.deletedAt = new Date();
  await this.save();
  await updateProductRating(this.product);
};

// Static Methods
reviewSchema.statics.getProductReviews = function(productId, options = {}) {
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', rating = null, verified = null } = options;
  const query = { product: productId, status: 'approved', deletedAt: null };
  if (rating) query.rating = rating;
  if (verified !== null) query.isVerifiedPurchase = verified;
  return this.find(query)
    .populate('user', 'fullName avatar')
    .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

reviewSchema.statics.canUserReview = async function(userId, productId) {
  const existing = await this.findOne({ user: userId, product: productId, deletedAt: null });
  if (existing) return { canReview: false, reason: 'Already reviewed' };
  const Order = mongoose.model('Order');
  const order = await Order.findOne({ user: userId, orderStatus: 'delivered', 'items.product': productId });
  if (!order) return { canReview: false, reason: 'Purchase required' };
  return { canReview: true };
};

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;