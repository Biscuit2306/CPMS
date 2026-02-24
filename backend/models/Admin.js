const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    // ─── Core Identity ───────────────────────────────────────────
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ─── Personal Info ───────────────────────────────────────────
    // sparse + unique allows multiple admins with empty/null emails
    // while still enforcing uniqueness for those who do have one
    email: {
      type: String,
      default: "",
      sparse: true,
      unique: true,
    },

    fullName: {
      type: String,
      default: "",
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

    // ─── Admin / Organization Info ───────────────────────────────
    collegeName: {
      type: String,
      default: "",
    },

    employeeId: {
      type: String,
      default: "",
    },

    adminRole: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// ✅ Prevents OverwriteModelError during hot reloads
module.exports = mongoose.models.Admin || mongoose.model("Admin", adminSchema);