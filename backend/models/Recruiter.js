const mongoose = require("mongoose");

const recruiterSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    phone: {
      type: String,
      required: true
    },

    companyName: {
      type: String,
      required: true
    },

    designation: {
      type: String,
      required: true
    },

    companyWebsite: {
      type: String,
      required: true
    },

    companySize: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// ✅ prevents OverwriteModelError
module.exports =
  mongoose.models.Recruiter ||
  mongoose.model("Recruiter", recruiterSchema);
