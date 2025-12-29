import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  Clock, 
  Eye, 
  Trash2,
  ChevronRight,
  Bell
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import riderApi from '../../../api/rider.api';

const OrderNotificationCard = ({ notification, onUpdate }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkAsRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!notification.isRead && !isMarking) {
      setIsMarking(true);
      try {
        await riderApi.notifications.markAsRead(notification._id);
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error marking as read:', error);
      } finally {
        setIsMarking(false);
      }
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Delete this notification?')) {
      setIsDeleting(true);
      try {
        await riderApi.notifications.delete(notification._id);
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error deleting notification:', error);
        setIsDeleting(false);
      }
    }
  };

  const getNotificationStyle = () => {
    const styles = {
      new_order_assignment: 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/10',
      pickup_reminder: 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
      delivery_completed: 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/10',
    };

    return !notification.isRead 
      ? styles[notification.type] || 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/10'
      : 'border-l-4 border-gray-300 dark:border-gray-700';
  };

  const getIcon = () => {
    const icons = {
      new_order_assignment: <Package className="w-6 h-6 text-blue-600" />,
      pickup_reminder: <Bell className="w-6 h-6 text-yellow-600" />,
      delivery_completed: <Package className="w-6 h-6 text-green-600" />,
    };

    return icons[notification.type] || <Package className="w-6 h-6 text-orange-600" />;
  };

  const orderLink = notification.data?.orderId 
    ? `/rider/orders/${notification.data.orderId}`
    : null;

  const content = (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all p-4 ${getNotificationStyle()} ${
        isDeleting ? 'opacity-50' : ''
      }`}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
            {getIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {notification.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {notification.message}
              </p>
            </div>
            {!notification.isRead && (
              <span className="flex-shrink-0 w-3 h-3 bg-orange-600 rounded-full animate-pulse"></span>
            )}
          </div>

          {/* Order Details */}
          {notification.data && (
            <div className="space-y-2 mt-3">
              {notification.data.orderNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Order #{notification.data.orderNumber}
                  </span>
                </div>
              )}
              
              {notification.data.deliveryAddress && (
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">{notification.data.deliveryAddress}</span>
                </div>
              )}

              {notification.data.amount && (
                <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold">
                  ₹{notification.data.amount}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              {formatDistanceToNow(new Date(notification.createdAt), { 
                addSuffix: true 
              })}
            </div>

            <div className="flex items-center gap-2">
              {!notification.isRead && (
                <button
                  onClick={handleMarkAsRead}
                  disabled={isMarking}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  title="Mark as read"
                >
                  <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              )}
              
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>

              {orderLink && (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (orderLink) {
    return (
      <Link to={orderLink} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

export default OrderNotificationCard;