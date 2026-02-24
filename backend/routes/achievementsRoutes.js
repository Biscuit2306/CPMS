const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Student = require("../models/Student");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* =========================
   FILE UPLOAD CONFIGURATION
========================= */

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/achievements");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "achievement-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, GIF, WEBP images and PDF files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/* =========================
   GET ALL ACHIEVEMENTS
========================= */
router.get("/:uid", async (req, res) => {
  try {
    let student = await Student.findOne({ firebaseUid: req.params.uid });

    // Auto-create student if not found
    if (!student) {
      student = await Student.create({
        firebaseUid: req.params.uid,
        fullName: "New Student",
        branch: "",
        rollNo: "",
        email: "",
        phone: "",
        dob: "",
        address: "",
        linkedin: "",
        github: "",
        portfolio: "",
        resume: "",
        year: "",
        cgpa: "",
        skills: [],
        projects: [],
        achievements: [],
        certifications: [],
        upcomingDrives: [],
        applications: [],
        notices: [],
      });
    }

    // Check if student is blocked or deleted
    if (student.isBlocked || student.isDeleted) {
      return res.status(403).json({
        error: "Your account has been " + (student.isDeleted ? "deleted" : "blocked"),
        isBlocked: student.isBlocked,
        isDeleted: student.isDeleted,
      });
    }

    res.json(student.achievements || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADD NEW ACHIEVEMENT
========================= */
router.post("/:uid", upload.single("certificateImage"), async (req, res) => {
  try {
    let student = await Student.findOne({ firebaseUid: req.params.uid });

    // Auto-create student if not found
    if (!student) {
      student = await Student.create({
        firebaseUid: req.params.uid,
        fullName: "New Student",
        branch: "",
        rollNo: "",
        email: "",
        phone: "",
        dob: "",
        address: "",
        linkedin: "",
        github: "",
        portfolio: "",
        resume: "",
        year: "",
        cgpa: "",
        skills: [],
        projects: [],
        achievements: [],
        certifications: [],
        upcomingDrives: [],
        applications: [],
        notices: [],
      });
    }

    // Check if student is blocked or deleted
    if (student.isBlocked || student.isDeleted) {
      // Delete uploaded file if any
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      return res.status(403).json({
        error: "Your account has been " + (student.isDeleted ? "deleted" : "blocked"),
        isBlocked: student.isBlocked,
        isDeleted: student.isDeleted,
      });
    }

    const { title, description, category, date, organization, credentialUrl } = req.body;

    if (!title) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      return res.status(400).json({ error: "Achievement title is required" });
    }

    const newAchievement = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description: description || "",
      category: category || "Other",
      date: date || new Date().toISOString().split("T")[0],
      organization: organization || "",
      certificateImage: req.file ? `/uploads/achievements/${req.file.filename}` : null,
      credentialUrl: credentialUrl || "",
      createdAt: new Date(),
    };

    // Initialize achievements array if it doesn't exist
    if (!Array.isArray(student.achievements)) {
      student.achievements = [];
    }

    student.achievements.push(newAchievement);
    await student.save();

    res.status(201).json(newAchievement);
  } catch (err) {
    // Delete uploaded file if any
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPDATE ACHIEVEMENT
========================= */
router.put("/:uid/:achievementId", upload.single("certificateImage"), async (req, res) => {
  try {
    let student = await Student.findOne({ firebaseUid: req.params.uid });

    if (!student) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      return res.status(404).json({ error: "Student not found" });
    }

    // Check if student is blocked or deleted
    if (student.isBlocked || student.isDeleted) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      return res.status(403).json({
        error: "Your account has been " + (student.isDeleted ? "deleted" : "blocked"),
        isBlocked: student.isBlocked,
        isDeleted: student.isDeleted,
      });
    }

    // Find the achievement
    const achievementIndex = student.achievements.findIndex(
      (a) => a._id.toString() === req.params.achievementId
    );

    if (achievementIndex === -1) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      return res.status(404).json({ error: "Achievement not found" });
    }

    const { title, description, category, date, organization, credentialUrl } = req.body;

    // If new image is uploaded, delete old one
    if (req.file && student.achievements[achievementIndex].certificateImage) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        student.achievements[achievementIndex].certificateImage
      );
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error("Error deleting old file:", err);
      });
    }

    // Update achievement fields
    if (title) student.achievements[achievementIndex].title = title;
    if (description !== undefined) student.achievements[achievementIndex].description = description;
    if (category) student.achievements[achievementIndex].category = category;
    if (date) student.achievements[achievementIndex].date = date;
    if (organization !== undefined) student.achievements[achievementIndex].organization = organization;
    if (credentialUrl !== undefined) student.achievements[achievementIndex].credentialUrl = credentialUrl;
    if (req.file) {
      student.achievements[achievementIndex].certificateImage = `/uploads/achievements/${req.file.filename}`;
    }

    student.achievements[achievementIndex].updatedAt = new Date();

    await student.save();

    res.json(student.achievements[achievementIndex]);
  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETE ACHIEVEMENT
========================= */
router.delete("/:uid/:achievementId", async (req, res) => {
  try {
    const student = await Student.findOne({ firebaseUid: req.params.uid });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check if student is blocked or deleted
    if (student.isBlocked || student.isDeleted) {
      return res.status(403).json({
        error: "Your account has been " + (student.isDeleted ? "deleted" : "blocked"),
        isBlocked: student.isBlocked,
        isDeleted: student.isDeleted,
      });
    }

    // Find the achievement
    const achievement = student.achievements.find(
      (a) => a._id.toString() === req.params.achievementId
    );

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    // Delete certificate image if it exists
    if (achievement.certificateImage) {
      const imagePath = path.join(__dirname, "..", achievement.certificateImage);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { firebaseUid: req.params.uid },
      {
        $pull: { achievements: { _id: req.params.achievementId } },
      },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: "Failed to delete achievement" });
    }

    res.json({ message: "Achievement deleted successfully", achievements: updatedStudent.achievements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
