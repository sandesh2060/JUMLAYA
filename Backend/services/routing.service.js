// Backend/services/routing.service.js

const axios = require('axios');

/**
 * Get optimal route using OpenRouteService (Free tier available)
 * Alternative: Google Maps Directions API, Mapbox Directions API
 */
class RoutingService {
  constructor() {
    this.provider = process.env.ROUTING_PROVIDER || 'openroute'; // openroute, google, mapbox
    this.apiKey = process.env.ROUTING_API_KEY;
  }

  /**
   * Get route from origin to destination
   * @param {Object} origin - { lat, lng }
   * @param {Object} destination - { lat, lng }
   * @returns {Promise<Object>} Route data
   */
  async getRoute(origin, destination) {
    try {
      switch (this.provider) {
        case 'openroute':
          return await this.getOpenRouteServiceRoute(origin, destination);
        case 'google':
          return await this.getGoogleRoute(origin, destination);
        case 'mapbox':
          return await this.getMapboxRoute(origin, destination);
        case 'osrm':
          return await this.getOSRMRoute(origin, destination);
        default:
          return await this.getOSRMRoute(origin, destination); // Free fallback
      }
    } catch (error) {
      console.error('Routing error:', error);
      // Fallback to straight-line calculation
      return this.getStraightLineRoute(origin, destination);
    }
  }

  /**
   * OpenRouteService route (Free with API key)
   */
  async getOpenRouteServiceRoute(origin, destination) {
    const url = 'https://api.openrouteservice.org/v2/directions/driving-car';
    
    const response = await axios.post(
      url,
      {
        coordinates: [
          [origin.lng, origin.lat],
          [destination.lng, destination.lat]
        ],
        instructions: true,
        preference: 'fastest',
        units: 'km'
      },
      {
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    const route = response.data.routes[0];
    
    return {
      distance: route.summary.distance / 1000, // Convert to km
      duration: route.summary.duration / 60, // Convert to minutes
      geometry: route.geometry,
      steps: route.segments[0].steps.map(step => ({
        instruction: step.instruction,
        distance: step.distance / 1000,
        duration: step.duration / 60,
        name: step.name,
        type: step.type
      })),
      coordinates: this.decodePolyline(route.geometry)
    };
  }

  /**
   * Google Maps Directions API
   */
  async getGoogleRoute(origin, destination) {
    const url = 'https://maps.googleapis.com/maps/api/directions/json';
    
    const response = await axios.get(url, {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode: 'driving',
        key: this.apiKey
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google API error: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    return {
      distance: leg.distance.value / 1000, // Convert to km
      duration: leg.duration.value / 60, // Convert to minutes
      geometry: route.overview_polyline.points,
      steps: leg.steps.map(step => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        distance: step.distance.value / 1000,
        duration: step.duration.value / 60,
        name: step.maneuver || 'straight'
      })),
      coordinates: this.decodeGooglePolyline(route.overview_polyline.points)
    };
  }

  /**
   * Mapbox Directions API
   */
  async getMapboxRoute(origin, destination) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    
    const response = await axios.get(url, {
      params: {
        access_token: this.apiKey,
        geometries: 'geojson',
        steps: true,
        overview: 'full'
      }
    });

    const route = response.data.routes[0];

    return {
      distance: route.distance / 1000, // Convert to km
      duration: route.duration / 60, // Convert to minutes
      geometry: route.geometry,
      steps: route.legs[0].steps.map(step => ({
        instruction: step.maneuver.instruction,
        distance: step.distance / 1000,
        duration: step.duration / 60,
        name: step.name || 'Unnamed road'
      })),
      coordinates: route.geometry.coordinates.map(coord => ({
        lat: coord[1],
        lng: coord[0]
      }))
    };
  }

  /**
   * OSRM (Open Source Routing Machine) - Completely free
   */
  async getOSRMRoute(origin, destination) {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    
    const response = await axios.get(url, {
      params: {
        overview: 'full',
        geometries: 'geojson',
        steps: true
      }
    });

    if (response.data.code !== 'Ok') {
      throw new Error(`OSRM error: ${response.data.code}`);
    }

    const route = response.data.routes[0];

    return {
      distance: route.distance / 1000, // Convert to km
      duration: route.duration / 60, // Convert to minutes
      geometry: route.geometry,
      steps: route.legs[0].steps.map(step => ({
        instruction: step.maneuver.instruction || `${step.maneuver.type} onto ${step.name}`,
        distance: step.distance / 1000,
        duration: step.duration / 60,
        name: step.name || 'Unnamed road',
        type: step.maneuver.type
      })),
      coordinates: route.geometry.coordinates.map(coord => ({
        lat: coord[1],
        lng: coord[0]
      }))
    };
  }

  /**
   * Fallback: Straight-line route
   */
  getStraightLineRoute(origin, destination) {
    const distance = this.calculateDistance(
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng
    );

    // Estimate duration assuming 40 km/h average
    const duration = (distance / 40) * 60;

    return {
      distance,
      duration,
      geometry: null,
      steps: [{
        instruction: 'Head towards destination',
        distance,
        duration,
        name: 'Direct route'
      }],
      coordinates: [origin, destination]
    };
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Decode polyline (for OpenRouteService)
   */
  decodePolyline(encoded) {
    // Implementation depends on encoding format
    // This is a simplified version
    return [];
  }

  /**
   * Decode Google polyline
   */
  decodeGooglePolyline(encoded) {
    const coordinates = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;

      coordinates.push({
        lat: lat / 1e5,
        lng: lng / 1e5
      });
    }

    return coordinates;
  }
}

module.exports = new RoutingService();