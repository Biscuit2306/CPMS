const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Recruiter = require("../models/Recruiter");
const Student = require("../models/Student");
const Admin = require("../models/Admin");
const InterviewSchedule = require("../models/InterviewSchedule");

/* =========================
   CREATE INTERVIEW SCHEDULE (RECRUITER)
========================= */
router.post("/", async (req, res) => {
  try {
    const {
      recruiterFirebaseUid,
      jobDriveId,
      company,
      position,
      interviewType,
      date,
      time,
      venue,
      platform,
      meetingLink,
      rounds,
      capacity,
      description,
    } = req.body;

    // Validate required fields first
    if (!recruiterFirebaseUid || !jobDriveId || !position || !date || !time) {
      return res.status(400).json({ 
        error: "Missing required fields. Please provide: recruiterFirebaseUid, jobDriveId, position, date, time" 
      });
    }

    let recruiter;
    try {
      recruiter = await Recruiter.findOne({ firebaseUid: recruiterFirebaseUid });
    } catch (dbErr) {
      console.error("Database error finding recruiter:", dbErr);
      return res.status(500).json({ error: "Database error while fetching recruiter information" });
    }

    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter not found. Please complete your profile first." });
    }

    const schedule = new InterviewSchedule({
      recruiterFirebaseUid,
      recruiterId: recruiter._id,
      jobDriveId,
      recruiterName: recruiter.fullName || "Recruiter",
      company: company || recruiter.companyName || "Company",
      position,
      interviewType: interviewType || "Technical Interview",
      date: new Date(date),
      time,
      venue: venue || "TBD",
      platform: platform || "Offline",
      meetingLink: meetingLink || "",
      rounds: rounds || [],
      capacity: capacity || 50,
      description: description || "",
      createdBy: "recruiter",
    });

    await schedule.save();
    res.json({ success: true, data: schedule, message: "Schedule created successfully" });
  } catch (err) {
    console.error("Error creating schedule:", err);
    const errorMsg = err.message || "Failed to create schedule";
    res.status(500).json({ error: errorMsg, message: errorMsg });
  }
});

/* =========================
   SPECIFIC ROUTES (BEFORE GENERIC :scheduleId)
========================= */

/**
 * Admin dashboard stats - SPECIFIC (before /:scheduleId)
 */
