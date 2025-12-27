// Frontend/src/components/map/LocationPicker.jsx
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Search, MapPin, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
function LocationMarker({ position, setPosition, setAddress }) {
  const map = useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      fetchAddress(e.latlng.lat, e.latlng.lng, setAddress);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

// Component to recenter map when position changes
function MapController({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
}

// Fetch address from coordinates using Nominatim (OpenStreetMap)
const fetchAddress = async (lat, lng, setAddress) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    
    if (data && data.display_name) {
      setAddress(data.display_name);
    }
  } catch (error) {
    console.error('Error fetching address:', error);
    setAddress('Address not found');
  }
};

// Search location by query
const searchLocation = async (query, setPosition, setAddress, setSearchResults) => {
  if (!query.trim()) {
    setSearchResults([]);
    return;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      setSearchResults(data);
    } else {
      setSearchResults([]);
    }
  } catch (error) {
    console.error('Error searching location:', error);
    setSearchResults([]);
  }
};

const LocationPicker = ({ onLocationSelect, defaultLocation = null }) => {
  // Default to Kathmandu, Nepal
  const defaultCenter = defaultLocation || [27.7172, 85.3240];
  
  const [position, setPosition] = useState(defaultLocation);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos = [latitude, longitude];
          setPosition(newPos);
          fetchAddress(latitude, longitude, setAddress);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location. Please allow location access.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  // Handle search input with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.trim()) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation(query, setPosition, setAddress, setSearchResults);
        setIsSearching(false);
      }, 500);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  // Handle selecting a search result
  const handleSelectSearchResult = (result) => {
    const newPos = [parseFloat(result.lat), parseFloat(result.lon)];
    setPosition(newPos);
    setAddress(result.display_name);
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  // Handle confirm location
  const handleConfirmLocation = () => {
    if (position) {
      onLocationSelect({
        coordinates: position,
        lat: position[0],
        lng: position[1],
        address: address,
        landmark: landmark,
        instructions: instructions
      });
    }
  };

  // Fetch initial address if default location is provided
  useEffect(() => {
    if (defaultLocation) {
      fetchAddress(defaultLocation[0], defaultLocation[1], setAddress);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          <button
            onClick={handleGetCurrentLocation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            title="Use my current location"
          >
            <Navigation size={20} />
            <span className="hidden sm:inline">Current</span>
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => handleSelectSearchResult(result)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-600 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={16} />
                  <p className="text-sm dark:text-gray-100 text-gray-900">{result.display_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="rounded-lg overflow-hidden border-2 dark:border-gray-600 border-gray-300 h-96">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={position} 
            setPosition={setPosition}
            setAddress={setAddress}
          />
          <MapController center={position} />
        </MapContainer>
      </div>

      {/* Selected Address Display */}
      {address && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-start gap-2">
            <MapPin className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Selected Location</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{address}</p>
              {position && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Additional Details */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Landmark (e.g., Near City Hall)"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        
        <textarea
          placeholder="Delivery instructions (e.g., Ring the doorbell twice)"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirmLocation}
        disabled={!position}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <MapPin size={20} />
        Confirm Location
      </button>
    </div>
  );
};

export default LocationPicker;