const mongoose = require("mongoose");

const recruiterSchema = new mongoose.Schema(
  {
    // ─── Core Identity ───────────────────────────────────────────
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ─── Personal Info ───────────────────────────────────────────
    fullName: {
      type: String,
      default: "",
    },

    // sparse + unique allows multiple recruiters with empty/null emails
    // while still enforcing uniqueness for those who do have one
    email: {
      type: String,
      sparse: true,
      unique: true,
    },

    phone: {
      type: String,
      default: "",
    },

    // ─── Security (2FA) ──────────────────────────────────────────
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorSecret: {
      type: String,
      default: "",
    },

    // ─── Trusted Device Token (Skip 2FA for 7 days) ───────────────
    trustedDeviceToken: {
      type: String,
      default: "",
    },

    trustedDeviceExpiry: {
      type: Date,
      default: null,
    },

    // ─── Company Info ─────────────────────────────────────────────
    companyName: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      default: "",
    },

    companyWebsite: {
      type: String,
      default: "",
    },

    companySize: {
      type: String,
      default: "",
    },

    // ─── Job Drives ───────────────────────────────────────────────
    jobDrives: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // ─── Block / Delete Tracking (Admin) ─────────────────────────
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
  { timestamps: true }
);

// ✅ Prevents OverwriteModelError during hot reloads
module.exports =
  mongoose.models.Recruiter || mongoose.model("Recruiter", recruiterSchema);