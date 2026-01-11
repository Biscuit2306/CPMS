const express = require("express");
const router = express.Router();
const User = require("../models/user");

/* =========================
   REGISTER USER
========================= */
router.post("/register", async (req, res) => {
  try {
    const {
      firebaseUid,
      role,
      name,
      username,
      email,
      studentId,
      collegeName,
      companyId,
      companyName
    } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    const user = await User.create({
      firebaseUid,
      role,
      name,
      username,
      email,
      studentId,
      collegeName,
      companyId,
      companyName
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   GET USER BY FIREBASE UID
========================= */
router.get("/:firebaseUid", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   GET USER BY USERNAME
========================= */
router.get("/username/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: "Username not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
