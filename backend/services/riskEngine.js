const crypto = require("crypto");
const Student = require("../models/Student");
const Recruiter = require("../models/Recruiter");

class RiskEngine {
  /**
   * Calculate hash of resume content for duplicate detection
   * @param {String} resumeContent - Resume text content
   * @returns {String} SHA256 hash
   */
  static calculateResumeHash(resumeContent) {
    if (!resumeContent) return "";
    return crypto.createHash("sha256").update(resumeContent).digest("hex");
  }

  /**
   * Evaluate Student Risk Score
   * @param {Object} student - Student document
   * @param {String} registrationIP - IP address from registration
   * @returns {Object} Risk analysis result
   */
  static async evaluateStudentRisk(student, registrationIP = "") {
    let score = 0;
    const flags = [];
    let resumeHash = "";
    let registrationIPForAnalysis = registrationIP;

    try {
      // ─── 1️⃣ Duplicate Phone Number Check ─────────────────────────
      if (student.phone) {
        const duplicatePhones = await Student.countDocuments({
          phone: student.phone,
          _id: { $ne: student._id },
        });

        if (duplicatePhones > 0) {
          score += 40;
          flags.push(`Duplicate phone number (${duplicatePhones} other account${duplicatePhones > 1 ? "s" : ""})`);
        }
      }

      // ─── 2️⃣ Duplicate Resume Detection ──────────────────────────
      if (student.resume) {
        resumeHash = this.calculateResumeHash(student.resume);
        const duplicateResumes = await Student.countDocuments({
          "riskAnalysis.resumeHash": resumeHash,
          _id: { $ne: student._id },
        });

        if (duplicateResumes > 0) {
          score += 30;
          flags.push(`Duplicate resume detected (${duplicateResumes} other account${duplicateResumes > 1 ? "s" : ""})`);
        }
      }

      // ─── 3️⃣ Suspicious Email Pattern ────────────────────────────
      if (student.email) {
        const suspiciousPatterns = ["test", "fake", "123", "admin", "temp", "spam"];
        const isMatched = suspiciousPatterns.some((pattern) =>
          student.email.toLowerCase().includes(pattern)
        );

        if (isMatched) {
          score += 10;
          flags.push("Suspicious email pattern detected");
        }
      }

      // ─── 4️⃣ Same IP Used Multiple Times ────────────────────────
      if (registrationIP) {
        const sameIPCount = await Student.countDocuments({
          "riskAnalysis.registrationIP": registrationIP,
          _id: { $ne: student._id },
        });

        if (sameIPCount >= 3) {
          score += 25;
          flags.push(`Multiple accounts from same IP (${sameIPCount + 1} accounts total)`);
        }

        student.riskAnalysis.registrationIP = registrationIP;
      }

      // ─── 5️⃣ Incomplete Profile Check ────────────────────────────
      const requiredFields = ["fullName", "email", "phone", "rollNo", "branch"];
      const missingFields = requiredFields.filter((field) => !student[field] || student[field].trim() === "");

      if (missingFields.length > 2) {
        score += 15;
        flags.push(`Incomplete profile (missing ${missingFields.join(", ")})`);
      }

      // ─── 6️⃣ New Account Spam Pattern ────────────────────────────
      if (student.createdAt) {
        const daysSinceCreation = Math.floor((Date.now() - student.createdAt.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceCreation < 1) {
          // Very new account
          const recentAccountsFromIP = await Student.countDocuments({
            "riskAnalysis.registrationIP": registrationIP,
            createdAt: {
              $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          });

          if (recentAccountsFromIP > 3) {
            score += 20;
            flags.push("Multiple new accounts from same IP in 24 hours");
          }
        }
      }

      // ─── Determine Risk Level ───────────────────────────────────
      let riskLevel = "low";
      if (score >= 70) {
        riskLevel = "high";
      } else if (score >= 40) {
        riskLevel = "medium";
      }

      // ─── Update Risk Analysis ───────────────────────────────────
      student.riskAnalysis = {
        riskScore: Math.min(score, 100),
        riskLevel,
        flags,
        lastEvaluated: new Date(),
        resumeHash: resumeHash,
        registrationIP: registrationIPForAnalysis,
      };

      return {
        success: true,
        riskAnalysis: student.riskAnalysis,
      };
    } catch (error) {
      console.error("Error in evaluateStudentRisk:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Evaluate Recruiter Risk Score
   * @param {Object} recruiter - Recruiter document
   * @param {String} registrationIP - IP address from registration
   * @returns {Object} Risk analysis result
   */
  static async evaluateRecruiterRisk(recruiter, registrationIP = "") {
    let score = 0;
    const flags = [];

    try {
      // ─── 1️⃣ Duplicate Phone Number Check ─────────────────────────
      if (recruiter.phone) {
        const duplicatePhones = await Recruiter.countDocuments({
          phone: recruiter.phone,
          _id: { $ne: recruiter._id },
        });

        if (duplicatePhones > 0) {
          score += 40;
          flags.push(`Duplicate phone number (${duplicatePhones} other account${duplicatePhones > 1 ? "s" : ""})`);
        }
      }

      // ─── 2️⃣ Duplicate Email Check ──────────────────────────────
      if (recruiter.email) {
        const duplicateEmails = await Recruiter.countDocuments({
          email: recruiter.email,
          _id: { $ne: recruiter._id },
        });

        if (duplicateEmails > 0) {
          score += 35;
          flags.push(`Duplicate email (${duplicateEmails} other account${duplicateEmails > 1 ? "s" : ""})`);
        }
      }

      // ─── 3️⃣ Suspicious Company Pattern ─────────────────────────
      if (recruiter.companyName) {
        const suspiciousPatterns = ["test", "fake", "demo", "spam"];
        const isMatched = suspiciousPatterns.some((pattern) =>
          recruiter.companyName.toLowerCase().includes(pattern)
        );

        if (isMatched) {
          score += 20;
          flags.push("Suspicious company name pattern");
        }

        // Check if company name looks too generic
        if (recruiter.companyName.length < 3) {
          score += 10;
          flags.push("Company name too short");
        }
      }

      // ─── 4️⃣ Same IP Used Multiple Times ────────────────────────
      if (registrationIP) {
        const sameIPCount = await Recruiter.countDocuments({
          "riskAnalysis.registrationIP": registrationIP,
          _id: { $ne: recruiter._id },
        });

        if (sameIPCount >= 2) {
          score += 25;
          flags.push(`Multiple recruiter accounts from same IP (${sameIPCount + 1} accounts total)`);
        }

        recruiter.riskAnalysis.registrationIP = registrationIP;
      }

      // ─── 5️⃣ Incomplete Company Info ────────────────────────────
      const requiredFields = ["companyName", "designation"];
      const missingFields = requiredFields.filter((field) => !recruiter[field] || recruiter[field].trim() === "");

      if (missingFields.length > 0) {
        score += 10;
        flags.push(`Incomplete company info (missing ${missingFields.join(", ")})`);
      }

      // ─── 6️⃣ No Verification Information ──────────────────────────
      if (!recruiter.companyWebsite || recruiter.companyWebsite.trim() === "") {
        score += 15;
        flags.push("No company website provided");
      }

      // ─── Determine Risk Level ───────────────────────────────────
      let riskLevel = "low";
      if (score >= 70) {
        riskLevel = "high";
      } else if (score >= 40) {
        riskLevel = "medium";
      }

      // ─── Update Risk Analysis ───────────────────────────────────
      recruiter.riskAnalysis = {
        riskScore: Math.min(score, 100),
        riskLevel,
        flags,
        lastEvaluated: new Date(),
      };

      return {
        success: true,
        riskAnalysis: recruiter.riskAnalysis,
      };
    } catch (error) {
      console.error("Error in evaluateRecruiterRisk:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get Risk Summary Statistics
   * @returns {Object} Risk summary
   */
  static async getRiskSummary() {
    try {
      const studentStats = await Student.aggregate([
        {
          $group: {
            _id: "$riskAnalysis.riskLevel",
            count: { $sum: 1 },
          },
        },
      ]);

      const recruiterStats = await Recruiter.aggregate([
        {
          $group: {
            _id: "$riskAnalysis.riskLevel",
            count: { $sum: 1 },
          },
        },
      ]);

      const summary = {
        students: {
          high: 0,
          medium: 0,
          low: 0,
        },
        recruiters: {
          high: 0,
          medium: 0,
          low: 0,
        },
      };

      studentStats.forEach((stat) => {
        if (stat._id) {
          summary.students[stat._id] = stat.count;
        }
      });

      recruiterStats.forEach((stat) => {
        if (stat._id) {
          summary.recruiters[stat._id] = stat.count;
        }
      });

      return {
        success: true,
        summary,
      };
    } catch (error) {
      console.error("Error in getRiskSummary:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get High Risk Accounts
   * @param {Number} limit - Maximum number of results
   * @returns {Object} High risk accounts
   */
  static async getHighRiskAccounts(limit = 50) {
    try {
      const highRiskStudents = await Student.find({
        "riskAnalysis.riskLevel": "high",
      })
        .select("fullName email phone rollNo branch riskAnalysis")
        .limit(limit)
        .sort({ "riskAnalysis.riskScore": -1 });

      const highRiskRecruiters = await Recruiter.find({
        "riskAnalysis.riskLevel": "high",
      })
        .select("fullName email phone companyName riskAnalysis")
        .limit(limit)
        .sort({ "riskAnalysis.riskScore": -1 });

      return {
        success: true,
        students: highRiskStudents,
        recruiters: highRiskRecruiters,
      };
    } catch (error) {
      console.error("Error in getHighRiskAccounts:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Re-evaluate all students
   * (Typically called by a scheduled cron job)
   */
  static async reevaluateAllStudents() {
    try {
      const students = await Student.find({});
      let processed = 0;
      let errors = 0;
      let skipped = 0;

      for (const student of students) {
        try {
          // ✅ CRITICAL FIX: Skip students without firebaseUid to prevent validation crash
          if (!student.firebaseUid) {
            console.warn(`⚠️ Skipping student ${student._id} - missing required firebaseUid`);
            skipped++;
            continue;
          }
          
          const result = await this.evaluateStudentRisk(student);
          if (result.success) {
            await student.save();
            processed++;
          } else {
            errors++;
          }
        } catch (err) {
          console.error(`Error evaluating student ${student._id}:`, err);
          errors++;
        }
      }

      return {
        success: true,
        processed,
        errors,
        skipped,
        total: students.length,
      };
    } catch (error) {
      console.error("Error in reevaluateAllStudents:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Re-evaluate all recruiters
   * (Typically called by a scheduled cron job)
   */
  static async reevaluateAllRecruiters() {
    try {
      const recruiters = await Recruiter.find({});
      let processed = 0;
      let errors = 0;

      for (const recruiter of recruiters) {
        try {
          const result = await this.evaluateRecruiterRisk(recruiter);
          if (result.success) {
            await recruiter.save();
            processed++;
          } else {
            errors++;
          }
        } catch (err) {
          console.error(`Error evaluating recruiter ${recruiter._id}:`, err);
          errors++;
        }
      }

      return {
        success: true,
        processed,
        errors,
        total: recruiters.length,
      };
    } catch (error) {
      console.error("Error in reevaluateAllRecruiters:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = RiskEngine;
