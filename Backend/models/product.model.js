// Backend/models/product.model.js - FIXED DUPLICATE INDEX
const mongoose = require("mongoose");
const slugify = require("slugify");
const Cart = require('./cart.model');
const User = require('./user.model');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },

    slug: {
      type: String,
      unique: true, // ✅ This creates an index automatically - removed duplicate
      lowercase: true,
      trim: true,
    },

    description: { type: String, trim: true, maxlength: 2000 },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true, // ✅ Keep only this
    },

    images: [
      {
        type: String,
      },
    ],

    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0, default: 0 },
    
    discount: { type: Number, default: 0, min: 0, max: 100 },
    
    stock: { type: Number, default: 0, min: 0 },

    productType: {
      type: String,
      enum: ["fruit", "herb", "honey", "grain", "vegetable", "dairy", "other"],
      required: true,
      index: true, // ✅ Keep only this
    },
    
    unit: { type: String, default: "kg" },
    brand: { type: String, trim: true },
    isOrganic: { type: Boolean, default: false },
    isSeasonal: { type: Boolean, default: false },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },

    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false, index: true }, // ✅ Keep only this
    
    views: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
  },
  { 
    timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
  }
);

// ✅ INDEXES (removed duplicates)
productSchema.index({ rating: -1 });

// Pre-save middleware to auto-generate slug
productSchema.pre("save", async function (next) {
  if (!this.slug || this.isModified("name")) {
    let baseSlug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    let slug = baseSlug;
    let counter = 1;

    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  
  // Calculate discount
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  } else {
    this.discount = 0;
  }
  
  next();
});

// Virtuals
productSchema.virtual("fullName").get(function () {
  return this.name;
});

// Method to get approved reviews
productSchema.methods.getApprovedReviews = function (limit = 10, page = 1) {
  const Review = mongoose.model("Review");
  return Review.find({ product: this._id, status: "approved", deletedAt: null })
    .populate("user", "fullName avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// When product is deleted, remove from all carts
productSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    console.log(`🗑️ Product ${doc._id} deleted, cleaning up carts...`);
    
    await Cart.updateMany(
      { 'items.product': doc._id },
      { $pull: { items: { product: doc._id } } }
    );

    await User.updateMany(
      { 'cart.product': doc._id },
      { $pull: { cart: { product: doc._id } } }
    );

    await Cart.updateMany(
      { 'savedForLater.product': doc._id },
      { $pull: { savedForLater: { product: doc._id } } }
    );

    console.log('✅ Carts cleaned up successfully');
  }
});

productSchema.post('deleteOne', { document: true, query: false }, async function() {
  const productId = this._id;
  
  await Cart.updateMany(
    { 'items.product': productId },
    { $pull: { items: { product: productId } } }
  );

  await User.updateMany(
    { 'cart.product': productId },
    { $pull: { cart: { product: productId } } }
  );

  await Cart.updateMany(
    { 'savedForLater.product': productId },
    { $pull: { savedForLater: { product: productId } } }
  );
});

productSchema.post('deleteMany', async function() {
  console.log('🗑️ Multiple products deleted, recommend full cart validation');
});

module.exports = mongoose.model("Product", productSchema);