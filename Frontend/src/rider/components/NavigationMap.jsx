// ============================================
// Frontend/src/rider/pages/RiderNavigation.jsx
// ============================================
import { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Clock } from 'lucide-react';

const RiderNavigation = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
          <MapPin className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Navigation Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            GPS navigation and route optimization will be available here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiderNavigation;