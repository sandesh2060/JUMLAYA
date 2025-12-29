// ============================================================================
// FILE: Backend/routes/ads.routes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const adsController = require('../controllers/ads.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Public routes
router.get('/active', adsController.getActiveAds);
router.get('/:id', adsController.getAdById);
router.post('/:id/click', adsController.trackClick);

// Admin routes
router.use(protect, authorize('admin'));

router.route('/')
  .get(adsController.getAllAds)
  .post(adsController.createAd);

router.route('/:id')
  .put(adsController.updateAd)
  .delete(adsController.deleteAd);

router.patch('/:id/toggle-status', adsController.toggleAdStatus);

module.exports = router;
