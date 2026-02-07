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

// Get admin dashboard (for context - returns full admin data)
router.get("/dashboard/:uid", async (req, res) => {
  try {
    let admin = await Admin.findOne({ firebaseUid: req.params.uid });
    
    // If admin doesn't exist, create a default one
    if (!admin) {
      admin = await Admin.create({
        firebaseUid: req.params.uid,
        fullName: "",
        email: "",
        phone: "",
        collegeName: "",
        employeeId: "",
        adminRole: "",
        department: ""
      });
    }
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get admin profile
router.get("/profile/:uid", async (req, res) => {
  try {
    let admin = await Admin.findOne({ firebaseUid: req.params.uid });
    
    // If admin doesn't exist, create a default one
    if (!admin) {
      admin = await Admin.create({
        firebaseUid: req.params.uid,
        fullName: "",
        email: "",
        phone: "",
        collegeName: "",
        employeeId: "",
        adminRole: "",
        department: ""
      });
    }
    res.json({ success: true, data: admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update admin profile
router.put("/profile/:uid", async (req, res) => {
  try {
    const admin = await Admin.findOneAndUpdate(
      { firebaseUid: req.params.uid },
      req.body,
      { new: true, runValidators: true }
    );
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.json({ success: true, data: admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
