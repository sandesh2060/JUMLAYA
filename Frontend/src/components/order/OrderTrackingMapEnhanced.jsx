// Frontend/src/components/orders/OrderTrackingMapEnhanced.jsx

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Bike, Home, MapPin, Clock, Navigation } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import 'leaflet/dist/leaflet.css';

// Custom icons
const riderIcon = L.divIcon({
  className: 'custom-rider-icon',
  html: `
    <div style="
      background: #3B82F6;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const deliveryIcon = L.divIcon({
  className: 'custom-delivery-icon',
  html: `
    <div style="
      background: #10B981;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const CustomerOrderTracking = ({ orderId, orderData }) => {
  const [riderLocation, setRiderLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const socket = useWebSocket();

  const deliveryAddress = orderData?.deliveryAddress?.location;
  const deliveryCoords = deliveryAddress ? {
    lat: deliveryAddress.coordinates[1],
    lng: deliveryAddress.coordinates[0]
  } : null;

  useEffect(() => {
    if (!socket || !orderId) return;

    // Join order tracking room
    socket.emit('track:order', { orderId });

    // Listen for rider location updates
    socket.on('rider:location:update', (data) => {
      setRiderLocation({
        lat: data.location.latitude,
        lng: data.location.longitude,
        heading: data.heading,
        speed: data.speed
      });
    });

    // Listen for route updates
    socket.on('route:update', (data) => {
      setRoutePath(data.route.coordinates || []);
      setEta(data.eta);
    });

    // Listen for proximity notifications
    socket.on('rider:proximity', (data) => {
      setDistance(data.distance);
      // You could show a toast notification here
      if (data.distance < 0.5) {
        showNotification('Your rider is arriving soon!');
      }
    });

    // Cleanup
    return () => {
      socket.off('rider:location:update');
      socket.off('route:update');
      socket.off('rider:proximity');
    };
  }, [socket, orderId]);

  const showNotification = (message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Order Update', { body: message });
    }
  };

  const mapCenter = riderLocation || deliveryCoords || { lat: 27.7172, lng: 85.3240 };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header with ETA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bike size={24} />
            <div>
              <h3 className="font-semibold">Track Your Order</h3>
              <p className="text-sm text-blue-100">Order #{orderId?.slice(-6)}</p>
            </div>
          </div>
          {eta && (
            <div className="text-right">
              <div className="text-2xl font-bold">{eta} min</div>
              <div className="text-xs text-blue-100">Estimated Time</div>
            </div>
          )}
        </div>

        {distance && (
          <div className="mt-3 flex items-center gap-2 bg-blue-500 bg-opacity-50 rounded px-3 py-2">
            <Navigation size={16} />
            <span className="text-sm">
              {distance < 1 
                ? `${(distance * 1000).toFixed(0)} meters away`
                : `${distance.toFixed(1)} km away`
              }
            </span>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-96 relative">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={14}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Rider location */}
          {riderLocation && (
            <>
              <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">Your Rider</p>
                    <p className="text-sm text-gray-600">
                      Speed: {riderLocation.speed} km/h
                    </p>
                  </div>
                </Popup>
              </Marker>
              
              {/* Circle showing approximate area */}
              <Circle
                center={[riderLocation.lat, riderLocation.lng]}
                radius={100}
                pathOptions={{ 
                  color: '#3B82F6', 
                  fillColor: '#3B82F6',
                  fillOpacity: 0.1 
                }}
              />
            </>
          )}

          {/* Delivery address */}
          {deliveryCoords && (
            <Marker position={[deliveryCoords.lat, deliveryCoords.lng]} icon={deliveryIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Delivery Location</p>
                  <p className="text-sm text-gray-600">
                    {orderData?.deliveryAddress?.address}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route path */}
          {routePath.length > 0 && (
            <Polyline
              positions={routePath.map(coord => [coord.lat, coord.lng])}
              pathOptions={{ 
                color: '#3B82F6', 
                weight: 4,
                opacity: 0.7,
                dashArray: '10, 10'
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Rider info */}
      {orderData?.rider && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <Bike className="text-gray-600" size={24} />
              </div>
              <div>
                <p className="font-semibold">{orderData.rider.name}</p>
                <p className="text-sm text-gray-600">
                  {orderData.rider.vehicleType || 'Motorcycle'}
                </p>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
              <Phone size={18} />
              Call
            </button>
          </div>
        </div>
      )}

      {/* Status timeline */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="space-y-3">
          <StatusStep 
            icon={<CheckCircle />}
            title="Order Confirmed"
            time={orderData?.createdAt}
            completed={true}
          />
          <StatusStep 
            icon={<Package />}
            title="Preparing"
            completed={orderData?.status !== 'confirmed'}
          />
          <StatusStep 
            icon={<Bike />}
            title="Out for Delivery"
            completed={orderData?.status === 'out_for_delivery' || orderData?.status === 'delivered'}
            active={orderData?.status === 'out_for_delivery'}
          />
          <StatusStep 
            icon={<Home />}
            title="Delivered"
            completed={orderData?.status === 'delivered'}
          />
        </div>
      </div>
    </div>
  );
};

const StatusStep = ({ icon, title, time, completed, active }) => (
  <div className="flex items-center gap-3">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
      completed ? 'bg-green-500' : active ? 'bg-blue-500' : 'bg-gray-300'
    } text-white`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className={`font-medium ${completed || active ? 'text-gray-900' : 'text-gray-500'}`}>
        {title}
      </p>
      {time && (
        <p className="text-xs text-gray-500">
          {new Date(time).toLocaleTimeString()}
        </p>
      )}
    </div>
  </div>
);

export default CustomerOrderTracking;