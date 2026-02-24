const mongoose = require("mongoose");

const ScrapedJobSchema = new mongoose.Schema(
  {
    // Basic Job Info
    company: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    position: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    jobDescription: {
      type: String,
      default: "",
      trim: true,
    },

    salary: {
      type: String,
      default: "Not Disclosed",
      trim: true,
    },

    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract", "Temporary"],
      default: "Full-time",
    },

    // Company Info
    about: {
      type: String,
      default: "External job opportunity",
      trim: true,
    },

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

    // Eligibility (Default for scraped jobs)
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
        default: ["All Years"],
      },
    },

    // Interview Process (Default)
    rounds: {
      type: [String],
      default: ["Online Assessment", "Technical Interview", "HR Round"],
    },

    // Dates
    applicationDeadline: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },

    // Source Info
    source: {
      type: String,
      enum: ["RapidAPI", "LinkedIn", "Indeed", "Glassdoor", "Direct"],
      default: "RapidAPI",
    },

    externalJobId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    applyLink: {
      type: String,
      default: "",
      trim: true,
    },

    // Status
    status: {
      type: String,
      enum: ["active", "closed", "expired"],
      default: "active",
    },

    isExpired: {
      type: Boolean,
      default: false,
    },

    // Tracking
    viewCount: {
      type: Number,
      default: 0,
    },

    appliedCount: {
      type: Number,
      default: 0,
    },

    savedByStudents: [String], // Array of student Firebase UIDs

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Auto-delete after 90 days
      index: { expires: 0 }, // TTL index for auto-deletion
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick queries
ScrapedJobSchema.index({ company: 1, position: 1 });
ScrapedJobSchema.index({ location: 1 });
ScrapedJobSchema.index({ createdAt: -1 });
ScrapedJobSchema.index({ status: 1, isExpired: 1 });

module.exports = mongoose.model("ScrapedJob", ScrapedJobSchema);
