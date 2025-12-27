// routes/wishlist.routes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const wishlistController = require("../controllers/wishlist.controller");

// Protect all routes
router.use(authenticate);

// GET /api/wishlist - Get user's wishlist
router.get("/", wishlistController.getWishlist);

// POST /api/wishlist - Add product to wishlist
router.post("/", wishlistController.addToWishlist);

// DELETE /api/wishlist/:productId - Remove product from wishlist
router.delete("/:productId", wishlistController.removeFromWishlist);

// DELETE /api/wishlist - Clear entire wishlist
router.delete("/", wishlistController.clearWishlist);

// GET /api/wishlist/check/:productId - Check if product is in wishlist
router.get("/check/:productId", wishlistController.checkWishlist);

// GET /api/wishlist/count - Get wishlist count
router.get("/count", wishlistController.getWishlistCount);

// POST /api/wishlist/move/:productId - Move item to cart
router.post("/move/:productId", wishlistController.moveToCart);

module.exports = router;