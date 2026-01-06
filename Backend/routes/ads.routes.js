// ============================================================================
// FILE: Backend/routes/ads.routes.js
// Routes for landing page popup ads (Public + Admin)
// ============================================================================

const express = require('express');
const router = express.Router();
const adsController = require('../controllers/ads.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware'); // ✅ Import upload middleware

// Custom admin check middleware
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  const userRole = req.user.role?.toLowerCase();
  const isAdmin = userRole === 'admin' || 
                  userRole === 'superadmin' || 
                  req.user.isAdmin === true;

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// ============================================
// PUBLIC ROUTES (Customer-facing)
// ============================================

/**
 * GET /api/ads/active
 * Get active popup ad for landing page
 */
router.get('/active', adsController.getActiveAds);

/**
 * POST /api/ads/:id/click
 * Track when user clicks CTA button
 */
router.post('/:id/click', adsController.trackClick);

// ============================================
// ADMIN ROUTES (Protected)
// ============================================

/**
 * POST /api/ads/upload
 * Upload ad image (NEW)
 */
router.post(
  '/upload', 
  protect, 
  adminOnly, 
  upload.single('adImage'), // ✅ Handle single image upload with field name 'adImage'
  adsController.uploadAdImage
);

/**
 * GET /api/ads
 * Get all ads with filters and pagination
 */
router.get('/', protect, adminOnly, adsController.getAllAds);

/**
 * POST /api/ads
 * Create new ad
 */
router.post('/', protect, adminOnly, adsController.createAd);

/**
 * GET /api/ads/:id/analytics
 * Get ad performance analytics
 */
router.get('/:id/analytics', protect, adminOnly, adsController.getAdAnalytics);

/**
 * GET /api/ads/:id
 * Get single ad by ID
 */
router.get('/:id', adsController.getAdById);

/**
 * PUT /api/ads/:id
 * Update ad
 */
router.put('/:id', protect, adminOnly, adsController.updateAd);

/**
 * DELETE /api/ads/:id
 * Delete ad
 */
router.delete('/:id', protect, adminOnly, adsController.deleteAd);

/**
 * PATCH /api/ads/:id/toggle-status
 * Toggle ad active/inactive status
 */
router.patch('/:id/toggle-status', protect, adminOnly, adsController.toggleAdStatus);

module.exports = router;