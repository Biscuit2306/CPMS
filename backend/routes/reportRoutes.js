const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const Recruiter = require("../models/Recruiter");

console.log("✅ reportRoutes.js loaded");

/* =========================
   CREATE PLACEMENT REPORT (RECRUITER)
========================= */
router.post("/", async (req, res) => {
  try {
    const {
      recruiterFirebaseUid,
      adminFirebaseUid,
      reportType,
      dateFrom,
      dateTo,
      totalApplicants,
      selectedCandidates,
      activeDrives,
      successRate,
      company,
    } = req.body;

    // Validate that either recruiterFirebaseUid or adminFirebaseUid is provided
    if (!recruiterFirebaseUid && !adminFirebaseUid) {
      return res.status(400).json({
        error: "Missing recruiterFirebaseUid or adminFirebaseUid",
      });
    }

    // Handle Recruiter Report
    if (recruiterFirebaseUid) {
      // Find recruiter
      let recruiter;
      try {
        recruiter = await Recruiter.findOne({
          firebaseUid: recruiterFirebaseUid,
        });
      } catch (dbErr) {
        console.error("Database error finding recruiter:", dbErr);
        return res.status(500).json({
          error: "Database error while fetching recruiter information",
        });
      }

      if (!recruiter) {
        return res.status(404).json({
          error: "Recruiter not found. Please complete your profile first.",
        });
      }

      // Create recruiter report
      const report = new Report({
        recruiterFirebaseUid,
        recruiterId: recruiter._id,
        reportType: reportType || "overview",
        dateFrom: dateFrom ? new Date(dateFrom) : null,
        dateTo: dateTo ? new Date(dateTo) : null,
        statistics: {
          totalApplicants: totalApplicants || 0,
          selectedCandidates: selectedCandidates || 0,
          activeDrives: activeDrives || 0,
          successRate: successRate || 0,
          company: company || "",
        },
        fileName: `report_${reportType}_${new Date().getTime()}.csv`,
      });

      await report.save();

      console.log(`✅ Report created successfully for recruiter: ${recruiterFirebaseUid}`);

      return res.json({
        success: true,
        message: "Report generated successfully",
        data: report,
      });
    }

    // Handle Admin Report
    if (adminFirebaseUid) {
      const report = new Report({
        adminFirebaseUid,
        reportType: reportType || "overview",
        dateFrom: dateFrom ? new Date(dateFrom) : null,
        dateTo: dateTo ? new Date(dateTo) : null,
        statistics: {
          totalApplicants: totalApplicants || 0,
          selectedCandidates: selectedCandidates || 0,
          activeDrives: activeDrives || 0,
          successRate: successRate || 0,
          company: company || "",
        },
        fileName: `report_${reportType}_${new Date().getTime()}.csv`,
      });

      await report.save();

      console.log(`✅ Report created successfully for admin: ${adminFirebaseUid}`);

      return res.json({
        success: true,
        message: "Report generated successfully",
        data: report,
      });
    }
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({
      error: "Failed to generate report",
      details: err.message,
    });
  }
});

/* =========================
   GET ALL REPORTS (RECRUITER)
========================= */
router.get("/recruiter/:recruiterFirebaseUid", async (req, res) => {
  try {
    const { recruiterFirebaseUid } = req.params;

    const reports = await Report.find({
      recruiterFirebaseUid,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports,
    });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({
      error: "Failed to fetch reports",
      details: err.message,
    });
  }
});

/* =========================
   GET SINGLE REPORT
========================= */
router.get("/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        error: "Report not found",
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (err) {
    console.error("Error fetching report:", err);
    res.status(500).json({
      error: "Failed to fetch report",
      details: err.message,
    });
  }
});

/* =========================
   DELETE REPORT
========================= */
router.delete("/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findByIdAndDelete(reportId);

    if (!report) {
      return res.status(404).json({
        error: "Report not found",
      });
    }

    res.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({
      error: "Failed to delete report",
      details: err.message,
    });
  }
});

module.exports = router;