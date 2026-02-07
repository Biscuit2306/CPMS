const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const Recruiter = require("../models/Recruiter");
const Admin = require("../models/Admin");

// ----------------------------
// REGISTER (ROLE LOCKED)
// ----------------------------
router.post("/register", async (req, res) => {
  try {
    const { role, firebaseUid, ...profileData } = req.body;

    if (!firebaseUid || !role) {
      return res.status(400).json({ message: "Missing firebaseUid or role" });
    }

    // ❌ Prevent duplicate across all roles
    const exists =
      (await Student.findOne({ firebaseUid })) ||
      (await Recruiter.findOne({ firebaseUid })) ||
      (await Admin.findOne({ firebaseUid }));

    if (exists) {
      return res.status(409).json({ message: "User already registered" });
    }

    // ✅ Common safe fields
    const baseData = {
      firebaseUid,
      fullName: profileData.fullName || "",
      email: profileData.email || "",
      phone: profileData.phone || null,
    };

    let user;

    if (role === "student") {
      user = await Student.create(baseData);

    } else if (role === "recruiter") {
      user = await Recruiter.create({
        ...baseData,
        companyName: profileData.companyName || "",
        designation: profileData.designation || "",
        companyWebsite: profileData.companyWebsite || "",
        companySize: profileData.companySize || "",
      });

    } else if (role === "admin") {
      user = await Admin.create({
        ...baseData,
        collegeName: profileData.collegeName || "",
        employeeId: profileData.employeeId || "",
        adminRole: profileData.adminRole || "",
        department: profileData.department || "",
      });

    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    res.status(201).json({ role, user });

  } catch (err) {
    console.error("REGISTER ERROR FULL:", {
      message: err.message,
      name: err.name,
      code: err.code,
      stack: err.stack,
    });

    // 🔥 Mongoose validation error
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        error: err.message,
      });
    }

    // 🔥 Duplicate index
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Duplicate user",
      });
    }

    res.status(500).json({ message: "Server error: " + err.message });
  }
});


// ----------------------------
// RESOLVE LOGIN (ROLE VALIDATED)
// ----------------------------
router.post("/resolve-login", async (req, res) => {
  try {
    const { firebaseUid, requestedRole } = req.body;

    if (!firebaseUid || !requestedRole) {
      return res.status(400).json({ error: "Missing firebaseUid or requestedRole" });
    }

    let user;

    if (requestedRole === "student") {
      user = await Student.findOne({ firebaseUid });
    } else if (requestedRole === "recruiter") {
      user = await Recruiter.findOne({ firebaseUid });
    } else if (requestedRole === "admin") {
      user = await Admin.findOne({ firebaseUid });
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (!user) {
      return res.status(403).json({
        error: "Unauthorized role access",
      });
    }

    res.json({ role: requestedRole, user });

  } catch (err) {
    console.error("RESOLVE LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ----------------------------
// GOOGLE LOGIN (ROLE VALIDATED)
// ----------------------------
router.post("/google-login", async (req, res) => {
  try {
    const { firebaseUid, requestedRole, ...profile } = req.body;

    if (!firebaseUid || !requestedRole) {
      return res.status(400).json({ error: "Missing firebaseUid or requestedRole" });
    }

    const safeProfile = {
      firebaseUid,
      fullName: profile.fullName || "",
      email: profile.email || "",
      phone: profile.phone || null,
    };

    let user;

    if (requestedRole === "student") {
      user = await Student.findOne({ firebaseUid });
      if (!user) {
        user = await Student.create(safeProfile);
      } else if (!user.fullName && safeProfile.fullName) {
        // Update with name from Google if empty
        user = await Student.findOneAndUpdate(
          { firebaseUid },
          { fullName: safeProfile.fullName },
          { new: true }
        );
      }

    } else if (requestedRole === "recruiter") {
      user = await Recruiter.findOne({ firebaseUid });
      if (!user) {
        user = await Recruiter.create({
          ...safeProfile,
          companyName: profile.companyName || "",
          designation: profile.designation || "",
          companyWebsite: profile.companyWebsite || "",
          companySize: profile.companySize || "",
        });
      } else if (!user.fullName && safeProfile.fullName) {
        // Update with name from Google if empty
        user = await Recruiter.findOneAndUpdate(
          { firebaseUid },
          { fullName: safeProfile.fullName },
          { new: true }
        );
      }

    } else if (requestedRole === "admin") {
      user = await Admin.findOne({ firebaseUid });
      if (!user) {
        user = await Admin.create({
          ...safeProfile,
          collegeName: profile.collegeName || "",
          employeeId: profile.employeeId || "",
          adminRole: profile.adminRole || "",
          department: profile.department || "",
        });
      } else if (!user.fullName && safeProfile.fullName) {
        // Update with name from Google if empty
        user = await Admin.findOneAndUpdate(
          { firebaseUid },
          { fullName: safeProfile.fullName },
          { new: true }
        );
      }

    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    res.json({ role: requestedRole, user });

  } catch (err) {
    console.error("GOOGLE LOGIN ERROR DETAILS:", {
      message: err.message,
      name: err.name,
      code: err.code,
      stack: err.stack,
    });

    // Validation error
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: err.message,
      });
    }

    // Duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({
        error: "User already exists",
      });
    }

    res.status(500).json({ error: "Server error: " + err.message });
  }
});

module.exports = router;
