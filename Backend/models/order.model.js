// Backend/models/order.model.js - WITH RIDER SUPPORT
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  image: String,
  sku: String,
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      addressLine1: { type: String, required: true },
      addressLine2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: "Nepal" },
    },
    // ✅ NEW: Location with GeoJSON for map integration
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false,
      },
      address: String,
      landmark: String,
      instructions: String, // "Leave at door", "Ring twice", etc.
    },
    // ✅ NEW: Rider assignment fields
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    riderAssignedAt: Date,
    riderAcceptedAt: Date,
    riderPickedUpAt: Date,
    riderDeliveredAt: Date,
    riderLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: [Number], // [longitude, latitude]
      lastUpdated: Date,
    },
    deliveryNotes: String,
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    
    paymentMethod: {
      type: String,
      enum: ["COD", "eSewa", "Khalti", "Card"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentDetails: {
      transactionId: String,
      paidAt: Date,
      refundedAt: Date,
      refundAmount: Number,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    couponCode: String,
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped", // ✅ When assigned to rider
        "Out for Delivery", // ✅ NEW: Rider accepted and on the way
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
    },
    statusHistory: [
      {
        status: String,
        comment: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
    notes: String,
    adminNotes: String,
  },
  {
    timestamps: true,
  }
);

// ✅ NEW: Geospatial index for location queries
orderSchema.index({ 'location.coordinates': '2dsphere' });
orderSchema.index({ 'riderLocation.coordinates': '2dsphere' });

// Existing indexes
orderSchema.index({ orderId: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ rider: 1 }); // ✅ NEW
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

// Virtual for order age in days
orderSchema.virtual("orderAge").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to add status history
orderSchema.methods.addStatusHistory = function (status, comment, userId) {
  this.statusHistory.push({
    status,
    comment,
    updatedBy: userId,
    updatedAt: new Date(),
  });
};

// ✅ NEW: Method to assign rider
orderSchema.methods.assignRider = function (riderId, adminId) {
  this.rider = riderId;
  this.riderAssignedAt = new Date();
  this.orderStatus = 'Shipped';
  this.addStatusHistory('Shipped', 'Order assigned to rider', adminId);
};

// ✅ NEW: Method to update rider location
orderSchema.methods.updateRiderLocation = function (lat, lng) {
  this.riderLocation = {
    type: 'Point',
    coordinates: [lng, lat],
    lastUpdated: new Date()
  };
};

module.exports = mongoose.model("Order", orderSchema);