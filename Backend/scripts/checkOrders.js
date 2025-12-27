// Backend/scripts/checkOrders.js
// Run this to verify if you have orders in your database

const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('../models/order.model');

async function checkOrders() {
  try {
    // Connect to database
    await mongoose.connect(process.env.DB_CONNECT, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to database');

    // Count total orders
    const totalOrders = await Order.countDocuments();
    console.log('📊 Total orders in database:', totalOrders);

    if (totalOrders === 0) {
      console.log('❌ No orders found in database!');
      console.log('💡 You need to create some test orders first.');
      console.log('\nYou can:');
      console.log('1. Place an order through your frontend');
      console.log('2. Or run a seed script to create test orders');
    } else {
      // Fetch and display some orders
      const orders = await Order.find()
        .populate('user', 'firstname lastname email')
        .limit(5)
        .lean();

      console.log('\n📦 Sample Orders:');
      orders.forEach((order, index) => {
        console.log(`\n${index + 1}. Order ID: ${order.orderId || order._id}`);
        console.log(`   User: ${order.user?.firstname} ${order.user?.lastname}`);
        console.log(`   Total: Rs. ${order.total}`);
        console.log(`   Status: ${order.orderStatus}`);
        console.log(`   Items: ${order.items?.length || 0}`);
        console.log(`   Created: ${order.createdAt}`);
      });

      // Show order status distribution
      const statusCounts = await Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      console.log('\n📊 Order Status Distribution:');
      statusCounts.forEach(status => {
        console.log(`   ${status._id}: ${status.count}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkOrders();