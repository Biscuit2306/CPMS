const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteOldNotifications,
} = require("../utils/notificationService");

/* =========================
   GET NOTIFICATIONS FOR USER
========================= */
router.get("/:firebaseUid", async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const notifications = await getNotifications(
      req.params.firebaseUid,
      50,
      unreadOnly === "true"
    );

    res.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    console.error("❌ Error fetching notifications:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   MARK NOTIFICATION AS READ
========================= */
router.put("/:notificationId/read", async (req, res) => {
  try {
    const notification = await markAsRead(req.params.notificationId);
    res.json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (err) {
    console.error("❌ Error marking notification as read:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   MARK ALL NOTIFICATIONS AS READ
========================= */
router.put("/user/:firebaseUid/mark-all-read", async (req, res) => {
  try {
    const count = await markAllAsRead(req.params.firebaseUid);
    res.json({
      success: true,
      message: `${count} notifications marked as read`,
      modifiedCount: count,
    });
  } catch (err) {
    console.error("❌ Error marking all notifications as read:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   CLEANUP OLD NOTIFICATIONS
========================= */
router.post("/cleanup/old", async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;
    const deletedCount = await deleteOldNotifications(daysOld);
    res.json({
      success: true,
      message: `Deleted ${deletedCount} old notifications`,
      deletedCount,
    });
  } catch (err) {
    console.error("❌ Error deleting old notifications:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;