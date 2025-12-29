import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  DollarSign, 
  Star,
  Clock, 
  Eye, 
  Trash2,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import riderApi from '../../../api/rider.api';

const DeliveryNotificationCard = ({ notification, onUpdate }) => {
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
      delivery_completed: 'border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/10',
      earnings_added: 'border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/10',
      bonus_received: 'border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/10',
      new_rating: 'border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/10',
    };

    return !notification.isRead 
      ? styles[notification.type] || 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10'
      : 'border-l-4 border-gray-300 dark:border-gray-700';
  };

  const getIcon = () => {
    const icons = {
      delivery_completed: (
        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
      ),
      earnings_added: (
        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
          <DollarSign className="w-6 h-6 text-green-600" />
        </div>
      ),
      bonus_received: (
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
          <Award className="w-6 h-6 text-purple-600" />
        </div>
      ),
      new_rating: (
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
          <Star className="w-6 h-6 text-yellow-600" />
        </div>
      ),
    };

    return icons[notification.type] || (
      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
        <TrendingUp className="w-6 h-6 text-gray-600" />
      </div>
    );
  };

  const renderEarningsDetails = () => {
    if (notification.type === 'earnings_added' && notification.data?.amount) {
      return (
        <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Earnings Added
            </span>
            <div className="flex items-center gap-1">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                ₹{notification.data.amount}
              </span>
            </div>
          </div>
          {notification.data.orderNumber && (
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
              Order #{notification.data.orderNumber}
            </p>
          )}
        </div>
      );
    }

    if (notification.type === 'bonus_received' && notification.data?.bonusAmount) {
      return (
        <div className="mt-3 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
              Bonus Earned! 🎉
            </span>
            <div className="flex items-center gap-1">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                ₹{notification.data.bonusAmount}
              </span>
            </div>
          </div>
          {notification.data.reason && (
            <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">
              {notification.data.reason}
            </p>
          )}
        </div>
      );
    }

    if (notification.type === 'new_rating' && notification.data?.rating) {
      return (
        <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              Customer Rating
            </span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < notification.data.rating
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
              <span className="ml-1 text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {notification.data.rating}/5
              </span>
            </div>
          </div>
          {notification.data.orderNumber && (
            <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
              Order #{notification.data.orderNumber}
            </p>
          )}
        </div>
      );
    }

    return null;
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
          {getIcon()}
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
              <span className="flex-shrink-0 w-3 h-3 bg-green-600 rounded-full animate-pulse"></span>
            )}
          </div>

          {/* Earnings/Rating Details */}
          {renderEarningsDetails()}

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

export default DeliveryNotificationCard;