const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const reviewController = require("../controllers/review.controller"); // ADD THIS LINE
const { authenticate } = require("../middlewares/auth.middleware"); // ADD THIS LINE

// ADD THESE 3 LINES HERE (BEFORE OTHER ROUTES)
router.get("/:productId/reviews", reviewController.getProductReviews);
router.get("/:productId/reviews/stats", reviewController.getRatingStats);
router.post("/:productId/reviews", authenticate, reviewController.createReview);



// Search products
router.get("/search", productController.searchProducts);

// Get featured products
router.get("/featured", productController.getFeaturedProducts);

// Get products on sale
router.get("/on-sale", productController.getOnSaleProducts);

// Get bestsellers
router.get("/bestsellers", productController.getBestsellers);

// Get organic products
router.get("/organic", productController.getOrganicProducts);

// Get seasonal products
router.get("/seasonal", productController.getSeasonalProducts);

// Get products by type
router.get("/type/:productType", productController.getProductsByType);

// Get products by category
router.get("/category/:categoryId", productController.getProductsByCategory);

// Get product by slug
router.get("/slug/:slug", productController.getProductBySlug);

// Increment product view
router.post("/:id/view", productController.incrementProductView);

// Get product by ID
router.get("/:id", productController.getProductById);

// Get all products (must be last)
router.get("/", productController.getAllProducts);

module.exports = router;