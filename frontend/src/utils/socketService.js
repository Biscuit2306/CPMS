import io from 'socket.io-client';

let socket = null;
let connectionAttempts = 0;
const MAX_RECONNECTION_ATTEMPTS = 5;

export const initializeSocket = (firebaseUid) => {
  if (socket && socket.connected) {
    console.log('✅ Socket.io already connected, reusing connection');
    return socket;
  }

  // If socket exists but is disconnected, disconnect it first
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Determine socket URL based on environment
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  try {
    socket = io(SOCKET_URL, {
      auth: {
        firebaseUid: firebaseUid || 'anonymous',
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 10000,
      query: {
        firebaseUid: firebaseUid || 'anonymous',
      },
    });

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket.io connected:', socket.id);
      connectionAttempts = 0; // Reset on successful connection
      // Join personal notification room after connecting
      if (firebaseUid) {
        socket.emit('join-notifications', firebaseUid);
        console.log('🔔 Joined notification room for:', firebaseUid);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      connectionAttempts++;
      console.error('❌ Socket.io connection error:', error.message);
      if (connectionAttempts > MAX_RECONNECTION_ATTEMPTS) {
        console.warn('⚠️ Max reconnection attempts reached, falling back to polling');
      }
    });

    socket.on('reconnect_attempt', () => {
      console.log('🔄 Socket.io reconnection attempt...');
    });

    socket.on('reconnect', () => {
      console.log('✅ Socket.io reconnected successfully');
      // Re-join notification room after reconnect
      if (firebaseUid) {
        socket.emit('join-notifications', firebaseUid);
        console.log('🔔 Re-joined notification room for:', firebaseUid);
      }
    });

    // Notification events
    socket.on('notification', (data) => {
      console.log('📢 Notification received:', data);
      // Dispatch custom event so components can listen
      window.dispatchEvent(new CustomEvent('notification', { detail: data }));
    });

    socket.on('notification:new', (data) => {
      console.log('📢 New notification:', data);
      window.dispatchEvent(new CustomEvent('notification:new', { detail: data }));
    });

    socket.on('notificationUpdate', (data) => {
      console.log('📢 Notification update:', data);
      window.dispatchEvent(new CustomEvent('notificationUpdate', { detail: data }));
    });

    socket.on('jobDriveCreated', (data) => {
      console.log('💼 Job drive created:', data);
      window.dispatchEvent(new CustomEvent('jobDriveCreated', { detail: data }));
    });

    socket.on('applicationStatusChanged', (data) => {
      console.log('📋 Application status changed:', data);
      window.dispatchEvent(new CustomEvent('applicationStatusChanged', { detail: data }));
    });

    socket.on('interviewScheduled', (data) => {
      console.log('📅 Interview scheduled:', data);
      window.dispatchEvent(new CustomEvent('interviewScheduled', { detail: data }));
    });

    console.log('🔌 Socket.io instance created and configured');
    return socket;
  } catch (err) {
    console.error('❌ Error initializing Socket.io:', err);
    return null;
  }
};

export const getSocket = () => {
  return socket;
};

export const isConnected = () => {
  return socket && socket.connected;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('✅ Socket.io disconnected');
  }
};

export const registerUserSocket = (userId) => {
  if (socket && socket.connected) {
    socket.emit('registerUser', { userId });
    console.log('📝 User registered with Socket.io:', userId);
  } else {
    console.warn('⚠️ Socket not connected, cannot register user');
  }
};

export const listenForNotifications = (callback) => {
  if (socket) {
    socket.on('notification', callback);
    return () => {
      if (socket) {
        socket.off('notification', callback);
      }
    };
  }
  return () => {};
};

export const listenForApplicationStatus = (callback) => {
  if (socket) {
    socket.on('applicationStatusChanged', callback);
    return () => {
      if (socket) {
        socket.off('applicationStatusChanged', callback);
      }
    };
  }
  return () => {};
};

export const listenForJobDrives = (callback) => {
  if (socket) {
    socket.on('jobDriveCreated', callback);
    return () => {
      if (socket) {
        socket.off('jobDriveCreated', callback);
      }
    };
  }
  return () => {};
};

export const listenForInterviews = (callback) => {
  if (socket) {
    socket.on('interviewScheduled', callback);
    return () => {
      if (socket) {
        socket.off('interviewScheduled', callback);
      }
    };
  }
  return () => {};
};
