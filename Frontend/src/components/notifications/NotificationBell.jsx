// src/components/notifications/NotificationBell.jsx
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotification } from "../../hooks/useNotification";
import { useAuth } from "../../hooks/useAuth";
import NotificationDropdown from "./NotificationDropdown";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, fetchUnreadCount } = useNotification();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    console.log('🔔 NotificationBell Effect Running:', {
      isAuthenticated,
      user: user?.email || 'No user',
      hasToken: !!localStorage.getItem('authToken')
    });

    if (!isAuthenticated) {
      console.log('⏭️ Skipping fetch - Not authenticated');
      return;
    }
    
    // Initial fetch
    console.log('🚀 Initial fetch unread count...');
    fetchUnreadCount();
    
    // Fetch count every 30 seconds
    const interval = setInterval(() => {
      console.log('🔄 Interval fetch unread count...');
      fetchUnreadCount();
    }, 30000);
    
    return () => {
      console.log('🧹 Cleaning up interval');
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Debug log on every render
  console.log('🔔 NotificationBell Render:', { 
    isAuthenticated, 
    unreadCount,
    shouldShowBadge: isAuthenticated && unreadCount > 0 
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />

        {/* ✅ FIXED: Only show badge when count > 0 */}
        {isAuthenticated && unreadCount > 0 && (
          <span 
            className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2"
            title={`Unread: ${unreadCount}`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;