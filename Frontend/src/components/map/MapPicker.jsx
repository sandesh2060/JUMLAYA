// src/components/map/MapPicker.jsx
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import marker images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Recenter map component
function RecenterMap({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position?.[0] && position?.[1]) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  
  return null;
}

// Location marker with click and drag
function LocationMarker({ position, setPosition, onLocationChange }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onLocationChange?.(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const handleDragEnd = (e) => {
      const pos = e.target.getLatLng();
      setPosition([pos.lat, pos.lng]);
      onLocationChange?.(pos.lat, pos.lng);
    };

    marker.on('dragend', handleDragEnd);
    return () => marker.off('dragend', handleDragEnd);
  }, [setPosition, onLocationChange]);

  if (!position?.[0] || !position?.[1]) return null;

  return <Marker position={position} draggable ref={markerRef} />;
}

const MapPicker = ({ position, setPosition, onLocationChange }) => {
  const defaultPosition = [27.7172, 85.3240];
  const currentPosition = position?.[0] && position?.[1] ? position : defaultPosition;

  return (
    <div className="h-96 rounded-xl overflow-hidden border-2 dark:border-gray-600 relative">
      <MapContainer
        center={currentPosition}
        zoom={13}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <RecenterMap position={currentPosition} />
        <LocationMarker 
          position={currentPosition} 
          setPosition={setPosition}
          onLocationChange={onLocationChange}
        />
      </MapContainer>
      
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg z-[1000] pointer-events-none">
        <p className="text-xs font-medium dark:text-gray-100">
          🖱️ Click map or drag marker
        </p>
      </div>
      
      {currentPosition?.[0] && currentPosition?.[1] && (
        <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg z-[1000] pointer-events-none">
          <p className="text-xs font-mono dark:text-gray-100">
            {currentPosition[0].toFixed(6)}, {currentPosition[1].toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapPicker;