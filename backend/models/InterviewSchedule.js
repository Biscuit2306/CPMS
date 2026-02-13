const mongoose = require("mongoose");

const interviewScheduleSchema = new mongoose.Schema(
  {
    recruiterFirebaseUid: {
      type: String,
      required: true,
      index: true,
    },
    
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },

    jobDriveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobDrive",
      required: true,
    },

    recruiterName: {
      type: String,
      default: "",
    },

    company: {
      type: String,
      required: true,
    },

    position: {
      type: String,
      required: true,
    },

    interviewType: {
      type: String,
      enum: ["Technical Interview", "HR Interview", "Aptitude Test", "Pre-Placement Talk", "Group Discussion", "Final Round"],
      default: "Technical Interview",
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true, // "10:00 AM"
    },

    venue: {
      type: String,
      required: false,
      default: "TBD",
    },

    platform: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Offline",
    },

    meetingLink: {
      type: String,
      default: "",
    },

    rounds: {
      type: [String],
      default: [],
    },

    candidates: [
      {
        studentId: String,
        studentName: String,
        studentEmail: String,
        status: {
          type: String,
          enum: ["scheduled", "attended", "absent", "passed", "failed"],
          default: "scheduled",
        },
        feedbackNotes: String,
        score: Number,
        additionalNotes: String,
      },
    ],

    capacity: {
      type: Number,
      default: 50,
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled", "blocked"],
      default: "scheduled",
    },

    // Block/Cancel tracking
    isBlocked: {
      type: Boolean,
      default: false,
    },

    blockedBy: {
      adminFirebaseUid: String,
      adminName: String,
      reason: String,
      blockedAt: Date,
    },

    isCancelled: {
      type: Boolean,
      default: false,
    },

    cancelledBy: {
      adminFirebaseUid: String,
      adminName: String,
      reason: String,
      cancelledAt: Date,
    },

    createdBy: {
      type: String,
      default: "recruiter",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.InterviewSchedule ||
  mongoose.model("InterviewSchedule", interviewScheduleSchema);
