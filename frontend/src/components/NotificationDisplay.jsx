import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import '../styles/toast-notifications.css';

const NotificationDisplay = () => {
  const [notifications, setNotifications] = useState([]);
  const { isConnected, notification } = useNotifications();

  useEffect(() => {
    if (notification) {
      const id = Date.now();
      const notif = {
        id,
        ...notification,
      };
      
      setNotifications(prev => [notif, ...prev]);

      // Auto-remove after 6 seconds
      const timer = setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="notif-icon success" />;
      case 'warning':
        return <AlertCircle className="notif-icon warning" />;
      case 'error':
        return <AlertCircle className="notif-icon error" />;
      default:
        return <Info className="notif-icon info" />;
    }
  };

  return (
    <div className="notifications-container">
      {/* Notifications List */}
      <div className="notifications-list">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`notification-card ${notif.type || 'info'} priority-${notif.priority || 'medium'}`}
          >
            <div className="notification-header">
              {getIcon(notif.type)}
              <h4 className="notification-title">{notif.title}</h4>
              <button
                className="close-btn"
                onClick={() => removeNotification(notif.id)}
                aria-label="Close notification"
              >
                <X size={18} />
              </button>
            </div>
            <p className="notification-message">{notif.message}</p>
            {notif.metadata && (
              <div className="notification-metadata">
                {notif.metadata.position && (
                  <span className="meta-tag">
                    📌 Position: {notif.metadata.position}
                  </span>
                )}
                {notif.metadata.company && (
                  <span className="meta-tag">
                    🏢 Company: {notif.metadata.company}
                  </span>
                )}
                {notif.metadata.recruiterName && (
                  <span className="meta-tag">
                    👤 Recruiter: {notif.metadata.recruiterName}
                  </span>
                )}
              </div>
            )}
            {notif.actionUrl && (
              <a href={notif.actionUrl} className="notification-action">
                View Details →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationDisplay;
