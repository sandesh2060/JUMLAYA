// ============================================
// Frontend/src/utils/geolocationService.js
// ✅ PRODUCTION READY - Complete Geolocation Handler
// ============================================

class GeolocationService {
  constructor() {
    this.watchId = null;
    this.currentPosition = null;
    this.isTracking = false;
    this.onPositionUpdate = null;
    this.onError = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 seconds
    this.fallbackTimeout = null;
    this.useHighAccuracy = true;
  }

  // ✅ Check if geolocation is supported
  isSupported() {
    return 'geolocation' in navigator;
  }

  // ✅ Check if running on HTTPS (required for geolocation)
  isSecureContext() {
    return window.isSecureContext || window.location.protocol === 'https:';
  }

  // ✅ Check permission status
  async checkPermission() {
    if (!navigator.permissions) {
      console.warn('⚠️ Permissions API not supported');
      return 'prompt';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      console.log('📍 Geolocation permission:', result.state);
      return result.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.warn('⚠️ Could not query geolocation permission:', error);
      return 'prompt';
    }
  }

  // ✅ Get detailed error message
  getErrorMessage(error) {
    const messages = {
      1: {
        code: 'PERMISSION_DENIED',
        message: 'Location access denied',
        userMessage: 'Please enable location access in your browser settings',
        action: 'CHECK_SETTINGS'
      },
      2: {
        code: 'POSITION_UNAVAILABLE',
        message: 'Location information unavailable',
        userMessage: 'Unable to determine your location. Please check if location services are enabled on your device',
        action: 'CHECK_DEVICE'
      },
      3: {
        code: 'TIMEOUT',
        message: 'Location request timed out',
        userMessage: 'Location request timed out. Retrying...',
        action: 'RETRY'
      }
    };

    return messages[error.code] || {
      code: 'UNKNOWN',
      message: 'Unknown geolocation error',
      userMessage: 'An error occurred while accessing your location',
      action: 'RETRY'
    };
  }

  // ✅ Request single position (for testing/permission request)
  async getCurrentPosition(options = {}) {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by this browser');
    }

    if (!this.isSecureContext()) {
      console.warn('⚠️ Geolocation may not work properly on non-HTTPS connections');
    }

    const defaultOptions = {
      enableHighAccuracy: this.useHighAccuracy,
      timeout: 10000,
      maximumAge: 0
    };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          console.log('✅ Current position:', this.currentPosition);
          resolve(this.currentPosition);
        },
        (error) => {
          const errorInfo = this.getErrorMessage(error);
          console.error(`❌ getCurrentPosition error [${error.code}]:`, errorInfo);
          reject({ error, errorInfo });
        },
        { ...defaultOptions, ...options }
      );
    });
  }

  // ✅ Start watching position with advanced error handling
  startWatching(callbacks = {}) {
    if (!this.isSupported()) {
      const error = new Error('Geolocation not supported');
      if (callbacks.onError) {
        callbacks.onError({
          code: 'NOT_SUPPORTED',
          message: 'Geolocation is not supported by this browser',
          userMessage: 'Your browser does not support location tracking'
        });
      }
      return false;
    }

    if (this.isTracking) {
      console.warn('⚠️ Already tracking location');
      return true;
    }

    this.onPositionUpdate = callbacks.onSuccess;
    this.onError = callbacks.onError;
    this.isTracking = true;
    this.retryCount = 0;

    const options = {
      enableHighAccuracy: this.useHighAccuracy,
      timeout: 15000, // 15 seconds
      maximumAge: 5000 // Allow 5-second cached position
    };

    console.log('📍 Starting location watch with options:', options);

    this.watchId = navigator.geolocation.watchPosition(
      // Success callback
      (position) => {
        this.retryCount = 0; // Reset on success
        
        this.currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        };

        console.log('📍 Position update:', {
          lat: this.currentPosition.lat.toFixed(6),
          lng: this.currentPosition.lng.toFixed(6),
          accuracy: `${this.currentPosition.accuracy.toFixed(2)}m`,
          time: new Date(this.currentPosition.timestamp).toLocaleTimeString()
        });

        if (this.onPositionUpdate) {
          this.onPositionUpdate(this.currentPosition);
        }
      },
      // Error callback
      (error) => {
        const errorInfo = this.getErrorMessage(error);
        console.error(`❌ Watch position error [${error.code}]:`, errorInfo);

        // Handle different error types
        if (error.code === 3) { // TIMEOUT
          if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`🔄 Retrying... (${this.retryCount}/${this.maxRetries})`);
            
            // Try with lower accuracy after retries
            if (this.retryCount >= 2 && this.useHighAccuracy) {
              console.log('🔄 Switching to lower accuracy mode');
              this.useHighAccuracy = false;
              this.stopWatching();
              setTimeout(() => this.startWatching(callbacks), this.retryDelay);
            }
            return; // Don't call error callback for retries
          }
        }

        if (error.code === 1) { // PERMISSION_DENIED
          this.stopWatching();
        }

        if (this.onError) {
          this.onError({
            code: error.code,
            ...errorInfo,
            retryCount: this.retryCount
          });
        }
      },
      options
    );

    return true;
  }

  // ✅ Stop watching position
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      console.log('📍 Location tracking stopped');
    }

    if (this.fallbackTimeout) {
      clearTimeout(this.fallbackTimeout);
      this.fallbackTimeout = null;
    }
  }

  // ✅ Get last known position
  getLastPosition() {
    return this.currentPosition;
  }

  // ✅ Calculate distance between two points (in meters)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // ✅ Format coordinates for display
  formatCoordinates(lat, lng, precision = 6) {
    return {
      lat: parseFloat(lat.toFixed(precision)),
      lng: parseFloat(lng.toFixed(precision))
    };
  }

  // ✅ Validate coordinates
  isValidCoordinates(lat, lng) {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !isNaN(lat) &&
      !isNaN(lng)
    );
  }

  // ✅ Get diagnostic info
  getDiagnostics() {
    return {
      supported: this.isSupported(),
      secureContext: this.isSecureContext(),
      isTracking: this.isTracking,
      hasPosition: !!this.currentPosition,
      currentPosition: this.currentPosition,
      retryCount: this.retryCount,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent
    };
  }
}

// ✅ Export singleton instance
export const geolocationService = new GeolocationService();

// ✅ Export class for custom instances
export default GeolocationService;