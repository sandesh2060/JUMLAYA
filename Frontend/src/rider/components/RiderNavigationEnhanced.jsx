// Frontend/src/rider/components/RiderNavigationEnhanced.jsx
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Phone,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader
} from 'lucide-react';
import axios from '../../api/axios.config';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createIcon = (color, emoji) => L.divIcon({
  className: 'custom-icon',
  html: `
    <div style="
      background: ${color};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      font-size: 20px;
    ">${emoji}</div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const riderIcon = createIcon('#3B82F6', '🏍️');
const destinationIcon = createIcon('#EF4444', '📍');
const pickupIcon = createIcon('#10B981', '🏪');

// Component to recenter map when rider moves
function RecenterMap({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  
  return null;
}

const RiderNavigationEnhanced = ({ orderId, orderDetails }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [heading, setHeading] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [route, setRoute] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [isArrived, setIsArrived] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  
  const watchIdRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  // Determine destination based on order status
  const isPickupPhase = orderDetails?.status === 'confirmed' || orderDetails?.status === 'preparing';
  
  const destination = isPickupPhase
    ? orderDetails?.restaurant?.location || orderDetails?.pickupLocation
    : orderDetails?.deliveryAddress?.location;

  const destinationCoords = destination ? {
    lat: destination.coordinates[1],
    lng: destination.coordinates[0]
  } : null;

  // Start tracking location
  useEffect(() => {
    if (!isTracking || !orderId) return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const handleSuccess = async (position) => {
      const { latitude, longitude, heading: deviceHeading, speed: deviceSpeed } = position.coords;
      
      const newPosition = { lat: latitude, lng: longitude };
      setCurrentPosition(newPosition);
      setHeading(deviceHeading || 0);
      setSpeed(deviceSpeed ? (deviceSpeed * 3.6).toFixed(1) : 0); // m/s to km/h

      // Send location update to server (throttled to every 5 seconds)
      const now = Date.now();
      if (now - lastUpdateRef.current >= 5000) {
        try {
          await axios.post('/api/rider/location/update', {
            latitude,
            longitude,
            heading: deviceHeading || 0,
            speed: deviceSpeed ? deviceSpeed * 3.6 : 0
          });
          lastUpdateRef.current = now;
        } catch (err) {
          console.error('Failed to update location:', err);
        }
      }

      // Calculate distance to destination
      if (destinationCoords) {
        const dist = calculateDistance(
          latitude,
          longitude,
          destinationCoords.lat,
          destinationCoords.lng
        );
        setDistance(dist);

        // Check if arrived (within 100 meters)
        if (dist < 0.1 && !isArrived) {
          setIsArrived(true);
        }

        // Update ETA
        const avgSpeed = deviceSpeed > 0 ? deviceSpeed * 3.6 : 30; // Default 30 km/h
        const estimatedMinutes = Math.ceil((dist / avgSpeed) * 60);
        setEta(estimatedMinutes);
      }
    };

    const handleError = (error) => {
      console.error('Geolocation error:', error);
      setError(`Location error: ${error.message}`);
    };

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    // Cleanup
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isTracking, orderId, destinationCoords, isArrived]);

  // Fetch route when destination changes
  useEffect(() => {
    if (currentPosition && destinationCoords && orderId) {
      fetchRoute();
    }
  }, [currentPosition, destinationCoords, orderId]);

  const fetchRoute = async () => {
    setLoadingRoute(true);
    try {
      const response = await axios.get(`/api/rider/location/route/${orderId}`);
      setRoute(response.data.data.route);
      setDistance(response.data.data.route.distance);
      setEta(Math.ceil(response.data.data.route.duration));
    } catch (err) {
      console.error('Failed to fetch route:', err);
      // Don't show error - will use straight line
    } finally {
      setLoadingRoute(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees) => degrees * (Math.PI / 180);

  const handleStartNavigation = () => {
    setIsTracking(true);
    setError(null);
  };

  const handleStopNavigation = () => {
    setIsTracking(false);
  };

  const handleArrival = async () => {
    try {
      const locationType = isPickupPhase ? 'pickup' : 'delivery';
      
      await axios.post('/api/rider/location/arrival', {
        orderId,
        locationType
      });

      alert(`Arrival at ${locationType} location confirmed!`);
      window.location.href = '/rider/orders'; // Redirect to orders
    } catch (err) {
      console.error('Failed to mark arrival:', err);
      setError('Failed to confirm arrival');
    }
  };

  const openInMaps = () => {
    if (destinationCoords) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destinationCoords.lat},${destinationCoords.lng}`;
      window.open(url, '_blank');
    }
  };

  const routeCoordinates = route?.coordinates || [];
  const mapCenter = currentPosition || destinationCoords || { lat: 27.7172, lng: 85.3240 };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header with Stats */}
      <div className="bg-white dark:bg-gray-800 shadow-md p-4 space-y-3 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isPickupPhase ? 'Navigate to Pickup' : 'Navigate to Customer'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Order #{orderId?.slice(-6)}
              </p>
            </div>
          </div>
          <button
            onClick={openInMaps}
            className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1 px-3 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
          >
            <MapPin size={16} />
            Google Maps
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {distance ? `${distance.toFixed(1)} km` : '--'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Distance</div>
          </div>
          <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {eta ? `${eta} min` : '--'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">ETA</div>
          </div>
          <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {speed} km/h
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Speed</div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loadingRoute && (
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
            <Loader size={16} className="animate-spin" />
            Calculating route...
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={15}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {currentPosition && (
            <>
              <Marker position={[currentPosition.lat, currentPosition.lng]} icon={riderIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">Your Location</p>
                    <p className="text-xs text-gray-600">Speed: {speed} km/h</p>
                  </div>
                </Popup>
              </Marker>
              <RecenterMap position={[currentPosition.lat, currentPosition.lng]} />
            </>
          )}

          {destinationCoords && (
            <Marker 
              position={[destinationCoords.lat, destinationCoords.lng]} 
              icon={isPickupPhase ? pickupIcon : destinationIcon}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">
                    {isPickupPhase ? 'Pickup Location' : 'Delivery Location'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {orderDetails?.deliveryAddress?.address || 'Destination'}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {routeCoordinates.length > 0 && (
            <Polyline
              positions={routeCoordinates.map(c => [c.lat, c.lng])}
              color="#3B82F6"
              weight={5}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>

      {/* Turn-by-turn instructions */}
      {route && route.steps && route.steps.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-t shadow-lg p-4">
          <div className="flex items-start gap-3">
            <Navigation className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {route.steps[currentStep]?.instruction || 'Head towards destination'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {route.steps[currentStep]?.distance?.toFixed(1) || 0} km
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="bg-white dark:bg-gray-800 border-t p-4 space-y-3">
        {!isTracking ? (
          <button
            onClick={handleStartNavigation}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Navigation size={20} />
            Start Navigation
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleStopNavigation}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Stop Navigation
            </button>
            
            {isArrived && (
              <button
                onClick={handleArrival}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle size={20} />
                Confirm Arrival
              </button>
            )}
          </div>
        )}

        {/* Customer contact */}
        {orderDetails?.user && !isPickupPhase && (
          <div className="flex gap-2">
            <button className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Phone size={18} />
              Call
            </button>
            <button className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <MessageCircle size={18} />
              Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderNavigationEnhanced;