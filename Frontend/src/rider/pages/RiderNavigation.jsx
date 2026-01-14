// Frontend/src/rider/pages/RiderNavigation.jsx
import { useState, useEffect } from 'react';
import { MapPin, Navigation as NavigationIcon, Phone, Clock, AlertCircle, Package, Home, Bike } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import RiderNavigationEnhanced from '../components/RiderNavigationEnhanced';
import axios from '../../api/axios.config';

const RiderNavigation = () => {
  const { user } = useAuth();
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch rider's active orders
  useEffect(() => {
    fetchActiveOrder();
    
    // Poll for active orders every 10 seconds
    const interval = setInterval(fetchActiveOrder, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveOrder = async () => {
    try {
      // Fetch rider's current active order
      const response = await axios.get('/api/rider/orders/active');
      
      if (response.data.data && response.data.data.length > 0) {
        // Get the first active order
        const order = response.data.data[0];
        setActiveOrder(order);
        setError(null);
      } else {
        setActiveOrder(null);
      }
    } catch (err) {
      console.error('Error fetching active order:', err);
      setError('Failed to load active order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading navigation...</p>
        </div>
      </div>
    );
  }

  // If rider has an active order, show navigation
  if (activeOrder) {
    return <RiderNavigationEnhanced orderId={activeOrder._id} orderDetails={activeOrder} />;
  }

  // No active order - show waiting screen
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Navigation</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            GPS and route navigation
          </p>
        </div>

        {/* No Active Order Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No Active Delivery
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Accept an order to start live navigation. The map will appear automatically when you have an active delivery.
          </p>

          {/* Status */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full mb-8">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Online & Ready</span>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <NavigationIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Turn-by-Turn
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                GPS navigation
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <MapPin className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Live Tracking
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Real-time updates
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                ETA & Distance
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Live calculations
              </p>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-left">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  How Navigation Works
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Go to <span className="font-semibold">Orders</span> and accept a delivery request
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Return to <span className="font-semibold">Navigation</span> - the map will load automatically
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Allow location access when prompted by your browser
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Click <span className="font-semibold">Start Navigation</span> to begin GPS tracking
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <a
            href="/rider/orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mt-6"
          >
            <Package className="w-5 h-5" />
            View Available Orders
          </a>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderNavigation;