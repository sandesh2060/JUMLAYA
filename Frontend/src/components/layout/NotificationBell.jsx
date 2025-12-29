import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Package, ShoppingCart, AlertCircle, TrendingDown } from 'lucide-react';
import { notificationApi } from '../../api/notification.api'; // ✅ Use your API client

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await notificationApi.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await notificationApi.getNotifications(1, 10);
      if (response.success && response.data && response.data.data) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (showDropdown) {
      fetchNotifications();
    }
  }, [showDropdown]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const icons = {
      new_order: ShoppingCart,
      order_cancelled: AlertCircle,
      order_delivered: CheckCircle,
      order_returned: Package,
      low_stock: TrendingDown,
      payment_received: CheckCircle,
      order_status_change: Package,
      default: Bell
    };
    return icons[type] || icons.default;
  };

  // Get notification style based on type
  const getNotificationStyle = (type) => {
    const styles = {
      new_order: { 
        color: 'text-blue-600 dark:text-blue-400', 
        bg: 'bg-blue-100 dark:bg-blue-900/30' 
      },
      order_cancelled: { 
        color: 'text-red-600 dark:text-red-400', 
        bg: 'bg-red-100 dark:bg-red-900/30' 
      },
      order_delivered: { 
        color: 'text-green-600 dark:text-green-400', 
        bg: 'bg-green-100 dark:bg-green-900/30' 
      },
      order_returned: { 
        color: 'text-orange-600 dark:text-orange-400', 
        bg: 'bg-orange-100 dark:bg-orange-900/30' 
      },
      low_stock: { 
        color: 'text-yellow-600 dark:text-yellow-400', 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30' 
      },
      payment_received: { 
        color: 'text-emerald-600 dark:text-emerald-400', 
        bg: 'bg-emerald-100 dark:bg-emerald-900/30' 
      },
      default: { 
        color: 'text-gray-600 dark:text-gray-400', 
        bg: 'bg-gray-100 dark:bg-gray-800' 
      }
    };
    return styles[type] || styles.default;
  };

  // Format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell size={22} className="text-gray-700 dark:text-gray-300" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="font-medium">No notifications yet</p>
                <p className="text-xs mt-1">We'll notify you when something happens</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const style = getNotificationStyle(notification.type);
                const Icon = getNotificationIcon(notification.type);
                
                return (
                  <div
                    key={notification._id}
                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group ${
                      !notification.isRead ? 'bg-green-50/50 dark:bg-gray-700/50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`${style.bg} ${style.color} rounded-lg p-2 h-10 w-10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="h-2 w-2 bg-green-600 dark:bg-green-400 rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                          {timeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-800/50">
              <a 
                href="/notifications" 
                className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
              >
                View all notifications →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;