// ============================================
// FILE #11: services/coupon.service.js
// ============================================
const Coupon = require('../models/coupon.model');

class CouponService {
  async validateAndApply(code, userId, subtotal) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    const validity = coupon.isValid();
    if (!validity.valid) {
      throw new Error(validity.reason);
    }

    const userCanUse = coupon.canUserUse(userId);
    if (!userCanUse.canUse) {
      throw new Error(userCanUse.reason);
    }

    if (subtotal < coupon.minPurchase) {
      throw new Error(`Minimum purchase of NPR ${coupon.minPurchase} required`);
    }

    const discount = coupon.calculateDiscount(subtotal);

    return {
      coupon,
      discount,
      code: coupon.code
    };
  }

  async markAsUsed(couponCode, userId, orderTotal) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      await coupon.markUsed(userId, orderTotal);
    }
    return coupon;
  }
}

module.exports = new CouponService();
