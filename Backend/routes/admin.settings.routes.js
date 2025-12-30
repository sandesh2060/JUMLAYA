// ============================================
// admin.settings.routes.js - Settings Routes
// Path: Backend/routes/admin.settings.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/admin/admin.settings.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/authorize.middleware');
const upload = require('../middlewares/upload.middleware'); // NEW: Import upload middleware

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// ============================================
// SETTINGS ROUTES
// ============================================

// GET /api/admin/settings - Get all settings
router.get('/', settingsController.getSettings);

// PUT /api/admin/settings/store-info - Update store information
router.put('/store-info', settingsController.updateStoreInfo);

// PUT /api/admin/settings/business - Update business settings
router.put('/business', settingsController.updateBusinessSettings);

// PUT /api/admin/settings/payment-methods - Update payment methods
router.put('/payment-methods', settingsController.updatePaymentMethods);

// PUT /api/admin/settings/social-media - Update social media links
router.put('/social-media', settingsController.updateSocialMedia);

// PUT /api/admin/settings/content-pages - Update content pages
router.put('/content-pages', settingsController.updateContentPages);

// PUT /api/admin/settings/seo - Update SEO settings
router.put('/seo', settingsController.updateSEO);

// PUT /api/admin/settings/notifications - Update notification settings
router.put('/notifications', settingsController.updateNotificationSettings);

// PUT /api/admin/settings/maintenance - Update maintenance mode
router.put('/maintenance', settingsController.updateMaintenanceMode);

// ============================================
// NEW: LOGO UPLOAD ROUTES
// ============================================

// POST /api/admin/settings/logo - Upload store logo
router.post('/logo', upload.single('logo'), settingsController.uploadLogo);

// DELETE /api/admin/settings/logo - Delete store logo
router.delete('/logo', settingsController.deleteLogo);

module.exports = router;