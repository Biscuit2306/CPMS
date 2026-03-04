import { useEffect, useState, useCallback } from 'react';
import {
  listenForNotifications,
  listenForApplicationStatus,
  listenForJobDrives,
  listenForInterviews,
  getSocket,
} from '../utils/socketService';

/**
 * Custom hook for listening to notifications
 * @param {Function} onNotification - Callback when notification arrives
 * @returns {Object} - { isConnected, notification, applicationStatus, jobDrive, interview }
 */
export const useNotifications = (onNotification = null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notification, setNotification] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [jobDrive, setJobDrive] = useState(null);
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    const socket = getSocket();
    
    // Check if socket is connected
    if (socket && socket.connected) {
      setIsConnected(true);
    }

    // Listen for connection
    const handleConnect = () => {
      setIsConnected(true);
      console.log('✅ Notification hook: Socket connected');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('❌ Notification hook: Socket disconnected');
    };

    if (socket) {
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      // Notification listener
      const unlistenNotif = listenForNotifications((data) => {
        setNotification(data);
        if (onNotification) {
          onNotification(data);
        }
      });

      // Application status listener
      const unlistenAppStatus = listenForApplicationStatus((data) => {
        setApplicationStatus(data);
      });

      // Job drive listener
      const unlistenJobDrive = listenForJobDrives((data) => {
        setJobDrive(data);
      });

      // Interview listener
      const unlistenInterview = listenForInterviews((data) => {
        setInterview(data);
      });

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        unlistenNotif?.();
        unlistenAppStatus?.();
        unlistenJobDrive?.();
        unlistenInterview?.();
      };
    }
  }, [onNotification]);

  return {
    isConnected,
    notification,
    applicationStatus,
    jobDrive,
    interview,
  };
};

/**
 * Custom hook for specific notification type
 */
export const useNotificationListener = (eventName, callback) => {
  useEffect(() => {
    const socket = getSocket();

    if (socket) {
      socket.on(eventName, callback);

      return () => {
        socket.off(eventName, callback);
      };
    }
  }, [eventName, callback]);
};

/**
 * Custom hook to check socket connection status
 */
export const useSocketStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    const socket = getSocket();

    if (socket) {
      setIsConnected(socket.connected);
      setSocketId(socket.id);

      const handleConnect = () => {
        setIsConnected(true);
        setSocketId(socket.id);
      };

      const handleDisconnect = () => {
        setIsConnected(false);
        setSocketId(null);
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, []);

  return { isConnected, socketId };
};
