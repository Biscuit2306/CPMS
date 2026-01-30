const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    // Firebase user reference
    firebaseUid: {
      type: String,
      required: true,
      unique: true
    },

    // Basic info
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },

    // Academic details
    college: String,
    branch: String,
    year: Number,
    cgpa: String,
    passingYear: String,

    // Profile info
    bio: String,
    location: String,

    // Skills shown in dashboard
    skills: [
      {
        name: String,
        level: String // Beginner / Intermediate / Advanced
      }
    ],

    // Projects section
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        link: String
      }
    ],

    // Social & professional links
    links: {
      linkedin: String,
      github: String,
      portfolio: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
