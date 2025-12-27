// ============================================
// FILE #15: services/payment.service.js
// ============================================
const axios = require('axios');
const crypto = require('crypto');

class PaymentService {
  constructor() {
    this.esewaUrl = process.env.ESEWA_ENVIRONMENT === 'production' 
      ? 'https://esewa.com.np/epay/main'
      : 'https://uat.esewa.com.np/epay/main';
    
    this.merchantId = process.env.ESEWA_MERCHANT_ID;
    this.secretKey = process.env.ESEWA_SECRET_KEY;
  }

  async initiateEsewaPayment(order) {
    const paymentData = {
      amt: order.total,
      psc: 0,
      pdc: 0,
      txAmt: order.tax,
      tAmt: order.total,
      pid: order.orderId,
      scd: this.merchantId,
      su: `${process.env.FRONTEND_URL}/payment/success`,
      fu: `${process.env.FRONTEND_URL}/payment/failure`
    };

    return {
      url: this.esewaUrl,
      data: paymentData
    };
  }

  async verifyEsewaPayment(data) {
    try {
      const verifyUrl = process.env.ESEWA_ENVIRONMENT === 'production'
        ? 'https://esewa.com.np/epay/transrec'
        : 'https://uat.esewa.com.np/epay/transrec';

      const response = await axios.get(verifyUrl, {
        params: {
          amt: data.amt,
          rid: data.refId,
          pid: data.oid,
          scd: this.merchantId
        }
      });

      return response.data.includes('Success');
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `TXN${timestamp}${random}`;
  }

  async processRefund(orderId, amount) {
    // Implement refund logic here
    console.log(`Processing refund for order ${orderId}: NPR ${amount}`);
    return {
      success: true,
      refundId: this.generateTransactionId(),
      amount: amount
    };
  }
}

module.exports = new PaymentService();