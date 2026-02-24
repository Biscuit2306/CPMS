const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    recruiterFirebaseUid: {
      type: String,
      required: false,
      index: true,
    },

    adminFirebaseUid: {
      type: String,
      required: false,
      index: true,
    },

    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
    },

    reportType: {
      type: String,
      enum: ["overview", "detailed", "candidates", "drives"],
      default: "overview",
    },

    dateFrom: {
      type: Date,
      default: null,
    },

    dateTo: {
      type: Date,
      default: null,
    },

    statistics: {
      totalApplicants: {
        type: Number,
        default: 0,
      },
      selectedCandidates: {
        type: Number,
        default: 0,
      },
      activeDrives: {
        type: Number,
        default: 0,
      },
      successRate: {
        type: Number,
        default: 0,
      },
      company: {
        type: String,
        default: "",
      },
    },

    fileName: {
      type: String,
      default: "",
    },

    downloadUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Report ||
  mongoose.model("Report", reportSchema);