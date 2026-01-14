// ============================================
// Backend/scripts/addStoreLocationToSettings.js
// Migration script to add store location to existing settings
// ============================================

const mongoose = require('mongoose');
const Settings = require('../models/settings.model');
require('dotenv').config();

async function addStoreLocationToSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('✅ Connected to MongoDB');

    // Find existing settings
    let settings = await Settings.findOne({ isActive: true });

    if (!settings) {
      console.log('📝 No settings found, creating default settings...');
      settings = await Settings.create({
        storeName: 'My Store',
        storeEmail: 'store@example.com',
        storePhone: '+977-1-XXXXXXX',
        storeAddress: 'Patan, Nepal',
        storeLocation: {
          latitude: 27.6745,
          longitude: 85.3240,
          address: 'Patan, Nepal',
          landmark: ''
        },
        deliverySettings: {
          freeDeliveryThreshold: 5000,
          freeDeliveryDistance: 5,
          maxDeliveryDistance: 50
        }
      });
      console.log('✅ Default settings created');
    } else {
      console.log('📝 Updating existing settings...');
      
      // Add storeLocation if it doesn't exist
      if (!settings.storeLocation) {
        settings.storeLocation = {
          latitude: 27.6745,
          longitude: 85.3240,
          address: settings.storeAddress || 'Patan, Nepal',
          landmark: ''
        };
      }

      // Add deliverySettings if it doesn't exist
      if (!settings.deliverySettings) {
        settings.deliverySettings = {
          freeDeliveryThreshold: 5000,
          freeDeliveryDistance: 5,
          maxDeliveryDistance: 50
        };
      }

      await settings.save();
      console.log('✅ Settings updated with store location and delivery settings');
    }

    console.log('\n📍 Current Settings:');
    console.log('Store Location:', settings.storeLocation);
    console.log('Delivery Settings:', settings.deliverySettings);

    await mongoose.connection.close();
    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
addStoreLocationToSettings();