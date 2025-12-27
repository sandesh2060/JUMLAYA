// ============================================
// Frontend/src/rider/pages/RiderNavigation.jsx
// ============================================
import { useState } from 'react';
import { MapPin, Navigation, Phone, Clock, AlertCircle } from 'lucide-react';

const RiderNavigation = () => {
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

        {/* Coming Soon Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Navigation Coming Soon
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Real-time GPS navigation, route optimization, and turn-by-turn directions will be available here.
          </p>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Navigation className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Turn-by-Turn
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Voice navigation
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <MapPin className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Live Tracking
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Real-time location
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Route Optimization
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Fastest routes
              </p>
            </div>
          </div>

          {/* Info Alert */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Currently in Development
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                This feature is under active development and will be released soon. You can still view order addresses in the Orders section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderNavigation;