const mongoose = require("mongoose");

const recruiterSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ✅ From Firebase OAuth
    fullName: {
      type: String,
      default: "",
    },

    // ✅ Email from Firebase OAuth (sparse allows unique null values)
    email: {
      type: String,
      sparse: true,
      unique: true,
    },

    // ✅ Optional - can be filled in recruiter profile
    phone: {
      type: String,
      default: "",
    },

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

    // Job Drives posted by this recruiter
    jobDrives: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { timestamps: true }
);

// ✅ prevents OverwriteModelError
module.exports =
  mongoose.models.Recruiter ||
  mongoose.model("Recruiter", recruiterSchema);
