// Fixed NotificationBell.jsx
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationAPI } from '@/api/notification.api';
import { useAuth } from '@/hooks/useAuth'; // ✅ ADD THIS

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth(); // ✅ ADD THIS

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Don't show error toast for 401s (user not logged in)
      if (error.response?.status !== 401) {
        // Only log non-auth errors
        console.error('Notification error:', error.message);
      }
    }
  };

  useEffect(() => {
    // ✅ CRITICAL FIX: Only fetch if user is authenticated
    if (isAuthenticated && user) {
      fetchUnreadCount();
      
      // Optional: Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => clearInterval(interval);
    } else {
      // Reset count when user logs out
      setUnreadCount(0);
    }
  }, [isAuthenticated, user]); // ✅ Re-run when auth state changes

  // ✅ Don't render if user is not logged in
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <button className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;