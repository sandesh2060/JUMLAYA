// routes/review.routes.js - FIXED
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// ✅ IMPORTANT: These routes are mounted at /api/reviews
// So /api/reviews/... becomes the base path

// Public routes (NO authentication needed)
// GET /api/reviews/:id - Get single review
router.get("/:id", reviewController.getReview);

// Protected routes (authentication required)
// POST /api/reviews/:id/helpful - Vote on review
router.post("/:id/helpful", authenticate, reviewController.voteReview);

// PUT /api/reviews/:id - Update review
router.put("/:id", authenticate, reviewController.updateReview);

// DELETE /api/reviews/:id - Delete review
router.delete("/:id", authenticate, reviewController.deleteReview);

module.exports = router;