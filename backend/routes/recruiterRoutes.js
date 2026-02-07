const express = require("express");
const router = express.Router();
const Recruiter = require("../models/Recruiter");

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

// Get recruiter dashboard
router.get("/dashboard/:uid", async (req, res) => {
  try {
    let recruiter = await Recruiter.findOne({
      firebaseUid: req.params.uid,
    });

    // If recruiter doesn't exist, create a default one
    if (!recruiter) {
      recruiter = await Recruiter.create({
        firebaseUid: req.params.uid,
        fullName: "",
        email: "",
        phone: "",
        companyName: "",
        designation: "",
        companyWebsite: "",
        companySize: ""
      });
    }

    res.json(recruiter);
  } catch (err) {
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

    res.json({ success: true, data: recruiter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update recruiter profile
router.put("/profile/:uid", async (req, res) => {
  try {
    const recruiter = await Recruiter.findOneAndUpdate(
      { firebaseUid: req.params.uid },
      req.body,
      { new: true, runValidators: true }
    );
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter not found" });
    }
    res.json({ success: true, data: recruiter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
