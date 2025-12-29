import { Bell } from 'lucide-react';
import RiderNotificationList from '../components/notifications/RiderNotificationList';

const RiderNotifications = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Notifications
              </h1>
              <p className="text-orange-100 text-sm mt-1">
                Stay updated with your orders and earnings
              </p>
            </div>
          </div>
        </div>

        {/* Notification List */}
        <RiderNotificationList />
      </div>
    </div>
  );
};

export default RiderNotifications;