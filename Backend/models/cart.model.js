// ============================================
// Backend/models/cart.model.js - COMPLETE FIXED VERSION
// ============================================

const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
    productSnapshot: { name: String, image: String, sku: String },
    subtotal: { type: Number, required: true, default: 0 },
  },
  { _id: false, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],

    subtotal: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },

    appliedCoupon: {
      code: String,
      discount: { type: Number, default: 0 },
      discountType: { type: String, enum: ["percentage", "fixed"] },
    },
    sessionId: { type: String, sparse: true },
    isActive: { type: Boolean, default: true },
    savedForLater: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        savedAt: { type: Date, default: Date.now },
      },
    ],

    lastActivity: { type: Date, default: Date.now, index: true },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtuals
cartSchema.virtual("itemsCount").get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

cartSchema.virtual("uniqueProductsCount").get(function () {
  return this.items.length;
});

cartSchema.virtual("isEmpty").get(function () {
  return this.items.length === 0;
});

// ============================================
// CART METHODS
// ============================================

// Add item to cart
cartSchema.methods.addItem = async function (productId, quantity, price) {
  const existingItem = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price = price;
  } else {
    this.items.push({
      product: productId,
      quantity,
      price,
      subtotal: price * quantity,
    });
  }

  return this.save();
};

// Update item quantity
cartSchema.methods.updateItemQuantity = async function (productId, quantity) {
  const item = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (!item) {
    throw new Error("Item not found in cart");
  }

  if (quantity === 0) {
    return this.removeItem(productId);
  }

  item.quantity = quantity;
  return this.save();
};

// Remove item from cart - FIXED: Using filter instead of .remove()
cartSchema.methods.removeItem = async function (productId) {
  console.log('🗑️ Removing item from cart:', productId);
  console.log('📦 Current items before removal:', this.items.length);
  
  // Filter out the item to remove
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  
  console.log('📦 Items after removal:', this.items.length);
  
  // Save and return
  await this.save();
  console.log('✅ Cart saved successfully');
  return this;
};

// Clear entire cart
cartSchema.methods.clearCart = async function () {
  this.items = [];
  this.appliedCoupon = undefined;
  this.discount = 0;
  return this.save();
};

// Apply coupon
cartSchema.methods.applyCoupon = async function (code, discount, discountType) {
  this.appliedCoupon = {
    code,
    discount,
    discountType,
  };
  return this.save();
};

// Remove coupon
cartSchema.methods.removeCoupon = async function () {
  this.appliedCoupon = undefined;
  return this.save();
};

// Save item for later
cartSchema.methods.saveForLater = async function (productId) {
  const itemIndex = this.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (itemIndex === -1) {
    throw new Error("Item not found in cart");
  }

  const item = this.items[itemIndex];
  
  // Check if already in saved for later
  const alreadySaved = this.savedForLater.some(
    (saved) => saved.product.toString() === productId.toString()
  );

  if (!alreadySaved) {
    this.savedForLater.push({
      product: item.product,
      savedAt: new Date(),
    });
  }

  // Remove from cart items using splice
  this.items.splice(itemIndex, 1);
  return this.save();
};

// Move item back to cart
cartSchema.methods.moveToCart = async function (productId, price) {
  const savedIndex = this.savedForLater.findIndex(
    (saved) => saved.product.toString() === productId.toString()
  );

  if (savedIndex === -1) {
    throw new Error("Item not found in saved for later");
  }

  // Check if already in cart
  const existingItem = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    this.items.push({
      product: productId,
      quantity: 1,
      price,
      subtotal: price,
    });
  }

  // Remove from saved for later using splice
  this.savedForLater.splice(savedIndex, 1);
  return this.save();
};

// Pre-save: calculate totals
cartSchema.pre("save", function (next) {
  // Calculate subtotals for each item
  this.items.forEach((item) => {
    item.subtotal = item.price * item.quantity;
  });
  
  // Calculate cart subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  
  // Calculate shipping fee
  this.shippingFee = this.subtotal >= 2000 ? 0 : 100;
  
  // Calculate tax (13%)
  this.tax = Math.round(this.subtotal * 0.13);

  // Calculate coupon discount
  let couponDiscount = 0;
  if (this.appliedCoupon?.code) {
    couponDiscount =
      this.appliedCoupon.discountType === "percentage"
        ? Math.round(this.subtotal * (this.appliedCoupon.discount / 100))
        : this.appliedCoupon.discount;
  }

  // Calculate total
  this.total = Math.max(
    0,
    this.subtotal + this.tax + this.shippingFee - this.discount - couponDiscount
  );
  
  // Update activity tracking
  this.lastActivity = new Date();
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  next();
});

module.exports = mongoose.model("Cart", cartSchema);