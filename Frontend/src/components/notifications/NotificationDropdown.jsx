import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  X,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../hooks/useNotification';
import { useLanguage } from "../../hooks/useLanguage"; 
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

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

  const dateLocale = enUS;

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, 10, activeTab === 'unread' ? 'unread' : 'all');
    }
  }, [isOpen, activeTab, fetchNotifications]);

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
      // Prevent body scroll on mobile
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
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

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5 sm:w-6 sm:h-6";
    const icons = {
      order_placed: <ShoppingBag className={`${iconClass} text-blue-500`} />,
      order_confirmed: <CheckCircle className={`${iconClass} text-green-500`} />,
      order_shipped: <Package className={`${iconClass} text-purple-500`} />,
      order_out_for_delivery: <Truck className={`${iconClass} text-orange-500`} />,
      order_delivered: <CheckCircle className={`${iconClass} text-green-500`} />,
      order_cancelled: <XCircle className={`${iconClass} text-red-500`} />,
      order_status_update: <AlertCircle className={`${iconClass} text-blue-500`} />,
    };

    return icons[type] || <Bell className={`${iconClass} text-gray-500`} />;
  };

  const translateNotification = (notification) => {
    const type = notification.type;
    
    const orderIdMatch = notification.message?.match(/#(ORD-[\d-]+)/);
    const amountMatch = notification.message?.match(/(?:NPR|रु)\s*([\d,]+)/);
    const orderId = orderIdMatch ? orderIdMatch[1] : '';
    const total = amountMatch ? amountMatch[1] : '';

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
    
    if (translationKey) {
      const titleKey = `notifications.${translationKey}.title`;
      const messageKey = `notifications.${translationKey}.message`;
      
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

    return {
      title: notification.title,
      message: notification.message
    };
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop Overlay - Mobile & Tablet */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Notification Panel - Fully Responsive */}
      <div
        ref={dropdownRef}
        className="
          fixed lg:absolute
          inset-x-0 bottom-0 lg:inset-auto lg:right-0 lg:top-full lg:mt-3
          w-full sm:max-w-md sm:mx-auto lg:w-[440px] lg:mx-0
          max-h-[90vh] sm:max-h-[85vh] lg:max-h-[650px]
          bg-white dark:bg-gray-800
          rounded-t-2xl sm:rounded-t-3xl lg:rounded-2xl
          shadow-2xl border-t lg:border border-gray-200 dark:border-gray-700
          z-50
          flex flex-col
          animate-slide-up lg:animate-scale-in
          safe-area-bottom
        "
        role="dialog"
        aria-label={t('notifications.aria.label')}
        aria-modal="true"
      >
        {/* Drag Handle - Mobile Only */}
        <div className="lg:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header Section */}
        <div className="flex-shrink-0 px-4 sm:px-5 lg:px-6 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          {/* Top Row: Title + Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <BellRing className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {t('notifications.title')}
                </h3>
                {unreadCount > 0 && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Language Selector */}
              <div className="relative" ref={languageMenuRef}>
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="
                    flex items-center gap-1.5 sm:gap-2
                    px-2.5 sm:px-3 py-2 sm:py-2.5
                    bg-gray-100 dark:bg-gray-700
                    hover:bg-gray-200 dark:hover:bg-gray-600
                    rounded-lg sm:rounded-xl
                    transition-all duration-200
                    group
                  "
                  aria-label={t('navbar.changeLanguage')}
                  aria-expanded={showLanguageMenu}
                >
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {currentLanguage?.toUpperCase() || 'EN'}
                  </span>
                  <ChevronDown className={`hidden sm:block w-4 h-4 text-gray-500 transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Language Dropdown */}
                {showLanguageMenu && languages && (
                  <div className="
                    absolute right-0 top-full mt-2
                    w-56 sm:w-64
                    bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    rounded-xl sm:rounded-2xl
                    shadow-2xl
                    overflow-hidden
                    z-[60]
                    animate-scale-in
                  ">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setShowLanguageMenu(false);
                        }}
                        className={`
                          w-full flex items-center gap-3 sm:gap-4
                          px-4 sm:px-5 py-3 sm:py-4
                          hover:bg-green-50 dark:hover:bg-gray-700
                          transition-colors duration-200
                          ${currentLanguage === lang.code ? "bg-green-50 dark:bg-gray-700" : ""}
                        `}
                      >
                        <span className="text-2xl sm:text-3xl">{lang.flag}</span>
                        <span className="flex-1 text-left text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                          {lang.name}
                        </span>
                        {currentLanguage === lang.code && (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 animate-scale-in" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="
                  p-2 sm:p-2.5
                  bg-gray-100 dark:bg-gray-700
                  hover:bg-gray-200 dark:hover:bg-gray-600
                  rounded-lg sm:rounded-xl
                  transition-all duration-200
                  group
                "
                aria-label={t('modal.close')}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 sm:gap-3 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`
                flex-1 px-4 sm:px-6 py-2.5 sm:py-3
                text-sm sm:text-base font-semibold
                rounded-lg sm:rounded-xl
                transition-all duration-300
                ${activeTab === 'all'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
            >
              {t('all')}
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`
                flex-1 px-4 sm:px-6 py-2.5 sm:py-3
                text-sm sm:text-base font-semibold
                rounded-lg sm:rounded-xl
                transition-all duration-300
                relative
                ${activeTab === 'unread'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
            >
              {t('unread')}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mark All Read Action */}
        {notifications.length > 0 && (
          <div className="flex-shrink-0 px-4 sm:px-5 lg:px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <button
              onClick={handleMarkAllRead}
              className="
                flex items-center gap-2 sm:gap-2.5
                px-3 sm:px-4 py-2 sm:py-2.5
                text-xs sm:text-sm font-semibold
                text-blue-600 dark:text-blue-400
                bg-blue-50 dark:bg-blue-900/30
                hover:bg-blue-100 dark:hover:bg-blue-900/50
                rounded-lg sm:rounded-xl
                transition-all duration-200
                ml-auto
              "
            >
              <CheckCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="whitespace-nowrap">{t('notifications.markAllRead')}</span>
            </button>
          </div>
        )}

        {/* Notifications List - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                Loading notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {activeTab === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </h4>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center max-w-xs">
                {activeTab === 'unread' 
                  ? t('notifications.empty.message')
                  : t('notifications.empty.title')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => {
                const translated = translateNotification(notification);
                
                return (
                  <div
                    key={notification._id}
                    className={`
                      group
                      px-4 sm:px-5 lg:px-6 py-4 sm:py-5
                      hover:bg-gray-50 dark:hover:bg-gray-700/50
                      active:bg-gray-100 dark:active:bg-gray-700
                      transition-colors duration-200
                      ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                    `}
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {translated.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-600 rounded-full mt-1.5 shadow-lg shadow-blue-600/50 animate-pulse" />
                          )}
                        </div>

                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {translated.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 font-medium">
                            {formatDistanceToNow(new Date(notification.createdAt), { 
                              addSuffix: true,
                              locale: dateLocale
                            })}
                          </span>

                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="
                                flex items-center gap-1.5
                                px-2.5 sm:px-3 py-1.5 sm:py-2
                                text-xs sm:text-sm font-medium
                                text-blue-600 dark:text-blue-400
                                bg-blue-50 dark:bg-blue-900/30
                                hover:bg-blue-100 dark:hover:bg-blue-900/50
                                rounded-lg
                                opacity-0 group-hover:opacity-100
                                transition-all duration-200
                              "
                              title={t('notifications.markAsRead')}
                            >
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Mark read</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - View All Button */}
        <div className="flex-shrink-0 p-4 sm:p-5 lg:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Link
            to="/notifications"
            onClick={onClose}
            className="
              block w-full
              px-6 py-3 sm:py-3.5
              text-sm sm:text-base font-semibold text-center
              text-white
              bg-gradient-to-r from-blue-600 to-blue-700
              hover:from-blue-700 hover:to-blue-800
              dark:from-blue-500 dark:to-blue-600
              dark:hover:from-blue-600 dark:hover:to-blue-700
              rounded-xl sm:rounded-2xl
              shadow-lg shadow-blue-600/30
              hover:shadow-xl hover:shadow-blue-600/40
              transition-all duration-300
              transform hover:scale-[1.02] active:scale-[0.98]
            "
          >
            {t('notifications.viewAll')}
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-scale-in {
          animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }

        .dark .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
        }

        .dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.7);
        }
      `}</style>
    </>
  );
};

export default NotificationDropdown;