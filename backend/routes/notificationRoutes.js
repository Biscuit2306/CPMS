const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../utils/notificationService");

/* =========================
   SPECIFIC ROUTES FIRST (MORE SPECIFIC)
   These must come BEFORE generic /:firebaseUid routes
========================= */

/**
 * Get unread notification count - SPECIFIC ROUTE (BEFORE generic)
 */
router.get("/:firebaseUid/count", async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const count = await Notification.countDocuments({
      recipientFirebaseUid: firebaseUid,
      read: false,
    });

    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (err) {
    console.error("❌ Error counting notifications:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Mark all notifications as read for a user - SPECIFIC ROUTE (BEFORE generic)
 */
router.put("/:firebaseUid/read-all", async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const modifiedCount = await markAllAsRead(firebaseUid);

    res.json({
      success: true,
      message: `Marked ${modifiedCount} notifications as read`,
      modifiedCount,
    });
  } catch (err) {
    console.error("❌ Error marking all as read:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Delete all notifications for a user - SPECIFIC ROUTE (BEFORE generic)
 */
router.delete("/:firebaseUid/delete-all", async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const result = await Notification.deleteMany({
      recipientFirebaseUid: firebaseUid,
    });

    res.json({
      success: true,
      message: "All notifications deleted",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("❌ Error deleting notifications:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   NOTIFICATION-SPECIFIC ROUTES (BY ID)
   These must come BEFORE generic /:firebaseUid routes
========================= */

/**
 * Mark a single notification as read
 */
router.put("/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await markAsRead(notificationId);

    res.json({
      success: true,
      data: notification,
    });
  } catch (err) {
    console.error("❌ Error marking notification as read:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Delete a notification by ID
 */
router.delete("/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const result = await Notification.deleteOne({ _id: notificationId });

    res.json({
      success: true,
      message: "Notification deleted",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("❌ Error deleting notification:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GENERIC ROUTES (LEAST SPECIFIC)
   These come LAST to avoid catching more specific routes
========================= */

/**
 * Get all notifications for a user - GENERIC ROUTE (AFTER specifics)
 */
router.get("/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const { limit = 50, unreadOnly = false } = req.query;

    const notifications = await getNotifications(
      firebaseUid,
      parseInt(limit),
      unreadOnly === "true"
    );

    res.json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
