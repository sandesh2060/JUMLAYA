// ============================================
// Backend/routes/rider.routes.js
// ✅ COMPLETE ROUTE CONFIGURATION
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
// PROTECTED ROUTES (All require authentication)
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
// ✅ FILE UPLOADS - FIXED ORDER AND LOGGING
// ============================================

// Avatar upload route
router.post(
  "/avatar/upload",
  (req, res, next) => {
    console.log('🔵 Avatar upload route hit');
    next();
  },
  uploadSingle("avatar"),
  handleUploadError,
  uploadAvatar
);

// ✅ CRITICAL: Document upload with detailed logging
router.post(
  "/documents/:documentType/upload",
  (req, res, next) => {
    console.log('🔵 Document upload route hit:', {
      documentType: req.params.documentType,
      contentType: req.headers['content-type'],
      method: req.method
    });
    next();
  },
  uploadSingle("document"),
  handleUploadError,
  (req, res, next) => {
    console.log('🔵 After multer middleware:', {
      hasFile: !!req.file,
      file: req.file
    });
    next();
  },
  uploadDocument
);

// Get documents
router.get("/documents", getDocuments);

// Delete document
router.delete("/documents/:documentType", deleteDocument);

// ============================================
// ORDERS - SPECIFIC ROUTES FIRST
// ============================================
router.get("/orders/pending", getPendingOrders);
router.get("/orders/active", getActiveOrders);
router.get("/orders/history", getOrderHistory);
router.get("/orders", getOrders);

// Dynamic routes LAST
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