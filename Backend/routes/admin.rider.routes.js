// ============================================
// Backend/routes/admin.rider.routes.js
// ✅ PERFECT - Complete Admin Rider Routes
// ============================================
const express = require('express');
const router = express.Router();

const {
  getAllRiders,
  getRider,
  getRiderStats,
  approveRider,
  rejectRider,
  verifyDocument,
  getDocumentHistory 
} = require('../controllers/admin/admin.rider.controller');

const { protect, restrictTo } = require('../middlewares/auth.middleware');

// ============================================
// ALL ROUTES REQUIRE ADMIN AUTHENTICATION
// ============================================
router.use(protect);
router.use(restrictTo('admin'));

// ============================================
// RIDER STATISTICS
// ============================================
/**
 * @route   GET /api/admin/riders/stats
 * @desc    Get rider statistics (total, pending, approved, active, offline)
 * @access  Admin
 */
router.get('/stats', getRiderStats);

// ============================================
// RIDER LISTING & DETAILS
// ============================================
/**
 * @route   GET /api/admin/riders
 * @desc    Get all riders with filters
 * @query   status=pending|approved|all, search, page, limit
 * @access  Admin
 */
router.get('/', getAllRiders);

/**
 * @route   GET /api/admin/riders/:id
 * @desc    Get single rider details
 * @access  Admin
 */
router.get('/:id', getRider);

// ============================================
// DOCUMENT VERIFICATION
// ============================================
/**
 * @route   PATCH /api/admin/riders/:id/documents/:documentType/verify
 * @desc    Verify or reject a specific document
 * @body    { verified: boolean, rejectionReason?: string }
 * @access  Admin
 */
router.patch('/:id/documents/:documentType/verify', verifyDocument);
router.get('/:id/documents/:documentType/history', getDocumentHistory);

// ============================================
// RIDER APPROVAL/REJECTION
// ============================================
/**
 * @route   PATCH /api/admin/riders/:id/approve
 * @desc    Approve rider application (after all documents verified)
 * @access  Admin
 */
router.patch('/:id/approve', approveRider);

/**
 * @route   PATCH /api/admin/riders/:id/reject
 * @desc    Reject rider application with reason
 * @body    { reason: string }
 * @access  Admin
 */
router.patch('/:id/reject', rejectRider);

module.exports = router;