const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

/* =========================
   REGISTER STUDENT
========================= */
router.post("/register", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* =========================
   GET STUDENT PROFILE
========================= */
router.get("/profile/:email", async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPDATE STUDENT PROFILE
========================= */
router.put("/profile/:email", async (req, res) => {
  try {
    // prevent password overwrite accidentally
    const { password, ...safeData } = req.body;

    const student = await Student.findOneAndUpdate(
      { email: req.params.email },
      safeData,
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
