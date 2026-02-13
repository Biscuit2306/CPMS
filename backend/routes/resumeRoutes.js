const express = require("express");
const router = express.Router();

const {
  uploadStudentResume,
  analyzeStudentResume,
  getLatestResumeAnalysis
} = require("../controllers/resumeController");

const { uploadResume } = require("../middlewares/uploadResume");

router.post(
  "/upload",
 uploadResume.single("resume"),
  uploadStudentResume
);

router.post("/analyze", analyzeStudentResume);
router.get("/latest/:firebaseUid", getLatestResumeAnalysis);

module.exports = router;