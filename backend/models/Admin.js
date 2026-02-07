const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ✅ Email from Firebase OAuth (sparse allows unique null values)
    email: {
      type: String,
      sparse: true,
      unique: true,
    },

    // ✅ Name from Firebase OAuth
    fullName: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

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

// ✅ prevents OverwriteModelError
module.exports =
  mongoose.models.Admin || mongoose.model("Admin", adminSchema);
