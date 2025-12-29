import { Bell } from 'lucide-react';
import AdminNotificationList from '../components/notifications/AdminNotificationList';

const AdminNotifications = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
            <Bell className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Manage and view all admin notifications
            </p>
          </div>
        </div>
      </div>

      {/* Notification List */}
      <AdminNotificationList />
    </div>
  );
};

export default AdminNotifications;