router.get("/admin/dashboard/stats", async (req, res) => {
  try {
    const totalSchedules = await InterviewSchedule.countDocuments();
    const upcomingSchedules = await InterviewSchedule.countDocuments({
      date: { $gte: new Date() },
      status: { $ne: "cancelled" },
    });
    const completedSchedules = await InterviewSchedule.countDocuments({
      status: "completed",
    });

    // Get all candidates across schedules
    const allSchedules = await InterviewSchedule.find();
    let totalCandidatesScheduled = 0;
    let totalCandidatesAttended = 0;

    allSchedules.forEach((schedule) => {
      if (schedule.candidates) {
        totalCandidatesScheduled += schedule.candidates.length;
        totalCandidatesAttended += schedule.candidates.filter(
          (c) => c.status === "attended" || c.status === "passed"
        ).length;
      }
    });

    res.json({
      success: true,
      data: {
        totalSchedules,
        upcomingSchedules,
        completedSchedules,
        totalCandidatesScheduled,
        totalCandidatesAttended,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get recruiter's schedules - SPECIFIC (before /:scheduleId)
 */
router.get("/recruiter/:recruiterFirebaseUid", async (req, res) => {
  try {
    console.log("📅 Fetching recruiter schedules for:", req.params.recruiterFirebaseUid);
    const schedules = await InterviewSchedule.find({
      recruiterFirebaseUid: req.params.recruiterFirebaseUid,
      isBlocked: { $ne: true },  // Exclude blocked schedules
      status: { $nin: ["blocked", "cancelled"] } // Exclude blocked and cancelled
    }).sort({ date: 1 });

    console.log("✅ Found", schedules.length, "active recruiter schedules");
    res.json({ success: true, data: schedules });
  } catch (err) {
    console.error("❌ Error fetching recruiter schedules:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get student's upcoming schedules - SPECIFIC (before /:scheduleId)
 */
router.get("/student/:studentFirebaseUid", async (req, res) => {
  try {
    console.log("📅 Fetching student schedules for:", req.params.studentFirebaseUid);
    
    const student = await Student.findOne({ firebaseUid: req.params.studentFirebaseUid });
    if (!student) {
      console.log("⚠️ Student not found, returning all upcoming schedules");
      // Still return all upcoming schedules even if student not found
      const schedules = await InterviewSchedule.find({
        status: { $ne: "cancelled" },
        date: { $gte: new Date() }
      })
        .sort({ date: 1 })
        .populate("recruiterId", "companyName email phone");
      
      return res.json({ success: true, data: schedules });
    }

    // Get all schedules where student is a candidate
    const schedules = await InterviewSchedule.find({
      "candidates.studentId": req.params.studentFirebaseUid,
      isBlocked: { $ne: true },  // Exclude blocked schedules
      status: { $nin: ["cancelled", "blocked"] } // Exclude cancelled and blocked
    })
      .sort({ date: 1 })
      .populate("recruiterId", "companyName email phone");

    console.log("✅ Found", schedules.length, "schedules for student");
    res.json({ success: true, data: schedules });
  } catch (err) {
    console.error("❌ Error fetching student schedules:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GENERIC ROUTE (AFTER SPECIFIC ONES)
========================= */

/**
 * Get all schedules
 */
router.get("/", async (req, res) => {
  try {
    console.log("📅 Fetching all schedules");
    const schedules = await InterviewSchedule.find({ status: { $ne: "cancelled" } })
      .sort({ date: 1 })
      .populate("recruiterId", "companyName fullName");

    console.log("✅ Found", schedules.length, "total schedules");
    res.json({ success: true, data: schedules });
  } catch (err) {
    console.error("❌ Error fetching all schedules:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET SCHEDULE BY ID (GENERIC ROUTE - AFTER SPECIFIC ONES)
========================= */
router.get("/:scheduleId", async (req, res) => {
  try {
    console.log("📅 Fetching schedule by ID:", req.params.scheduleId);
    const schedule = await InterviewSchedule.findById(req.params.scheduleId).populate(
      "recruiterId",
      "companyName fullName email phone"
    );

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ success: true, data: schedule });
  } catch (err) {
    console.error("❌ Error fetching schedule by ID:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPDATE SCHEDULE (RECRUITER)
========================= */
router.put("/:scheduleId", async (req, res) => {
  try {
    const schedule = await InterviewSchedule.findByIdAndUpdate(
      req.params.scheduleId,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ success: true, data: schedule, message: "Schedule updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETE SCHEDULE (RECRUITER)
========================= */
router.delete("/:scheduleId", async (req, res) => {
  try {
    const schedule = await InterviewSchedule.findByIdAndUpdate(
      req.params.scheduleId,
      { status: "cancelled" },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ success: true, message: "Schedule cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADD CANDIDATES TO SCHEDULE
========================= */
router.post("/:scheduleId/add-candidates", async (req, res) => {
  try {
    const { candidates } = req.body; // Array of { studentId, studentName, studentEmail }

    const schedule = await InterviewSchedule.findById(req.params.scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    if (!schedule.candidates) schedule.candidates = [];

    for (const candidate of candidates) {
      if (!schedule.candidates.find((c) => c.studentId === candidate.studentId)) {
        schedule.candidates.push({
          studentId: candidate.studentId,
          studentName: candidate.studentName,
          studentEmail: candidate.studentEmail,
          status: "scheduled",
        });
      }
    }

    await schedule.save();
    res.json({ success: true, data: schedule, message: "Candidates added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPDATE CANDIDATE STATUS IN SCHEDULE
========================= */
router.put("/:scheduleId/candidate/:studentId", async (req, res) => {
  try {
    const { status, feedbackNotes, score } = req.body;

    const schedule = await InterviewSchedule.findById(req.params.scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const candidate = schedule.candidates.find((c) => c.studentId === req.params.studentId);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found in schedule" });
    }

    candidate.status = status;
    if (feedbackNotes) candidate.feedbackNotes = feedbackNotes;
    if (score !== undefined) candidate.score = score;

    await schedule.save();
    res.json({ success: true, data: schedule, message: "Candidate status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
