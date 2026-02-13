const mongoose = require("mongoose");

const resumeAnalysisSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true },

    resumeFileName: { type: String, required: true },
    resumeFileUrl: { type: String, required: true },

    atsScore: { type: Number, default: 0 },
    missingKeywords: { type: [String], default: [] },
    weakSections: { type: [String], default: [] },

    improvements: { type: [String], default: [] },
    suggestedProjects: { type: [String], default: [] },
    suggestedBulletPoints: { type: [String], default: [] },

    rawAIResponse: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);