const JobDrive = require("../models/JobDrive");
const Recruiter = require("../models/Recruiter");

class DriveRiskEngine {
  // Average salary baseline (in INR) - can be updated with real data
  static AVERAGE_SALARY = 1200000;

  /**
   * Calculate risk score for a job drive
   * @param {Object} drive - JobDrive document
   * @returns {Object} Risk analysis result
   */
  static async evaluateDriveRisk(drive) {
    let score = 0;
    const flags = [];

    try {
      // Get recruiter info for additional context
      // Try to find by ObjectId first, then by firebaseUid
      let recruiter = null;
      try {
        recruiter = await Recruiter.findById(drive.recruiterId);
      } catch (err) {
        // If findById fails, try finding by firebaseUid
        recruiter = await Recruiter.findOne({ firebaseUid: drive.recruiterId }).catch(() => null);
      }

      if (!recruiter) {
        recruiter = await Recruiter.findOne({ firebaseUid: drive.recruiterId }).catch(() => null);
      }

      // ─── 1️⃣ Unrealistic Salary Detection ──────────────────────────
      if (drive.salary) {
        try {
          // Parse salary - handles both string and number formats
          let salaryValue = typeof drive.salary === "string" ? parseInt(drive.salary) : drive.salary;

          if (salaryValue > this.AVERAGE_SALARY * 3) {
            score += 30;
            flags.push(`Unrealistic salary (₹${salaryValue.toLocaleString()} - 3x+ market average)`);
          } else if (salaryValue > this.AVERAGE_SALARY * 2) {
            score += 15;
            flags.push(`Exceptionally high salary (₹${salaryValue.toLocaleString()} - 2x market average)`);
          }
        } catch (err) {
          console.error("Error parsing salary:", err);
        }
      }

      // ─── 2️⃣ New Recruiter Posting Too Fast ────────────────────────
      if (recruiter && recruiter.createdAt) {
        const daysSinceCreation = Math.floor((Date.now() - recruiter.createdAt.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceCreation < 7) {
          score += 25;
          flags.push(`Very new recruiter account (${daysSinceCreation} days old)`);
        } else if (daysSinceCreation < 30) {
          score += 10;
          flags.push(`New recruiter account (${daysSinceCreation} days old)`);
        }
      }

      // ─── 3️⃣ Suspicious Job Description ────────────────────────────
      if (drive.jobDescription) {
        const descLength = drive.jobDescription.trim().length;

        if (descLength < 50) {
          score += 20;
          flags.push(`Extremely short job description (${descLength} characters)`);
        } else if (descLength < 150) {
          score += 10;
          flags.push(`Brief job description (${descLength} characters)`);
        }

        // Check for copy-paste patterns (repeated text)
        const words = drive.jobDescription.toLowerCase().split(/\s+/);
        const uniqueWords = new Set(words);
        const repetitionRate = (words.length - uniqueWords.size) / words.length;

        if (repetitionRate > 0.4) {
          score += 15;
          flags.push("Suspected copy-paste pattern in job description");
        }
      }

      // ─── 4️⃣ Too Many Drives in Short Time ──────────────────────────
      if (drive.recruiterId) {
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentDriveCount = await JobDrive.countDocuments({
          recruiterId: drive.recruiterId,
          createdAt: { $gte: last24Hours },
          _id: { $ne: drive._id },
        });

        if (recentDriveCount > 5) {
          score += 25;
          flags.push(`Too many drives posted in 24 hours (${recentDriveCount + 1} total)`);
        } else if (recentDriveCount > 2) {
          score += 10;
          flags.push(`Multiple drives posted recently (${recentDriveCount + 1} in 24 hours)`);
        }
      }

      // ─── 5️⃣ Missing Essential Information ──────────────────────────
      const requiredFields = ["company", "position", "jobDescription", "location"];
      const missingFields = requiredFields.filter((field) => !drive[field] || drive[field].trim() === "");

      if (missingFields.length > 0) {
        score += 12;
        flags.push(`Missing essential info (${missingFields.join(", ")})`);
      }

      // ─── 6️⃣ No Company Website Provided ────────────────────────────
      if (!drive.companyWebsite || drive.companyWebsite.trim() === "") {
        score += 10;
        flags.push("No company website provided");
      }

      // ─── 7️⃣ Invalid Deadline ────────────────────────────────────────
      if (drive.applicationDeadline && drive.date) {
        if (drive.applicationDeadline <= drive.date) {
          score += 20;
          flags.push("Application deadline is before or on the drive date");
        }

        const daysUntilDeadline = Math.floor(
          (drive.applicationDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilDeadline < 0) {
          score += 15;
          flags.push("Application deadline has already passed");
        } else if (daysUntilDeadline < 1) {
          score += 10;
          flags.push("Deadline is within 24 hours");
        }
      }

      // ─── 8️⃣ Duplicate Job Posting ──────────────────────────────────
      const similarDrives = await JobDrive.countDocuments({
        company: drive.company,
        position: drive.position,
        recruiterId: drive.recruiterId,
        _id: { $ne: drive._id },
      });

      if (similarDrives > 0) {
        score += 15;
        flags.push(`Duplicate job posting (${similarDrives} other identical posting${similarDrives > 1 ? "s" : ""})`);
      }

      // ─── 9️⃣ Recruiter Verification Status ───────────────────────────
      if (recruiter) {
        if (!recruiter.companyName || recruiter.companyName.trim() === "") {
          score += 15;
          flags.push("Recruiter has no verified company name");
        }

        if (recruiter.riskAnalysis && recruiter.riskAnalysis.riskLevel === "high") {
          score += 30;
          flags.push("Recruiter account flagged as high-risk");
        }
      }

      // ─── Determine Risk Level ───────────────────────────────────
      let riskLevel = "low";
      if (score >= 70) {
        riskLevel = "high";
      } else if (score >= 40) {
        riskLevel = "medium";
      }

      // ─── Auto-block if high level ───────────────────────────────
      const autoBlocked = score >= 75;

      // ─── Update Risk Analysis ───────────────────────────────────
      drive.riskAnalysis = {
        riskScore: Math.min(score, 100),
        riskLevel,
        flags,
        autoBlocked,
        lastEvaluated: new Date(),
      };

      return {
        success: true,
        riskAnalysis: drive.riskAnalysis,
        autoBlocked,
      };
    } catch (error) {
      console.error("Error in evaluateDriveRisk:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get Drive Risk Summary
   * @returns {Object} Risk summary
   */
  static async getDriveRiskSummary() {
    try {
      const stats = await JobDrive.aggregate([
        {
          $group: {
            _id: "$riskAnalysis.riskLevel",
            count: { $sum: 1 },
          },
        },
      ]);

      const autoBlockedCount = await JobDrive.countDocuments({
        "riskAnalysis.autoBlocked": true,
      });

      const summary = {
        high: 0,
        medium: 0,
        low: 0,
        autoBlocked: autoBlockedCount,
      };

      stats.forEach((stat) => {
        if (stat._id) {
          summary[stat._id] = stat.count;
        }
      });

      return {
        success: true,
        summary,
      };
    } catch (error) {
      console.error("Error in getDriveRiskSummary:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get High Risk Drives
   * @param {Number} limit - Maximum number of results
   * @returns {Object} High risk drives
   */
  static async getHighRiskDrives(limit = 50) {
    try {
      const highRiskDrives = await JobDrive.find({
        "riskAnalysis.riskLevel": { $in: ["high", "medium"] },
      })
        .select("company position salary riskAnalysis recruiterId date")
        .limit(limit)
        .sort({ "riskAnalysis.riskScore": -1 });

      // Fetch recruiter info separately since recruiterId is a string, not an ObjectId reference
      const drivesWithRecruiter = await Promise.all(
        highRiskDrives.map(async (drive) => {
          // Try to find by MongoDB ObjectId first, then by firebaseUid
          const recruiter = await Recruiter.findById(drive.recruiterId).select("fullName companyName email")
            .catch(() => null) || 
            await Recruiter.findOne({ firebaseUid: drive.recruiterId }).select("fullName companyName email")
              .catch(() => null);
          
          return {
            ...drive.toObject(),
            recruiter: recruiter || { fullName: "Unknown", companyName: "N/A", email: "" },
          };
        })
      );

      return {
        success: true,
        drives: drivesWithRecruiter,
      };
    } catch (error) {
      console.error("Error in getHighRiskDrives:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get Auto-blocked Drives
   * @param {Number} limit - Maximum number of results
   * @returns {Object} Auto-blocked drives
   */
  static async getAutoBlockedDrives(limit = 50) {
    try {
      const blockedDrives = await JobDrive.find({
        "riskAnalysis.autoBlocked": true,
      })
        .select("company position salary riskAnalysis recruiterId")
        .limit(limit)
        .sort({ "riskAnalysis.riskScore": -1 });

      // Fetch recruiter info separately since recruiterId is a string, not an ObjectId reference
      const drivesWithRecruiter = await Promise.all(
        blockedDrives.map(async (drive) => {
          // Try to find by MongoDB ObjectId first, then by firebaseUid
          const recruiter = await Recruiter.findById(drive.recruiterId).select("fullName companyName email")
            .catch(() => null) || 
            await Recruiter.findOne({ firebaseUid: drive.recruiterId }).select("fullName companyName email")
              .catch(() => null);
          
          return {
            ...drive.toObject(),
            recruiter: recruiter || { fullName: "Unknown", companyName: "N/A", email: "" },
          };
        })
      );

      return {
        success: true,
        drives: drivesWithRecruiter,
      };
    } catch (error) {
      console.error("Error in getAutoBlockedDrives:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Re-evaluate all job drives (from both JobDrive collection and embedded in Recruiter)
   * (Typically called by a scheduled cron job)
   */
  static async reevaluateAllDrives() {
    try {
      let processed = 0;
      let errors = 0;
      let autoBlocked = 0;

      // 1️⃣ EVALUATE DRIVES IN JOBDRIVE COLLECTION
      console.log("  📊 Checking JobDrive collection...");
      const jobDrives = await JobDrive.find({});
      console.log(`     Found ${jobDrives.length} drives in JobDrive collection`);

      for (const drive of jobDrives) {
        try {
          const result = await this.evaluateDriveRisk(drive);
          if (result.success) {
            if (result.autoBlocked) {
              autoBlocked++;
            }
            await drive.save();
            processed++;
          } else {
            errors++;
          }
        } catch (err) {
          console.error(`    ❌ Error evaluating drive ${drive._id}:`, err.message);
          errors++;
        }
      }

      // 2️⃣ ALSO EVALUATE EMBEDDED DRIVES IN RECRUITER COLLECTION
      // (In case old drives are only stored as embedded documents)
      console.log("  📊 Checking embedded drives in Recruiter collection...");
      const recruiters = await Recruiter.find({ "jobDrives.0": { $exists: true } });
      console.log(`     Found ${recruiters.length} recruiters with embedded drives`);

      let embeddedProcessed = 0;
      for (const recruiter of recruiters) {
        if (!recruiter.jobDrives || recruiter.jobDrives.length === 0) continue;

        let recruiterUpdated = false;

        for (let i = 0; i < recruiter.jobDrives.length; i++) {
          const drive = recruiter.jobDrives[i];
          
          // Skip if already deleted/blocked
          if (drive.isDeleted || drive.isBlocked) continue;

          try {
            // Check if this drive already has risk analysis and is recent
            if (drive.riskAnalysis && drive.riskAnalysis.lastEvaluated) {
              const lastEvalDays = Math.floor((Date.now() - drive.riskAnalysis.lastEvaluated.getTime()) / (1000 * 60 * 60 * 24));
              if (lastEvalDays < 1) {
                // Already evaluated today, skip
                continue;
              }
            }

            const result = await this.evaluateDriveRisk(drive);
            if (result.success) {
              recruiter.jobDrives[i].riskAnalysis = result.riskAnalysis;
              if (result.autoBlocked) {
                recruiter.jobDrives[i].status = "blocked";
                autoBlocked++;
              }
              processed++;
              embeddedProcessed++;
              recruiterUpdated = true;
            } else {
              errors++;
            }
          } catch (err) {
            console.error(`    ❌ Error evaluating embedded drive for ${recruiter.fullName}:`, err.message);
            errors++;
          }
        }

        // 🔥 CRITICAL: Save the recruiter document once after all drives are processed
        // Mongoose Mixed type arrays require markModified() to track nested changes
        if (recruiterUpdated) {
          try {
            recruiter.markModified('jobDrives');
            await recruiter.save();
            console.log(`     ✅ Saved risk data for recruiter: ${recruiter.fullName}`);
          } catch (err) {
            console.error(`    ❌ Error saving recruiter ${recruiter.fullName}:`, err.message);
            errors++;
          }
        }
      }

      console.log(`     Processed ${embeddedProcessed} embedded drives`);

      return {
        success: true,
        processed,
        errors,
        autoBlocked,
        total: jobDrives.length + embeddedProcessed,
      };
    } catch (error) {
      console.error("Error in reevaluateAllDrives:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Approve a flagged drive for admin override
   * @param {String} driveId - Drive ID
   * @param {String} adminId - Admin ID
   * @param {String} reason - Reason for approval
   */
  static async approveFlaggedDrive(driveId, adminId, reason = "") {
    try {
      const drive = await JobDrive.findByIdAndUpdate(
        driveId,
        {
          "riskAnalysis.autoBlocked": false,
          "riskAnalysis.approvedBy": adminId,
          "riskAnalysis.approvalReason": reason,
          "riskAnalysis.approvedAt": new Date(),
        },
        { new: true }
      );

      return {
        success: true,
        drive,
      };
    } catch (error) {
      console.error("Error in approveFlaggedDrive:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = DriveRiskEngine;
