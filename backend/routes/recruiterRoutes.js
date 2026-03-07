
const express = require("express");
const router = express.Router();
const Recruiter = require("../models/Recruiter");
const Student = require("../models/Student");
const { rankCandidatesBySkills } = require("../services/skillRankingService");
// Rank candidates for a job drive
router.post("/rank-candidates/:id", async (req, res) => {
  try {
    const driveId = req.params.id;
    const { candidateIds, jobDescription } = req.body;
    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({ success: false, error: "candidateIds array is required" });
    }
    // Optionally: Validate driveId exists, if needed
    const ranked = await rankCandidatesBySkills(candidateIds, jobDescription || "");
    res.json({ success: true, data: ranked });
  } catch (err) {
    console.error("/rank-candidates error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get recruiter dashboard with jobs
router.get("/dashboard/:uid", async (req, res) => {
  try {
    let recruiter = await Recruiter.findOne({
      firebaseUid: req.params.uid,
    });

    // ✅ CHECK IF RECRUITER IS BLOCKED OR DELETED
    if (recruiter && (recruiter.isBlocked || recruiter.isDeleted)) {
      return res.status(403).json({ 
        error: "Your account has been " + (recruiter.isDeleted ? "deleted" : "blocked") + " by the administration. You cannot access this platform.",
        isBlocked: recruiter.isBlocked,
        isDeleted: recruiter.isDeleted
      });
    }

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

    // ✅ CHECK IF RECRUITER IS BLOCKED OR DELETED
    if (recruiter.isBlocked || recruiter.isDeleted) {
      return res.status(403).json({ 
        error: "Your account has been " + (recruiter.isDeleted ? "deleted" : "blocked") + " by the administration.",
        isBlocked: recruiter.isBlocked,
        isDeleted: recruiter.isDeleted
      });
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
    const recruiter = await Recruiter.findOne({ firebaseUid: req.params.uid });

    // ✅ CHECK IF RECRUITER IS BLOCKED OR DELETED
    if (recruiter && (recruiter.isBlocked || recruiter.isDeleted)) {
      return res.status(403).json({ 
        error: "Your account has been " + (recruiter.isDeleted ? "deleted" : "blocked") + ". You cannot update your profile.",
        isBlocked: recruiter.isBlocked,
        isDeleted: recruiter.isDeleted
      });
    }

    const updatedRecruiter = await Recruiter.findOneAndUpdate(
      { firebaseUid: req.params.uid },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRecruiter) {
      return res.status(404).json({ error: "Recruiter not found" });
    }
    res.json({ success: true, data: updatedRecruiter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
