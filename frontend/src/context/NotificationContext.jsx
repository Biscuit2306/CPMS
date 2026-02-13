import { createContext, useState, useContext, useCallback } from "react";
import axios from "axios";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  /**
   * Fetch notifications for current user
   */
  const fetchNotifications = useCallback(async (firebaseUid, limit = 50) => {
    if (!firebaseUid) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE}/api/notifications/${firebaseUid}?limit=${limit}`
      );

      if (res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  /**
   * Get unread notification count
   */
  const fetchUnreadCount = useCallback(async (firebaseUid) => {
    if (!firebaseUid) return;

    try {
      const res = await axios.get(
        `${API_BASE}/api/notifications/${firebaseUid}/count`
      );

      if (res.data.success) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("❌ Failed to fetch unread count:", err);
    }
  }, [API_BASE]);

  /**
   * Mark single notification as read
   */
  const markAsRead = async (notificationId) => {
    try {
      const res = await axios.put(
        `${API_BASE}/api/notifications/${notificationId}/read`
      );

      if (res.data.success) {
        // Update local notifications
        setNotifications(prev =>
          prev.map(n =>
            n._id === notificationId ? { ...n, read: true } : n
          )
        );

        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
    } catch (err) {
      console.error("❌ Failed to mark as read:", err);
    }
    return false;
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async (firebaseUid) => {
    try {
      const res = await axios.put(
        `${API_BASE}/api/notifications/${firebaseUid}/read-all`
      );

      if (res.data.success) {
        // Update local notifications
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );

        // Reset unread count
        setUnreadCount(0);
        return true;
      }
    } catch (err) {
      console.error("❌ Failed to mark all as read:", err);
    }
    return false;
  };

  /**
   * Delete a single notification
   */
  const deleteNotification = async (notificationId) => {
    try {
      const res = await axios.delete(
        `${API_BASE}/api/notifications/${notificationId}`
      );

      if (res.data.success) {
        // Update local notifications
        const notification = notifications.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }

        setNotifications(prev =>
          prev.filter(n => n._id !== notificationId)
        );
        return true;
      }
    } catch (err) {
      console.error("❌ Failed to delete notification:", err);
    }
    return false;
  };

  /**
   * Delete all notifications for user
   */
  const deleteAllNotifications = async (firebaseUid) => {
    try {
      const res = await axios.delete(
        `${API_BASE}/api/notifications/${firebaseUid}/delete-all`
      );

      if (res.data.success) {
        setNotifications([]);
        setUnreadCount(0);
        return true;
      }
    } catch (err) {
      console.error("❌ Failed to delete all notifications:", err);
    }
    return false;
  };

  /**
   * Get unread notifications
   */
  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.read);
  };

  /**
   * Get notifications by type
   */
  const getNotificationsByType = (type) => {
    return notifications.filter(n => n.type === type);
  };

  /**
   * Get high priority notifications
   */
  const getHighPriorityNotifications = () => {
    return notifications.filter(n => n.priority === "high" || n.priority === "urgent");
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getUnreadNotifications,
    getNotificationsByType,
    getHighPriorityNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
