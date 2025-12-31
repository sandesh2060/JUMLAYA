// ============================================
// Backend/routes/user.routes.js (WITH DEBUG LOGGING)
// ============================================
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const userController = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { validate } = require('../middlewares/validate.middleware');
const userValidator = require('../validators/user.validator');

// Create uploads directory
const uploadDir = "uploads/users";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.user?.id || "temp";
    cb(null, `avatar-${userId}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  cb(new Error("Only image files allowed"));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

// ============================================
// 🔍 DEBUG MIDDLEWARE - Add logging
// ============================================
router.use((req, res, next) => {
  console.log("🌐 [USER ROUTES]", req.method, req.path);
  console.log("📦 [USER ROUTES] Body:", req.body);
  next();
});

// PUBLIC ROUTES - WITH VALIDATORS
router.post("/register", 
  userValidator.registerValidator, 
  validate,
  userController.register
);

// ✅ CRITICAL FIX: Add debug logging for verify-otp
router.post("/verify-otp", 
  (req, res, next) => {
    console.log("🔵 [VERIFY-OTP ROUTE] Hit! Email:", req.body.email, "OTP:", req.body.otp);
    next();
  },
  userValidator.verifyOTPValidator,
  validate,
  userController.verifyOTP
);

router.post("/resend-otp", 
  userValidator.resendOTPValidator,
  validate,
  userController.resendOTP
);

router.post("/login", 
  userValidator.loginValidator,
  validate,
  userController.login
);

// ✅ Logout route (can be public or protected)
router.post("/logout", authenticate, userController.logout);

// ============================================
// PROTECTED ROUTES
// ============================================
router.use(authenticate); // Apply authentication to all routes below

router.get("/me", userController.getProfile);
router.get("/profile", userController.getProfile);
router.get("/stats", userController.getStats);
router.put("/profile", upload.single("avatar"), userController.updateProfile);
router.put("/change-password", userController.changePassword);

// Address routes
router.get("/addresses", userController.getAddresses);
router.post("/addresses", userController.addAddress);
router.put("/addresses/:addressId", userController.updateAddress);
router.delete("/addresses/:addressId", userController.deleteAddress);

// Cart routes
router.get("/cart", userController.getCart);
router.post("/cart", userController.addToCart);
router.delete("/cart", userController.clearCart);
router.put("/cart/:itemId", userController.updateCartItem);
router.delete("/cart/:itemId", userController.removeCartItem);

module.exports = router;