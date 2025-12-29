import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  Bell
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotification } from '../../hooks/useNotification';

const NotificationItem = ({ notification }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { markAsRead, deleteNotification } = useNotification();

  const handleMarkAsRead = async () => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setIsDeleting(true);
      await deleteNotification(notification._id);
    }
  };

  const getNotificationIcon = () => {
    const iconMap = {
      order_placed: <ShoppingBag className="w-6 h-6" />,
      order_confirmed: <CheckCircle className="w-6 h-6" />,
      order_processing: <Clock className="w-6 h-6" />,
      order_shipped: <Package className="w-6 h-6" />,
      order_out_for_delivery: <Truck className="w-6 h-6" />,
      order_delivered: <CheckCircle className="w-6 h-6" />,
      order_cancelled: <XCircle className="w-6 h-6" />,
      order_returned: <AlertCircle className="w-6 h-6" />,
      order_status_update: <AlertCircle className="w-6 h-6" />,
      payment_success: <CheckCircle className="w-6 h-6" />,
      payment_failed: <XCircle className="w-6 h-6" />,
    };

    return iconMap[notification.type] || <Bell className="w-6 h-6" />;
  };

  const getIconColor = () => {
    const colorMap = {
      order_placed: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      order_confirmed: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      order_processing: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
      order_shipped: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
      order_out_for_delivery: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
      order_delivered: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      order_cancelled: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      order_returned: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
      payment_success: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      payment_failed: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    };

    return colorMap[notification.type] || 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
  };

  const getNotificationLink = () => {
    if (notification.data?.orderId) {
      return `/orders/${notification.data.orderId}`;
    }
    return null;
  };

  const link = getNotificationLink();

  const content = (
    <div
      className={`flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all ${
        !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
      } ${isDeleting ? 'opacity-50' : ''}`}
      onClick={handleMarkAsRead}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 p-3 rounded-xl ${getIconColor()}`}>
        {getNotificationIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {notification.title}
          </h3>
          {!notification.isRead && (
            <span className="flex-shrink-0 w-2.5 h-2.5 bg-blue-600 rounded-full mt-1.5"></span>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {notification.message}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDistanceToNow(new Date(notification.createdAt), { 
                addSuffix: true 
              })}
            </span>
            
            {notification.data?.orderNumber && (
              <span className="font-medium text-blue-600 dark:text-blue-400">
                #{notification.data.orderNumber}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!notification.isRead && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMarkAsRead();
                }}
                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Mark as read"
              >
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
              title="Delete notification"
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>

        {/* Additional Data */}
        {notification.data?.totalAmount && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Amount: ₹{notification.data.totalAmount}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // If there's a link, wrap in Link component
  if (link) {
    return (
      <Link to={link} className="block">
        {content}
      </Link>
    );
  }

  // Otherwise, return plain div
  return <div className="cursor-default">{content}</div>;
};

export default NotificationItem;