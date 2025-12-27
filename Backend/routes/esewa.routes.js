const express = require("express");
const router = express.Router();

const {
  initiateEsewaPayment,
  verifyEsewaPayment,
  paymentFailed,
} = require("../controllers/esewa.controller");

// Step 1 → Customer requests payment
router.post("/initiate", initiateEsewaPayment);

// Step 2 → Esewa hits this after success
router.get("/payment-success", verifyEsewaPayment);

// Step 3 → Esewa hits this after failure
router.get("/payment-failed", paymentFailed);

module.exports = router;
