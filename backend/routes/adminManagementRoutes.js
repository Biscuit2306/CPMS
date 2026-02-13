const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Recruiter = require("../models/Recruiter");
const InterviewSchedule = require("../models/InterviewSchedule");
const {
  notifyJobDriveBlocked,
  notifyJobDriveDeleted,
  notifyScheduleBlocked,
  notifyCandidateRemoved,
  notifyRecruiterScheduleBlocked,
  notifyStudentBlocked,
} = require("../utils/notificationService");

/* =========================
   JOB DRIVE MANAGEMENT
========================= */

/**
 * Block a job drive (admin action) - ✅ FIXED WITH MONGODB $SET OPERATORS
 * Admin can block a drive, students get notified
 */
router.post("/job-drive/block/:driveId", async (req, res) => {
  try {
    const driveObjectId = new mongoose.Types.ObjectId(req.params.driveId);
    const { adminFirebaseUid, adminName, reason } = req.body;

    console.log(`\n🚫 BLOCK: ${driveObjectId}`);

    // 🔍 DIAGNOSTIC: Check if this drive ID even exists
    const diagnostic = await Recruiter.findOne(
      { "jobDrives._id": driveObjectId },
      { "jobDrives.$": 1 }
    );
    console.log("🔍 DIAGNOSTIC:", diagnostic ? `Found in recruiter` : `NOT FOUND`);
    if (diagnostic) {
      console.log("   Drive:", diagnostic.jobDrives[0]);
    }

    // ✅ UPDATE RECRUITER.JOBDRIVES
    const result = await Recruiter.updateOne(
      { "jobDrives._id": driveObjectId },
      {
        $set: {
          "jobDrives.$.isBlocked": true,
          "jobDrives.$.status": "blocked",
          "jobDrives.$.blockedBy": {
            adminFirebaseUid,
            adminName,
            reason: reason || "Administrative decision",
            blockedAt: new Date()
          }
        }
      }
    );

    console.log(`📊 Result: matched=${result.matchedCount}, modified=${result.modifiedCount}`);

    // ✅ RETURN ONLY IF REALLY MODIFIED
    return res.json({
      success: result.modifiedCount === 1,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });

  } catch (err) {
    console.error("❌ Error blocking job drive:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Delete a job drive (admin action) - ✅ FIXED WITH MONGODB $SET OPERATORS
 * Admin can delete a drive, students get notified
 */
router.post("/job-drive/delete/:driveId", async (req, res) => {
  try {
    const driveObjectId = new mongoose.Types.ObjectId(req.params.driveId);
    const { adminFirebaseUid, adminName, reason } = req.body;

    console.log(`\n🗑️ DELETE: ${driveObjectId}`);

    // 🔍 DIAGNOSTIC: Check if this drive ID even exists
    const diagnostic = await Recruiter.findOne(
      { "jobDrives._id": driveObjectId },
      { "jobDrives.$": 1 }
    );
    console.log("🔍 DIAGNOSTIC:", diagnostic ? `Found in recruiter` : `NOT FOUND`);
    if (diagnostic) {
      console.log("   Drive:", diagnostic.jobDrives[0]);
    }

    // ✅ UPDATE RECRUITER.JOBDRIVES
    const result = await Recruiter.updateOne(
      { "jobDrives._id": driveObjectId },
      {
        $set: {
          "jobDrives.$.isDeleted": true,
          "jobDrives.$.status": "deleted",
          "jobDrives.$.deletedBy": {
            adminFirebaseUid,
            adminName,
            reason,
            deletedAt: new Date()
          }
        }
      }
    );

    console.log(`📊 Result: matched=${result.matchedCount}, modified=${result.modifiedCount}`);

    // ✅ RETURN ONLY IF REALLY MODIFIED
    return res.json({
      success: result.modifiedCount === 1,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });

  } catch (err) {
    console.error("❌ Error deleting job drive:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Remove a candidate from a job drive
 */
router.post("/job-drive/:driveId/remove-candidate/:studentId", async (req, res) => {
  try {
    const { driveId, studentId } = req.params;
    const { adminFirebaseUid, adminName, reason } = req.body;

    if (!adminFirebaseUid || !adminName) {
      return res.status(400).json({ error: "Admin info required" });
    }

    const recruiters = await Recruiter.find();
    let jobDrive = null;
    let recruiter = null;

    for (const rec of recruiters) {
      const drive = rec.jobDrives?.find(d => d._id.toString() === driveId);
      if (drive) {
        recruiter = rec;
        jobDrive = drive;
        break;
      }
    }

    if (!jobDrive) {
      return res.status(404).json({ error: "Job drive not found" });
    }

    // Remove candidate from applications
    const appIndex = jobDrive.applications.findIndex(
      a => a.studentId === studentId
    );

    if (appIndex === -1) {
      return res.status(404).json({ error: "Candidate not found in this drive" });
    }

    const removedApp = jobDrive.applications.splice(appIndex, 1)[0];
    await recruiter.save();

    // Notify student
    if (removedApp.studentEmail) {
      const notification = {
        recipientFirebaseUid: studentId,
        recipientEmail: removedApp.studentEmail,
        type: "application_rejected",
        title: "Application Rejected",
        message: `Your application for ${jobDrive.company} - ${jobDrive.position} has been rejected by admin (${adminName}). Reason: ${reason || "Not specified"}`,
        actionType: "remove",
        affectedItemId: driveId,
        affectedItemType: "JobDrive",
        metadata: {
          company: jobDrive.company,
          position: jobDrive.position,
          jobDriveId: driveId,
          studentName: removedApp.studentName,
          adminName,
          reason,
        },
        priority: "medium",
        actionUrl: "/student/applications",
      };

      const Notification = require("../models/Notification");
      await Notification.create(notification);
    }

    res.json({
      success: true,
      message: "Candidate removed from job drive",
      removedApplication: removedApp,
    });
  } catch (err) {
    console.error("❌ Error removing candidate:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   INTERVIEW SCHEDULE MANAGEMENT
========================= */

/**
 * Block/Cancel an interview schedule (admin action)
 */
router.post("/schedule/block/:scheduleId", async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { adminFirebaseUid, adminName, reason } = req.body;

    if (!adminFirebaseUid || !adminName) {
      return res.status(400).json({ error: "Admin info required" });
    }

    const schedule = await InterviewSchedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Mark schedule as blocked
    schedule.isBlocked = true;
    schedule.isCancelled = true;
    schedule.status = "blocked";
    schedule.blockedBy = {
      adminFirebaseUid,
      adminName,
      reason: reason || "Administrative cancellation",
      blockedAt: new Date(),
    };

    await schedule.save();

    // Notify all candidates
    if (schedule.candidates && schedule.candidates.length > 0) {
      const candidatesToNotify = schedule.candidates;
      for (const candidate of candidatesToNotify) {
        const studentNotif = {
          recipientFirebaseUid: candidate.studentId,
          recipientEmail: candidate.studentEmail,
          type: "interview_blocked",
          title: "Interview Cancelled",
          message: `Your interview for ${schedule.company} - ${schedule.position} scheduled on ${new Date(schedule.date).toLocaleDateString()} has been cancelled by admin (${adminName}). Reason: ${reason || "Not specified"}`,
          actionType: "block",
          affectedItemId: scheduleId,
          affectedItemType: "InterviewSchedule",
          metadata: {
            company: schedule.company,
            position: schedule.position,
            scheduleId,
            studentId: candidate.studentId,
            studentName: candidate.studentName,
            adminName,
            reason,
          },
          priority: "high",
          actionUrl: "/student/interviews",
        };

        const Notification = require("../models/Notification");
        await Notification.create(studentNotif);
      }
    }

    // Notify recruiter
    const recruiter = await Recruiter.findOne({
      firebaseUid: schedule.recruiterFirebaseUid,
    });

    if (recruiter) {
      const Notification = require("../models/Notification");
      await Notification.create({
        recipientFirebaseUid: recruiter.firebaseUid,
        recipientEmail: recruiter.email,
        type: "interview_blocked",
        title: "Interview Cancelled",
        message: `Your interview for ${schedule.company} - ${schedule.position} scheduled on ${new Date(schedule.date).toLocaleDateString()} has been cancelled by admin (${adminName}). Reason: ${reason || "Not specified"}`,
        actionType: "block",
        affectedItemId: scheduleId,
        affectedItemType: "InterviewSchedule",
        metadata: {
          company: schedule.company,
          position: schedule.position,
          scheduleId,
          adminName,
          reason,
        },
        priority: "high",
        actionUrl: "/recruiter/schedules",
      });
    }

    res.json({
      success: true,
      message: "Interview schedule blocked successfully",
      schedule,
    });
  } catch (err) {
    console.error("❌ Error blocking schedule:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Remove a single candidate from an interview schedule
 */
router.post("/schedule/:scheduleId/remove-candidate/:studentId", async (req, res) => {
  try {
    const { scheduleId, studentId } = req.params;
    const { adminFirebaseUid, adminName, reason } = req.body;

    if (!adminFirebaseUid || !adminName) {
      return res.status(400).json({ error: "Admin info required" });
    }

    const schedule = await InterviewSchedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Find and remove candidate
    const candidateIndex = schedule.candidates.findIndex(
      c => c.studentId === studentId
    );

    if (candidateIndex === -1) {
      return res.status(404).json({ error: "Candidate not found in this schedule" });
    }

    const removedCandidate = schedule.candidates.splice(candidateIndex, 1)[0];
    await schedule.save();

    // Notify student
    const Notification = require("../models/Notification");
    await Notification.create({
      recipientFirebaseUid: studentId,
      recipientEmail: removedCandidate.studentEmail,
      type: "candidate_removed",
      title: "Removed from Interview",
      message: `You have been removed from the interview for ${schedule.company} - ${schedule.position} by admin (${adminName}). Reason: ${reason || "Not specified"}`,
      actionType: "remove",
      affectedItemId: scheduleId,
      affectedItemType: "InterviewSchedule",
      metadata: {
        company: schedule.company,
        position: schedule.position,
        scheduleId,
        studentId,
        studentName: removedCandidate.studentName,
        adminName,
        reason,
      },
      priority: "high",
      actionUrl: "/student/interviews",
    });

    res.json({
      success: true,
      message: "Candidate removed from interview schedule",
      removedCandidate,
    });
  } catch (err) {
    console.error("❌ Error removing candidate from schedule:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   STUDENT MANAGEMENT
========================= */

/**
 * Block a student account
 */
router.post("/student/block/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { adminFirebaseUid, adminName, reason } = req.body;

    if (!adminFirebaseUid || !adminName) {
      return res.status(400).json({ error: "Admin info required" });
    }

    const student = await Student.findOne({ firebaseUid: studentId });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Mark student as blocked
    student.isBlocked = true;
    student.blockedBy = {
      adminFirebaseUid,
      adminName,
      reason: reason || "Administrative action",
      blockedAt: new Date(),
    };

    await student.save();

    // Notify student
    const Notification = require("../models/Notification");
    await Notification.create({
      recipientFirebaseUid: studentId,
      recipientEmail: student.email,
      type: "admin_action",
      title: "Account Blocked",
      message: `Your account has been blocked by admin (${adminName}). Reason: ${reason || "Not specified"}. Please contact the administration for more details.`,
      actionType: "block",
      affectedItemId: student._id,
      affectedItemType: "Student",
      metadata: {
        studentId,
        studentName: student.fullName,
        adminName,
        reason,
      },
      priority: "urgent",
      actionUrl: "/student/dashboard",
    });

    // Also cancel all their upcoming interview schedules
    const schedules = await InterviewSchedule.find({
      "candidates.studentId": studentId,
      status: { $in: ["scheduled", "ongoing"] },
    });

    for (const schedule of schedules) {
      const candidateIndex = schedule.candidates.findIndex(
        c => c.studentId === studentId
      );

      if (candidateIndex !== -1) {
        schedule.candidates.splice(candidateIndex, 1);
        await schedule.save();
      }
    }

    res.json({
      success: true,
      message: "Student blocked successfully",
      student,
    });
  } catch (err) {
    console.error("❌ Error blocking student:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Unblock a student account
 */
router.post("/student/unblock/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { adminFirebaseUid, adminName } = req.body;

    if (!adminFirebaseUid || !adminName) {
      return res.status(400).json({ error: "Admin info required" });
    }

    const student = await Student.findOne({ firebaseUid: studentId });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Unblock student
    student.isBlocked = false;
    student.blockedBy = null;
    await student.save();

    // Notify student
    const Notification = require("../models/Notification");
    await Notification.create({
      recipientFirebaseUid: studentId,
      recipientEmail: student.email,
      type: "admin_action",
      title: "Account Unblocked",
      message: `Your account has been unblocked by admin (${adminName}). You can now access all features again.`,
      actionType: "update",
      affectedItemId: student._id,
      affectedItemType: "Student",
      metadata: {
        studentId,
        studentName: student.fullName,
        adminName,
      },
      priority: "medium",
      actionUrl: "/student/dashboard",
    });

    res.json({
      success: true,
      message: "Student unblocked successfully",
      student,
    });
  } catch (err) {
    console.error("❌ Error unblocking student:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all blocked/deleted items for admin dashboard
 */
router.get("/blocked-items", async (req, res) => {
  try {
    // Get blocked job drives
    const recruiters = await Recruiter.find();
    const blockedDrives = [];
    const deletedDrives = [];

    for (const recruiter of recruiters) {
      if (!recruiter.jobDrives) continue;

      for (const drive of recruiter.jobDrives) {
        if (drive.isBlocked) {
          blockedDrives.push({
            ...drive.toObject(),
            recruiterName: recruiter.fullName,
            recruiterEmail: recruiter.email,
            type: "JobDrive",
          });
        }
        if (drive.isDeleted) {
          deletedDrives.push({
            ...drive.toObject(),
            recruiterName: recruiter.fullName,
            recruiterEmail: recruiter.email,
            type: "JobDrive",
          });
        }
      }
    }

    // Get blocked schedules
    const blockedSchedules = await InterviewSchedule.find({ isBlocked: true });
    const cancelledSchedules = await InterviewSchedule.find({ isCancelled: true });

    // Get blocked students
    const blockedStudents = await Student.find({ isBlocked: true });

    res.json({
      success: true,
      data: {
        blockedDrives,
        deletedDrives,
        blockedSchedules,
        cancelledSchedules,
        blockedStudents,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching blocked items:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
