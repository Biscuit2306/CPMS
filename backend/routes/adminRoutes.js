const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Recruiter = require("../models/Recruiter");
const JobDrive = require("../models/JobDrive");
const InterviewSchedule = require("../models/InterviewSchedule");
const mongoose = require("mongoose");

console.log("✅ adminRoutes.js loaded");

// TEST ROUTE
router.get("/test", (req, res) => {
  console.log("🔥 TEST ROUTE CALLED");
  res.json({ message: "Admin routes are working" });
});

// REPAIR: Rebuild Admin collection indexes to remove corrupted email unique index
router.post("/repair/rebuild-indexes", async (req, res) => {
  try {
    console.log("🔧 Rebuilding Admin collection indexes...");
    
    // Drop all existing indexes (except _id)
    const indexes = await Admin.collection.getIndexes();
    for (const indexName in indexes) {
      if (indexName !== "_id_") {
        console.log(`  Dropping index: ${indexName}`);
        await Admin.collection.dropIndex(indexName);
      }
    }
    console.log("✅ Dropped old indexes");
    
    // Rebuild indexes from current schema
    await Admin.collection.createIndex({ firebaseUid: 1 }, { unique: true });
    console.log("✅ Rebuilt firebaseUid unique index (email unique index removed)");
    
    res.json({
      success: true,
      message: "✅ Admin collection indexes rebuilt. The email field is no longer unique. Try reloading the dashboard."
    });
  } catch (err) {
    console.error("❌ Index rebuild failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// DEBUG: List all admins in collection
router.get("/debug/all-admins", async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json({
      totalAdmins: admins.length,
      admins: admins
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    // Count active (non-deleted/blocked) records only
    const totalStudents = await Student.countDocuments({ isBlocked: { $ne: true }, isDeleted: { $ne: true } });
    const totalRecruiters = await Recruiter.countDocuments({ isBlocked: { $ne: true } });
    const totalAdmins = await Admin.countDocuments();

    // Get job drives that are active
    const recruiters = await Recruiter.find({ isBlocked: { $ne: true } });
    let activeDrives = 0;
    recruiters.forEach(recruiter => {
      if (recruiter && recruiter.jobDrives && Array.isArray(recruiter.jobDrives)) {
        activeDrives += recruiter.jobDrives.filter(d => d && !d.isDeleted && !d.isBlocked && d.status !== 'deleted' && d.status !== 'blocked').length;
      }
    });

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalRecruiters,
        totalAdmins,
        activeDrives,
        placementRate: "92%",
        avgPackage: "₹14.2 LPA"
      }
    });
  } catch (err) {
    console.error("❌ Error fetching dashboard:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all students
router.get("/students", async (req, res) => {
  try {
    // Exclude blocked and deleted students for normal view
    const students = await Student.find({ isBlocked: { $ne: true }, isDeleted: { $ne: true } }).select("-password");
    res.json({ success: true, data: students });
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all recruiters
router.get("/recruiters", async (req, res) => {
  try {
    // Exclude blocked recruiters for normal view
    const recruiters = await Recruiter.find({ isBlocked: { $ne: true } }).select("-password");
    res.json({ success: true, data: recruiters });
  } catch (err) {
    console.error("❌ Error fetching recruiters:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all drives (from Recruiter.jobDrives embedded array)
// Admin sees all drives created by all recruiters
router.get("/drives", async (req, res) => {
  try {
    console.log(`\n🔥 GET /API/ADMIN/DRIVES CALLED 🔥`);
    const recruiters = await Recruiter.find();
    console.log(`   Found ${recruiters.length} recruiters`);
    
    let allDrives = [];
    
    recruiters.forEach((recruiter, idx) => {
      const drivesCount = recruiter.jobDrives?.length || 0;
      console.log(`   [${idx}] ${recruiter.fullName || 'Unknown'}: ${drivesCount} drives`);
      if (drivesCount > 0) {
        console.log(`     Sample drive id: ${recruiter.jobDrives[0]._id} position: ${recruiter.jobDrives[0].position || 'N/A'} isDeleted: ${recruiter.jobDrives[0].isDeleted}`);
      }
      
        if (recruiter.jobDrives && Array.isArray(recruiter.jobDrives) && recruiter.jobDrives.length > 0) {
          recruiter.jobDrives.forEach((drive, dIdx) => {
            // Skip soft-deleted / blocked drives so admin sees only active ones here
            if (drive.isDeleted || drive.status === 'deleted' || drive.isBlocked || drive.status === 'blocked') {
              console.log(`        ├─ Skipping drive ${dIdx} (deleted/blocked)`);
              return;
            }
            console.log(`        ├─ Drive ${dIdx}: ${drive.position || drive.company || 'Unknown'}`);
            // Ensure we return the full drive object so frontend can render details and actions
            const driveObj = (drive && typeof drive.toObject === 'function') ? drive.toObject() : JSON.parse(JSON.stringify(drive));
            allDrives.push(Object.assign({}, driveObj, {
              recruiterId: recruiter._id,
              recruiterFirebaseUid: recruiter.firebaseUid,
              recruiterName: recruiter.fullName || "Unknown Recruiter",
              recruiterEmail: recruiter.email || "",
              companyName: recruiter.companyName || recruiter.company || "N/A",
            }));
          });
        }
    });
    
    console.log(`   ✅ Total drives to return: ${allDrives.length}\n`);
    // If no embedded drives found (older data model may store drives in JobDrive collection),
    // fallback to JobDrive documents so admin UI still shows drives.
    if (!allDrives || allDrives.length === 0) {
      try {
        const jobDrives = await JobDrive.find({}).lean();
        if (Array.isArray(jobDrives) && jobDrives.length > 0) {
          // Attach basic recruiter info when possible
          const enriched = await Promise.all(jobDrives.map(async (d) => {
            let recruiterInfo = {};
            try {
              const rec = await Recruiter.findOne({ firebaseUid: d.recruiterFirebaseUid || d.recruiterId });
              if (rec) {
                recruiterInfo = {
                  recruiterId: rec._id,
                  recruiterFirebaseUid: rec.firebaseUid,
                  recruiterName: rec.fullName || '',
                  recruiterEmail: rec.email || '',
                  companyName: rec.companyName || rec.company || ''
                };
              }
            } catch (e) {
              // ignore recruiter lookup failure
            }
            return Object.assign({}, d, recruiterInfo);
          }));

          return res.json({ success: true, data: enriched });
        }
      } catch (e) {
        console.warn('Fallback JobDrive lookup failed', e.message);
      }
    }

    res.json({ success: true, data: allDrives });
  } catch (err) {
    console.error("❌ Error fetching drives:", err);
    res.status(500).json({ error: err.message });
  }
});

// DEBUG: find recruiter + embedded drive by driveId
router.get('/drives/find-by-id/:driveId', async (req, res) => {
  try {
  const { driveId } = req.params;
  let driveObjectId;
  try {
    driveObjectId = new mongoose.Types.ObjectId(driveId);
  } catch (e) {
    return res.status(400).json({ success: false, error: 'Invalid driveId' });
  }

  const recruiter = await Recruiter.findOne({ 'jobDrives._id': driveObjectId }, { 'jobDrives.$': 1 });
  if (!recruiter) return res.json({ success: true, data: null });
  const drive = recruiter.jobDrives && recruiter.jobDrives[0] ? recruiter.jobDrives[0] : null;
  res.json({ success: true, data: { recruiterId: recruiter._id, firebaseUid: recruiter.firebaseUid, drive } });
  } catch (err) {
  console.error('Error in find-by-id:', err);
  res.status(500).json({ error: err.message });
  }
});

// Delete a job drive (set isDeleted flag)
router.delete("/drives/:recruiterId/:driveId", async (req, res) => {
  try {
    const { recruiterId, driveId } = req.params;
    let driveObjectId;
    try {
      driveObjectId = new mongoose.Types.ObjectId(driveId);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid driveId' });
    }

    // Diagnostic: ensure drive exists
    const diagnostic = await Recruiter.findOne({ _id: recruiterId, 'jobDrives._id': driveObjectId }, { 'jobDrives.$': 1 });
    if (!diagnostic) {
      return res.status(404).json({ success: false, message: 'Drive not found for recruiter' });
    }

    const result = await Recruiter.updateOne(
      { _id: recruiterId, 'jobDrives._id': driveObjectId },
      {
        $set: {
          'jobDrives.$.isDeleted': true,
          'jobDrives.$.status': 'deleted',
          'jobDrives.$.deletedBy': { deletedAt: new Date() }
        }
      }
    );

    return res.json({
      success: result.modifiedCount === 1,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("❌ Error deleting drive:", err);
    res.status(500).json({ error: err.message });
  }
});

// Block a job drive (set isBlocked flag)
router.patch("/drives/:recruiterId/:driveId/block", async (req, res) => {
  try {
    const { recruiterId, driveId } = req.params;
    const { isBlocked } = req.body;
    let driveObjectId;
    try {
      driveObjectId = new mongoose.Types.ObjectId(driveId);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid driveId' });
    }

    // Diagnostic: check existence
    const diagnostic = await Recruiter.findOne({ _id: recruiterId, 'jobDrives._id': driveObjectId }, { 'jobDrives.$': 1 });
    if (!diagnostic) {
      return res.status(404).json({ success: false, message: 'Drive not found for recruiter' });
    }

    const result = await Recruiter.updateOne(
      { _id: recruiterId, 'jobDrives._id': driveObjectId },
      {
        $set: {
          'jobDrives.$.isBlocked': !!isBlocked,
          'jobDrives.$.status': isBlocked ? 'blocked' : 'active',
          'jobDrives.$.blockedBy': { blockedAt: new Date() }
        }
      }
    );

    return res.json({
      success: result.modifiedCount === 1,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("❌ Error updating drive:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get stats
router.get("/stats", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ isBlocked: { $ne: true } });
    const activeRecruiters = await Recruiter.countDocuments({ isBlocked: { $ne: true } });
    
    // Get all drives from Recruiter.jobDrives (embedded array)
    const recruiters = await Recruiter.find({ isBlocked: { $ne: true } }).lean();
    let allDrives = [];
    let driveCompanies = new Set();
    
    recruiters.forEach((recruiter) => {
      if (recruiter && recruiter.jobDrives && Array.isArray(recruiter.jobDrives)) {
        recruiter.jobDrives.forEach((drive) => {
          if (drive && !drive.isDeleted && !drive.isBlocked) {
            allDrives.push(drive);
            if (drive.company) {
              driveCompanies.add(drive.company);
            }
          }
        });
      }
    });
    
    const partnerCompanies = driveCompanies.size;
    
    let totalApplications = 0;
    let selectedApplications = 0;
    
    recruiters.forEach((recruiter) => {
      if (recruiter && recruiter.jobDrives && Array.isArray(recruiter.jobDrives)) {
        recruiter.jobDrives.forEach(drive => {
          if (drive && drive.applications && Array.isArray(drive.applications)) {
            totalApplications += drive.applications.length;
            selectedApplications += drive.applications.filter(app => app && app.applicationStatus === 'selected').length;
          }
        });
      }
    });
    
    const placementRate = totalApplications > 0 ? Math.round((selectedApplications / totalApplications) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        activeRecruiters,
        partnerCompanies,
        placementRate
      }
    });
  } catch (err) {
    console.error("❌ Error fetching stats:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get admin dashboard (for context - returns full admin data plus aggregated stats)
router.get("/dashboard/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    if (!uid) {
      return res.status(400).json({ error: "User ID required" });
    }

    let admin = await Admin.findOne({ firebaseUid: uid });

    // If admin doesn't exist, return in-memory object (avoid E11000 errors from upsert)
    if (!admin) {
      admin = {
        firebaseUid: uid,
        fullName: "",
        email: "",
        phone: "",
        collegeName: "",
        employeeId: "",
        adminRole: "",
        department: ""
      };
    }

    // Only count active students and recruiters
    const activeStudents = await Student.countDocuments({ isBlocked: { $ne: true }, isDeleted: { $ne: true } });
    const activeRecruiters = await Recruiter.countDocuments({ isBlocked: { $ne: true } });

    // Only use active recruiters
    const recruiters = await Recruiter.find({ isBlocked: { $ne: true } });
    let activeDrives = 0;
    let companies = new Set();

    // GUARD: Check each recruiter exists and has valid jobDrives
    if (recruiters && Array.isArray(recruiters)) {
      recruiters.forEach(recruiter => {
        if (!recruiter) return;
        if (recruiter.jobDrives && Array.isArray(recruiter.jobDrives)) {
          recruiter.jobDrives.forEach(drive => {
            if (drive && !drive.isDeleted && !drive.isBlocked && drive.status !== 'deleted' && drive.status !== 'blocked') {
              activeDrives += 1;
            }
          });
        }
        if (recruiter.companyName) {
          companies.add(recruiter.companyName);
        }
      });
    }

    // Calculate placement rate from completed interviews, only if recruiter still exists
    let placementCount = 0;
    let totalInterviews = 0;

    try {
      const schedules = await InterviewSchedule.find({ status: 'completed' });
      
      if (schedules && Array.isArray(schedules)) {
        for (const schedule of schedules) {
          // GUARD: Skip if schedule is missing or has no candidates
          if (!schedule) continue;
          if (!schedule.candidates) continue;
          if (!Array.isArray(schedule.candidates)) continue;

          // GUARD: Verify recruiter exists in database
          let recruiterExists = false;
          
          if (schedule.recruiterFirebaseUid) {
            try {
              const recruiter = await Recruiter.findOne({ firebaseUid: schedule.recruiterFirebaseUid });
              if (recruiter && !recruiter.isBlocked) {
                recruiterExists = true;
              }
            } catch (err) {
              console.warn("Recruiter lookup failed:", err.message);
            }
          } else if (schedule.recruiterId) {
            try {
              const recruiter = await Recruiter.findById(schedule.recruiterId);
              if (recruiter && !recruiter.isBlocked) {
                recruiterExists = true;
              }
            } catch (err) {
              console.warn("Recruiter lookup failed:", err.message);
            }
          }

          // GUARD: Only count if recruiter exists
          if (recruiterExists) {
            totalInterviews += 1;
            if (Array.isArray(schedule.candidates)) {
              placementCount += schedule.candidates.filter(c => c && c.status === 'passed').length;
            }
          }
        }
      }
    } catch (scheduleErr) {
      console.warn("Schedule processing error (non-fatal):", scheduleErr.message);
      // Don't fail dashboard if schedule processing has issues
      placementCount = 0;
      totalInterviews = 0;
    }

    const placementRate = totalInterviews > 0 ? Math.round((placementCount / totalInterviews) * 100) : 0;

    res.json({
      ...(admin.toObject ? admin.toObject() : admin),
      stats: {
        totalStudents: activeStudents,
        totalRecruiters: activeRecruiters,
        activeDrives: activeDrives,
        totalCompanies: companies.size,
        placementRate: placementRate,
        avgPackage: "₹14.2 LPA"
      }
    });
  } catch (err) {
    console.error("❌ CRITICAL Error fetching admin dashboard:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Get admin profile
router.get("/profile/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    if (!uid) {
      return res.status(400).json({ error: "User ID required" });
    }

    console.log(`[Profile] Looking up admin: ${uid}`);
    let admin = await Admin.findOne({ firebaseUid: uid });
    console.log(`[Profile] Found admin:`, admin ? "YES" : "NO");
    
    if (!admin) {
      // Return in-memory admin object without storing (avoid E11000 errors)
      admin = {
        firebaseUid: uid,
        fullName: "",
        email: "",
        phone: "",
        collegeName: "",
        employeeId: "",
        adminRole: "",
        department: ""
      };
    }
    
    res.json({ success: true, data: admin });
  } catch (err) {
    console.error("❌ Profile endpoint error:", err.message, err.code);
    res.status(500).json({ error: `${err.code || 'ERROR'}: ${err.message}` });
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
