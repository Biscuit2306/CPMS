const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Recruiter = require("../models/Recruiter");

// Register a new admin
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const admin = new Admin({ name, email, password });
    await admin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get admin dashboard data
router.get("/dashboard", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalRecruiters = await Recruiter.countDocuments();
    const totalAdmins = await Admin.countDocuments();

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalRecruiters,
        totalAdmins,
        activeDrives: 8,
        placementRate: "92%",
        avgPackage: "₹14.2 LPA"
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all students
router.get("/students", async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all recruiters
router.get("/recruiters", async (req, res) => {
  try {
    const recruiters = await Recruiter.find().select("-password");
    res.json({ success: true, data: recruiters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get admin profile
router.get("/profile/:uid", async (req, res) => {
  try {
    const admin = await Admin.findOne({ firebaseUid: req.params.uid });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.json({ success: true, data: admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
