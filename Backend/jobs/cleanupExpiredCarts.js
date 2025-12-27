// ============================================
// FILE #4: jobs/cleanupExpiredCarts.js
// ============================================
const Cart = require('../models/cart.model');

async function cleanupExpiredCarts() {
  try {
    console.log('🧹 Starting cart cleanup...');
    
    const deletedCount = await Cart.cleanExpiredCarts();
    
    console.log(`✅ Cleanup complete: ${deletedCount} expired carts removed`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Cart cleanup error:', error);
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
      await cleanupExpiredCarts();
      process.exit(0);
    })
    .catch(err => {
      console.error('Database connection error:', err);
      process.exit(1);
    });
}

module.exports = cleanupExpiredCarts;
