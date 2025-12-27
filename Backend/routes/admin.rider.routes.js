// ============================================
// Backend/routes/admin.rider.routes.js
// Admin Rider Management Routes - FIXED
// ============================================
const express = require("express");
const router = express.Router();

// ✅ FIXED: Use the correct function names from auth.middleware.js
const { protect, restrictTo } = require("../middlewares/auth.middleware");

// ✅ FIXED: Import controller functions correctly
const {
  getAllRiders,
  getRider,
  approveRider,
  rejectRider,
  getRiderStats
} = require("../controllers/admin/admin.rider.controller");

// ✅ Apply authentication and authorization middleware
router.use(protect);           // Verify JWT token
router.use(restrictTo("admin")); // Only admins allowed

// ✅ IMPORTANT: Stats route MUST come BEFORE /:id route
router.get("/stats", getRiderStats);

// ✅ Get all riders with filters
router.get("/", getAllRiders);

// ✅ Get single rider by ID
router.get("/:id", getRider);

// ✅ Approve rider
router.patch("/:id/approve", approveRider);

// ✅ Reject rider
router.post("/:id/reject", rejectRider);

module.exports = router;