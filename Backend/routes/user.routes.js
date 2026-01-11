// ============================================
// FILE 3: Backend/routes/user.routes.js
// ✅ REPLACE YOUR ENTIRE FILE WITH THIS
// ============================================

const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { uploadSingle, handleUploadError } = require('../middlewares/upload.middleware');
const { validate } = require('../middlewares/validate.middleware');
const userValidator = require('../validators/user.validator');

// ============================================
// DEBUG MIDDLEWARE (Optional - for testing)
// ============================================
router.use((req, res, next) => {
  console.log("🌐 [USER ROUTES]", req.method, req.path);
  next();
});

// ============================================
// PUBLIC ROUTES
// ============================================
router.post("/register", 
  userValidator.registerValidator, 
  validate,
  userController.register
);

router.post("/verify-otp", 
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

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================
router.use(authenticate); // All routes below require authentication

// Profile routes
router.get("/me", userController.getProfile);
router.get("/profile", userController.getProfile);
router.get("/stats", userController.getStats);

// ✅ CLOUDINARY UPLOAD ROUTE - Profile update with avatar
router.put(
  "/profile", 
  uploadSingle('avatar'),      // Multer middleware - handles file upload
  handleUploadError,           // Error handling middleware
  userController.updateProfile // Controller
);

router.put("/change-password", userController.changePassword);
router.post("/logout", userController.logout);

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