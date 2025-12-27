// ============================================
// FILE #6: jobs/updateInventory.js
// ============================================
const Product = require('../models/product.model');

async function updateInventory() {
  try {
    console.log('📦 Starting inventory sync...');

    // Get all products
    const products = await Product.find({});
    
    let updated = 0;
    let lowStock = 0;
    let outOfStock = 0;

    for (const product of products) {
      // Check stock levels
      if (product.stock === 0) {
        outOfStock++;
        
        // Deactivate if out of stock
        if (product.isActive) {
          product.isActive = false;
          await product.save();
          updated++;
        }
      } else if (product.stock < 10) {
        lowStock++;
        
        // Send low stock alert (implement your own logic)
        console.log(`⚠️  Low stock: ${product.name} (${product.stock} remaining)`);
      }
    }

    console.log(`✅ Inventory sync complete:`);
    console.log(`   - Products updated: ${updated}`);
    console.log(`   - Low stock items: ${lowStock}`);
    console.log(`   - Out of stock: ${outOfStock}`);

    return {
      updated,
      lowStock,
      outOfStock
    };
  } catch (error) {
    console.error('❌ Inventory sync error:', error);
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
      await updateInventory();
      process.exit(0);
    })
    .catch(err => {
      console.error('Database connection error:', err);
      process.exit(1);
    });
}

module.exports = updateInventory;