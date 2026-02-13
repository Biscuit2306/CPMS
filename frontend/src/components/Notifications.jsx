import React, { useEffect, useState } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import '../styles/notifications.css';

/**
 * Notification Center Component - Shows all notifications
 */
export function NotificationCenter({ firebaseUid, isOpen, onClose }) {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotification();

  useEffect(() => {
    if (isOpen && firebaseUid) {
      fetchNotifications(firebaseUid, 50);
    }
  }, [isOpen, firebaseUid, fetchNotifications]);

  const getIcon = (type) => {
    switch (type) {
      case 'job_drive_blocked':
      case 'job_drive_deleted':
      case 'interview_blocked':
      case 'interview_cancelled':
      case 'candidate_removed':
        return <AlertCircle size={18} style={{ color: '#ef4444' }} />;
      case 'admin_action':
        return <AlertCircle size={18} style={{ color: '#f59e0b' }} />;
      default:
        return <Info size={18} style={{ color: '#0ea5e9' }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#0ea5e9';
      case 'low':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div
        className="notification-center-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="notification-center-header">
          <div>
            <h2>Notifications</h2>
            {unreadCount > 0 && (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                {unreadCount} unread
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {unreadCount > 0 && (
              <button
                className="notification-btn-secondary"
                onClick={() => markAllAsRead(firebaseUid)}
              >
                Mark all read
              </button>
            )}
            <button
              className="notification-btn-close"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notification-center-list">
          {notifications.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#9ca3af'
            }}>
              <Bell size={40} style={{ opacity: 0.5, margin: '0 auto 10px' }} />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                style={{
                  borderLeftColor: getPriorityColor(notif.priority),
                }}
              >
                <div className="notification-item-icon">
                  {getIcon(notif.type)}
                </div>

                <div className="notification-item-content">
                  <div className="notification-item-title">
                    <h4>{notif.title}</h4>
                    {!notif.read && (
                      <span className="notification-badge-unread">New</span>
                    )}
                  </div>
                  <p className="notification-item-message">
                    {notif.message}
                  </p>
                  <span className="notification-item-time">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="notification-item-actions">
                  {!notif.read && (
                    <button
                      className="notification-btn-action"
                      onClick={() => markAsRead(notif._id)}
                      title="Mark as read"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  <button
                    className="notification-btn-action"
                    onClick={() => deleteNotification(notif._id)}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Notification Toast - Shows up momentarily
 */
export function NotificationToast({ notification, onDismiss, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!isVisible) return null;

  const getToastIcon = (type) => {
    switch (type) {
      case 'job_drive_blocked':
      case 'job_drive_deleted':
      case 'interview_blocked':
        return <AlertCircle size={20} style={{ color: '#ef4444' }} />;
      case 'admin_action':
        return <AlertCircle size={20} style={{ color: '#f59e0b' }} />;
      default:
        return <Info size={20} style={{ color: '#0ea5e9' }} />;
    }
  };

  const getToastClass = (priority) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className={`notification-toast notification-toast-${getToastClass(notification.priority)}`}>
      <div className="notification-toast-icon">
        {getToastIcon(notification.type)}
      </div>
      <div className="notification-toast-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
      </div>
      <button
        className="notification-toast-close"
        onClick={() => {
          setIsVisible(false);
          onDismiss?.();
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
}

/**
 * Notification Bell - Shows in navbar with unread count
 */
export function NotificationBell({ onClick }) {
  const { unreadCount } = useNotification();

  return (
    <button className="notification-bell" onClick={onClick}>
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="notification-badge">{unreadCount}</span>
      )}
    </button>
  );
}

/**
 * Alert Banner for critical notifications
 */
export function AlertBanner({ notification, onDismiss }) {
  if (!notification) return null;

  return (
    <div className="alert-banner">
      <div className="alert-banner-icon">
        <AlertCircle size={20} />
      </div>
      <div className="alert-banner-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
      </div>
      <button
        className="alert-banner-close"
        onClick={onDismiss}
      >
        <X size={18} />
      </button>
    </div>
  );
}

export default NotificationCenter;
