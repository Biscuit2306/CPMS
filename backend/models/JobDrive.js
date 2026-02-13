const mongoose = require("mongoose");

const JobDriveSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: String,
      required: true,
      index: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    position: {
      type: String,
      required: true,
      trim: true,
    },

    about: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    salary: {
      type: String,
      required: true,
      trim: true,
    },

    eligibilityCriteria: {
      minCGPA: {
        type: Number,
        default: 0,
      },
      allowedBranches: {
        type: [String],
        default: [],
      },
      yearsEligible: {
        type: [String],
        default: ["Final Year"],
      },
    },

    jobDescription: {
      type: String,
      default: "",
      trim: true,
    },

    rounds: {
      type: [String],
      default: ["Online Test", "Technical Interview", "HR Round"],
    },

    date: {
      type: Date,
      required: true,
    },

    applicationDeadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "active", "completed", "closed", "blocked", "deleted"],
      default: "scheduled",
    },

    // Block/Delete tracking
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

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedBy: {
      adminFirebaseUid: String,
      adminName: String,
      reason: String,
      deletedAt: Date,
    },

    applications: [
      {
        studentId: String,
        studentName: String,
        studentEmail: String,
        studentPhone: String,
        studentBranch: String,
        studentCGPA: String,
        applicationDate: {
          type: Date,
          default: Date.now,
        },
        applicationStatus: {
          type: String,
          enum: ["applied", "shortlisted", "interview-scheduled", "selected", "rejected"],
          default: "applied",
        },
        lastUpdated: Date,
      },
    ],

    companyWebsite: {
      type: String,
      default: "",
      trim: true,
    },

    companySize: {
      type: String,
      default: "",
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JobDrive", JobDriveSchema);
