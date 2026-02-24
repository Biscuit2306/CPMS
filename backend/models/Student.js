const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
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

    dob: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    // ─── Academic Info ───────────────────────────────────────────
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

    // ─── Online Presence ─────────────────────────────────────────
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

    // ─── Security (2FA) ──────────────────────────────────────────
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorSecret: {
      type: String,
      default: "",
    },

    // ─── Career & Placements ─────────────────────────────────────
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

    achievements: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          default: "",
        },
        category: {
          type: String,
          enum: [
            "Certification",
            "Award",
            "Hackathon",
            "Coding",
            "Academic",
            "Project",
            "Competition",
            "Other",
          ],
          default: "Other",
        },
        date: {
          type: String, // YYYY-MM-DD format
          default: () => new Date().toISOString().split("T")[0],
        },
        organization: {
          type: String,
          default: "",
        },
        certificateImage: {
          type: String, // File path to uploaded certificate image
          default: null,
        },
        credentialUrl: {
          type: String,
          default: "",
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
    ],

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
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", StudentSchema);