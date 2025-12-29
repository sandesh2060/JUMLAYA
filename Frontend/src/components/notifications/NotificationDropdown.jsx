import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  Trash2, 
  X,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../hooks/useNotification';
import { useLanguage } from "../../hooks/useLanguage"; 
import { formatDistanceToNow } from 'date-fns';
import { enUS, ne } from 'date-fns/locale';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const dropdownRef = useRef(null);
  const languageMenuRef = useRef(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotification();
  
  const { currentLanguage, changeLanguage, languages } = useLanguage();

  const dateLocale = i18n.language === 'ne' ? ne : enUS;

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, 10, activeTab === 'unread' ? 'unread' : 'all');
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
    fetchNotifications(1, 10, activeTab === 'unread' ? 'unread' : 'all');
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    fetchNotifications(1, 10, activeTab === 'unread' ? 'unread' : 'all');
  };

  const handleDelete = async (notificationId) => {
    await deleteNotification(notificationId);
    fetchNotifications(1, 10, activeTab === 'unread' ? 'unread' : 'all');
  };

  const getNotificationIcon = (type) => {
    const icons = {
      order_placed: <ShoppingBag className="w-5 h-5 text-blue-500" />,
      order_confirmed: <CheckCircle className="w-5 h-5 text-green-500" />,
      order_shipped: <Package className="w-5 h-5 text-purple-500" />,
      order_out_for_delivery: <Truck className="w-5 h-5 text-orange-500" />,
      order_delivered: <CheckCircle className="w-5 h-5 text-green-500" />,
      order_cancelled: <XCircle className="w-5 h-5 text-red-500" />,
      order_status_update: <AlertCircle className="w-5 h-5 text-blue-500" />,
    };

    return icons[type] || <Bell className="w-5 h-5 text-gray-500" />;
  };

  // ✅ CRITICAL: Function to translate notification content
  const translateNotification = (notification) => {
    const type = notification.type;
    
    // Extract order ID and amount from message using regex
    const orderIdMatch = notification.message?.match(/#(ORD-[\d-]+)/);
    const amountMatch = notification.message?.match(/(?:NPR|रु)\s*([\d,]+)/);
    const orderId = orderIdMatch ? orderIdMatch[1] : '';
    const total = amountMatch ? amountMatch[1] : '';

    // Map notification types to translation keys
    const typeMap = {
      order_placed: 'orders.placed',
      order_confirmed: 'orders.confirmed',
      order_shipped: 'orders.shipped',
      order_delivered: 'orders.delivered',
      order_cancelled: 'orders.cancelled',
      order_returned: 'orders.returned',
      order_payment: 'orders.payment',
    };

    const translationKey = typeMap[type];
    
    // Check if translation exists
    if (translationKey) {
      const titleKey = `notifications.${translationKey}.title`;
      const messageKey = `notifications.${translationKey}.message`;
      
      // Check if the translation key exists (won't return the key itself)
      if (t(titleKey) !== titleKey) {
        return {
          title: t(titleKey),
          message: t(messageKey, { 
            orderId, 
            total,
            amount: total,
            reason: ''
          })
        };
      }
    }

    // Fallback to original if no translation found
    return {
      title: notification.title,
      message: notification.message
    };
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] flex flex-col"
      aria-label={t('notifications.aria.label')}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('notifications.title')}
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1"
                aria-label={t('navbar.changeLanguage')}
              >
                <Globe size={18} className="text-gray-700 dark:text-gray-300" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {currentLanguage?.toUpperCase() || 'EN'}
                </span>
              </button>

              {showLanguageMenu && languages && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-[60] animate-fade-in">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors ${
                        currentLanguage === lang.code ? "bg-green-50 dark:bg-gray-700" : ""
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {lang.name}
                      </span>
                      {currentLanguage === lang.code && (
                        <CheckCircle size={16} className="ml-auto text-green-600 dark:text-green-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={t('modal.close')}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {t('all')}
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'unread'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {t('unread')}
          </button>
        </div>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            {t('notifications.markAllRead')}
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {activeTab === 'unread' 
                ? t('notifications.empty.message')
                : t('notifications.empty.title')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => {
              // ✅ TRANSLATE EACH NOTIFICATION
              const translated = translateNotification(notification);
              
              return (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {translated.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1"></span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {translated.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), { 
                            addSuffix: true,
                            locale: dateLocale
                          })}
                        </span>

                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                              title={t('notifications.markAsRead')}
                            >
                              <Check className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                            title={t('delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/notifications"
          onClick={onClose}
          className="block w-full text-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          {t('notifications.viewAll')}
        </Link>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;