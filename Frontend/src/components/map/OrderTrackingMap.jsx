// Frontend/src/components/map/OrderTrackingMap.jsx
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import { Navigation, MapPin, Home, Store, Package, Clock, Phone } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

// Custom icons
const riderIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #22c55e; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const restaurantIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #f59e0b; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const deliveryIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #3b82f6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const OrderTrackingMap = ({ order, riderLocation, updateInterval = 10000 }) => {
  const [currentRiderLocation, setCurrentRiderLocation] = useState(riderLocation);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [mapCenter, setMapCenter] = useState([27.7172, 85.3240]); // Kathmandu default
  const [mapZoom, setMapZoom] = useState(13);
  const intervalRef = useRef(null);

  // Extract locations
  const restaurantLocation = order?.restaurant?.location?.coordinates 
    ? [order.restaurant.location.coordinates[1], order.restaurant.location.coordinates[0]]
    : null;

  const deliveryLocation = order?.shippingAddress?.location?.coordinates
    ? [order.shippingAddress.location.coordinates[1], order.shippingAddress.location.coordinates[0]]
    : null;

  // Initialize map center
  useEffect(() => {
    if (currentRiderLocation) {
      setMapCenter(currentRiderLocation);
    } else if (restaurantLocation) {
      setMapCenter(restaurantLocation);
    } else if (deliveryLocation) {
      setMapCenter(deliveryLocation);
    }
  }, [currentRiderLocation, restaurantLocation, deliveryLocation]);

  // Fetch rider location updates
  useEffect(() => {
    if (!order?.rider?._id || order.status === 'delivered' || order.status === 'cancelled') {
      return;
    }

    const fetchRiderLocation = async () => {
      try {
        const response = await fetch(`/api/rider/location/${order.rider._id}`);
        const data = await response.json();
        
        if (data.success && data.location) {
          setCurrentRiderLocation([data.location.lat, data.location.lng]);
          
          // Update route path if rider moved significantly
          if (routePath.length === 0 || 
              calculateDistance(routePath[routePath.length - 1], [data.location.lat, data.location.lng]) > 0.05) {
            setRoutePath(prev => [...prev, [data.location.lat, data.location.lng]]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch rider location:', error);
      }
    };

    // Initial fetch
    fetchRiderLocation();

    // Set up interval for updates
    intervalRef.current = setInterval(fetchRiderLocation, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [order?.rider?._id, order?.status, updateInterval]);

  // Calculate estimated delivery time
  useEffect(() => {
    if (!currentRiderLocation || !deliveryLocation) return;

    const distance = calculateDistance(currentRiderLocation, deliveryLocation);
    const avgSpeed = 25; // km/h average speed
    const timeInMinutes = Math.ceil((distance / avgSpeed) * 60);
    
    setEstimatedTime(timeInMinutes);
  }, [currentRiderLocation, deliveryLocation]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(point2[0] - point1[0]);
    const dLon = toRad(point2[1] - point1[1]);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(point1[0])) * Math.cos(toRad(point2[0])) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  // Get route line between points
  const getRouteLine = () => {
    const points = [];
    
    if (restaurantLocation) points.push(restaurantLocation);
    if (currentRiderLocation) points.push(currentRiderLocation);
    if (deliveryLocation) points.push(deliveryLocation);
    
    return points;
  };

  // Status display
  const getStatusInfo = () => {
    switch (order?.status) {
      case 'pending':
        return { text: 'Finding a rider...', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'accepted':
        return { text: 'Rider assigned', color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'picked_up':
        return { text: 'Order picked up', color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'on_the_way':
        return { text: 'On the way', color: 'text-green-600', bg: 'bg-green-100' };
      case 'delivered':
        return { text: 'Delivered', color: 'text-green-700', bg: 'bg-green-200' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { text: 'Processing', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Track Your Order
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Order ID: {order?.orderId || 'Loading...'}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full ${statusInfo.bg} ${statusInfo.color} font-semibold`}>
            {statusInfo.text}
          </div>
        </div>

        {/* Estimated Time */}
        {estimatedTime && order?.status !== 'delivered' && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <Clock className="text-green-600 dark:text-green-400" size={24} />
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                Estimated Arrival
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {estimatedTime} minutes
              </p>
            </div>
          </div>
        )}

        {/* Rider Info */}
        {order?.rider && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Package className="text-white" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {order.rider.name || 'Delivery Partner'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.rider.vehicleType || 'Vehicle'} • {order.rider.riderCode}
                  </p>
                </div>
              </div>
              {order.rider.phone && (
                <a
                  href={`tel:${order.rider.phone}`}
                  className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
                >
                  <Phone size={20} />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="h-[500px] relative">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Restaurant Marker */}
            {restaurantLocation && (
              <Marker position={restaurantLocation} icon={restaurantIcon}>
                <Popup>
                  <div className="text-center p-2">
                    <Store className="mx-auto mb-2 text-orange-600" size={24} />
                    <p className="font-semibold">{order?.restaurant?.name || 'Restaurant'}</p>
                    <p className="text-xs text-gray-600">Pickup Location</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Rider Marker */}
            {currentRiderLocation && (
              <>
                <Marker position={currentRiderLocation} icon={riderIcon}>
                  <Popup>
                    <div className="text-center p-2">
                      <Navigation className="mx-auto mb-2 text-green-600" size={24} />
                      <p className="font-semibold">Your Rider</p>
                      <p className="text-xs text-gray-600">
                        {order?.rider?.name || 'On the way'}
                      </p>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Accuracy circle */}
                <Circle
                  center={currentRiderLocation}
                  radius={50}
                  pathOptions={{
                    color: '#22c55e',
                    fillColor: '#22c55e',
                    fillOpacity: 0.1
                  }}
                />
              </>
            )}

            {/* Delivery Location Marker */}
            {deliveryLocation && (
              <Marker position={deliveryLocation} icon={deliveryIcon}>
                <Popup>
                  <div className="text-center p-2">
                    <Home className="mx-auto mb-2 text-blue-600" size={24} />
                    <p className="font-semibold">Delivery Address</p>
                    <p className="text-xs text-gray-600">
                      {order?.shippingAddress?.street || 'Your location'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Route Line */}
            {getRouteLine().length > 1 && (
              <Polyline
                positions={getRouteLine()}
                pathOptions={{
                  color: '#3b82f6',
                  weight: 4,
                  opacity: 0.7,
                  dashArray: '10, 10'
                }}
              />
            )}

            {/* Rider Path (breadcrumb trail) */}
            {routePath.length > 1 && (
              <Polyline
                positions={routePath}
                pathOptions={{
                  color: '#22c55e',
                  weight: 3,
                  opacity: 0.5
                }}
              />
            )}
          </MapContainer>
        </div>

        {/* Map Legend */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-around text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Restaurant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Rider</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">
          Order Timeline
        </h4>
        <div className="space-y-4">
          <TimelineItem
            icon={<Package />}
            title="Order Placed"
            time={order?.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
            completed={true}
          />
          <TimelineItem
            icon={<Navigation />}
            title="Rider Assigned"
            time={order?.timeline?.accepted ? new Date(order.timeline.accepted).toLocaleString() : '-'}
            completed={!!order?.timeline?.accepted}
          />
          <TimelineItem
            icon={<Store />}
            title="Order Picked Up"
            time={order?.timeline?.picked_up ? new Date(order.timeline.picked_up).toLocaleString() : '-'}
            completed={!!order?.timeline?.picked_up}
          />
          <TimelineItem
            icon={<Home />}
            title="Delivered"
            time={order?.timeline?.delivered ? new Date(order.timeline.delivered).toLocaleString() : '-'}
            completed={!!order?.timeline?.delivered}
          />
        </div>
      </div>
    </div>
  );
};

// Timeline Item Component
const TimelineItem = ({ icon, title, time, completed }) => (
  <div className="flex items-start gap-4">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
      completed 
        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
    }`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className={`font-semibold ${
        completed 
          ? 'text-gray-900 dark:text-gray-100'
          : 'text-gray-500 dark:text-gray-400'
      }`}>
        {title}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{time}</p>
    </div>
    {completed && (
      <div className="text-green-600 dark:text-green-400">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    )}
  </div>
);

export default OrderTrackingMap;