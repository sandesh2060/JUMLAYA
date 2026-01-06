// Backend/models/order.model.js - FIXED DUPLICATE INDEXES
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
      unique: true, // ✅ This creates an index automatically - removed duplicate
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // ✅ Keep only this
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
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: false,
      },
      address: String,
      landmark: String,
      instructions: String,
    },
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true, // ✅ Keep only this
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
      coordinates: [Number],
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
      index: true, // ✅ Keep only this
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
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
      index: true, // ✅ Keep only this
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

// ✅ Geospatial indexes
orderSchema.index({ 'location.coordinates': '2dsphere' });
orderSchema.index({ 'riderLocation.coordinates': '2dsphere' });

// ✅ Additional indexes (removed duplicates)
orderSchema.index({ createdAt: -1 });

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

// Method to assign rider
orderSchema.methods.assignRider = function (riderId, adminId) {
  this.rider = riderId;
  this.riderAssignedAt = new Date();
  this.orderStatus = 'Shipped';
  this.addStatusHistory('Shipped', 'Order assigned to rider', adminId);
};

// Method to update rider location
orderSchema.methods.updateRiderLocation = function (lat, lng) {
  this.riderLocation = {
    type: 'Point',
    coordinates: [lng, lat],
    lastUpdated: new Date()
  };
};

module.exports = mongoose.model("Order", orderSchema);