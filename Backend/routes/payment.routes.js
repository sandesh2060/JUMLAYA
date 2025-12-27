const express = require('express');
const router = express.Router();
const { verifyPayment } = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/verify', protect, verifyPayment);

module.exports = router;
