// Frontend/src/admin/components/StoreLocationPicker.jsx
import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const StoreLocationPicker = ({ 
  initialLocation, 
  onLocationChange,
  onSave 
}) => {
  const [location, setLocation] = useState({
    latitude: initialLocation?.latitude || 27.6745,
    longitude: initialLocation?.longitude || 85.3240,
    address: initialLocation?.address || '',
    landmark: initialLocation?.landmark || ''
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Initialize map when modal opens
  useEffect(() => {
    if (showModal && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [showModal]);

  // Update marker when location changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([location.latitude, location.longitude]);
      mapInstanceRef.current.setView([location.latitude, location.longitude], 15);
    }
  }, [location.latitude, location.longitude]);

  const initializeMap = () => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      setTimeout(() => {
        if (window.L && mapRef.current) {
          // Initialize map
          const map = window.L.map(mapRef.current).setView(
            [location.latitude, location.longitude],
            15
          );

          // Add tile layer
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          // Add marker
          const marker = window.L.marker([location.latitude, location.longitude], {
            draggable: true
          }).addTo(map);

          // Handle marker drag
          marker.on('dragend', async function(e) {
            const position = e.target.getLatLng();
            setLocation(prev => ({
              ...prev,
              latitude: position.lat,
              longitude: position.lng
            }));
            await reverseGeocode(position.lat, position.lng);
          });

          // Handle map click
          map.on('click', async function(e) {
            marker.setLatLng(e.latlng);
            setLocation(prev => ({
              ...prev,
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            }));
            await reverseGeocode(e.latlng.lat, e.latlng.lng);
          });

          mapInstanceRef.current = map;
          markerRef.current = marker;
        }
      }, 100);
    };
    document.body.appendChild(script);
  };

  // Get current location
  const getCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setLocation(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
          }));
          
          await reverseGeocode(lat, lng);
          setIsLoading(false);
          toast.success('Location detected!');
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Unable to get your location');
          setIsLoading(false);
        }
      );
    } else {
      toast.error('Geolocation not supported');
      setIsLoading(false);
    }
  };

  // Search for location
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // Reverse geocode (get address from coordinates)
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data.display_name) {
        setLocation(prev => ({
          ...prev,
          address: data.display_name
        }));
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    }
  };

  // Select search result
  const selectSearchResult = (result) => {
    setLocation({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name,
      landmark: location.landmark
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  // Handle save
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(location);
      toast.success('Store location saved successfully!');
      setShowModal(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save location');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Current Location Display */}
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-gray-900 dark:text-white">
                Current Store Location
              </span>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Coordinates:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
              {location.address && (
                <p>
                  <strong>Address:</strong> {location.address}
                </p>
              )}
              {location.landmark && (
                <p>
                  <strong>Landmark:</strong> {location.landmark}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            Change Location
          </button>
        </div>
      </div>

      {/* Location Picker Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Set Store Location
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                    placeholder="Search for a location..."
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <button
                  onClick={searchLocation}
                  disabled={isSearching}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
                <button
                  onClick={getCurrentLocation}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  My Location
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => selectSearchResult(result)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-b last:border-b-0"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.display_name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
              <div ref={mapRef} className="w-full h-full min-h-[400px]" />
              
              <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={location.address}
                      onChange={(e) => setLocation({ ...location, address: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={location.landmark}
                      onChange={(e) => setLocation({ ...location, landmark: e.target.value })}
                      placeholder="e.g., Near Patan Durbar Square"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                  <strong>Coordinates:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  <br />
                  <em>Click on the map or drag the marker to set location</em>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Saving...' : 'Save Location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreLocationPicker;