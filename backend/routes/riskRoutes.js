const express = require("express");
const router = express.Router();
const riskController = require("../controllers/riskController");

// ─── ACCOUNT RISK ENDPOINTS ──────────────────────────────────────────────

/**
 * GET /admin/risk/account-summary
 * Get summary of account risk levels
 */
router.get("/account-summary", riskController.getAccountRiskSummary);

/**
 * GET /admin/risk/high-risk-accounts
 * Get high risk student and recruiter accounts
 */
router.get("/high-risk-accounts", riskController.getHighRiskAccounts);

/**
 * GET /admin/risk/student/:studentId
 * Get detailed risk analysis for a student
 */
router.get("/student/:studentId", riskController.getStudentRiskDetail);

/**
 * GET /admin/risk/recruiter/:recruiterId
 * Get detailed risk analysis for a recruiter
 */
router.get("/recruiter/:recruiterId", riskController.getRecruiterRiskDetail);

/**
 * POST /admin/risk/re-evaluate
 * Re-evaluate all accounts
 */
router.post("/re-evaluate", riskController.reevaluateAllAccounts);

/**
 * POST /admin/risk/mark-safe
 * Mark an account as safe (override risk)
 */
router.post("/mark-safe", riskController.markAccountSafe);

// ─── JOB DRIVE RISK ENDPOINTS ────────────────────────────────────────────

/**
 * GET /admin/risk/drive-summary
 * Get summary of job drive risk levels
 */
router.get("/drive-summary", riskController.getDriveRiskSummary);

/**
 * GET /admin/risk/high-risk-drives
 * Get high risk job drives
 */
router.get("/high-risk-drives", riskController.getHighRiskDrives);

/**
 * GET /admin/risk/auto-blocked-drives
 * Get auto-blocked job drives
 */
router.get("/auto-blocked-drives", riskController.getAutoBlockedDrives);

/**
 * GET /admin/risk/drive/:driveId
 * Get detailed risk analysis for a job drive
 */
router.get("/drive/:driveId", riskController.getDriveRiskDetail);

/**
 * POST /admin/risk/drives/re-evaluate
 * Re-evaluate all job drives
 */
router.post("/drives/re-evaluate", riskController.reevaluateAllDrives);

/**
 * POST /admin/risk/drive/approve
 * Approve an auto-blocked drive
 */
router.post("/drive/approve", riskController.approveFlaggedDrive);

/**
 * POST /admin/risk/drive/reject
 * Reject/block a job drive
 */
router.post("/drive/reject", riskController.rejectDrive);

module.exports = router;
