const axios = require("axios");
const ScrapedJob = require("../models/ScrapedJob");

/**
 * Fetch jobs from RapidAPI JSearch and store in MongoDB
 * Call this via cron job every hour or manually
 */
async function fetchAndStoreJobsFromRapidAPI() {
  try {
    console.log("\n🚀 Starting RapidAPI Job Fetch...");
    console.log("📅 Time:", new Date().toLocaleString());

    const RAPID_API_KEY = process.env.RAPID_API_KEY;
    const RAPID_API_HOST = "jsearch.p.rapidapi.com";

    if (!RAPID_API_KEY) {
      console.error("❌ RAPID_API_KEY not found in .env");
      return { success: false, message: "API Key missing" };
    }

    // Search queries for student jobs (Internships + Fresher + Entry-level)
    const searchQueries = [
      "internship developer India",
      "fresher software engineer",
      "entry level Java developer",
      "junior frontend developer internship",
      "graduate trainee India",
    ];

    let totalJobsProcessed = 0;
    let jobsAdded = 0;
    let jobsUpdated = 0;

    for (const query of searchQueries) {
      try {
        console.log(`\n🔍 Searching for: "${query}"`);

        const response = await axios.get(
          "https://jsearch.p.rapidapi.com/search",
          {
            params: {
              query: query,
              page: "1",
              num_pages: "1", // 10 jobs per page
              date_posted: "month", // Posted within last 30 days
              country: "India", // Focus on India
            },
            headers: {
              "X-RapidAPI-Key": RAPID_API_KEY,
              "X-RapidAPI-Host": RAPID_API_HOST,
            },
          }
        );

        const jobs = response.data?.data || [];
        console.log(`   ✅ Found ${jobs.length} jobs`);

        for (const job of jobs) {
          try {
            // Create unique external ID from API
            const externalJobId = `jsearch_${job.job_id}`;

            // Parse salary info
            let salary = "Not Disclosed";
            if (job.job_salary_currency_code && job.job_salary_period) {
              const minSal = job.job_salary_min || "N/A";
              const maxSal = job.job_salary_max || "N/A";
              const currency = job.job_salary_currency_code;

              if (minSal !== "N/A" && maxSal !== "N/A") {
                salary = `${currency} ${minSal} - ${maxSal} per ${job.job_salary_period}`;
              }
            }

            // Determine job type
            let jobType = "Full-time";
            if (job.job_employment_type) {
              const type = job.job_employment_type.toLowerCase();
              if (type.includes("intern")) jobType = "Internship";
              else if (type.includes("part")) jobType = "Part-time";
              else if (type.includes("contract")) jobType = "Contract";
            }

            // Prepare job data
            const jobData = {
              company: job.employer_name || "Unknown Company",
              position: job.job_title || "Unknown Position",
              location: job.job_city
                ? `${job.job_city}, ${job.job_country || "India"}`
                : "Remote",
              jobDescription: job.job_description || "No description available",
              about: job.employer_company_type || "Company",
              salary: salary,
              jobType: jobType,
              companyWebsite: job.employer_website || "",
              applyLink: job.job_apply_link || "",
              externalJobId: externalJobId,
              source: "RapidAPI",
              status: "active",

              // Set deadline to 30 days from now for external jobs
              applicationDeadline: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ),

              // Add eligibility (can be customized later)
              eligibilityCriteria: {
                minCGPA: 0,
                allowedBranches: [],
                yearsEligible: ["All Years"],
              },
            };

            // Update or insert using upsert
            const result = await ScrapedJob.updateOne(
              { externalJobId: externalJobId },
              jobData,
              {
                upsert: true,
                new: true,
              }
            );

            if (result.upsertedId) {
              jobsAdded++;
            } else if (result.modifiedCount > 0) {
              jobsUpdated++;
            }

            totalJobsProcessed++;
          } catch (jobError) {
            console.error(
              `   ⚠️ Error processing job: ${job.job_title}`,
              jobError.message
            );
          }
        }

        // Rate limit - wait 1 second between API calls
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (queryError) {
        console.error(
          `   ❌ Error fetching query "${query}":`,
          queryError.message
        );
      }
    }

    // Mark expired jobs
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const expiredResult = await ScrapedJob.updateMany(
      {
        createdAt: { $lt: thirtyDaysAgo },
        status: "active",
      },
      {
        status: "expired",
        isExpired: true,
      }
    );

    const summary = {
      success: true,
      totalJobsProcessed,
      jobsAdded,
      jobsUpdated,
      jobsExpired: expiredResult.modifiedCount,
      timestamp: new Date().toLocaleString(),
    };

    console.log("\n✅ RapidAPI Job Fetch Complete!");
    console.log("📊 Summary:", summary);

    return summary;
  } catch (error) {
    console.error("\n❌ Fatal Error in RapidAPI Fetch:", error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toLocaleString(),
    };
  }
}

/**
 * Get filtered jobs for students
 */
async function getJobsForStudents(filters = {}) {
  try {
    const query = {
      status: "active",
      isExpired: false,
      applicationDeadline: { $gt: new Date() }, // Only future deadlines
    };

    // Location filter
    if (filters.location) {
      query.location = { $regex: filters.location, $options: "i" };
    }

    // Job type filter
    if (filters.jobType) {
      query.jobType = filters.jobType;
    }

    // Salary filter (min amount)
    if (filters.minSalary) {
      // This is a basic filter - you might want to enhance this
      query.salary = { $regex: filters.minSalary, $options: "i" };
    }

    // Company filter
    if (filters.company) {
      query.company = { $regex: filters.company, $options: "i" };
    }

    // Search in title or description
    if (filters.search) {
      query.$or = [
        { position: { $regex: filters.search, $options: "i" } },
        { company: { $regex: filters.search, $options: "i" } },
        { jobDescription: { $regex: filters.search, $options: "i" } },
      ];
    }

    const jobs = await ScrapedJob.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .lean();

    return {
      success: true,
      count: jobs.length,
      jobs: jobs,
    };
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Mark job as viewed by student
 */
async function markJobViewed(jobId) {
  try {
    await ScrapedJob.findByIdAndUpdate(
      jobId,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    return { success: true };
  } catch (error) {
    console.error("Error marking job as viewed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Save/unsave job for student
 */
async function toggleSaveJob(jobId, studentFirebaseUid) {
  try {
    const job = await ScrapedJob.findById(jobId);

    if (!job) {
      return { success: false, error: "Job not found" };
    }

    const isSaved = job.savedByStudents.includes(studentFirebaseUid);

    if (isSaved) {
      // Remove student from saved list
      await ScrapedJob.findByIdAndUpdate(
        jobId,
        { $pull: { savedByStudents: studentFirebaseUid } },
        { new: true }
      );
    } else {
      // Add student to saved list
      await ScrapedJob.findByIdAndUpdate(
        jobId,
        { $addToSet: { savedByStudents: studentFirebaseUid } },
        { new: true }
      );
    }

    return {
      success: true,
      saved: !isSaved,
    };
  } catch (error) {
    console.error("Error toggling save job:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  fetchAndStoreJobsFromRapidAPI,
  getJobsForStudents,
  markJobViewed,
  toggleSaveJob,
};
