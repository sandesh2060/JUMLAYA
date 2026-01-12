// ============================================
// INDEX 1B: Backend/routes/rider.routes.js
// ✅ CRITICAL FIX: Document routes BEFORE dynamic order routes
// ============================================
const express = require("express");
const router = express.Router();

const {
  registerRider,
  getDashboard,
  getStats,
  updateStatus,
  updateLocation,
  getOrders,
  getPendingOrders,
  getActiveOrders,
  getOrderHistory,
  getOrderDetails,
  acceptOrder,
  updateOrderStatus,
  pickupOrder,
  deliverOrder,
  getProfile,
  updateProfile,
  getEarnings,
} = require("../controllers/rider/rider.controller");

const {
  uploadAvatar,
  uploadDocument,
  getDocuments,
  deleteDocument,
} = require("../controllers/rider/rider.document.controller");

const {
  uploadSingle,
  handleUploadError,
} = require("../middlewares/upload.middleware");

const { protect, restrictTo } = require("../middlewares/auth.middleware");
const { isVerifiedRider } = require("../middlewares/rider.middleware");

// ============================================
// PUBLIC ROUTES
// ============================================
router.post("/register", registerRider);

// ============================================
// PROTECTED ROUTES
// ============================================
router.use(protect);
router.use(restrictTo("rider", "admin"));
router.use(isVerifiedRider);

// ============================================
// DASHBOARD & STATS
// ============================================
router.get("/dashboard", getDashboard);
router.get("/stats", getStats);

// ============================================
// STATUS MANAGEMENT
// ============================================
router.patch("/status", updateStatus);
router.patch("/location", updateLocation);

// ============================================
// ✅ FILE UPLOADS - CRITICAL: BEFORE ORDER ROUTES
// ============================================
router.post(
  "/avatar/upload",
  uploadSingle("avatar"),
  handleUploadError,
  uploadAvatar
);

router.post(
  "/documents/upload",
  uploadSingle("document"),
  handleUploadError,
  uploadDocument
);

router.get("/documents", getDocuments);
router.delete("/documents/:documentType", deleteDocument);

// ============================================
// ORDERS - SPECIFIC ROUTES FIRST, THEN DYNAMIC
// ============================================
router.get("/orders/pending", getPendingOrders);
router.get("/orders/active", getActiveOrders);
router.get("/orders/history", getOrderHistory);
router.get("/orders", getOrders);

// ✅ Dynamic routes LAST
router.get("/orders/:orderId", getOrderDetails);
router.post("/orders/:orderId/accept", acceptOrder);
router.patch("/orders/:orderId/status", updateOrderStatus);
router.post("/orders/:orderId/pickup", pickupOrder);
router.post("/orders/:orderId/deliver", deliverOrder);

// ============================================
// PROFILE & EARNINGS
// ============================================
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.get("/earnings", getEarnings);

module.exports = router;