const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Recruiter = require("../models/Recruiter");
const Student = require("../models/Student");

// =======================================================
// 🔍 DEBUG ROUTES
// =======================================================

/* =========================
   DEBUG: GET ALL RECRUITERS
========================= */
router.get("/debug/recruiters", async (req, res) => {
  try {
    const recruiters = await Recruiter.find().select('firebaseUid fullName companyName jobDrives');
    console.log("🔍 DEBUG: All recruiters in database:");
    recruiters.forEach((r) => {
      console.log(`  - ${r.fullName} (UID: ${r.firebaseUid}) - ${r.jobDrives?.length || 0} drives`);
    });
    res.json({
      success: true,
      count: recruiters.length,
      recruiters: recruiters.map(r => ({
        firebaseUid: r.firebaseUid,
        fullName: r.fullName,
        companyName: r.companyName,
        driveCount: r.jobDrives?.length || 0,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DIAGNOSTIC: Check Applicants in DB
========================= */
router.get("/debug/check-applicants", async (req, res) => {
  try {
    console.log("\n📊📊📊 DIAGNOSTIC: Checking all applicants in MongoDB 📊📊📊");

    const recruiters = await Recruiter.find();

    let totalDrives = 0;
    let totalApplicants = 0;
    let drivesByApplicants = [];

    recruiters.forEach((recruiter) => {
      if (recruiter.jobDrives && recruiter.jobDrives.length > 0) {
        recruiter.jobDrives.forEach((drive) => {
          totalDrives++;
          const applicantCount = (drive.applicants || []).length;
          totalApplicants += applicantCount;

          console.log(`\n  Recruiter: ${recruiter.fullName}`);
          console.log(`    Drive: ${drive.position} (ID: ${drive._id})`);
          console.log(`    Applicants: ${applicantCount}`);

          if (drive.applicants && drive.applicants.length > 0) {
            drive.applicants.forEach((applicant, idx) => {
              console.log(`      [${idx + 1}] ${applicant.studentName} (${applicant.studentEmail})`);
            });

            drivesByApplicants.push({
              recruiter: recruiter.fullName,
              position: drive.position,
              driveId: drive._id.toString(),
              applicantCount,
              applicants: drive.applicants.map(a => ({
                name: a.studentName,
                email: a.studentEmail,
                id: a.studentId,
              })),
            });
          }
        });
      }
    });

    console.log(`\n📊 SUMMARY: ${totalDrives} drives, ${totalApplicants} total applicants`);

    res.json({
      success: true,
      summary: {
        totalRecruiters: recruiters.length,
        totalDrives,
        totalApplicants,
      },
      data: drivesByApplicants,
    });
  } catch (err) {
    console.error("❌ Diagnostic error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 📋 JOB DRIVE ROUTES
// =======================================================

/* =========================
   GET ALL JOB DRIVES (PUBLIC)
========================= */
router.get("/", async (req, res) => {
  try {
    console.log("📨 [Get Drives] Fetching all active drives...");

    const recruiters = await Recruiter.find();
    console.log(`📨 [Get Drives] Found ${recruiters.length} recruiters`);

    let allDrives = [];
    recruiters.forEach((recruiter) => {
      console.log(`  - ${recruiter.fullName}: ${recruiter.jobDrives?.length || 0} drives`);

      if (recruiter.jobDrives && recruiter.jobDrives.length > 0) {
        recruiter.jobDrives.forEach((drive) => {
          console.log(`    - ${drive.position} (status: ${drive.status})`);

          // Filter out deleted/blocked drives for public view
          if (drive.isDeleted || drive.status === 'deleted' || drive.isBlocked || drive.status === 'blocked') {
            console.log(`    ⛔ Skipping deleted/blocked drive`);
            return;
          }

          allDrives.push({
            ...drive,
            recruiterId: recruiter._id,
            recruiterName: recruiter.fullName,
            companyName: recruiter.companyName || "N/A",
          });
        });
      }
    });

    console.log(`✅ [Get Drives] Returning ${allDrives.length} active drives`);
    res.json({ success: true, data: allDrives });
  } catch (err) {
    console.error("❌ [Get Drives] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   CREATE JOB DRIVE (RECRUITER)
========================= */
router.post("/", async (req, res) => {
  try {
    console.log("📨 [1] CREATE DRIVE - Request received");

    const { recruiterFirebaseUid, driveData } = req.body;
    console.log("📨 [2] UID:", recruiterFirebaseUid);
    console.log("📨 [3] Data keys:", Object.keys(driveData || {}));

    if (!recruiterFirebaseUid || !driveData) {
      console.log("❌ [4] Missing fields");
      return res.status(400).json({ error: "Missing recruiterFirebaseUid or driveData" });
    }

    console.log("📨 [5] Finding recruiter...");
    const recruiter = await Recruiter.findOne({ firebaseUid: recruiterFirebaseUid });
    if (!recruiter) {
      console.log("❌ [6] Recruiter not found:", recruiterFirebaseUid);
      return res.status(404).json({ error: "Recruiter not found" });
    }
    console.log("✓ [7] Found recruiter:", recruiter.fullName);

    const newDrive = {
      _id: new mongoose.Types.ObjectId(),
      company: String(driveData.company || ""),
      position: String(driveData.position || ""),
      salary: String(driveData.salary || ""),
      location: String(driveData.location || ""),
      date: driveData.date ? new Date(driveData.date) : new Date(),
      applicationDeadline: driveData.applicationDeadline ? new Date(driveData.applicationDeadline) : new Date(),
      jobDescription: String(driveData.jobDescription || ""),
      status: String(driveData.status || "active"),
      eligibilityCriteria: driveData.eligibilityCriteria || { minCGPA: 0, allowedBranches: [], yearsEligible: [] },
      rounds: driveData.rounds || [],
      createdAt: new Date(),
      applicants: [],
    };
    console.log("✓ [8] Drive object prepared");

    if (!Array.isArray(recruiter.jobDrives)) recruiter.jobDrives = [];

    console.log("✓ [9] Current drives count:", recruiter.jobDrives.length);
    recruiter.jobDrives.push(newDrive);
    console.log("✓ [10] Drive pushed, new count:", recruiter.jobDrives.length);

    await recruiter.save();
    console.log("✅ [11] Drive created successfully:", newDrive._id);

    // 🔔 Send notifications to all students and admins about the new job drive
    try {
      const NotificationManager = require("../utils/notificationManager");
      const notifMgr = new NotificationManager();
      await notifMgr.jobDriveCreated(recruiter, newDrive);
      console.log("✅ [12] Notifications sent for new job drive");
    } catch (notifErr) {
      console.warn("⚠️ Notification error (non-critical):", notifErr.message);
    }

    res.json({ success: true, data: newDrive, message: "Job drive created successfully" });
  } catch (err) {
    console.error("❌ [ERROR] Error creating drive:", {
      name: err.name,
      message: err.message,
      code: err.code,
      details: err,
    });
    res.status(500).json({ error: err.message, type: err.name, code: err.code });
  }
});

/* =========================
   GET RECRUITER'S JOB DRIVES
========================= */
router.get("/recruiter/:recruiterFirebaseUid", async (req, res) => {
  try {
    console.log("📚 GET RECRUITER DRIVES - Request received");
    console.log("  Looking for recruiter UID:", req.params.recruiterFirebaseUid);

    let recruiter = await Recruiter.findOne({ firebaseUid: req.params.recruiterFirebaseUid });

    if (!recruiter) {
      console.log("  ⚠️ Recruiter NOT FOUND - AUTO-CREATING...");
      try {
        recruiter = await Recruiter.create({
          firebaseUid: req.params.recruiterFirebaseUid,
          fullName: "",
          companyName: "",
          jobDrives: [],
          // DO NOT set email to empty string - let it be null/undefined
        });
        console.log("  ✅ Auto-created recruiter successfully");
      } catch (createErr) {
        console.log("  ❌ Failed to auto-create recruiter");
        console.log("     Error code:", createErr.code);
        console.log("     Error message:", createErr.message);
        if (createErr.code === 11000) {
          console.log("     Duplicate key error - likely empty email field");
        }
        return res.json({ success: true, data: [] });
      }
    } else {
      console.log("  ✅ Found recruiter:", recruiter.fullName || "(no name)");
    }

    console.log("  Drives count:", recruiter.jobDrives?.length || 0);

    // Filter out soft-deleted / blocked drives before returning
    const visible = Array.isArray(recruiter.jobDrives)
      ? recruiter.jobDrives.filter(d =>
          !(d.isDeleted === true ||
            (d.status && String(d.status).toLowerCase() === 'deleted') ||
            d.isBlocked === true ||
            (d.status && String(d.status).toLowerCase() === 'blocked'))
        )
      : [];

    res.json({ success: true, data: visible });
  } catch (err) {
    console.error("  ❌ Unexpected error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET ALL CANDIDATES FOR RECRUITER
========================= */
router.get("/candidates/all/:recruiterFirebaseUid", async (req, res) => {
  try {
    console.log("\n🔥🔥🔥 CANDIDATES REQUEST - QUERYING Student.applications 🔥🔥🔥");
    console.log("  Recruiter Firebase UID:", req.params.recruiterFirebaseUid);

    let recruiter = await Recruiter.findOne({ firebaseUid: req.params.recruiterFirebaseUid });

    if (!recruiter) {
      console.log("  ⚠️ Recruiter NOT FOUND - AUTO-CREATING...");
      try {
        recruiter = await Recruiter.create({
          firebaseUid: req.params.recruiterFirebaseUid,
          fullName: "",
          companyName: "",
          jobDrives: [],
        });
        console.log("  ✅ Auto-created recruiter successfully");
      } catch (createErr) {
        console.log("  ❌ Failed to auto-create recruiter");
        console.log("     Error code:", createErr.code);
        if (createErr.code === 11000) {
          console.log("     🔥 Duplicate key error - DB has bad records");
          console.log("     FIX: Run in MongoDB: db.recruiters.deleteMany({ email: '' })");
        }
        return res.json({ success: true, data: [] });
      }
    } else {
      console.log("  ✅ Found recruiter:", recruiter.fullName || "(no name)");
    }

    const recruiterDriveIds = recruiter.jobDrives?.map(d => d._id.toString()) || [];
    console.log(`  📊 Recruiter has ${recruiterDriveIds.length} drives`);

    // Query Student.applications (source of truth)
    const allStudents = await Student.find({ applications: { $exists: true, $ne: [] } });
    console.log(`  👥 Checking ${allStudents.length} students with applications`);

    const allCandidates = [];

    for (const student of allStudents) {
      if (!student.applications || student.applications.length === 0) continue;

      for (const app of student.applications) {
        if (
          app.recruiterId === req.params.recruiterFirebaseUid ||
          app.recruiterId === recruiter._id.toString()
        ) {
          const drive = recruiter.jobDrives?.find(d => d._id.toString() === app.driveId);

          allCandidates.push({
            applicationId: app._id || "",
            studentId: student.firebaseUid,
            studentName: student.fullName || "Unknown",
            studentEmail: student.email,
            studentPhone: student.phone || "N/A",
            studentBranch: student.branch || "N/A",
            studentCGPA: student.cgpa || "N/A",
            studentYear: student.year || "N/A",
            studentRollNo: student.rollNo || "N/A",
            studentResume: student.resume || "",
            studentPortfolio: student.portfolio || "",
            studentLinkedin: student.linkedin || "",
            studentGithub: student.github || "",
            driveId: app.driveId,
            position: drive?.position || app.position || "Position",
            company: drive?.company || recruiter.companyName || "Company",
            companyName: recruiter.companyName || "Company",
            appliedAt: app.appliedAt || app._id?.getTimestamp?.() || new Date(),
            applicationStatus: app.applicationStatus || "applied",
          });

          console.log(`    ✅ Found application: ${student.fullName} → ${app.position}`);
        }
      }
    }

    console.log(`\n✅✅✅ RESULT: Fetched ${allCandidates.length} candidates from Student.applications`);
    res.json({ success: true, data: allCandidates });
  } catch (err) {
    console.error("❌ Error fetching candidates:", err.message);
    console.error("   Stack:", err.stack);
    res.json({ success: false, error: err.message, data: [] });
  }
});

/* =========================
   GET SINGLE JOB DRIVE
========================= */
router.get("/:recruiterId/:driveId", async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.recruiterId);
    if (!recruiter) return res.status(404).json({ error: "Recruiter not found" });

    const drive = recruiter.jobDrives.find((d) => d._id.toString() === req.params.driveId);
    if (!drive) return res.status(404).json({ error: "Drive not found" });

    res.json({ success: true, data: drive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPDATE JOB DRIVE
========================= */
router.put("/:recruiterId/:driveId", async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.recruiterId);
    if (!recruiter) return res.status(404).json({ error: "Recruiter not found" });

    const driveIndex = recruiter.jobDrives.findIndex((d) => d._id.toString() === req.params.driveId);
    if (driveIndex === -1) return res.status(404).json({ error: "Drive not found" });

    recruiter.jobDrives[driveIndex] = { ...recruiter.jobDrives[driveIndex], ...req.body };
    await recruiter.save();

    res.json({ success: true, data: recruiter.jobDrives[driveIndex], message: "Drive updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPDATE APPLICATION STATUS
========================= */
router.put("/:recruiterId/:driveId/applicant/:studentId", async (req, res) => {
  try {
    const { status } = req.body;

    console.log("\n🔄🔄🔄 STATUS UPDATE REQUEST 🔄🔄🔄");
    console.log("  Recruiter ID:", req.params.recruiterId);
    console.log("  Drive ID:", req.params.driveId);
    console.log("  Student ID:", req.params.studentId);
    console.log("  New Status:", status);

    // 🔥 CRITICAL: Update Student.applications FIRST (source of truth)
    const student = await Student.findOne({ firebaseUid: req.params.studentId });
    if (!student) {
      console.log("  ❌ Student not found:", req.params.studentId);
      return res.status(404).json({ error: "Student not found" });
    }
    console.log("  ✅ Student found:", student.fullName);
    console.log("  📊 Before update - Student has", student.applications.length, "applications");

    const studentAppIndex = student.applications.findIndex((a) => a.driveId === req.params.driveId);
    if (studentAppIndex === -1) {
      console.log("  ❌ Application not found in student.applications");
      console.log("     Looking for driveId:", req.params.driveId);
      student.applications.forEach((a, idx) => {
        console.log(`      [${idx}] driveId: ${a.driveId}, position: ${a.position}, status: ${a.applicationStatus}`);
      });
      return res.status(404).json({ error: "Application not found" });
    }
    console.log("  ✅ Application found:", student.applications[studentAppIndex].position);
    console.log("  📊 Old status:", student.applications[studentAppIndex].applicationStatus);

    student.applications[studentAppIndex].applicationStatus = status;
    student.applications[studentAppIndex].lastUpdated = new Date();

    // 🔥 CRITICAL: Tell Mongoose that the nested array has changed
    student.markModified('applications');

    const savedStudent = await student.save();
    console.log("  ✅ Updated status in student.applications - saved to DB");
    console.log("  📊 New status:", savedStudent.applications[studentAppIndex].applicationStatus);
    console.log("  📊 After update - Student has", savedStudent.applications.length, "applications");

    // Verify the save
    const verifyStudent = await Student.findOne({ firebaseUid: req.params.studentId });
    const verifyIndex = verifyStudent.applications.findIndex((a) => a.driveId === req.params.driveId);
    console.log("  ✅ VERIFIED - New status in DB:", verifyStudent.applications[verifyIndex].applicationStatus);

    // Also update recruiter's drive if available (secondary storage)
    const recruiter = await Recruiter.findOne({ firebaseUid: req.params.recruiterId });
    if (recruiter) {
      const drive = recruiter.jobDrives.find((d) => d._id.toString() === req.params.driveId);
      if (drive && drive.applications) {
        const recruiterAppIndex = drive.applications.findIndex((a) => a.studentId === req.params.studentId);
        if (recruiterAppIndex !== -1) {
          drive.applications[recruiterAppIndex].applicationStatus = status;
          drive.applications[recruiterAppIndex].lastUpdated = new Date();
          await recruiter.save();
          console.log("  ✅ Updated status in recruiter's drive.applications");
        }
      }
    }

    console.log("  ✅ Status update complete and saved to database");

    // 🔔 Send notification based on application status
    try {
      const NotificationManager = require("../utils/notificationManager");
      const notifMgr = new NotificationManager();
      
      if (status === "accepted") {
        await notifMgr.applicationAccepted(student, { _id: req.params.driveId, position: student.applications[studentAppIndex].position }, recruiter);
        console.log("  ✅ Acceptance notification sent to student");
      } else if (status === "rejected") {
        await notifMgr.applicationRejected(student, { _id: req.params.driveId, position: student.applications[studentAppIndex].position }, recruiter, "After careful review of your application");
        console.log("  ✅ Rejection notification sent to student");
      }
    } catch (notifErr) {
      console.warn("  ⚠️ Notification error (non-critical):", notifErr.message);
    }

    res.json({ success: true, message: "Status updated successfully", status });
  } catch (err) {
    console.error("  ❌ ERROR:", err.message);
    console.error("     Stack:", err.stack);
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 🎓 STUDENT APPLICATION ROUTES
// =======================================================

/* =========================
   APPLY TO JOB DRIVE (STUDENT)
========================= */
router.post("/:recruiterId/:driveId/apply", async (req, res) => {
  try {
    const { studentFirebaseUid } = req.body;
    console.log("\n🚀🚀🚀 APPLY TO DRIVE - REQUEST RECEIVED 🚀🚀🚀");
    console.log("  Recruiter ID (param):", req.params.recruiterId);
    console.log("  Drive ID (param):", req.params.driveId);
    console.log("  Student Firebase UID (body):", studentFirebaseUid);

    if (!studentFirebaseUid) {
      console.log("  ❌ Missing studentFirebaseUid in request body");
      return res.status(400).json({ error: "Student Firebase UID is required" });
    }

    // Find recruiter by MongoDB ID first, fallback to firebaseUid
    let recruiter = await Recruiter.findById(req.params.recruiterId);
    if (!recruiter) {
      console.log("  ❌ Recruiter NOT FOUND with findById, trying firebaseUid...");
      recruiter = await Recruiter.findOne({ firebaseUid: req.params.recruiterId });
      if (!recruiter) {
        console.log("  ❌ Recruiter not found by either method");
        return res.status(404).json({ error: "Recruiter not found" });
      }
      console.log("  ✅ Found recruiter by firebaseUid:", recruiter.fullName);
    } else {
      console.log("  ✅ Found recruiter by MongoDB ID:", recruiter.fullName);
    }

    if (!recruiter.jobDrives || recruiter.jobDrives.length === 0) {
      console.log("  ❌ Recruiter has NO drives");
      return res.status(404).json({ error: "Recruiter has no job drives" });
    }

    const drive = recruiter.jobDrives.find((d) => d._id.toString() === req.params.driveId);
    if (!drive) {
      console.log("  ❌ Drive not found - looking for ID:", req.params.driveId);
      console.log("     Available IDs:", recruiter.jobDrives.map(d => d._id.toString()));
      return res.status(404).json({ error: "Drive not found" });
    }
    console.log("  ✅ Found drive:", drive.position);

    const student = await Student.findOne({ firebaseUid: studentFirebaseUid });
    if (!student) {
      console.log("  ❌ Student not found with Firebase UID:", studentFirebaseUid);
      return res.status(404).json({ error: "Student not found" });
    }
    console.log("  ✅ Found student:", student.fullName);

    if (!student.applications) student.applications = [];

    // Check if already applied
    const alreadyApplied = student.applications.find((a) => a.driveId === req.params.driveId);
    if (alreadyApplied) {
      console.log("  ⚠️ Student already applied to this drive");
      return res.json({ success: true, message: "Already applied" });
    }

    // ✅ Add full application details to student record (source of truth)
    student.applications.push({
      driveId: req.params.driveId,
      recruiterId: req.params.recruiterId,
      company: drive.company,
      position: drive.position,
      salary: drive.salary,
      location: drive.location,
      jobDescription: drive.jobDescription,
      about: drive.about,
      rounds: drive.rounds,
      eligibilityCriteria: drive.eligibilityCriteria,
      applicationDeadline: drive.applicationDeadline,
      applicationDate: new Date(),
      appliedAt: new Date(),
      applicationStatus: "applied",
    });
    console.log("  ✅ Added application to student.applications with all job details");

    try {
      await student.save();
      console.log("  ✅✅✅ STUDENT SAVED - Application persisted to DB");
      console.log("     Total applications now:", student.applications.length);
    } catch (saveErr) {
      console.log("  ❌ ERROR SAVING STUDENT:", saveErr.message);
      throw saveErr;
    }

    // ✅ Add student to any existing interview schedules for this drive
    try {
      const InterviewSchedule = require('../models/InterviewSchedule');
      const schedules = await InterviewSchedule.find({ jobDriveId: drive._id });
      console.log("  📅 Found", schedules.length, "interview schedules for this job drive");

      for (const schedule of schedules) {
        if (!schedule.candidates) schedule.candidates = [];
        const existingCandidate = schedule.candidates.find(c => c.studentId === student.firebaseUid);
        if (!existingCandidate) {
          schedule.candidates.push({
            studentId: student.firebaseUid,
            studentName: student.fullName || 'Student',
            studentEmail: student.email || 'N/A',
            status: 'scheduled',
          });
          await schedule.save();
          console.log("  ✅ Added student to schedule:", schedule.company, schedule.position);
        } else {
          console.log("  ℹ️ Student already in schedule:", schedule.company);
        }
      }
      console.log("  ✅✅✅ Student added to all interview schedules");
    } catch (scheduleErr) {
      console.log("  ⚠️ Warning: Could not add student to schedules:", scheduleErr.message);
      // Don't fail the application if schedule update fails
    }

    console.log("✅✅✅ APPLICATION COMPLETE");
    res.json({ success: true, message: "Application submitted successfully" });
  } catch (err) {
    console.error("  ❌ UNEXPECTED ERROR:", err.message);
    console.error("     Stack:", err.stack);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   WITHDRAW APPLICATION (STUDENT)
========================= */
router.delete("/:driveId/withdraw", async (req, res) => {
  try {
    const { studentFirebaseUid } = req.body;
    const { driveId } = req.params;

    console.log("\n🔄 WITHDRAW APPLICATION - REQUEST RECEIVED");
    console.log("  Drive ID:", driveId);
    console.log("  Student Firebase UID:", studentFirebaseUid);

    if (!studentFirebaseUid) {
      console.log("  ❌ Missing studentFirebaseUid in request body");
      return res.status(400).json({ error: "Student Firebase UID is required" });
    }

    const student = await Student.findOne({ firebaseUid: studentFirebaseUid });
    if (!student) {
      console.log("  ❌ Student not found");
      return res.status(404).json({ error: "Student not found" });
    }

    if (!student.applications || student.applications.length === 0) {
      console.log("  ⚠️ Student has no applications");
      return res.status(404).json({ error: "No applications found" });
    }

    const appIndex = student.applications.findIndex((app) => app.driveId === driveId);
    if (appIndex === -1) {
      console.log("  ⚠️ Application for this drive not found");
      return res.status(404).json({ error: "Application not found for this drive" });
    }

    const removedApp = student.applications.splice(appIndex, 1);
    console.log("  ✅ Removed application for:", removedApp[0].position);

    await student.save();
    console.log("  ✅ Student record updated");

    // Also remove from recruiter's drive applicants list for consistency
    try {
      const recruiterId = removedApp[0].recruiterId;
      const recruiter = await Recruiter.findById(recruiterId);

      if (recruiter) {
        const drive = recruiter.jobDrives.find((d) => d._id.toString() === driveId);
        if (drive && drive.applicants) {
          const applicantIndex = drive.applicants.findIndex((a) => a.studentId === studentFirebaseUid);
          if (applicantIndex !== -1) {
            drive.applicants.splice(applicantIndex, 1);
            await recruiter.save();
            console.log("  ✅ Removed from recruiter's drive applicants list");
          }
        }
      }
    } catch (err) {
      console.log("  ⚠️ Warning: Could not update recruiter's applicants list:", err.message);
      // Don't fail the withdrawal if this optional update fails
    }

    console.log("✅✅✅ WITHDRAWAL COMPLETE");
    res.json({ success: true, message: "Application withdrawn successfully" });
  } catch (err) {
    console.error("  ❌ UNEXPECTED ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETE JOB DRIVE
========================= */
router.delete("/:recruiterId/:driveId", async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.recruiterId);
    if (!recruiter) return res.status(404).json({ error: "Recruiter not found" });

    recruiter.jobDrives = recruiter.jobDrives.filter((d) => d._id.toString() !== req.params.driveId);
    await recruiter.save();

    return res.json({ success: true, message: "Drive deleted successfully", matchedCount: 1, modifiedCount: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 🔄 SYNC ROUTES
// =======================================================

/* =========================
   SYNC STUDENT TO INTERVIEW SCHEDULES
========================= */
router.post("/sync-schedules", async (req, res) => {
  try {
    const { studentFirebaseUid } = req.body;

    if (!studentFirebaseUid) {
      return res.status(400).json({ error: "studentFirebaseUid required" });
    }

    const student = await Student.findOne({ firebaseUid: studentFirebaseUid });
    if (!student) return res.status(404).json({ error: "Student not found" });

    if (!student.applications || student.applications.length === 0) {
      return res.json({ success: true, message: "No applications to sync" });
    }

    const InterviewSchedule = require('../models/InterviewSchedule');
    let schedulesSynced = 0;

    for (const app of student.applications) {
      const schedules = await InterviewSchedule.find({ jobDriveId: app.driveId });

      for (const schedule of schedules) {
        if (!schedule.candidates) schedule.candidates = [];

        const existingCandidate = schedule.candidates.find(c => c.studentId === studentFirebaseUid);
        if (!existingCandidate) {
          schedule.candidates.push({
            studentId: studentFirebaseUid,
            studentName: student.fullName || 'Student',
            studentEmail: student.email || 'N/A',
            status: 'scheduled',
          });
          await schedule.save();
          schedulesSynced++;
        }
      }
    }

    res.json({ success: true, message: `Synced student to ${schedulesSynced} schedules` });
  } catch (err) {
    console.error("Sync schedules error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;