// ============================================
// FILE #5: jobs/sendAbandonedCartEmails.js
// ============================================
const Cart = require('../models/cart.model');
const emailService = require('../services/email.service');

async function sendAbandonedCartEmails(daysInactive = 1) {
  try {
    console.log(`📧 Finding abandoned carts (${daysInactive} days inactive)...`);
    
    const abandonedCarts = await Cart.getAbandonedCarts(daysInactive);
    
    console.log(`Found ${abandonedCarts.length} abandoned carts`);

    let sentCount = 0;
    for (const cart of abandonedCarts) {
      try {
        if (cart.user && cart.user.email) {
          await emailService.sendAbandonedCartEmail(cart);
          sentCount++;
          
          // Mark as notified (you can add a field to track this)
          cart.lastEmailSent = new Date();
          await cart.save();
        }
      } catch (error) {
        console.error(`Failed to send email to ${cart.user?.email}:`, error.message);
      }
    }

    console.log(`✅ Sent ${sentCount} abandoned cart emails`);
    return sentCount;
  } catch (error) {
    console.error('❌ Abandoned cart email job error:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const mongoose = require('mongoose');
  require('dotenv').config();

  mongoose.connect(process.env.DB_CONNECT)
    .then(async () => {
      console.log('📦 Connected to database');
      await sendAbandonedCartEmails(1); // 1 day inactive
      process.exit(0);
    })
    .catch(err => {
      console.error('Database connection error:', err);
      process.exit(1);
    });
}

module.exports = sendAbandonedCartEmails;
