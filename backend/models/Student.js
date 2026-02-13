const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    fullName: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    branch: {
      type: String,
      default: "",
      trim: true,
    },

    rollNo: {
      type: String,
      default: "",
      trim: true,
    },

    dob: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    linkedin: {
      type: String,
      default: "",
      trim: true,
    },

    github: {
      type: String,
      default: "",
      trim: true,
    },

    portfolio: {
      type: String,
      default: "",
      trim: true,
    },

    resume: {
      type: String,
      default: "",
      trim: true,
    },

    year: {
      type: String,
      default: "",
      trim: true,
    },

    cgpa: {
      type: String,
      default: "",
      trim: true,
    },

    // Optional fields (safe for future use)
    skills: {
      type: Array,
      default: [],
    },

    projects: {
      type: Array,
      default: [],
    },

    certifications: {
      type: Array,
      default: [],
    },

    applications: {
      type: Array,
      default: [],
    },

    upcomingDrives: {
      type: Array,
      default: [],
    },

    notices: {
      type: Array,
      default: [],
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
  },
  {
    timestamps: true,
  }
);

/**
 * 🚨 CRITICAL LINE
 * Must export the MONGOOSE MODEL
 */
module.exports = mongoose.model("Student", StudentSchema);

