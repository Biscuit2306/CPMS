const express = require("express");
const router = express.Router();
const Recruiter = require("../models/recruiter");

// Register a new recruiter
router.post("/register", async (req, res) => {
  try {
    const { name, company, email, password, position } = req.body;
    const recruiter = new Recruiter({ name, company, email, password, position });
    await recruiter.save();
    res.status(201).json({ message: "Recruiter registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
