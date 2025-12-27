// ============================================
// FILE #17: utils/priceCalculator.js
// ============================================

/**
 * Price calculation utilities for JUMLAYA
 * Handles VAT, shipping, discounts, and total calculations
 */

class PriceCalculator {
  // Constants
  static TAX_RATE = 0.13; // 13% VAT in Nepal
  static FREE_SHIPPING_THRESHOLD = 2000; // NPR 2000
  static STANDARD_SHIPPING_FEE = 100; // NPR 100
  
  /**
   * Calculate subtotal from items
   */
  static calculateSubtotal(items) {
    return items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }
  
  /**
   * Calculate tax (13% VAT)
   */
  static calculateTax(subtotal) {
    return Math.round(subtotal * this.TAX_RATE);
  }
  
  /**
   * Calculate shipping fee
   * Free shipping over NPR 2000
   */
  static calculateShipping(subtotal) {
    return subtotal >= this.FREE_SHIPPING_THRESHOLD 
      ? 0 
      : this.STANDARD_SHIPPING_FEE;
  }
  
  /**
   * Calculate discount amount
   */
  static calculateDiscount(subtotal, discountType, discountValue, maxDiscount = null) {
    let discount = 0;
    
    if (discountType === 'percentage') {
      discount = (subtotal * discountValue) / 100;
      
      if (maxDiscount && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else if (discountType === 'fixed') {
      discount = discountValue;
    }
    
    return Math.round(discount);
  }
  
  /**
   * Calculate total
   */
  static calculateTotal(subtotal, tax, shipping, discount = 0) {
    const total = subtotal + tax + shipping - discount;
    return Math.max(0, Math.round(total));
  }
  
  /**
   * Calculate complete order pricing
   */
  static calculateOrderTotal(items, coupon = null, shippingOverride = null) {
    const subtotal = this.calculateSubtotal(items);
    const tax = this.calculateTax(subtotal);
    const shipping = shippingOverride !== null 
      ? shippingOverride 
      : this.calculateShipping(subtotal);
    
    let discount = 0;
    if (coupon) {
      discount = this.calculateDiscount(
        subtotal,
        coupon.discountType,
        coupon.discountValue,
        coupon.maxDiscount
      );
    }
    
    const total = this.calculateTotal(subtotal, tax, shipping, discount);
    
    return {
      subtotal: Math.round(subtotal),
      tax: Math.round(tax),
      shipping: Math.round(shipping),
      discount: Math.round(discount),
      total: Math.round(total),
      savings: Math.round(discount)
    };
  }
  
  /**
   * Calculate product discount
   */
  static calculateProductDiscount(originalPrice, discount) {
    if (!discount || discount === 0) return originalPrice;
    
    const discountAmount = (originalPrice * discount) / 100;
    return Math.round(originalPrice - discountAmount);
  }
  
  /**
   * Calculate percentage saved
   */
  static calculateSavingsPercentage(originalPrice, discountedPrice) {
    if (originalPrice <= discountedPrice) return 0;
    
    const savings = originalPrice - discountedPrice;
    return Math.round((savings / originalPrice) * 100);
  }
  
  /**
   * Format price for display
   */
  static formatPrice(amount, currency = 'NPR') {
    const formatted = Math.round(amount).toLocaleString('en-NP');
    return `${currency} ${formatted}`;
  }
  
  /**
   * Calculate cart summary
   */
  static getCartSummary(cart, coupon = null) {
    const pricing = this.calculateOrderTotal(cart.items, coupon);
    
    return {
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      uniqueItems: cart.items.length,
      subtotal: pricing.subtotal,
      tax: pricing.tax,
      taxRate: this.TAX_RATE * 100,
      shipping: pricing.shipping,
      shippingMessage: pricing.shipping === 0 
        ? 'Free Shipping!' 
        : `Add NPR ${this.FREE_SHIPPING_THRESHOLD - pricing.subtotal} more for free shipping`,
      discount: pricing.discount,
      couponApplied: coupon ? coupon.code : null,
      total: pricing.total,
      savings: pricing.savings
    };
  }
  
  /**
   * Validate price
   */
  static isValidPrice(price) {
    return typeof price === 'number' && price >= 0 && !isNaN(price);
  }
  
  /**
   * Round to 2 decimal places (for rupees and paisa)
   */
  static roundPrice(price) {
    return Math.round(price * 100) / 100;
  }
}

module.exports = PriceCalculator;