const express = require("express");
const router = express.Router();
const {
  getJobsForStudents,
  markJobViewed,
  toggleSaveJob,
} = require("../services/scrapedJobsService");

/**
 * GET /api/scraped-jobs
 * Fetch all active scraped jobs with filters
 * Query params: location, jobType, search, limit
 */
router.get("/", async (req, res) => {
  try {
    const filters = {
      location: req.query.location,
      jobType: req.query.jobType,
      company: req.query.company,
      search: req.query.search,
      minSalary: req.query.minSalary,
      limit: parseInt(req.query.limit) || 50,
    };

    // Remove undefined filters
    Object.keys(filters).forEach(
      (key) => filters[key] === undefined && delete filters[key]
    );

    const result = await getJobsForStudents(filters);

    if (result.success) {
      res.json({
        success: true,
        count: result.count,
        jobs: result.jobs,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in GET /scraped-jobs:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/scraped-jobs/:jobId
 * Get single job details
 */
router.get("/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;

    const ScrapedJob = require("../models/ScrapedJob");
    const job = await ScrapedJob.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    // Mark as viewed
    await markJobViewed(jobId);

    res.json({
      success: true,
      job: job,
    });
  } catch (error) {
    console.error("Error fetching job details:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/scraped-jobs/:jobId/save
 * Save/unsave job for student
 * Body: { studentFirebaseUid }
 */
router.post("/:jobId/save", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { studentFirebaseUid } = req.body;

    if (!studentFirebaseUid) {
      return res.status(400).json({
        success: false,
        error: "Student Firebase UID required",
      });
    }

    const result = await toggleSaveJob(jobId, studentFirebaseUid);

    res.json(result);
  } catch (error) {
    console.error("Error saving job:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/scraped-jobs/student/:studentFirebaseUid/saved
 * Get all saved jobs for a student
 */
router.get("/student/:studentFirebaseUid/saved", async (req, res) => {
  try {
    const { studentFirebaseUid } = req.params;

    const ScrapedJob = require("../models/ScrapedJob");
    const savedJobs = await ScrapedJob.find({
      savedByStudents: studentFirebaseUid,
      status: "active",
      isExpired: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: savedJobs.length,
      jobs: savedJobs,
    });
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/scraped-jobs/stats
 * Get job statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const ScrapedJob = require("../models/ScrapedJob");

    const stats = {
      totalJobs: await ScrapedJob.countDocuments({ status: "active", isExpired: false }),
      byJobType: await ScrapedJob.aggregate([
        {
          $match: { status: "active", isExpired: false },
        },
        {
          $group: {
            _id: "$jobType",
            count: { $sum: 1 },
          },
        },
      ]),
      byLocation: await ScrapedJob.aggregate([
        {
          $match: { status: "active", isExpired: false },
        },
        {
          $group: {
            _id: "$location",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 10,
        },
      ]),
      topCompanies: await ScrapedJob.aggregate([
        {
          $match: { status: "active", isExpired: false },
        },
        {
          $group: {
            _id: "$company",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 10,
        },
      ]),
    };

    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
