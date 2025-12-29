import { useEffect, useState } from 'react';
import { Trash2, CheckCheck, Filter } from 'lucide-react';
import riderApi from '../../../api/rider.api';
import OrderNotificationCard from './OrderNotificationCard';
import DeliveryNotificationCard from './DeliveryNotificationCard';

const RiderNotificationList = () => {
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await riderApi.notifications.getAll(currentPage, filter);
      setNotifications(response.data.notifications || []);
      setPagination(response.data.pagination);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
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
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        await riderApi.notifications.deleteAll();
        setCurrentPage(1);
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting all notifications:', error);
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderNotificationCard = (notification) => {
    // Render different card types based on notification type
    if (notification.type === 'new_order_assignment' || notification.type === 'pickup_reminder') {
      return (
        <OrderNotificationCard
          key={notification._id}
          notification={notification}
          onUpdate={fetchNotifications}
        />
      );
    } else if (notification.type === 'delivery_completed' || notification.type === 'earnings_added') {
      return (
        <DeliveryNotificationCard
          key={notification._id}
          notification={notification}
          onUpdate={fetchNotifications}
        />
      );
    }
    
    // Default generic card
    return (
      <OrderNotificationCard
        key={notification._id}
        notification={notification}
        onUpdate={fetchNotifications}
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-lg">
          <p className="text-sm text-blue-100">Total Notifications</p>
          <p className="text-3xl font-bold">
            {pagination?.total || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl text-white shadow-lg">
          <p className="text-sm text-orange-100">Unread</p>
          <p className="text-3xl font-bold">
            {unreadCount}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-white shadow-lg">
          <p className="text-sm text-green-100">Read</p>
          <p className="text-3xl font-bold">
            {(pagination?.total || 0) - unreadCount}
          </p>
        </div>
      </div>

      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => handleFilterChange('read')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'read'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Read
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete all
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-12 text-center text-gray-500 dark:text-gray-400">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No notifications found</p>
            <p className="text-sm mt-1">
              {filter === 'unread' 
                ? "You're all caught up! 🎉" 
                : filter === 'read'
                ? 'No read notifications yet'
                : 'You have no notifications'}
            </p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => renderNotificationCard(notification))}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((currentPage - 1) * 20) + 1} to{' '}
                    {Math.min(currentPage * 20, pagination.total)} of{' '}
                    {pagination.total} notifications
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    
                    <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Page {currentPage} of {pagination.pages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.pages}
                      className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RiderNotificationList;