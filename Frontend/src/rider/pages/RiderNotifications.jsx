// path: Frontend/src/rider/pages/RiderNotifications.jsx
import { useState, useEffect } from 'react';
import { Bell, Loader2, Filter, Trash2, CheckCheck } from 'lucide-react';
import riderApi from '../utils/riderApi';
import OrderNotificationCard from '../components/notifications/OrderNotificationCard';
import DeliveryNotificationCard from '../components/notifications/DeliveryNotificationCard';

const RiderNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await riderApi.notifications.getAll(page, filter);
      const newNotifications = response.data.notifications || [];
      
      if (page === 1) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }
      
      setHasMore(newNotifications.length === 20);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    setNotifications([]);
  };

  const handleMarkAllRead = async () => {
    try {
      await riderApi.notifications.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Delete all notifications? This cannot be undone.')) {
      try {
        await riderApi.notifications.deleteAll();
        setNotifications([]);
      } catch (error) {
        console.error('Error deleting all notifications:', error);
      }
    }
  };

  const renderNotificationCard = (notification) => {
    const orderTypes = ['new_order_assignment', 'pickup_reminder'];
    const deliveryTypes = ['delivery_completed', 'earnings_added', 'bonus_received', 'new_rating'];

    if (orderTypes.includes(notification.type)) {
      return (
        <OrderNotificationCard
          key={notification._id}
          notification={notification}
          onUpdate={fetchNotifications}
        />
      );
    } else if (deliveryTypes.includes(notification.type)) {
      return (
        <DeliveryNotificationCard
          key={notification._id}
          notification={notification}
          onUpdate={fetchNotifications}
        />
      );
    }

    return null;
  };

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'orders', label: 'Orders' },
    { value: 'earnings', label: 'Earnings' },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              
              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => handleFilterChange(f.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === f.value
                    ? 'bg-orange-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading && page === 1 ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No notifications yet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You'll see your order updates and earnings here
              </p>
            </div>
          ) : (
            <>
              {notifications.map(renderNotificationCard)}

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={loading}
                    className="px-6 py-3 bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Load more'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderNotifications;