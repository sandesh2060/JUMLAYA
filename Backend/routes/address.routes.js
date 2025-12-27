// ============================================
// routes/address.routes.js
// ============================================
const express = require("express"); 
const router = express.Router();
const addressController = require("../controllers/address.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// All routes require authentication
router.use(authenticate);

// Main CRUD routes
router.get("/", (req, res, next) => addressController.getAddresses(req, res, next));
router.get("/default", (req, res, next) => addressController.getDefaultAddress(req, res, next));
router.get("/recent", (req, res, next) => addressController.getRecentAddresses(req, res, next));
router.get("/:id", (req, res, next) => addressController.getAddress(req, res, next));
router.post("/", (req, res, next) => addressController.createAddress(req, res, next));

// Update routes (PATCH and PUT)
router.patch("/:id", (req, res, next) => addressController.updateAddress(req, res, next));
router.put("/:id", (req, res, next) => addressController.updateAddress(req, res, next));

router.patch("/:id/default", (req, res, next) => addressController.setDefaultAddress(req, res, next));
router.delete("/:id", (req, res, next) => addressController.deleteAddress(req, res, next));

// Utility routes
router.post("/:id/mark-used", (req, res, next) => addressController.markAddressAsUsed(req, res, next));
router.get("/:id/validate", (req, res, next) => addressController.validateNepalAddress(req, res, next));

module.exports = router;
