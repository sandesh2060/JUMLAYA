import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "../hooks/useLanguage";
import {
  Bell,
  CheckCircle,
  Package,
  ShoppingCart,
  AlertCircle,
  TrendingDown,
  Check,
} from "lucide-react";
import { notificationApi } from "../api/notification.api";

const Notifications = () => {
  const { t, currentLanguage, changeLanguage, languages } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, unread: 0 });

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationApi.getNotifications(page, 20, filter);
      if (response.success && response.data) {
        setNotifications(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setStats({
          total: response.data.total || 0,
          unread: response.data.data?.filter((n) => !n.isRead).length || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, filter]);

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setStats((prev) => ({ ...prev, unread: 0 }));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    const icons = {
      new_order: ShoppingCart,
      order_cancelled: AlertCircle,
      order_delivered: CheckCircle,
      order_returned: Package,
      low_stock: TrendingDown,
      payment_received: CheckCircle,
      order_status_change: Package,
      default: Bell,
    };
    return icons[type] || icons.default;
  };

  // Get notification style
  const getNotificationStyle = (type) => {
    const styles = {
      new_order: {
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        borderColor: "border-blue-200 dark:border-blue-800",
      },
      order_cancelled: {
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-100 dark:bg-red-900/30",
        borderColor: "border-red-200 dark:border-red-800",
      },
      order_delivered: {
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-100 dark:bg-green-900/30",
        borderColor: "border-green-200 dark:border-green-800",
      },
      order_returned: {
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-100 dark:bg-orange-900/30",
        borderColor: "border-orange-200 dark:border-orange-800",
      },
      payment_received: {
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        borderColor: "border-emerald-200 dark:border-emerald-800",
      },
      default: {
        color: "text-gray-600 dark:text-gray-400",
        bg: "bg-gray-100 dark:bg-gray-800",
        borderColor: "border-gray-200 dark:border-gray-700",
      },
    };
    return styles[type] || styles.default;
  };

  // Format time ago (with translation)
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return t("justNow", "Just now");
    if (seconds < 3600)
      return t("minutesAgo", { count: Math.floor(seconds / 60) });
    if (seconds < 86400)
      return t("hoursAgo", { count: Math.floor(seconds / 3600) });
    if (seconds < 604800)
      return t("daysAgo", { count: Math.floor(seconds / 86400) });
    return new Date(date).toLocaleDateString(currentLanguage);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Language Toggle */}
      <div className="flex justify-end mb-4">
        <select
          value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("nav.notifications", "Notifications")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {t("total", "Total")}: {stats.total} • {t("unread", "Unread")}:{" "}
                {stats.unread}
              </p>
            </div>
          </div>

          {/* Actions */}
          {stats.unread > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Check size={16} />
              {t("markAllRead", "Mark all read")}
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setFilter("all");
              setPage(1);
            }}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              filter === "all"
                ? "border-green-600 text-green-600 dark:text-green-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {t("all", "All")}
          </button>
          <button
            onClick={() => {
              setFilter("unread");
              setPage(1);
            }}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              filter === "unread"
                ? "border-green-600 text-green-600 dark:text-green-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {t("unread", "Unread")} {stats.unread > 0 && `(${stats.unread})`}
          </button>
          <button
            onClick={() => {
              setFilter("read");
              setPage(1);
            }}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              filter === "read"
                ? "border-green-600 text-green-600 dark:text-green-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {t("read", "Read")}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Skeleton className="h-8 w-1/2 rounded-full mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {t("loading", "Loading notifications...")}
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <Bell size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t("noNotifications", "No notifications")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === "unread"
                ? t("allCaughtUp", "You're all caught up!")
                : t(
                    "notifyWhenSomethingHappens",
                    "We'll notify you when something happens"
                  )}
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const style = getNotificationStyle(notification.type);
            const Icon = getNotificationIcon(notification.type);

            return (
              <div
                key={notification._id}
                className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${
                  style.borderColor
                } shadow-sm hover:shadow-md transition-all ${
                  !notification.isRead ? "ring-2 ring-green-500/20" : ""
                }`}
              >
                <div className="p-5">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className={`${style.bg} ${style.color} rounded-xl p-3 h-fit`}
                    >
                      <Icon size={24} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="h-3 w-3 bg-green-600 rounded-full flex-shrink-0 mt-1"></span>
                        )}
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {timeAgo(notification.createdAt)}
                        </span>

                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors font-medium"
                          >
                            <Check size={14} />
                            {t("markRead", "Mark read")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t("pagination.previous", "Previous")}
          </button>

          <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-medium">
            {t("pagination.page", { page })} {t("of", "of")} {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t("pagination.next", "Next")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
