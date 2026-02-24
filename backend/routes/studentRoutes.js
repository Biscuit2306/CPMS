const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// ─── Helper: Reusable block/delete check ─────────────────────
const checkAccountStatus = (student, action = "access this platform") => {
  if (student?.isBlocked || student?.isDeleted) {
    const reason = student.isDeleted ? "deleted" : "blocked";
    return {
      error: `Your account has been ${reason} by the administration. You cannot ${action}.`,
      isBlocked: student.isBlocked,
      isDeleted: student.isDeleted,
    };
  }
  return null;
};

// =======================================================
// 📊 DASHBOARD
// =======================================================

/* =========================
   GET DASHBOARD DATA (AUTO-CREATE STUDENT)
========================= */
router.get("/dashboard/:uid", async (req, res) => {
  try {
    console.log("\n📌 DASHBOARD REQUEST received for UID:", req.params.uid);

    let student = await Student.findOne({ firebaseUid: req.params.uid });

    // ✅ Block/delete check before serving dashboard
    const blocked = checkAccountStatus(student, "access this platform");
    if (blocked) return res.status(403).json(blocked);

    // ✅ Auto-create student if not found
    if (!student) {
      console.log("  ⚠️ Student not found - auto-creating...");
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
        certifications: [],
        upcomingDrives: [],
        applications: [],
        notices: [],
      });
      console.log("  ✅ New student created");
    }

    console.log("  ✅ Student found:", student.fullName);
    console.log("  📊 Applications count:", student.applications?.length || 0);
    if (student.applications?.length > 0) {
      student.applications.forEach((app, idx) => {
        console.log(`    [${idx}] driveId: ${app.driveId}, position: ${app.position}, status: ${app.applicationStatus}`);
      });
    }

    res.json(student);
  } catch (err) {
    console.error("❌ Dashboard error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 📝 APPLICATIONS
// =======================================================

/* =========================
   ADD APPLICATION
========================= */
router.post("/applications/:uid", async (req, res) => {
  try {
    const student = await Student.findOne({ firebaseUid: req.params.uid });

    // ✅ Block/delete check before allowing application
    const blocked = checkAccountStatus(student, "apply for positions");
    if (blocked) return res.status(403).json(blocked);

    const updatedStudent = await Student.findOneAndUpdate(
      { firebaseUid: req.params.uid },
      { $push: { applications: req.body } },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(updatedStudent.applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPDATE APPLICATION STATUS
========================= */
router.put("/applications/:uid/:appId", async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      {
        firebaseUid: req.params.uid,
        "applications._id": req.params.appId,
      },
      {
        $set: { "applications.$.status": req.body.status },
      },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student.applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETE APPLICATION
========================= */
router.delete("/applications/:uid/:appId", async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { firebaseUid: req.params.uid },
      { $pull: { applications: { _id: req.params.appId } } },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student.applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 👤 PROFILE
// =======================================================

/* =========================
   GET STUDENT PROFILE
========================= */
router.get("/profile/:uid", async (req, res) => {
  try {
    const student = await Student.findOne({ firebaseUid: req.params.uid });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // ✅ Block/delete check — still return student data for display purposes
    const blocked = checkAccountStatus(student, "access this platform");
    if (blocked) {
      return res.status(403).json({ ...blocked, student });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPDATE STUDENT PROFILE
========================= */
router.put("/profile/:uid", async (req, res) => {
  try {
    const student = await Student.findOne({ firebaseUid: req.params.uid });

    // ✅ Block/delete check before allowing profile update
    const blocked = checkAccountStatus(student, "update your profile");
    if (blocked) return res.status(403).json(blocked);

    const updatedStudent = await Student.findOneAndUpdate(
      { firebaseUid: req.params.uid },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(updatedStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;