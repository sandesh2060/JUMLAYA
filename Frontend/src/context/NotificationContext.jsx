import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { useLocation } from "react-router-dom";
import { notificationApi } from "../api/notification.api";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const NotificationContext = createContext(null);

const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]); // ✅ Already correct
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (page = 1, limit = 20, filter = "all") => {
      if (!isAuthenticated) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("🔔 Fetching notifications...");

        const response = await notificationApi.getNotifications(
          page,
          limit,
          filter
        );

        // ✅ CRITICAL FIX: Ensure we always get an array
        const notificationList =
          response?.data?.notifications || response?.notifications || [];

        // ✅ EXTRA SAFETY: Verify it's actually an array
        const safeNotifications = Array.isArray(notificationList)
          ? notificationList
          : [];

        setNotifications(safeNotifications);
        setError(null);
        console.log("✅ Notifications fetched:", safeNotifications.length);
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
        setError(err.message);
        setNotifications([]); // ✅ Always set to empty array on error
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

// Fetch unread count
const fetchUnreadCount = useCallback(async () => {
  if (!isAuthenticated) {
    setUnreadCount(0);
    return;
  }

  try {
    console.log("🔢 Fetching unread count...");

    const response = await notificationApi.getUnreadCount();
    console.log("FULL RESPONSE:", response);
    console.log("response.data:", response?.data);
    console.log("response.data.data:", response?.data?.data);

    // ✅ FIXED: Handle double nesting
    const count = response?.data?.data?.unreadCount ?? response?.data?.unreadCount ?? 0;

    setUnreadCount(count);
    console.log("✅ Unread count:", count);
  } catch (err) {
    console.error("❌ Error fetching unread count:", err);
    setUnreadCount(0);
  }
}, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated) return false;

    try {
      console.log("✓ Marking as read:", notificationId);
      await notificationApi.markAsRead(notificationId);

      setNotifications((prev) => {
        // ✅ Safety check
        if (!Array.isArray(prev)) return [];
        return prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        );
      });

      setUnreadCount((prev) => Math.max(0, prev - 1));

      return true;
    } catch (err) {
      console.error("❌ Error marking as read:", err);
      toast.error("Failed to mark as read");
      return false;
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!isAuthenticated) return false;

    try {
      console.log("✓ Marking all as read...");
      await notificationApi.markAllAsRead();

      setNotifications((prev) => {
        // ✅ Safety check
        if (!Array.isArray(prev)) return [];
        return prev.map((notif) => ({ ...notif, isRead: true }));
      });

      setUnreadCount(0);
      toast.success("All notifications marked as read");
      return true;
    } catch (err) {
      console.error("❌ Error marking all as read:", err);
      toast.error("Failed to mark all as read");
      return false;
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!isAuthenticated) return false;

    try {
      console.log("🗑️ Deleting notification:", notificationId);
      await notificationApi.deleteNotification(notificationId);

      setNotifications((prev) => {
        // ✅ Safety check
        if (!Array.isArray(prev)) return [];
        const deletedNotif = prev.find((n) => n._id === notificationId);

        // Update unread count if deleted notification was unread
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }

        return prev.filter((notif) => notif._id !== notificationId);
      });

      toast.success("Notification deleted");
      return true;
    } catch (err) {
      console.error("❌ Error deleting notification:", err);
      toast.error("Failed to delete notification");
      return false;
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    if (!isAuthenticated) return false;

    try {
      console.log("🧹 Clearing all notifications...");
      await notificationApi.deleteAllNotifications();

      setNotifications([]);
      setUnreadCount(0);
      toast.success("All notifications cleared");
      return true;
    } catch (err) {
      console.error("❌ Error clearing notifications:", err);
      toast.error("Failed to clear notifications");
      return false;
    }
  };

  // Auto-fetch on mount and auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      // ✅ Reset to empty array when logged out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  const value = {
    notifications: Array.isArray(notifications) ? notifications : [], // ✅ FINAL SAFETY
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export { NotificationContext, NotificationProvider };
