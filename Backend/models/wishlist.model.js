// ============================================
// FILE #9: models/wishlist.model.js
// ============================================
const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true,
    index: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 });
wishlistSchema.index({ 'items.addedAt': -1 });

// Virtual for items count
wishlistSchema.virtual('itemsCount').get(function() {
  return this.items ? this.items.length : 0;
});

// Add item to wishlist
wishlistSchema.methods.addItem = async function(productId) {
  const exists = this.items.some(item => 
    item.product.toString() === productId.toString()
  );

  if (exists) {
    throw new Error('Product already in wishlist');
  }

  this.items.push({ 
    product: productId,
    addedAt: new Date()
  });
  
  return await this.save();
};

// Remove item from wishlist
wishlistSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(item =>
    item.product.toString() !== productId.toString()
  );
  return await this.save();
};

// Clear wishlist
wishlistSchema.methods.clearWishlist = async function() {
  this.items = [];
  return await this.save();
};

// Check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
  return this.items.some(item => 
    item.product.toString() === productId.toString()
  );
};

// Get wishlist statistics
wishlistSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalWishlists: { $sum: 1 },
        totalItems: { $sum: { $size: '$items' } },
        averageItemsPerWishlist: { $avg: { $size: '$items' } }
      }
    }
  ]);

  return stats[0] || {
    totalWishlists: 0,
    totalItems: 0,
    averageItemsPerWishlist: 0
  };
};

// Find wishlists containing a specific product
wishlistSchema.statics.findByProduct = async function(productId) {
  return await this.find({ 'items.product': productId })
    .populate('user', 'fullName email')
    .select('user items createdAt');
};

module.exports = mongoose.model('Wishlist', wishlistSchema);