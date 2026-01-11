const express = require("express");
const router = express.Router();
const adminSettingsController = require("../controllers/admin/admin.settings.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");
const { uploadSingle, handleUploadError } = require("../middlewares/upload.middleware");

router.use(protect);
router.use(restrictTo("admin"));

router.get("/", adminSettingsController.getSettings);
router.put("/store-info", adminSettingsController.updateStoreInfo);
router.put("/business", adminSettingsController.updateBusinessSettings);
router.put("/payment-methods", adminSettingsController.updatePaymentMethods);
router.put("/social-media", adminSettingsController.updateSocialMedia);
router.put("/content-pages", adminSettingsController.updateContentPages);
router.put("/seo", adminSettingsController.updateSEO);
router.put("/notifications", adminSettingsController.updateNotificationSettings);
router.put("/maintenance", adminSettingsController.updateMaintenanceMode);

// Logo upload
router.post("/logo", uploadSingle("logo"), handleUploadError, adminSettingsController.uploadLogo);
router.delete("/logo", adminSettingsController.deleteLogo);

module.exports = router;