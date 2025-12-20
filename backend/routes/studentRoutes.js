const express = require("express");
const router = express.Router();
const Student = require("../models/student");

// Register a new student
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, college, branch, year } = req.body;
    const student = new Student({ name, email, password, college, branch, year });
    await student.save();
    res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
