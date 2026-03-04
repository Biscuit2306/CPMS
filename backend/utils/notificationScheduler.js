/**
 * ⏰ NOTIFICATION SCHEDULING SERVICE
 * Handles scheduled reminders (deadline reminders, interview reminders, etc.)
 * 
 * Usage:
 * const notificationScheduler = require('./notificationScheduler');
 * await notificationScheduler.startScheduler();
 */

const cron = require("node-cron");
const NotificationManager = require("./notificationManager");
const Student = require("../models/Student");
const Recruiter = require("../models/Recruiter");
const JobDrive = require("../models/JobDrive");
const InterviewSchedule = require("../models/InterviewSchedule");
const { ALERT_THRESHOLDS, SCHEDULED_REMINDERS } = require("./notificationConstants");

class NotificationScheduler {
  constructor() {
    this.notificationManager = new NotificationManager();
    this.scheduledTasks = [];
  }

  /**
   * Start all scheduled notification tasks
   */
  async startScheduler() {
    console.log("🚀 Starting Notification Scheduler...");

    try {
      // Check deadlines every hour
      this.scheduleDeadlineReminders();

      // Check interviews every hour
      this.scheduleInterviewReminders();

      // Check incomplete profiles weekly
      this.scheduleProfileCheckReminders();

      // Clean up old notifications
      this.scheduleCleanupTask();

      // Check for high applications on jobs
      this.scheduleApplicationCountCheck();

      console.log("✅ Notification Scheduler started successfully");
    } catch (err) {
      console.error("❌ Error starting notification scheduler:", err.message);
    }
  }

  /**
   * 📅 Schedule deadline reminders (hourly check)
   */
  scheduleDeadlineReminders() {
    const task = cron.schedule("0 * * * *", async () => {
      try {
        console.log("🔔 Checking for upcoming deadline reminders...");

        const now = new Date();
        const inHours = new Date(now.getTime() + ALERT_THRESHOLDS.DEADLINE_HOURS_REMINDER * 60 * 60 * 1000);

        // Find job drives closing in the next 24 hours
        const closingJobs = await JobDrive.find({
          applicationDeadline: {
            $gte: now,
            $lte: inHours,
          },
          status: "active",
        })
          .populate("recruiterId")
          .lean();

        for (const jobDrive of closingJobs) {
          // Find students who haven't applied yet and match the criteria
          const eligibleStudents = await Student.find({
            branch: jobDrive.requiredBranches,
            "applications.jobDriveId": { $ne: jobDrive._id },
          })
            .select("firebaseUid email fullName")
            .lean();

          // Send deadline reminder to each student
          for (const student of eligibleStudents) {
            const timeLeft = Math.floor(
              (jobDrive.applicationDeadline - now) / (60 * 60 * 1000)
            );

            await this.notificationManager.studentDeadlineReminder(
              student,
              jobDrive,
              jobDrive.recruiterId,
              timeLeft
            );
          }
        }

        console.log(`✅ Deadline reminders sent for ${closingJobs.length} jobs`);
      } catch (err) {
        console.error("❌ Error in deadline reminder task:", err.message);
      }
    });

    this.scheduledTasks.push(task);
  }

  /**
   * 🎤 Schedule interview reminders (hourly check)
   */
  scheduleInterviewReminders() {
    const task = cron.schedule("0 * * * *", async () => {
      try {
        console.log("🔔 Checking for upcoming interview reminders...");

        const now = new Date();
        
        // Validate dates before using them
        if (isNaN(now.getTime())) {
          console.error("❌ Invalid current date");
          return;
        }
        
        const inHours = new Date(
          now.getTime() + ALERT_THRESHOLDS.INTERVIEW_HOURS_REMINDER * 60 * 60 * 1000
        );
        
        if (isNaN(inHours.getTime())) {
          console.error("❌ Invalid future date calculation");
          return;
        }

        // Find interviews happening in the next 24 hours
        const upcomingInterviews = await InterviewSchedule.find({
          date: {
            $gte: now,
            $lte: inHours,
          },
          status: "scheduled",
        })
          .populate("jobDriveId")
          .populate("recruiterId")
          .lean();

        for (const interview of upcomingInterviews) {
          // ✅ Validate interview date
          if (!interview.date || isNaN(new Date(interview.date).getTime())) {
            console.warn(`⚠️ Skipping interview ${interview._id} - invalid date`, interview.date);
            continue;
          }
          
          // Remind students
          const students = interview.candidates || [];
          for (const studentId of students) {
            const student = await Student.findById(studentId)
              .select("firebaseUid email fullName")
              .lean();

            if (student) {
              await this.notificationManager.studentInterviewScheduled(
                student,
                interview
              );
            }
          }

          // Remind recruiter
          const recruiter = await Recruiter.findById(interview.recruiterId)
            .select("firebaseUid email fullName")
            .lean();

          if (recruiter) {
            await this.notificationManager.recruiterDriveReminder(
              recruiter,
              interview.jobDriveId,
              24
            );
          }
        }

        console.log(
          `✅ Interview reminders sent for ${upcomingInterviews.length} interviews`
        );
      } catch (err) {
        console.error("❌ Error in interview reminder task:", err.message);
      }
    });

    this.scheduledTasks.push(task);
  }

