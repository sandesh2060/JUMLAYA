import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart,
  Users,
  Bike,
  AlertTriangle,
  DollarSign,
  Package,
  Clock,
  Trash2,
  Eye,
  Bell,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { notificationApi } from '../../../api/notification.api';

const AdminNotificationItem = ({ notification, onUpdate }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkAsRead = async () => {
    if (!notification.isRead && !isMarking) {
      setIsMarking(true);
      try {
        await notificationApi.markAsRead(notification._id);
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error marking as read:', error);
      } finally {
        setIsMarking(false);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setIsDeleting(true);
      try {
        await notificationApi.deleteNotification(notification._id);
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error deleting notification:', error);
        setIsDeleting(false);
      }
    }
  };

  const getNotificationIcon = () => {
    const iconMap = {
      new_order: <ShoppingCart className="w-6 h-6" />,
      new_user_registration: <Users className="w-6 h-6" />,
      new_rider_application: <Bike className="w-6 h-6" />,
      low_stock_alert: <AlertTriangle className="w-6 h-6" />,
      payment_received: <DollarSign className="w-6 h-6" />,
      order_cancelled: <X className="w-6 h-6" />,
      order_delivered: <Package className="w-6 h-6" />,
      system_alert: <AlertTriangle className="w-6 h-6" />,
    };

    return iconMap[notification.type] || <Bell className="w-6 h-6" />;
  };

  const getIconColor = () => {
    const colorMap = {
      new_order: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      new_user_registration: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      new_rider_application: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
      low_stock_alert: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
      payment_received: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      order_cancelled: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      order_delivered: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      system_alert: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
    };

    return colorMap[notification.type] || 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
  };

  const getNotificationLink = () => {
    const { type, data } = notification;
    
    if (type === 'new_order' && data?.orderId) {
      return `/admin/orders/${data.orderId}`;
    } else if (type === 'new_user_registration' && data?.userId) {
      return `/admin/users/${data.userId}`;
    } else if (type === 'new_rider_application' && data?.riderId) {
      return `/admin/riders/${data.riderId}`;
    } else if (type === 'low_stock_alert' && data?.productId) {
      return `/admin/products/${data.productId}`;
    } else if (type === 'payment_received' && data?.orderId) {
      return `/admin/orders/${data.orderId}`;
    }
    
    return null;
  };

  const getPriorityBadge = () => {
    const priority = notification.priority || 'medium';
    const badges = {
      urgent: (
        <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">
          URGENT
        </span>
      ),
      high: (
        <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded">
          HIGH
        </span>
      ),
    };
    
    return badges[priority] || null;
  };

  const link = getNotificationLink();

  const content = (
    <div
      className={`flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all ${
        !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-blue-600' : ''
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
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {notification.title}
            </h3>
            {getPriorityBadge()}
          </div>
          {!notification.isRead && (
            <span className="flex-shrink-0 w-2.5 h-2.5 bg-blue-600 rounded-full mt-1.5"></span>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
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
                Order #{notification.data.orderNumber}
              </span>
            )}
            
            {notification.data?.userName && (
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {notification.data.userName}
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
                disabled={isMarking}
                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
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
        {(notification.data?.totalAmount || notification.data?.amount) && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Amount: ₹{notification.data.totalAmount || notification.data.amount}
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

export default AdminNotificationItem;