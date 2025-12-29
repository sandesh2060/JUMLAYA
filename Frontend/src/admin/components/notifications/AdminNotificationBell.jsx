import { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { notificationApi } from '../../../api/notification.api';

const AdminNotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      {unreadCount > 0 ? <BellRing className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default AdminNotificationBell;