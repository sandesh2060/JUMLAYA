// ============================================
// Backend/utils/distanceCalculator.js
// Haversine formula for accurate distance calculation
// ============================================

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate distance from coordinates object
 * @param {object} point1 - {latitude, longitude} or {coordinates: [lng, lat]}
 * @param {object} point2 - {latitude, longitude} or {coordinates: [lng, lat]}
 * @returns {number} Distance in kilometers
 */
const calculateDistanceFromObjects = (point1, point2) => {
  let lat1, lon1, lat2, lon2;
  
  // Handle different coordinate formats
  if (point1.latitude !== undefined && point1.longitude !== undefined) {
    lat1 = point1.latitude;
    lon1 = point1.longitude;
  } else if (point1.coordinates && Array.isArray(point1.coordinates)) {
    lon1 = point1.coordinates[0];
    lat1 = point1.coordinates[1];
  } else {
    throw new Error('Invalid point1 format');
  }
  
  if (point2.latitude !== undefined && point2.longitude !== undefined) {
    lat2 = point2.latitude;
    lon2 = point2.longitude;
  } else if (point2.coordinates && Array.isArray(point2.coordinates)) {
    lon2 = point2.coordinates[0];
    lat2 = point2.coordinates[1];
  } else {
    throw new Error('Invalid point2 format');
  }
  
  return calculateDistance(lat1, lon1, lat2, lon2);
};

/**
 * Find nearest point from a list of points
 * @param {object} origin - Origin point
 * @param {array} points - Array of points with location data
 * @returns {object} Nearest point with distance
 */
const findNearestPoint = (origin, points) => {
  if (!points || points.length === 0) {
    return null;
  }
  
  let nearest = null;
  let minDistance = Infinity;
  
  points.forEach(point => {
    try {
      const distance = calculateDistanceFromObjects(origin, point.currentLocation || point.location);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...point, distance };
      }
    } catch (error) {
      console.error('Error calculating distance for point:', error);
    }
  });
  
  return nearest ? { ...nearest, distance: minDistance } : null;
};

/**
 * Check if point is within radius
 * @param {object} center - Center point
 * @param {object} point - Point to check
 * @param {number} radiusKm - Radius in kilometers
 * @returns {boolean}
 */
const isWithinRadius = (center, point, radiusKm) => {
  const distance = calculateDistanceFromObjects(center, point);
  return distance <= radiusKm;
};

module.exports = {
  calculateDistance,
  calculateDistanceFromObjects,
  findNearestPoint,
  isWithinRadius,
  toRadians
};