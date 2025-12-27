// routes/coupon.routes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");

// Placeholder controller
const couponController = {
  getCoupons: (req, res) => res.json({ success: true, data: [] }),
  applyCoupon: (req, res) => res.json({ success: true, message: "Coupon applied" }),
};

router.use(authenticate);

router.get("/", couponController.getCoupons);
router.post("/apply", couponController.applyCoupon);

module.exports = router;
