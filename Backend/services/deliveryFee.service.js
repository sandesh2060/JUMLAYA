// ============================================
// Backend/services/deliveryFee.service.js
// ✅ UPDATED: Fetch store location dynamically from settings
// ============================================

const User = require('../models/user.model');
const Settings = require('../models/settings.model');

// 📍 Default store location (fallback if settings not found)
const DEFAULT_STORE_LOCATION = {
  latitude: 27.6745,
  longitude: 85.3240
};

// 📊 Delivery fee tiers
const DELIVERY_TIERS = [
  { maxKm: 3, fee: 80, label: '0-3 km' },
  { maxKm: 5, fee: 100, label: '3-5 km' },
  { maxKm: 8, fee: 150, label: '5-8 km' },
  { maxKm: 12, fee: 200, label: '8-12 km' },
  { maxKm: 20, fee: 300, label: '12-20 km' },
  { maxKm: Infinity, fee: 500, label: '20+ km' }
];

// 🕐 Estimated delivery times
const DELIVERY_TIME_ESTIMATES = [
  { maxKm: 5, time: '30-45 min' },
  { maxKm: 10, time: '45-60 min' },
  { maxKm: 15, time: '60-90 min' },
  { maxKm: Infinity, time: '90-120 min' }
];

/**
 * ✅ Get store location from settings (cached)
 */
let cachedStoreLocation = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getStoreLocation() {
  try {
    // Return cached location if still valid
    if (cachedStoreLocation && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      return cachedStoreLocation;
    }

    // Fetch from database
    const settings = await Settings.findOne({ isActive: true }).select('storeLocation');
    
    if (settings?.storeLocation?.latitude && settings?.storeLocation?.longitude) {
      cachedStoreLocation = {
        latitude: settings.storeLocation.latitude,
        longitude: settings.storeLocation.longitude,
        address: settings.storeLocation.address || '',
        landmark: settings.storeLocation.landmark || ''
      };
      cacheTimestamp = Date.now();
      
      console.log('✅ Store location loaded from settings:', cachedStoreLocation);
      return cachedStoreLocation;
    }
    
    // Fallback to default
    console.log('⚠️ No store location in settings, using default');
    cachedStoreLocation = DEFAULT_STORE_LOCATION;
    cacheTimestamp = Date.now();
    return cachedStoreLocation;
    
  } catch (error) {
    console.error('❌ Error fetching store location:', error);
    return DEFAULT_STORE_LOCATION;
  }
}

/**
 * ✅ Get delivery settings from database
 */
