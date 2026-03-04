/**
 * 🔴 SOCKET.IO REAL-TIME NOTIFICATIONS
 * Enables real-time push notifications to connected clients
 * 
 * Usage in server.js:
 * const notificationSocket = require('./utils/notificationSocket');
 * const io = require('socket.io')(server);
 * notificationSocket.initialize(io);
 */

const NotificationManager = require("./notificationManager");

class NotificationSocket {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // Map userId -> socketIds
    this.notificationManager = new NotificationManager();
  }

  /**
   * Initialize Socket.io with notification handlers
   */
  initialize(io) {
    this.io = io;
    console.log("🔴 Socket.io Notifications Initialized");

    io.on("connection", (socket) => {
      console.log(`📱 User connected: ${socket.id}`);

      // User joins their personal notification room
      socket.on("join-notifications", (firebaseUid) => {
        socket.join(`user:${firebaseUid}`);
        this.registerUserSocket(firebaseUid, socket.id);
        console.log(`✅ User ${firebaseUid} joined notification room`);
      });

      // User joins role-based notification room
      socket.on("join-role", (role) => {
        socket.join(`role:${role}`);
        console.log(`✅ User joined role room: ${role}`);
      });

      // Mark notification as read in real-time
      socket.on("mark-read", async (notificationId) => {
        try {
          await this.notificationManager.create({
            _id: notificationId,
            read: true,
            readAt: new Date(),
          });

          // Notify all connected clients
          io.to(`user:${socket.data.firebaseUid}`).emit("notification-read", {
            notificationId,
          });
        } catch (err) {
          console.error("❌ Error marking notification as read:", err.message);
        }
      });

      // Disconnect handler
      socket.on("disconnect", () => {
        console.log(`📱 User disconnected: ${socket.id}`);
        this.unregisterUserSocket(socket.id);
      });
    });
  }

  /**
   * Register user socket
   */
  registerUserSocket(firebaseUid, socketId) {
    if (!this.userSockets.has(firebaseUid)) {
      this.userSockets.set(firebaseUid, []);
    }
    this.userSockets.get(firebaseUid).push(socketId);
  }

  /**
   * Unregister user socket
   */
  unregisterUserSocket(socketId) {
    this.userSockets.forEach((sockets, userId) => {
      const index = sockets.indexOf(socketId);
      if (index > -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        }
      }
    });
  }

  /**
   * Send real-time notification to a specific user
   */
  notifyUser(firebaseUid, notification) {
    if (!this.io) {
      console.warn("⚠️ Socket.io not initialized");
      return;
    }

    this.io.to(`user:${firebaseUid}`).emit("notification", {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      category: notification.category,
      actionUrl: notification.actionUrl,
      createdAt: notification.createdAt,
    });

    console.log(
      `📤 Real-time notification sent to ${firebaseUid}: ${notification.title}`
    );
  }

  /**
   * Send notification to all users with a specific role
   */
  notifyRole(role, notification) {
    if (!this.io) {
      console.warn("⚠️ Socket.io not initialized");
      return;
    }

    this.io.to(`role:${role}`).emit("notification", {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      category: notification.category,
      actionUrl: notification.actionUrl,
      createdAt: notification.createdAt,
    });

    console.log(`📤 Role notification sent to ${role}: ${notification.title}`);
  }

  /**
   * Broadcast notification to all connected users
   */
  broadcastNotification(notification) {
    if (!this.io) {
      console.warn("⚠️ Socket.io not initialized");
      return;
    }

    this.io.emit("notification", {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      category: notification.category,
      actionUrl: notification.actionUrl,
      createdAt: notification.createdAt,
    });

    console.log(`📡 Broadcast notification: ${notification.title}`);
  }

  /**
   * Send notification to multiple users
   */
  notifyMultiple(userIds, notification) {
    if (!this.io) {
      console.warn("⚠️ Socket.io not initialized");
      return;
    }

    userIds.forEach((userId) => {
      this.notifyUser(userId, notification);
    });
  }

  /**
   * Get real-time stats
   */
  getStats() {
    return {
      connectedUsers: this.userSockets.size,
      totalSockets: Array.from(this.userSockets.values()).reduce(
        (sum, arr) => sum + arr.length,
        0
      ),
      users: Array.from(this.userSockets.keys()),
    };
  }

  /**
   * Check if user is online
   */
  isUserOnline(firebaseUid) {
    return this.userSockets.has(firebaseUid);
  }

  /**
   * Get user sockets
   */
  getUserSockets(firebaseUid) {
    return this.userSockets.get(firebaseUid) || [];
  }
}

// Create singleton instance
const notificationSocket = new NotificationSocket();

module.exports = notificationSocket;
