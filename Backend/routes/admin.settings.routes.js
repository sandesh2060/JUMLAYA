// Backend/routes/admin.settings.routes.js
const express = require("express");
const router = express.Router();
const adminSettingsController = require("../controllers/admin/admin.settings.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");
const { uploadSingle, handleUploadError } = require("../middlewares/upload.middleware");

router.use(protect);
router.use(restrictTo("admin"));

// Get all settings
router.get("/", adminSettingsController.getSettings);

// Store information
router.put("/store-info", adminSettingsController.updateStoreInfo);
router.put("/store-location", adminSettingsController.updateStoreLocation); // NEW

// Business settings
router.put("/business", adminSettingsController.updateBusinessSettings);
router.put("/payment-methods", adminSettingsController.updatePaymentMethods);

// Social & content
router.put("/social-media", adminSettingsController.updateSocialMedia);
router.put("/content-pages", adminSettingsController.updateContentPages);

// SEO & notifications
router.put("/seo", adminSettingsController.updateSEO);
router.put("/notifications", adminSettingsController.updateNotificationSettings);

// Maintenance
router.put("/maintenance", adminSettingsController.updateMaintenanceMode);

// Logo upload
router.post("/logo", uploadSingle("logo"), handleUploadError, adminSettingsController.uploadLogo);
router.delete("/logo", adminSettingsController.deleteLogo);

module.exports = router;