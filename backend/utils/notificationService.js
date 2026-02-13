const Notification = require("../models/Notification");

/**
 * Create and save a notification for a user
 */
async function createNotification({
  recipientFirebaseUid,
  recipientEmail,
  type,
  title,
  message,
  actionType,
  affectedItemId,
  affectedItemType,
  metadata = {},
  priority = "medium",
  actionUrl = "",
}) {
  try {
    const notification = new Notification({
      recipientFirebaseUid,
      recipientEmail,
      type,
      title,
      message,
      actionType,
      affectedItemId,
      affectedItemType,
      metadata,
      priority,
      actionUrl,
      read: false,
      emailSent: false,
    });

    await notification.save();
    console.log(`✅ Notification created for ${recipientEmail}: ${type}`);
    return notification;
  } catch (err) {
    console.error("❌ Error creating notification:", err.message);
    return null;
  }
}

/**
 * Create notifications for multiple recipients
 */
async function createBulkNotifications(recipients, notificationData) {
  try {
    const notifications = recipients.map(recipient => ({
      ...notificationData,
      recipientFirebaseUid: recipient.firebaseUid,
      recipientEmail: recipient.email,
    }));

    const created = await Notification.insertMany(notifications);
    console.log(`✅ Created ${created.length} notifications`);
    return created;
  } catch (err) {
    console.error("❌ Error creating bulk notifications:", err.message);
    return [];
  }
}

/**
 * Get notifications for a user
 */
async function getNotifications(firebaseUid, limit = 50, unreadOnly = false) {
  try {
    const query = { recipientFirebaseUid: firebaseUid };
    if (unreadOnly) query.read = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return notifications;
  } catch (err) {
    console.error("❌ Error fetching notifications:", err.message);
    return [];
  }
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId) {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true, readAt: new Date() },
      { new: true }
    );
    return notification;
  } catch (err) {
    console.error("❌ Error marking notification as read:", err.message);
    return null;
  }
}

/**
 * Mark all notifications as read for a user
 */
async function markAllAsRead(firebaseUid) {
  try {
    const result = await Notification.updateMany(
      { recipientFirebaseUid: firebaseUid, read: false },
      { read: true, readAt: new Date() }
    );
    return result.modifiedCount;
  } catch (err) {
    console.error("❌ Error marking all as read:", err.message);
    return 0;
  }
}

/**
 * Delete old notifications (cleanup)
 */
async function deleteOldNotifications(daysOld = 30) {
  try {
    const date = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const result = await Notification.deleteMany({ createdAt: { $lt: date } });
    console.log(`🗑️ Deleted ${result.deletedCount} old notifications`);
    return result.deletedCount;
  } catch (err) {
    console.error("❌ Error deleting old notifications:", err.message);
    return 0;
  }
}

/**
 * Notification template creators
 */

async function notifyJobDriveBlocked(students, jobDrive, adminName, reason) {
  const notifications = students.map(student => ({
    recipientFirebaseUid: student.firebaseUid,
    recipientEmail: student.email,
    type: "job_drive_blocked",
    title: "Job Drive Blocked",
    message: `The job drive for ${jobDrive.company} - ${jobDrive.position} has been blocked by admin (${adminName}). Reason: ${reason || "No reason specified"}`,
    actionType: "block",
    affectedItemId: jobDrive._id.toString(),
    affectedItemType: "JobDrive",
    metadata: {
      company: jobDrive.company,
      position: jobDrive.position,
      jobDriveId: jobDrive._id.toString(),
      adminName,
      reason,
    },
    priority: "high",
    actionUrl: "/student/applications",
  }));

  return await createBulkNotifications(students, notifications[0]);
}

