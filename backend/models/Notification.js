const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    recipientFirebaseUid: {
      type: String,
      required: true,
      index: true,
    },
    
    recipientEmail: {
      type: String,
      default: "",
    },

    // Type of notification
    type: {
      type: String,
      enum: [
        "job_drive_blocked",
        "job_drive_deleted",
        "interview_cancelled",
        "interview_blocked",
        "candidate_removed",
        "application_rejected",
        "schedule_updated",
        "admin_action",
      ],
      required: true,
    },

    // Subject/Title of notification
    title: {
      type: String,
      required: true,
    },

    // Detailed message
    message: {
      type: String,
      required: true,
    },

    // What triggered this notification
    actionType: {
      type: String,
      enum: ["delete", "block", "cancel", "remove", "update"],
      required: true,
    },

    // Reference to affected item
    affectedItemId: {
      type: String,
    },

    affectedItemType: {
      type: String,
      enum: ["JobDrive", "InterviewSchedule", "Student", "Application"],
    },

    // Details about the action
    metadata: {
      company: String,
      position: String,
      jobDriveId: String,
      scheduleId: String,
      studentId: String,
      studentName: String,
      adminName: String,
      reason: String, // Why was this action taken
    },

    // Status
    read: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
    },

    // Whether user has been notified
    emailSent: {
      type: Boolean,
      default: false,
    },

    emailSentAt: {
      type: Date,
    },

    // Priority level
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // URL to take action on this notification
    actionUrl: {
      type: String,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  { timestamps: true }
);

// Auto-delete expired notifications
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
