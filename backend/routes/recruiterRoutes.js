const express = require("express");
const router = express.Router();
const Recruiter = require("../models/Recruiter");
const Student = require("../models/Student");

// Get recruiter dashboard with jobs
router.get("/dashboard/:uid", async (req, res) => {
  try {
    let recruiter = await Recruiter.findOne({
      firebaseUid: req.params.uid,
    });

    // If recruiter doesn't exist, create a default one
    if (!recruiter) {
      try {
        recruiter = await Recruiter.create({
          firebaseUid: req.params.uid,
          fullName: "",
          phone: "",
          companyName: "",
          designation: "",
          companyWebsite: "",
          companySize: "",
          jobDrives: []
        });
      } catch (createErr) {
        console.error("Failed to create default recruiter", createErr);
        // If creation fails, return a minimal recruiter object
        recruiter = {
          firebaseUid: req.params.uid,
          fullName: "",
          email: "",
          phone: "",
          companyName: "",
          designation: "",
          companyWebsite: "",
          companySize: "",
          jobDrives: []
        };
      }
    }

    // Filter out soft-deleted / blocked job drives before returning dashboard
    const recObj = recruiter && typeof recruiter.toObject === 'function' ? recruiter.toObject() : recruiter;
    if (recObj && Array.isArray(recObj.jobDrives)) {
      recObj.jobDrives = recObj.jobDrives.filter(d => !(d.isDeleted === true || (d.status && String(d.status).toLowerCase() === 'deleted') || d.isBlocked === true || (d.status && String(d.status).toLowerCase() === 'blocked')));
    }
    res.json(recObj);
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get recruiter profile
router.get("/profile/:uid", async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({
      firebaseUid: req.params.uid,
    });

    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter not found" });
    }

    // Hide deleted/blocked drives in profile response
    const recObj = recruiter && typeof recruiter.toObject === 'function' ? recruiter.toObject() : recruiter;
    if (recObj && Array.isArray(recObj.jobDrives)) {
      recObj.jobDrives = recObj.jobDrives.filter(d => !(d.isDeleted === true || (d.status && String(d.status).toLowerCase() === 'deleted') || d.isBlocked === true || (d.status && String(d.status).toLowerCase() === 'blocked')));
    }
    res.json({ success: true, data: recObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update recruiter profile
router.put("/profile/:uid", async (req, res) => {
  try {
    const recruiter = await Recruiter.findOneAndUpdate(
      { firebaseUid: req.params.uid },
      req.body,
      { new: true, runValidators: true }
    );
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter not found" });
    }
    res.json({ success: true, data: recruiter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
