const RiskEngine = require("../services/riskEngine");
const DriveRiskEngine = require("../services/driveRiskEngine");
const Student = require("../models/Student");
const Recruiter = require("../models/Recruiter");
const JobDrive = require("../models/JobDrive");

// ─── STUDENT & RECRUITER RISK MANAGEMENT ─────────────────────────────────

/**
 * GET /admin/risk/account-summary
 * Get summary of account risk levels
 */
exports.getAccountRiskSummary = async (req, res) => {
  try {
    const result = await RiskEngine.getRiskSummary();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.summary,
    });
  } catch (error) {
    console.error("Error in getAccountRiskSummary:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /admin/risk/high-risk-accounts
 * Get high risk student and recruiter accounts
 */
exports.getHighRiskAccounts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const result = await RiskEngine.getHighRiskAccounts(limit);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: {
        students: result.students,
        recruiters: result.recruiters,
      },
    });
  } catch (error) {
    console.error("Error in getHighRiskAccounts:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /admin/risk/student/:studentId
 * Get detailed risk analysis for a student
 */
exports.getStudentRiskDetail = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).select(
      "fullName email phone rollNo branch riskAnalysis createdAt"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    res.json({
      success: true,
      data: {
        student,
        riskAnalysis: student.riskAnalysis,
      },
    });
  } catch (error) {
    console.error("Error in getStudentRiskDetail:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /admin/risk/recruiter/:recruiterId
 * Get detailed risk analysis for a recruiter
 */
exports.getRecruiterRiskDetail = async (req, res) => {
  try {
    const { recruiterId } = req.params;

    const recruiter = await Recruiter.findById(recruiterId).select(
      "fullName email phone companyName designation riskAnalysis createdAt"
    );

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        error: "Recruiter not found",
      });
    }

    res.json({
      success: true,
      data: {
        recruiter,
        riskAnalysis: recruiter.riskAnalysis,
      },
    });
  } catch (error) {
    console.error("Error in getRecruiterRiskDetail:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /admin/risk/re-evaluate
 * Re-evaluate all accounts
 */
exports.reevaluateAllAccounts = async (req, res) => {
  try {
    const studentResult = await RiskEngine.reevaluateAllStudents();
    const recruiterResult = await RiskEngine.reevaluateAllRecruiters();

    res.json({
      success: true,
      data: {
        students: studentResult,
        recruiters: recruiterResult,
      },
    });
  } catch (error) {
    console.error("Error in reevaluateAllAccounts:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /admin/risk/mark-safe
 * Mark an account as safe (override risk)
 */
exports.markAccountSafe = async (req, res) => {
  try {
    const { accountId, type } = req.body; // type: 'student' or 'recruiter'

    if (!accountId || !type) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    let account;

    if (type === "student") {
      account = await Student.findByIdAndUpdate(
        accountId,
        {
          "riskAnalysis.riskScore": 0,
          "riskAnalysis.riskLevel": "low",
          "riskAnalysis.flags": [],
          "riskAnalysis.overriddenBy": req.user.uid,
          "riskAnalysis.overridenAt": new Date(),
        },
        { new: true }
      );
    } else if (type === "recruiter") {
      account = await Recruiter.findByIdAndUpdate(
        accountId,
        {
          "riskAnalysis.riskScore": 0,
          "riskAnalysis.riskLevel": "low",
          "riskAnalysis.flags": [],
          "riskAnalysis.overriddenBy": req.user.uid,
          "riskAnalysis.overriddenAt": new Date(),
        },
        { new: true }
      );
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid account type",
      });
    }

    if (!account) {
      return res.status(404).json({
        success: false,
        error: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
      });
    }

    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error("Error in markAccountSafe:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ─── JOB DRIVE RISK MANAGEMENT ────────────────────────────────────────────

/**
 * GET /admin/risk/drive-summary
 * Get summary of job drive risk levels
 */
exports.getDriveRiskSummary = async (req, res) => {
  try {
    const result = await DriveRiskEngine.getDriveRiskSummary();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.summary,
    });
  } catch (error) {
    console.error("Error in getDriveRiskSummary:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /admin/risk/high-risk-drives
 * Get high risk job drives
 */
exports.getHighRiskDrives = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const result = await DriveRiskEngine.getHighRiskDrives(limit);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.drives,
    });
  } catch (error) {
    console.error("Error in getHighRiskDrives:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /admin/risk/auto-blocked-drives
 * Get auto-blocked job drives
 */
exports.getAutoBlockedDrives = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const result = await DriveRiskEngine.getAutoBlockedDrives(limit);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.drives,
    });
  } catch (error) {
    console.error("Error in getAutoBlockedDrives:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /admin/risk/drive/:driveId
 * Get detailed risk analysis for a job drive
 */
exports.getDriveRiskDetail = async (req, res) => {
  try {
    const { driveId } = req.params;

    const drive = await JobDrive.findById(driveId);

    if (!drive) {
      return res.status(404).json({
        success: false,
        error: "Job drive not found",
      });
    }

    // Fetch recruiter info separately since recruiterId is a string, not an ObjectId reference
    let recruiter = null;
    if (drive.recruiterId) {
      recruiter = await Recruiter.findById(drive.recruiterId).select("fullName email companyName designation")
        .catch(() => null) ||
        await Recruiter.findOne({ firebaseUid: drive.recruiterId }).select("fullName email companyName designation")
          .catch(() => null);
    }

    res.json({
      success: true,
      data: {
        drive,
        recruiter,
        riskAnalysis: drive.riskAnalysis,
      },
    });
  } catch (error) {
    console.error("Error in getDriveRiskDetail:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /admin/risk/drives/re-evaluate
 * Re-evaluate all job drives
 */
exports.reevaluateAllDrives = async (req, res) => {
  try {
    const result = await DriveRiskEngine.reevaluateAllDrives();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in reevaluateAllDrives:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /admin/risk/drive/approve
 * Approve an auto-blocked drive
 */
exports.approveFlaggedDrive = async (req, res) => {
  try {
    const { driveId, reason } = req.body;

    if (!driveId) {
      return res.status(400).json({
        success: false,
        error: "Missing driveId",
      });
    }

    const result = await DriveRiskEngine.approveFlaggedDrive(driveId, req.user.uid, reason || "");

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.drive,
    });
  } catch (error) {
    console.error("Error in approveFlaggedDrive:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /admin/risk/drive/reject
 * Reject/block a job drive
 */
exports.rejectDrive = async (req, res) => {
  try {
    const { driveId, reason } = req.body;

    if (!driveId) {
      return res.status(400).json({
        success: false,
        error: "Missing driveId",
      });
    }

    const drive = await JobDrive.findByIdAndUpdate(
      driveId,
      {
        status: "blocked",
        isBlocked: true,
        blockedBy: {
          adminFirebaseUid: req.user.uid,
          adminName: req.user.name || "Admin",
          reason: reason || "Flagged as risky",
          blockedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!drive) {
      return res.status(404).json({
        success: false,
        error: "Job drive not found",
      });
    }

    res.json({
      success: true,
      data: drive,
    });
  } catch (error) {
    console.error("Error in rejectDrive:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
