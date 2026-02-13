const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

/* =========================
   DASHBOARD DATA (AUTO-CREATE STUDENT)
========================= */
router.get("/dashboard/:uid", async (req, res) => {
  try {
    let student = await Student.findOne({
      firebaseUid: req.params.uid,
    });

    // ✅ AUTO-CREATE STUDENT IF NOT FOUND
    if (!student) {
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
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADD APPLICATION
========================= */
router.post("/applications/:uid", async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { firebaseUid: req.params.uid },
      { $push: { applications: req.body } },
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
        $set: {
          "applications.$.status": req.body.status,
        },
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
      {
        $pull: {
          applications: { _id: req.params.appId },
        },
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
   UPDATE STUDENT PROFILE
========================= */
router.put("/profile/:uid", async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { firebaseUid: req.params.uid },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET STUDENT PROFILE
========================= */
router.get("/profile/:uid", async (req, res) => {
  try {
    const student = await Student.findOne({
      firebaseUid: req.params.uid,
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
