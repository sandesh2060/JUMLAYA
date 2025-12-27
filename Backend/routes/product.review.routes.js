// routes/product.review.routes.js - NEW FILE
// This handles routes like /api/products/:productId/reviews
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// ✅ These routes are mounted at /api/products
// So they become /api/products/:productId/reviews

// Public routes
// GET /api/products/:productId/reviews - Get all reviews for a product
router.get("/:productId/reviews", reviewController.getProductReviews);

// GET /api/products/:productId/reviews/stats - Get rating stats
router.get("/:productId/reviews/stats", reviewController.getRatingStats);

// Protected routes (authentication required)
// POST /api/products/:productId/reviews - Create review
router.post("/:productId/reviews", authenticate, reviewController.createReview);

module.exports = router;