async function notifyJobDriveDeleted(students, jobDrive, adminName, reason) {
  const notifications = students.map(student => ({
    recipientFirebaseUid: student.firebaseUid,
    recipientEmail: student.email,
    type: "job_drive_deleted",
    title: "Job Drive Deleted",
    message: `The job drive for ${jobDrive.company} - ${jobDrive.position} has been deleted by admin (${adminName}). Your application has been removed. Reason: ${reason || "No reason specified"}`,
    actionType: "delete",
    affectedItemId: jobDrive._id.toString(),
    affectedItemType: "JobDrive",
    metadata: {
      company: jobDrive.company,
      position: jobDrive.position,
      jobDriveId: jobDrive._id.toString(),
      adminName,
      reason,
    },
    priority: "high",
    actionUrl: "/student/applications",
  }));

  return await createBulkNotifications(students, notifications[0]);
}

async function notifyScheduleBlocked(candidates, schedule, adminName, reason) {
  const notifications = candidates.map(candidate => ({
    recipientFirebaseUid: candidate.studentId,
    recipientEmail: candidate.studentEmail,
    type: "interview_blocked",
    title: "Interview Cancelled",
    message: `Your interview for ${schedule.company} - ${schedule.position} has been cancelled by admin (${adminName}). Reason: ${reason || "No reason specified"}`,
    actionType: "block",
    affectedItemId: schedule._id.toString(),
    affectedItemType: "InterviewSchedule",
    metadata: {
      company: schedule.company,
      position: schedule.position,
      scheduleId: schedule._id.toString(),
      studentId: candidate.studentId,
      studentName: candidate.studentName,
      adminName,
      reason,
    },
    priority: "high",
    actionUrl: "/student/interviews",
  }));

  return await createBulkNotifications(candidates, notifications[0]);
}

async function notifyCandidateRemoved(student, schedule, adminName, reason) {
  return await createNotification({
    recipientFirebaseUid: student.firebaseUid,
    recipientEmail: student.email,
    type: "candidate_removed",
    title: "Removed from Interview",
    message: `You have been removed from the interview for ${schedule.company} - ${schedule.position} by admin (${adminName}). Reason: ${reason || "No reason specified"}`,
    actionType: "remove",
    affectedItemId: schedule._id.toString(),
    affectedItemType: "InterviewSchedule",
    metadata: {
      company: schedule.company,
      position: schedule.position,
      scheduleId: schedule._id.toString(),
      studentId: student.firebaseUid,
      studentName: student.fullName,
      adminName,
      reason,
    },
    priority: "high",
    actionUrl: "/student/interviews",
  });
}

async function notifyRecruiterScheduleBlocked(recruiter, schedule, adminName, reason) {
  return await createNotification({
    recipientFirebaseUid: recruiter.firebaseUid,
    recipientEmail: recruiter.email,
    type: "interview_blocked",
    title: "Interview Cancelled",
    message: `Your interview for ${schedule.company} - ${schedule.position} has been cancelled by admin (${adminName}). Reason: ${reason || "No reason specified"}`,
    actionType: "block",
    affectedItemId: schedule._id.toString(),
    affectedItemType: "InterviewSchedule",
    metadata: {
      company: schedule.company,
      position: schedule.position,
      scheduleId: schedule._id.toString(),
      adminName,
      reason,
    },
    priority: "high",
    actionUrl: "/recruiter/schedules",
  });
}

async function notifyStudentBlocked(student, adminName, reason) {
  return await createNotification({
    recipientFirebaseUid: student.firebaseUid,
    recipientEmail: student.email,
    type: "admin_action",
    title: "Account Blocked",
    message: `Your account has been blocked by admin (${adminName}). Reason: ${reason || "No reason specified"}. Please contact the administration.`,
    actionType: "block",
    affectedItemId: student._id.toString(),
    affectedItemType: "Student",
    metadata: {
      studentId: student.firebaseUid,
      studentName: student.fullName,
      adminName,
      reason,
    },
    priority: "urgent",
    actionUrl: "/student/dashboard",
  });
}

module.exports = {
  createNotification,
  createBulkNotifications,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteOldNotifications,
  notifyJobDriveBlocked,
  notifyJobDriveDeleted,
  notifyScheduleBlocked,
  notifyCandidateRemoved,
  notifyRecruiterScheduleBlocked,
  notifyStudentBlocked,
};