  /**
   * 👤 Schedule profile completeness check (weekly)
   */
  scheduleProfileCheckReminders() {
    const task = cron.schedule("0 0 * * 0", async () => {
      try {
        console.log("🔔 Checking for incomplete profiles...");

        // Check students with incomplete profiles
        const incompleteStudents = await Student.find({
          $or: [
            { fullName: { $in: [null, ""] } },
            { email: { $in: [null, ""] } },
            { phone: { $in: [null, ""] } },
            { branch: { $in: [null, ""] } },
          ],
        })
          .select("firebaseUid email fullName")
          .lean();

        for (const student of incompleteStudents) {
          await this.notificationManager.studentProfileIncomplete(student);
        }

        // Check recruiters with incomplete profiles
        const incompleteRecruiters = await Recruiter.find({
          $or: [
            { fullName: { $in: [null, ""] } },
            { companyName: { $in: [null, ""] } },
            { companyEmail: { $in: [null, ""] } },
          ],
        })
          .select("firebaseUid email fullName companyName")
          .lean();

        for (const recruiter of incompleteRecruiters) {
          await this.notificationManager.recruiterProfileIncomplete(recruiter);
        }

        console.log(
          `✅ Profile reminders sent to ${incompleteStudents.length} students and ${incompleteRecruiters.length} recruiters`
        );
      } catch (err) {
        console.error("❌ Error in profile check task:", err.message);
      }
    });

    this.scheduledTasks.push(task);
  }

  /**
   * 🗑️ Schedule cleanup of old notifications (daily)
   */
  scheduleCleanupTask() {
    const task = cron.schedule("0 2 * * *", async () => {
      try {
        console.log("🗑️ Cleaning up old notifications...");

        const manager = new NotificationManager();
        // Assuming you have a cleanup method
        const Notification = require("../models/Notification");
        const thirtyDaysAgo = new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        );

        const result = await Notification.deleteMany({
          createdAt: { $lt: thirtyDaysAgo },
          read: true, // Only delete read notifications
        });

        console.log(`✅ Deleted ${result.deletedCount} old notifications`);
      } catch (err) {
        console.error("❌ Error in cleanup task:", err.message);
      }
    });

    this.scheduledTasks.push(task);
  }

  /**
   * 📊 Schedule application count alert check (every 6 hours)
   */
  scheduleApplicationCountCheck() {
    const task = cron.schedule("0 */6 * * *", async () => {
      try {
        console.log("📊 Checking for high application counts...");

        const Notification = require("../models/Notification");
        const Application = require("../models/Application");

        // Find all active job drives
        const activeJobs = await JobDrive.find({ status: "active" })
          .populate("recruiterId")
          .lean();

        const Admin = require("../models/Admin");
        const adminUsers = await Admin.find()
          .select("firebaseUid email")
          .lean();

        for (const job of activeJobs) {
          const appCount = await Application.countDocuments({
            jobDriveId: job._id,
          });

          if (appCount > ALERT_THRESHOLDS.HIGH_APPLICATIONS_COUNT) {
            // Alert all admins
            for (const admin of adminUsers) {
              await this.notificationManager.adminHighApplicationAlert(
                admin,
                job,
                job.recruiterId,
                appCount
              );
            }
          }
        }

        console.log("✅ Application count check completed");
      } catch (err) {
        console.error("❌ Error in application count check:", err.message);
      }
    });

    this.scheduledTasks.push(task);
  }

  /**
   * Send immediate scheduled notification
   */
  async sendScheduledNotification(params) {
    try {
      const { delay, notificationFn, args } = params;

      setTimeout(async () => {
        try {
          await notificationFn(...args);
        } catch (err) {
          console.error("❌ Error sending scheduled notification:", err.message);
        }
      }, delay);
    } catch (err) {
      console.error("❌ Error scheduling notification:", err.message);
    }
  }

  /**
   * Send notification after delay (e.g., 24 hours)
   */
  scheduleNotificationAfterDelay(notificationFn, args, delayMs) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const result = await notificationFn(...args);
          resolve(result);
        } catch (err) {
          console.error("❌ Error in delayed notification:", err.message);
          resolve(null);
        }
      }, delayMs);
    });
  }

  /**
   * Stop all scheduled tasks
   */
  stopScheduler() {
    console.log("⏹️ Stopping Notification Scheduler...");
    this.scheduledTasks.forEach((task) => task.stop());
    this.scheduledTasks = [];
    console.log("✅ Notification Scheduler stopped");
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.scheduledTasks.length > 0,
      tasksCount: this.scheduledTasks.length,
      tasks: [
        "Deadline Reminders (hourly)",
        "Interview Reminders (hourly)",
        "Profile Check Reminders (weekly)",
        "Old Notifications Cleanup (daily)",
        "Application Count Check (6-hourly)",
      ],
    };
  }
}

// Create singleton instance
const notificationScheduler = new NotificationScheduler();

module.exports = notificationScheduler;