async function getDeliverySettings() {
  try {
    const settings = await Settings.findOne({ isActive: true }).select('deliverySettings');
    
    if (settings?.deliverySettings) {
      return {
        freeDeliveryThreshold: settings.deliverySettings.freeDeliveryThreshold || 5000,
        freeDeliveryDistance: settings.deliverySettings.freeDeliveryDistance || 5,
        maxDeliveryDistance: settings.deliverySettings.maxDeliveryDistance || 50
      };
    }
    
    // Default values
    return {
      freeDeliveryThreshold: 5000,
      freeDeliveryDistance: 5,
      maxDeliveryDistance: 50
    };
  } catch (error) {
    console.error('❌ Error fetching delivery settings:', error);
    return {
      freeDeliveryThreshold: 5000,
      freeDeliveryDistance: 5,
      maxDeliveryDistance: 50
    };
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimals
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Get delivery fee for a given distance
 */
function getFeeForDistance(distance) {
  for (const tier of DELIVERY_TIERS) {
    if (distance <= tier.maxKm) {
      return {
        fee: tier.fee,
        tier: tier.label,
        maxKm: tier.maxKm
      };
    }
  }
  return {
    fee: 500,
    tier: '20+ km',
    maxKm: Infinity
  };
}

/**
 * Get estimated delivery time based on distance
 */
function getEstimatedDeliveryTime(distance) {
  for (const estimate of DELIVERY_TIME_ESTIMATES) {
    if (distance <= estimate.maxKm) {
      return estimate.time;
    }
  }
  return '90-120 min';
}

/**
 * ✅ MAIN FUNCTION: Calculate delivery fee with dynamic settings
 * 
 * FREE DELIVERY CONDITIONS (from settings):
 * 1. Distance ≤ freeDeliveryDistance → FREE
 * 2. Order total ≥ freeDeliveryThreshold → FREE
 */
async function calculateDeliveryFee(deliveryLocation, riderId = null, orderTotal = null) {
  try {
    const { latitude, longitude } = deliveryLocation;

    if (!latitude || !longitude) {
      throw new Error('Invalid delivery location coordinates');
    }

    // ✅ Get store location from settings
    const storeLocation = await getStoreLocation();
    
    // ✅ Get delivery settings from database
    const deliverySettings = await getDeliverySettings();
    const { freeDeliveryThreshold, freeDeliveryDistance, maxDeliveryDistance } = deliverySettings;

    let fromLocation = storeLocation;
    let riderAvailable = false;
    let riderInfo = null;

    // If specific rider requested, use their location
    if (riderId) {
      const rider = await User.findOne({
        _id: riderId,
        role: 'rider',
        'riderProfile.isActive': true
      }).select('riderProfile');

      if (rider?.riderProfile?.currentLocation?.coordinates) {
        fromLocation = {
          latitude: rider.riderProfile.currentLocation.coordinates[1],
          longitude: rider.riderProfile.currentLocation.coordinates[0]
        };
        riderAvailable = true;
        riderInfo = {
          id: rider._id,
          vehicleType: rider.riderProfile.vehicleType,
          rating: rider.riderProfile.rating
        };
      }
    }

    // Calculate distance
    const distance = calculateDistance(
      fromLocation.latitude,
      fromLocation.longitude,
      latitude,
      longitude
    );

    // Check if delivery is too far
    if (distance > maxDeliveryDistance) {
      return {
        distance: distance,
        fee: null,
        error: true,
        message: `Delivery not available beyond ${maxDeliveryDistance}km`,
        maxDeliveryDistance: maxDeliveryDistance
      };
    }

    // Get base fee and tier info
    const feeInfo = getFeeForDistance(distance);
    const estimatedTime = getEstimatedDeliveryTime(distance);

    // ✅ CHECK FREE DELIVERY CONDITIONS (from settings)
    let finalFee = feeInfo.fee;
    let freeDelivery = false;
    let freeDeliveryReason = null;

    // Rule 1: Distance ≤ freeDeliveryDistance → FREE
    if (distance <= freeDeliveryDistance) {
      finalFee = 0;
      freeDelivery = true;
      freeDeliveryReason = `Within ${freeDeliveryDistance}km radius`;
      console.log(`🎉 FREE DELIVERY: Distance ${distance}km ≤ ${freeDeliveryDistance}km`);
    }
    // Rule 2: Order total ≥ freeDeliveryThreshold → FREE
    else if (orderTotal && orderTotal >= freeDeliveryThreshold) {
      finalFee = 0;
      freeDelivery = true;
      freeDeliveryReason = `Order total ≥ Rs. ${freeDeliveryThreshold}`;
      console.log(`🎉 FREE DELIVERY: Order total Rs. ${orderTotal} ≥ Rs. ${freeDeliveryThreshold}`);
    }

    return {
      distance: distance,
      fee: finalFee,
      originalFee: feeInfo.fee,
      freeDelivery: freeDelivery,
      freeDeliveryReason: freeDeliveryReason,
      freeDeliveryThreshold: freeDeliveryThreshold,
      freeDeliveryDistance: freeDeliveryDistance,
      tier: feeInfo.tier,
      estimatedDeliveryTime: estimatedTime,
      riderAvailable: riderAvailable,
      riderInfo: riderInfo,
      storeLocation: storeLocation, // Include store location in response
      calculation: freeDelivery 
        ? `FREE (${freeDeliveryReason})` 
        : `${distance.toFixed(2)} km × Tier: ${feeInfo.tier} = Rs. ${finalFee}`,
      breakdown: {
        baseDistance: distance,
        tierApplied: feeInfo.tier,
        baseFee: feeInfo.fee,
        finalFee: finalFee,
        discountApplied: freeDelivery ? feeInfo.fee : 0
      }
    };

  } catch (error) {
    console.error('❌ Error calculating delivery fee:', error);
    throw error;
  }
}

/**
 * Find nearest available rider to delivery location
 */
async function findNearestRider(deliveryLocation, maxDistance = 10) {
  try {
    const { latitude, longitude } = deliveryLocation;

    const riders = await User.find({
      role: 'rider',
      'riderProfile.isActive': true,
      'riderProfile.isAvailable': true,
      'riderProfile.currentLocation.coordinates': { $exists: true }
    }).select('firstname lastname riderProfile');

    if (!riders.length) {
      return null;
    }

    let nearestRider = null;
    let minDistance = Infinity;

    for (const rider of riders) {
      if (!rider.riderProfile?.currentLocation?.coordinates) continue;

      const riderLat = rider.riderProfile.currentLocation.coordinates[1];
      const riderLon = rider.riderProfile.currentLocation.coordinates[0];

      const distance = calculateDistance(latitude, longitude, riderLat, riderLon);

      if (distance < minDistance && distance <= maxDistance) {
        minDistance = distance;
        nearestRider = {
          id: rider._id,
          name: `${rider.firstname} ${rider.lastname}`,
          distance: distance,
          vehicleType: rider.riderProfile.vehicleType,
          vehicleNumber: rider.riderProfile.vehicleNumber,
          rating: rider.riderProfile.rating,
          currentLocation: {
            latitude: riderLat,
            longitude: riderLon
          }
        };
      }
    }

    return nearestRider;
  } catch (error) {
    console.error('❌ Error finding nearest rider:', error);
    return null;
  }
}

/**
 * Get all active riders with their distances from delivery location
 */
async function getAllRidersWithDistance(deliveryLocation) {
  try {
    const { latitude, longitude } = deliveryLocation;

    const riders = await User.find({
      role: 'rider',
      'riderProfile.isActive': true,
      'riderProfile.currentLocation.coordinates': { $exists: true }
    }).select('firstname lastname email phone riderProfile');

    const ridersWithDistance = riders
      .map(rider => {
        if (!rider.riderProfile?.currentLocation?.coordinates) return null;

        const riderLat = rider.riderProfile.currentLocation.coordinates[1];
        const riderLon = rider.riderProfile.currentLocation.coordinates[0];

        const distance = calculateDistance(latitude, longitude, riderLat, riderLon);
        const feeInfo = getFeeForDistance(distance);

        return {
          id: rider._id,
          name: `${rider.firstname} ${rider.lastname}`,
          email: rider.email,
          phone: rider.phone,
          distance: distance,
          deliveryFee: feeInfo.fee,
          isAvailable: rider.riderProfile.isAvailable,
          vehicleType: rider.riderProfile.vehicleType,
          vehicleNumber: rider.riderProfile.vehicleNumber,
          rating: rider.riderProfile.rating,
          currentLocation: {
            latitude: riderLat,
            longitude: riderLon
          }
        };
      })
      .filter(rider => rider !== null)
      .sort((a, b) => a.distance - b.distance);

    return ridersWithDistance;
  } catch (error) {
    console.error('❌ Error getting riders with distance:', error);
    return [];
  }
}

/**
 * ✅ Clear cache (call this when admin updates store location)
 */
function clearLocationCache() {
  cachedStoreLocation = null;
  cacheTimestamp = null;
  console.log('🔄 Store location cache cleared');
}

module.exports = {
  calculateDeliveryFee,
  findNearestRider,
  getAllRidersWithDistance,
  calculateDistance,
  getStoreLocation,
  getDeliverySettings,
  clearLocationCache,
  DEFAULT_STORE_LOCATION,
  DELIVERY_TIERS
};