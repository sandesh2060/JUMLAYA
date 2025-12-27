const mongoose = require('mongoose');
const Rider = require('../models/rider.model');
const path = require('path');

// Load .env from Backend directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('🔗 Connecting to MongoDB...');

mongoose.connect(process.env.DB_CONNECT) // ✅ FIXED: Changed to DB_CONNECT
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

async function createRiderProfile() {
  const userId = '694f866afa0c8c946d851037';
  
  console.log('🔍 Checking if rider exists...');
  
  const exists = await Rider.findOne({ user: userId });
  if (exists) {
    console.log('✅ Rider already exists!');
    console.log('Rider Code:', exists.riderCode);
    process.exit(0);
  }
  
  console.log('📝 Creating rider profile...');
  
  const riderCode = await Rider.generateRiderCode();
  
  const rider = await Rider.create({
    user: userId,
    riderCode,
    phoneNumber: '9876543210',
    vehicleType: 'bike',
    status: 'offline',
    verification: {
      isVerified: true
    }
  });
  
  console.log('✅ Rider profile created successfully!');
  console.log('Rider Code:', rider.riderCode);
  console.log('Phone:', rider.phoneNumber);
  process.exit(0);
}

createRiderProfile().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});