/**
 * 🔔 Notification Manager
 * Role-based, event-driven notification system for CPMS
 * 
 * Usage:
 * const notif = new NotificationManager();
 * await notif.studentJobShortlisted(studentId, jobDrive);
 */

const Notification = require("../models/Notification");

class NotificationManager {
  /**
   * BASE METHOD - Create a notification
   * @param {Object} params - Notification parameters
   */
  async create(params) {
    try {
      const {
        recipientFirebaseUid,
        recipientEmail,
        role,
        category,
        title,
        message,
        type = "info",
        priority = "medium",
        actionUrl = null,
        affectedItemId = null,
        affectedItemType = null,
        metadata = {},
      } = params;

      // Validate required fields
      if (!recipientFirebaseUid || !role || !category) {
        console.error("❌ Missing required notification fields:", {
          recipientFirebaseUid,
          role,
          category,
        });
        return null;
      }

      const notification = await Notification.create({
        recipientFirebaseUid,
        recipientEmail,
        role,
        category,
        title,
        message,
        type,
        priority,
        actionUrl,
        affectedItemId,
        affectedItemType,
        metadata,
      });

      console.log(`✅ Notification created: ${category}`);
      
      // 🔴 EMIT REAL-TIME NOTIFICATION VIA SOCKET.IO
      if (global.notificationSocket) {
        try {
          global.notificationSocket.notifyUser(recipientFirebaseUid, notification);
        } catch (socketErr) {
          console.warn("⚠️ Socket.io notification failed (will still be saved):", socketErr.message);
        }
      }
      
      return notification;
    } catch (err) {
      console.error("❌ Error creating notification:", err.message);
      return null;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎓 STUDENT NOTIFICATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 💼 New job posted matching student's branch
   */
  async studentJobPosted(student, jobDrive, recruiter) {
    return this.create({
      recipientFirebaseUid: student.firebaseUid,
      recipientEmail: student.email,
      role: "student",
      category: "student_job_posted",
      title: `🎉 New Job Posted: ${jobDrive.position}`,
      message: `${recruiter.companyName} is hiring for ${jobDrive.position}. Salary: ${jobDrive.salary}. Deadline: ${new Date(jobDrive.applicationDeadline).toLocaleDateString()}`,
      type: "success",
      priority: "high",
      actionUrl: `/student/job-drives/${jobDrive._id}`,
      affectedItemId: jobDrive._id,
      affectedItemType: "JobDrive",
      metadata: {
        jobDriveId: jobDrive._id,
        company: jobDrive.company,
        position: jobDrive.position,
        salary: jobDrive.salary,
        applicationDeadline: jobDrive.applicationDeadline,
        recruiterName: recruiter.fullName,
        recruiterCompany: recruiter.companyName,
      },
    });
  }

  /**
   * ✅ Application submitted successfully
   */
  async studentApplicationSubmitted(student, jobDrive, recruiter) {
    return this.create({
      recipientFirebaseUid: student.firebaseUid,
      recipientEmail: student.email,
      role: "student",
      category: "student_application_submitted",
      title: `✅ Application Submitted`,
      message: `Your application for ${jobDrive.position} at ${recruiter.companyName} has been submitted successfully. Good luck!`,
      type: "success",
      priority: "medium",
      actionUrl: `/student/applications`,
      affectedItemId: jobDrive._id,
      affectedItemType: "JobDrive",
      metadata: {
        jobDriveId: jobDrive._id,
        company: jobDrive.company,
        position: jobDrive.position,
        recruiterName: recruiter.fullName,
      },
    });
  }

  /**
   * 🎉 Application shortlisted
   */
  async studentApplicationShortlisted(student, jobDrive, recruiter) {
    return this.create({
      recipientFirebaseUid: student.firebaseUid,
      recipientEmail: student.email,
      role: "student",
      category: "student_application_shortlisted",
      title: `🎉 You've Been Shortlisted!`,
      message: `Congratulations! You have been shortlisted for ${jobDrive.position} at ${recruiter.companyName}. Next steps coming soon.`,
      type: "success",
      priority: "high",
      actionUrl: `/student/applications`,
      affectedItemId: jobDrive._id,
      affectedItemType: "JobDrive",
      metadata: {
        jobDriveId: jobDrive._id,
        company: jobDrive.company,
        position: jobDrive.position,
        recruiterName: recruiter.fullName,
      },
    });
  }

  /**
   * ❌ Application rejected
   */
  async studentApplicationRejected(student, jobDrive, recruiter, reason = "Not specified") {
    return this.create({
      recipientFirebaseUid: student.firebaseUid,
      recipientEmail: student.email,
      role: "student",
      category: "student_application_rejected",
      title: `Application Status Update`,
      message: `Your application for ${jobDrive.position} at ${recruiter.companyName} has been updated. Reason: ${reason}. Keep applying!`,
      type: "warning",
      priority: "medium",
      actionUrl: `/student/applications`,
      affectedItemId: jobDrive._id,
      affectedItemType: "JobDrive",
      metadata: {
        jobDriveId: jobDrive._id,
        company: jobDrive.company,
        position: jobDrive.position,
        reason,
      },
    });
  }

  /**
   * 📅 Interview scheduled
   */
  async studentInterviewScheduled(student, schedule) {
    const scheduleDate = new Date(schedule.date);
    return this.create({
      recipientFirebaseUid: student.firebaseUid,
      recipientEmail: student.email,
      role: "student",
      category: "student_interview_scheduled",
      title: `📅 Interview Scheduled!`,
      message: `Your interview for ${schedule.position} at ${schedule.company} is scheduled on ${scheduleDate.toLocaleDateString()} at ${schedule.time || "To be confirmed"}`,
      type: "success",
      priority: "high",
      actionUrl: `/student/interviews`,
      affectedItemId: schedule._id,
      affectedItemType: "InterviewSchedule",
      metadata: {
        scheduleId: schedule._id,
        company: schedule.company,
        position: schedule.position,
        interviewDate: schedule.date,
        interviewTime: schedule.time,
      },
    });
  }

  /**
   * 📊 Interview result declared
   */
  async studentInterviewResult(student, schedule, result = "pending") {
    const resultText =
      result === "passed" ? "Congratulations! You passed!" : "Thank you for participating!";
    return this.create({
      recipientFirebaseUid: student.firebaseUid,
      recipientEmail: student.email,
      role: "student",
      category: "student_interview_result",
      title: `📊 Interview Result: ${result.toUpperCase()}`,
      message: `${resultText} Check your interview page for details about ${schedule.company}`,
      type: result === "passed" ? "success" : "info",
      priority: "high",
      actionUrl: `/student/interviews`,
      affectedItemId: schedule._id,
      affectedItemType: "InterviewSchedule",
      metadata: {
        scheduleId: schedule._id,
        company: schedule.company,
        position: schedule.position,
      },
    });
  }

  /**
   * 📄 Offer letter uploaded
   */
  async studentOfferLetter(student, jobDrive, recruiter) {
    return this.create({
      recipientFirebaseUid: student.firebaseUid,
      recipientEmail: student.email,
      role: "student",
      category: "student_offer_letter",
      title: `🎊 Offer Letter Available!`,
      message: `Your offer letter from ${recruiter.companyName} for ${jobDrive.position} is ready. Download it now!`,
      type: "success",
      priority: "urgent",
      actionUrl: `/student/offers`,
      affectedItemId: jobDrive._id,
      affectedItemType: "JobDrive",
      metadata: {
        jobDriveId: jobDrive._id,
        company: recruiter.companyName,
        position: jobDrive.position,
      },
    });
  }

  /**
   * ⚠️ Profile incomplete reminder
   */
  async studentProfileIncomplete(student) {
    return this.create({
      recipientFirebaseUid: student.firebaseUid,
      recipientEmail: student.email,
      role: "student",
      category: "student_profile_incomplete",
      title: `⚠️ Complete Your Profile`,
      message: `Your profile is incomplete. Complete all sections to increase your chances of getting selected for job drives.`,
      type: "warning",
      priority: "medium",
      actionUrl: `/student/profile`,
      metadata: { studentName: student.fullName },
    });
  }

  /**
   * ✅ Document/Resume verified
   */
  async studentDocumentVerified(student, documentType = "Resume") {
    return this.create({
      recipientFirebaseUid: student.firebaseUid,
      recipientEmail: student.email,
      role: "student",
      category: "student_resume_verified",
      title: `✅ ${documentType} Verified`,
      message: `Your ${documentType} has been verified and approved. You're all set!`,
      type: "success",
      priority: "medium",
      actionUrl: `/student/profile`,
      metadata: { documentType },
    });
  }

  /**
   * ❌ Document rejected
   */
  async studentDocumentRejected(student, documentType = "Resume", reason = "Not specified") {
    return this.create({
      recipientFirebaseUid: student.firebaseUid,
      recipientEmail: student.email,
      role: "student",
      category: "student_document_rejected",
      title: `❌ ${documentType} Rejected`,
      message: `Your ${documentType} was rejected. Reason: ${reason}. Please upload a corrected version.`,
      type: "error",
      priority: "high",
      actionUrl: `/student/profile`,
      metadata: { documentType, reason },
    });
  }

  /**
   * 🔔 Deadline reminder
   */
  async studentDeadlineReminder(student, jobDrive, recruiter, hoursLeft = 24) {
    return this.create({
      recipientFirebaseUid: student.firebaseUid,
      recipientEmail: student.email,
      role: "student",
      category: "student_deadline_reminder",
      title: `⏰ Deadline Closing Soon!`,
      message: `Application deadline for ${jobDrive.position} at ${recruiter.companyName} closes in ${hoursLeft} hours!`,
      type: "warning",
      priority: "high",
      actionUrl: `/student/job-drives/${jobDrive._id}`,
      affectedItemId: jobDrive._id,
      affectedItemType: "JobDrive",
      metadata: {
        jobDriveId: jobDrive._id,
        company: recruiter.companyName,
        position: jobDrive.position,
        applicationDeadline: jobDrive.applicationDeadline,
      },
    });
  }

  /**
   * 🏆 Achievement approved
   */
  async studentAchievementApproved(student, achievement) {
    return this.create({
      recipientFirebaseUid: student.firebaseUid,
      recipientEmail: student.email,
      role: "student",
      category: "student_achievement_approved",
      title: `🏆 Achievement Approved!`,
      message: `Your achievement "${achievement.title}" has been approved and added to your profile!`,
      type: "success",
      priority: "medium",
      actionUrl: `/student/profile`,
      affectedItemId: achievement._id,
      affectedItemType: "Achievement",
      metadata: { achievementTitle: achievement.title },
    });
  }

  /**
   * ⭐ Points/Credits added
   */
  async studentPointsAdded(student, points = 0, reason = "Activity") {
    return this.create({
      recipientFirebaseUid: student.firebaseUid,
      recipientEmail: student.email,
      role: "student",
      category: "student_points_added",
      title: `⭐ ${points} Credits Added!`,
      message: `You earned ${points} credits for ${reason}. Keep participating!`,
      type: "success",
      priority: "low",
      actionUrl: `/student/dashboard`,
      metadata: { points, reason },
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏢 RECRUITER NOTIFICATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 📧 New application received
   */
  async recruiterApplicationReceived(recruiter, jobDrive, student) {
    return this.create({
      recipientFirebaseUid: recruiter.firebaseUid,
      recipientEmail: recruiter.email,
      role: "recruiter",
      category: "recruiter_application_received",
      title: `📧 New Application from ${student.fullName}`,
      message: `${student.fullName} (${student.branch}) applied for ${jobDrive.position}. CGPA: ${student.cgpa}`,
      type: "info",
      priority: "medium",
      actionUrl: `/recruiter/applications/${jobDrive._id}`,
      affectedItemId: jobDrive._id,
      affectedItemType: "JobDrive",
      metadata: {
        jobDriveId: jobDrive._id,
        position: jobDrive.position,
        studentId: student.firebaseUid,
        studentName: student.fullName,
        studentBranch: student.branch,
      },
    });
  }

  /**
   * 🚪 Candidate withdrew application
   */
  async recruiterApplicationWithdrawn(recruiter, jobDrive, student) {
    return this.create({
      recipientFirebaseUid: recruiter.firebaseUid,
      recipientEmail: recruiter.email,
      role: "recruiter",
      category: "recruiter_application_withdrawn",
      title: `🚪 Application Withdrawn`,
      message: `${student.fullName} has withdrawn their application for ${jobDrive.position}`,
      type: "info",
      priority: "low",
      actionUrl: `/recruiter/applications/${jobDrive._id}`,
      affectedItemId: jobDrive._id,
      affectedItemType: "JobDrive",
      metadata: {
        jobDriveId: jobDrive._id,
        position: jobDrive.position,
        studentName: student.fullName,
      },
    });
  }

  /**
   * ✅ Candidate confirmed interview
   */
  async recruiterInterviewConfirmed(recruiter, schedule, student) {
    return this.create({
      recipientFirebaseUid: recruiter.firebaseUid,
      recipientEmail: recruiter.email,
      role: "recruiter",
      category: "recruiter_interview_accepted",
      title: `✅ Interview Confirmed by ${student.fullName}`,
      message: `${student.fullName} has confirmed their attendance for the interview on ${new Date(schedule.date).toLocaleDateString()}`,
      type: "success",
      priority: "medium",
      actionUrl: `/recruiter/schedules/${schedule._id}`,
      affectedItemId: schedule._id,
      affectedItemType: "InterviewSchedule",
      metadata: {
        scheduleId: schedule._id,
        studentName: student.fullName,
        interviewDate: schedule.date,
      },
    });
  }

  /**
   * ✅ Job posting approved
   */
  async recruiterJobApproved(recruiter, jobDrive) {
    return this.create({
      recipientFirebaseUid: recruiter.firebaseUid,
      recipientEmail: recruiter.email,
      role: "recruiter",
      category: "recruiter_job_approved",
      title: `✅ Job Posting Approved`,
      message: `Your job posting for ${jobDrive.position} has been approved. It's now live and students can apply!`,
      type: "success",
      priority: "high",
      actionUrl: `/recruiter/job-drives/${jobDrive._id}`,
      affectedItemId: jobDrive._id,
      affectedItemType: "JobDrive",
      metadata: {
        jobDriveId: jobDrive._id,
        position: jobDrive.position,
      },
    });
  }

  /**
   * ❌ Job posting rejected
   */
  async recruiterJobRejected(recruiter, jobDrive, reason = "Not specified") {
    return this.create({
      recipientFirebaseUid: recruiter.firebaseUid,
      recipientEmail: recruiter.email,
      role: "recruiter",
      category: "recruiter_job_rejected",
      title: `❌ Job Posting Rejected`,
      message: `Your job posting for ${jobDrive.position} was rejected. Reason: ${reason}. Please review and resubmit.`,
      type: "error",
      priority: "high",
      actionUrl: `/recruiter/job-drives/${jobDrive._id}`,
      affectedItemId: jobDrive._id,
      affectedItemType: "JobDrive",
      metadata: {
        jobDriveId: jobDrive._id,
        position: jobDrive.position,
        reason,
      },
    });
  }

  /**
   * 📅 Drive scheduled
   */
  async recruiterDriveScheduled(recruiter, jobDrive) {
    return this.create({
      recipientFirebaseUid: recruiter.firebaseUid,
      recipientEmail: recruiter.email,
      role: "recruiter",
      category: "recruiter_drive_scheduled",
      title: `📅 Drive Scheduled Successfully`,
      message: `Your placement drive for ${jobDrive.position} is scheduled for ${new Date(jobDrive.date).toLocaleDateString()}`,
      type: "success",
      priority: "high",
      actionUrl: `/recruiter/job-drives/${jobDrive._id}`,
      affectedItemId: jobDrive._id,
      affectedItemType: "JobDrive",
      metadata: {
        jobDriveId: jobDrive._id,
        position: jobDrive.position,
        driveDate: jobDrive.date,
      },
    });
  }

  /**
   * 🔔 Upcoming drive reminder
   */
  async recruiterDriveReminder(recruiter, jobDrive, hoursLeft = 24) {
    return this.create({
      recipientFirebaseUid: recruiter.firebaseUid,
      recipientEmail: recruiter.email,
      role: "recruiter",
      category: "recruiter_drive_reminder",
      title: `🔔 Drive Happening Soon!`,
      message: `Your ${jobDrive.position} drive is happening in ${hoursLeft} hours. Get ready!`,
      type: "warning",
      priority: "high",
      actionUrl: `/recruiter/job-drives/${jobDrive._id}`,
      affectedItemId: jobDrive._id,
      affectedItemType: "JobDrive",
      metadata: {
        jobDriveId: jobDrive._id,
        position: jobDrive.position,
        driveDate: jobDrive.date,
      },
    });
  }

  /**
   * ⚠️ Profile incomplete
   */
  async recruiterProfileIncomplete(recruiter) {
    return this.create({
      recipientFirebaseUid: recruiter.firebaseUid,
      recipientEmail: recruiter.email,
      role: "recruiter",
      category: "recruiter_profile_incomplete",
      title: `⚠️ Complete Your Profile`,
      message: `Your company profile is incomplete. Complete all sections to start posting job drives.`,
      type: "warning",
      priority: "medium",
      actionUrl: `/recruiter/profile`,
      metadata: { recruiterName: recruiter.fullName },
    });
  }

  /**
   * ✅ Company verified
   */
  async recruiterCompanyVerified(recruiter) {
    return this.create({
      recipientFirebaseUid: recruiter.firebaseUid,
      recipientEmail: recruiter.email,
      role: "recruiter",
      category: "recruiter_company_verified",
      title: `✅ Company Verified!`,
      message: `${recruiter.companyName} has been verified. You can now post job drives!`,
      type: "success",
      priority: "high",
      actionUrl: `/recruiter/dashboard`,
      metadata: { company: recruiter.companyName },
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👨‍💼 ADMIN NOTIFICATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 🆕 New recruiter registered
   */
  async adminRecruiterRegistered(admin, recruiter) {
    return this.create({
      recipientFirebaseUid: admin.firebaseUid,
      recipientEmail: admin.email,
      role: "admin",
      category: "admin_recruiter_registered",
      title: `🆕 New Recruiter Registered`,
      message: `${recruiter.fullName} from ${recruiter.companyName} has registered. Verify their company details.`,
      type: "info",
      priority: "medium",
      actionUrl: `/admin/recruiters`,
      affectedItemId: recruiter._id,
      affectedItemType: "Recruiter",
      metadata: {
        recruiterId: recruiter.firebaseUid,
        recruiterName: recruiter.fullName,
        recruiterCompany: recruiter.companyName,
      },
    });
  }

  /**
   * ⏳ Job posting pending approval
   */
  async adminJobPendingApproval(admin, jobDrive, recruiter) {
    return this.create({
      recipientFirebaseUid: admin.firebaseUid,
      recipientEmail: admin.email,
      role: "admin",
      category: "admin_job_pending",
      title: `⏳ Job Posting Pending Approval`,
      message: `${recruiter.fullName} from ${recruiter.companyName} posted a job for ${jobDrive.position}. Review and approve.`,
      type: "warning",
      priority: "high",
      actionUrl: `/admin/job-drives`,
      affectedItemId: jobDrive._id,
      affectedItemType: "JobDrive",
      metadata: {
        jobDriveId: jobDrive._id,
        position: jobDrive.position,
        company: recruiter.companyName,
        recruiterName: recruiter.fullName,
      },
    });
  }

  /**
   * 📋 Achievement pending verification
   */
  async adminAchievementPending(admin, student, achievement) {
    return this.create({
      recipientFirebaseUid: admin.firebaseUid,
      recipientEmail: admin.email,
      role: "admin",
      category: "admin_achievement_pending",
      title: `📋 Achievement Pending Verification`,
      message: `${student.fullName} submitted "${achievement.title}". Verify and approve.`,
      type: "warning",
      priority: "medium",
      actionUrl: `/admin/students`,
      affectedItemId: achievement._id,
      affectedItemType: "Achievement",
      metadata: {
        studentId: student.firebaseUid,
        studentName: student.fullName,
        achievementTitle: achievement.title,
      },
    });
  }

  /**
   * ⏰ Many applications on a job
   */
  async adminHighApplicationAlert(admin, jobDrive, recruiter, applicationCount) {
    return this.create({
      recipientFirebaseUid: admin.firebaseUid,
      recipientEmail: admin.email,
      role: "admin",
      category: "admin_alert_applications",
      title: `⏰ High Application Count Alert`,
      message: `The job posting "${jobDrive.position}" at ${recruiter.companyName} has received ${applicationCount} applications.`,
      type: "info",
      priority: "low",
      actionUrl: `/admin/job-drives/${jobDrive._id}`,
      affectedItemId: jobDrive._id,
      affectedItemType: "JobDrive",
      metadata: {
        jobDriveId: jobDrive._id,
        position: jobDrive.position,
        applicationCount,
      },
    });
  }

  /**
   * 🏁 Drive completed
   */
  async adminDriveCompleted(admin, jobDrive, recruiter, selectedCount = 0) {
    return this.create({
      recipientFirebaseUid: admin.firebaseUid,
      recipientEmail: admin.email,
      role: "admin",
      category: "admin_drive_completed",
      title: `🏁 Drive Completed`,
      message: `${recruiter.companyName}'s drive for ${jobDrive.position} is complete. ${selectedCount} candidates selected.`,
      type: "success",
      priority: "medium",
      actionUrl: `/admin/job-drives/${jobDrive._id}`,
      affectedItemId: jobDrive._id,
      affectedItemType: "JobDrive",
      metadata: {
        jobDriveId: jobDrive._id,
        company: recruiter.companyName,
        position: jobDrive.position,
      },
    });
  }

  /**
   * ⚠️ System error
   */
  async adminSystemError(admin, errorMessage, errorType = "Unknown") {
    return this.create({
      recipientFirebaseUid: admin.firebaseUid,
      recipientEmail: admin.email,
      role: "admin",
      category: "admin_system_error",
      title: `⚠️ System Error: ${errorType}`,
      message: `A system error occurred: ${errorMessage}. Please investigate.`,
      type: "error",
      priority: "urgent",
      actionUrl: `/admin/logs`,
      metadata: {
        errorMessage,
        errorType,
        timestamp: new Date(),
      },
    });
  }

  /**
   * 📋 Student document pending verification
   */
  async adminDocumentPending(admin, student, documentType = "Resume") {
    return this.create({
      recipientFirebaseUid: admin.firebaseUid,
      recipientEmail: admin.email,
      role: "admin",
      category: "admin_document_pending",
      title: `📋 ${documentType} Pending Verification`,
      message: `${student.fullName} submitted a ${documentType} for verification. Please review.`,
      type: "warning",
      priority: "medium",
      actionUrl: `/admin/students/${student.firebaseUid}`,
      affectedItemId: student.firebaseUid,
      affectedItemType: "Student",
      metadata: {
        studentId: student.firebaseUid,
        studentName: student.fullName,
        documentType,
      },
    });
  }

  /**
   * 🗑️ Recruiter deleted job (alert to admin)
   */
  async adminRecruiterDeletedJob(admin, recruiter, jobDrive, reason = "Not specified") {
    return this.create({
      recipientFirebaseUid: admin.firebaseUid,
      recipientEmail: admin.email,
      role: "admin",
      category: "admin_recruiter_action",
      title: `🗑️ Job Deleted by ${recruiter.companyName}`,
      message: `${recruiter.fullName} deleted job posting for ${jobDrive.position}. Reason: ${reason}`,
      type: "warning",
      priority: "medium",
      actionUrl: `/admin/recruiters/${recruiter.firebaseUid}`,
      affectedItemId: recruiter.firebaseUid,
      affectedItemType: "Recruiter",
      metadata: {
        recruiterId: recruiter.firebaseUid,
        recruiterName: recruiter.fullName,
        position: jobDrive.position,
        reason,
      },
    });
  }

  /**
   * 👥 Multiple admins notification
   */
  async notifyMultipleAdmins(adminList, notificationData) {
    try {
      const notifications = adminList.map(admin => ({
        ...notificationData,
        recipientFirebaseUid: admin.firebaseUid,
        recipientEmail: admin.email,
        role: "admin",
      }));

      const created = await Notification.insertMany(notifications);
      console.log(`✅ Created ${created.length} admin notifications`);
      return created;
    } catch (err) {
      console.error("❌ Error creating admin notifications:", err.message);
      return [];
    }
  }

  /**
   * 📊 Get notification statistics for a user
   */
  async getStats(firebaseUid) {
    try {
      const total = await Notification.countDocuments({
        recipientFirebaseUid: firebaseUid,
      });

      const unread = await Notification.countDocuments({
        recipientFirebaseUid: firebaseUid,
        read: false,
      });

      const byCategory = await Notification.aggregate([
        { $match: { recipientFirebaseUid: firebaseUid } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]);

      const byType = await Notification.aggregate([
        { $match: { recipientFirebaseUid: firebaseUid } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]);

      return {
        total,
        unread,
        read: total - unread,
        byCategory,
        byType,
      };
    } catch (err) {
      console.error("❌ Error getting notification stats:", err.message);
      return null;
    }
  }

  /**
   * 🔔 Get notifications by priority
   */
  async getByPriority(firebaseUid, priority = "high") {
    try {
      const notifications = await Notification.find({
        recipientFirebaseUid: firebaseUid,
        priority,
      })
        .sort({ createdAt: -1 })
        .limit(20);

      return notifications;
    } catch (err) {
      console.error("❌ Error fetching notifications by priority:", err.message);
      return [];
    }
  }

  /**
   * 🎯 Get notifications by category
   */
  async getByCategory(firebaseUid, category) {
    try {
      const notifications = await Notification.find({
        recipientFirebaseUid: firebaseUid,
        category,
      })
        .sort({ createdAt: -1 })
        .limit(20);

      return notifications;
    } catch (err) {
      console.error("❌ Error fetching notifications by category:", err.message);
      return [];
    }
  }

  /**
   * 📌 Delete notification
   */
  async delete(notificationId) {
    try {
      const result = await Notification.findByIdAndDelete(notificationId);
      console.log(`✅ Notification deleted`);
      return result;
    } catch (err) {
      console.error("❌ Error deleting notification:", err.message);
      return null;
    }
  }

  /**
   * 🗑️ Delete multiple notifications
   */
  async deleteMultiple(notificationIds) {
    try {
      const result = await Notification.deleteMany({
        _id: { $in: notificationIds },
      });
      console.log(`✅ Deleted ${result.deletedCount} notifications`);
      return result.deletedCount;
    } catch (err) {
      console.error("❌ Error deleting notifications:", err.message);
      return 0;
    }
  }

  /**
   * 📧 Check if user notification preferences exist
   */
  async getUserPreferences(firebaseUid) {
    try {
      // This would require a UserPreferences model - for now return defaults
      return {
        emailNotifications: true,
        pushNotifications: true,
        allJobs: true,
        myApplications: true,
        interviews: true,
        achievements: true,
        deadlines: true,
      };
    } catch (err) {
      console.error("❌ Error getting user preferences:", err.message);
      return null;
    }
  }

  /**
   * 🔔 Bulk notify students about job matching their criteria
   */
  async notifyStudentsAboutJob(students, jobDrive, recruiter) {
    try {
      const notifications = students.map(student => ({
        recipientFirebaseUid: student.firebaseUid,
        recipientEmail: student.email,
        role: "student",
        category: "student_job_posted",
        title: `🎉 New ${jobDrive.position} Role at ${recruiter.companyName}`,
        message: `${recruiter.companyName} is hiring! ${jobDrive.position} - Salary: ${jobDrive.salary}. Apply before ${new Date(jobDrive.applicationDeadline).toLocaleDateString()}`,
        type: "success",
        priority: "high",
        actionUrl: `/student/job-drives/${jobDrive._id}`,
        affectedItemId: jobDrive._id,
        affectedItemType: "JobDrive",
        metadata: {
          jobDriveId: jobDrive._id,
          company: recruiter.companyName,
          position: jobDrive.position,
          salary: jobDrive.salary,
          applicationDeadline: jobDrive.applicationDeadline,
          recruiterName: recruiter.fullName,
        },
      }));

      const created = await Notification.insertMany(notifications);
      console.log(`✅ Job notification sent to ${created.length} students`);
      return created;
    } catch (err) {
      console.error("❌ Error notifying students about job:", err.message);
      return [];
    }
  }

  /**
   * RECRUITER CREATED JOB DRIVE - Notify all students and admin
   */
  async jobDriveCreated(recruiter, jobDrive) {
    try {
      const Student = require("../models/Student");
      const Admin = require("../models/Admin");

      // Notify all active students about the new job posting
      const students = await Student.find({ isBlocked: { $ne: true }, isDeleted: { $ne: true } }).select("firebaseUid email");
      
      for (const student of students) {
        await this.create({
          recipientFirebaseUid: student.firebaseUid,
          recipientEmail: student.email,
          role: "student",
          category: "JOB_POSTED",
          title: `💼 New Job Opportunity: ${jobDrive.position}`,
          message: `${recruiter.companyName} posted a new position for ${jobDrive.position}. Salary: ${jobDrive.salary}. Apply before ${new Date(jobDrive.applicationDeadline).toLocaleDateString()}`,
          type: "info",
          priority: "high",
          actionUrl: `/student/job-drives`,
          affectedItemId: jobDrive._id,
          affectedItemType: "JobDrive",
          metadata: {
            recruiterName: recruiter.fullName,
            company: jobDrive.company,
            position: jobDrive.position,
            salary: jobDrive.salary,
            deadline: jobDrive.applicationDeadline,
          },
        });
      }

      // Notify admin about new job drive
      const admins = await Admin.find().select("firebaseUid email");
      for (const admin of admins) {
        await this.create({
          recipientFirebaseUid: admin.firebaseUid,
          recipientEmail: admin.email,
          role: "admin",
          category: "JOB_POSTED",
          title: `📊 New Job Drive Created`,
          message: `${recruiter.companyName} created a new job drive for ${jobDrive.position}. ${jobDrive.salary}. Deadline: ${new Date(jobDrive.applicationDeadline).toLocaleDateString()}`,
          type: "info",
          priority: "medium",
          actionUrl: `/admin/drives`,
          affectedItemId: jobDrive._id,
          affectedItemType: "JobDrive",
          metadata: {
            recruiterName: recruiter.fullName,
            company: jobDrive.company,
            position: jobDrive.position,
          },
        });
      }

      console.log(`✅ Job drive creation notifications sent to students and admins`);
      return true;
    } catch (err) {
      console.error("❌ Error notifying about job drive creation:", err.message);
      return false;
    }
  }

  /**
   * RECRUITER CREATED INTERVIEW SCHEDULE - Notify students and admin
   */
  async interviewScheduleCreated(recruiter, schedule, students = []) {
    try {
      const Admin = require("../models/Admin");

      // Notify selected students about interview
      for (const student of students) {
        await this.create({
          recipientFirebaseUid: student.firebaseUid,
          recipientEmail: student.email,
          role: "student",
          category: "INTERVIEW_SCHEDULED",
          title: `📅 Interview Scheduled: ${schedule.position}`,
          message: `Congratulations! You have been scheduled for an interview. Date: ${new Date(schedule.interviewDate).toLocaleDateString()} at ${schedule.interviewTime}. Further details will be provided.`,
          type: "success",
          priority: "high",
          actionUrl: `/student/schedule`,
          affectedItemId: schedule._id,
          affectedItemType: "InterviewSchedule",
          metadata: {
            position: schedule.position,
            company: schedule.company,
            interviewDate: schedule.interviewDate,
            interviewTime: schedule.interviewTime,
            recruiterName: recruiter.fullName,
          },
        });
      }

      // Notify admin about new interview schedule
      const admins = await Admin.find().select("firebaseUid email");
      for (const admin of admins) {
        await this.create({
          recipientFirebaseUid: admin.firebaseUid,
          recipientEmail: admin.email,
          role: "admin",
          category: "INTERVIEW_SCHEDULED",
          title: `📋 Interview Schedule Created`,
          message: `${recruiter.fullName} scheduled interviews for ${students.length} candidates. Position: ${schedule.position}. Date: ${new Date(schedule.interviewDate).toLocaleDateString()}`,
          type: "info",
          priority: "medium",
          actionUrl: `/admin/schedules`,
          affectedItemId: schedule._id,
          affectedItemType: "InterviewSchedule",
          metadata: {
            recruiterName: recruiter.fullName,
            candidateCount: students.length,
            position: schedule.position,
          },
        });
      }

      console.log(`✅ Interview schedule notifications sent`);
      return true;
    } catch (err) {
      console.error("❌ Error notifying about interview schedule:", err.message);
      return false;
    }
  }

  /**
   * APPLICATION ACCEPTED BY RECRUITER - Notify student
   */
  async applicationAccepted(student, jobDrive, recruiter) {
    try {
      return await this.create({
        recipientFirebaseUid: student.firebaseUid,
        recipientEmail: student.email,
        role: "student",
        category: "APPLICATION_ACCEPTED",
        title: `✅ Application Accepted: ${jobDrive.position}`,
        message: `Congratulations! Your application for ${jobDrive.position} at ${recruiter.companyName} has been accepted. We're excited to proceed with you!`,
        type: "success",
        priority: "high",
        actionUrl: `/student/applications`,
        affectedItemId: jobDrive._id,
        affectedItemType: "JobDrive",
        metadata: {
          position: jobDrive.position,
          company: recruiter.companyName,
          recruiterName: recruiter.fullName,
          jobDriveId: jobDrive._id,
        },
      });
    } catch (err) {
      console.error("❌ Error notifying about application acceptance:", err.message);
      return null;
    }
  }

  /**
   * APPLICATION REJECTED BY RECRUITER - Notify student
   */
  async applicationRejected(student, jobDrive, recruiter, reason = "After review") {
    try {
      return await this.create({
        recipientFirebaseUid: student.firebaseUid,
        recipientEmail: student.email,
        role: "student",
        category: "APPLICATION_REJECTED",
        title: `❌ Application Status: ${jobDrive.position}`,
        message: `Your application for ${jobDrive.position} at ${recruiter.companyName} was not selected for this round. ${reason}. Keep improving and apply to other opportunities!`,
        type: "warning",
        priority: "medium",
        actionUrl: `/student/applications`,
        affectedItemId: jobDrive._id,
        affectedItemType: "JobDrive",
        metadata: {
          position: jobDrive.position,
          company: recruiter.companyName,
          recruiterName: recruiter.fullName,
          jobDriveId: jobDrive._id,
          reason: reason,
        },
      });
    } catch (err) {
      console.error("❌ Error notifying about application rejection:", err.message);
      return null;
    }
  }

  /**
   * ADMIN ACTION WARNING - Deletion of job drive
   */
  async adminDeletedJobDrive(jobDrive, recruiter, students = []) {
    try {
      const Admin = require("../models/Admin");

      // Notify all affected students
      for (const student of students) {
        await this.create({
          recipientFirebaseUid: student.firebaseUid,
          recipientEmail: student.email,
          role: "student",
          category: "JOB_DRIVE_DELETED",
          title: `⚠️ Job Drive Removed: ${jobDrive.position}`,
          message: `The job drive for ${jobDrive.position} at ${recruiter.companyName} has been removed by administrators. Your application has been canceled.`,
          type: "warning",
          priority: "high",
          actionUrl: `/student/job-drives`,
          affectedItemId: jobDrive._id,
          affectedItemType: "JobDrive",
          metadata: {
            position: jobDrive.position,
            company: recruiter.companyName,
            reason: "Admin removed posting",
          },
        });
      }

      // Notify recruiter
      await this.create({
        recipientFirebaseUid: recruiter.firebaseUid,
        recipientEmail: recruiter.email,
        role: "recruiter",
        category: "JOB_DRIVE_DELETED",
        title: `⚠️ Job Drive Deleted by Admin`,
        message: `Your job drive for ${jobDrive.position} has been deleted by administrators. All associated applications have been canceled. Contact support for more details.`,
        type: "warning",
        priority: "high",
        actionUrl: `/recruiter/drives`,
        affectedItemId: jobDrive._id,
        affectedItemType: "JobDrive",
        metadata: {
          position: jobDrive.position,
          company: jobDrive.company,
        },
      });

      // Notify all admins about the deletion action
      const admins = await Admin.find().select("firebaseUid email");
      for (const admin of admins) {
        await this.create({
          recipientFirebaseUid: admin.firebaseUid,
          recipientEmail: admin.email,
          role: "admin",
          category: "SUSPICIOUS_ACTIVITY",
          title: `🚨 Admin Action: Job Drive Deleted`,
          message: `A job drive for ${jobDrive.position} from ${recruiter.companyName} was deleted. ${students.length} affected candidates have been notified.`,
          type: "warning",
          priority: "high",
          actionUrl: `/admin/logs`,
          affectedItemId: jobDrive._id,
          affectedItemType: "JobDrive",
          metadata: {
            position: jobDrive.position,
            recruiterName: recruiter.fullName,
            affectedStudents: students.length,
          },
        });
      }

      console.log(`✅ Job drive deletion notifications sent`);
      return true;
    } catch (err) {
      console.error("❌ Error notifying about job drive deletion:", err.message);
      return false;
    }
  }

  /**
   * ADMIN ACTION WARNING - Deletion of interview schedule
   */
  async adminDeletedSchedule(schedule, students = [], recruiter = null) {
    try {
      const Admin = require("../models/Admin");

      // Notify all affected students
      for (const student of students) {
        await this.create({
          recipientFirebaseUid: student.firebaseUid,
          recipientEmail: student.email,
          role: "student",
          category: "SCHEDULE_DELETED",
          title: `⚠️ Interview Cancelled: ${schedule.position}`,
          message: `Your scheduled interview for ${schedule.position} on ${new Date(schedule.interviewDate).toLocaleDateString()} has been cancelled by administrators. You will be contacted regarding next steps.`,
          type: "warning",
          priority: "high",
          actionUrl: `/student/schedule`,
          affectedItemId: schedule._id,
          affectedItemType: "InterviewSchedule",
          metadata: {
            position: schedule.position,
            reason: "Admin cancelled schedule",
          },
        });
      }

      // Notify recruiter if deletion affects them
      if (recruiter) {
        await this.create({
          recipientFirebaseUid: recruiter.firebaseUid,
          recipientEmail: recruiter.email,
          role: "recruiter",
          category: "SCHEDULE_DELETED",
          title: `⚠️ Interview Schedule Deleted by Admin`,
          message: `Your interview schedule for ${schedule.position} on ${new Date(schedule.interviewDate).toLocaleDateString()} has been deleted by administrators. ${students.length} candidates have been notified.`,
          type: "warning",
          priority: "high",
          actionUrl: `/recruiter/schedule`,
          affectedItemId: schedule._id,
          affectedItemType: "InterviewSchedule",
          metadata: {
            position: schedule.position,
            affectedCandidates: students.length,
          },
        });
      }

      // Notify all admins
      const admins = await Admin.find().select("firebaseUid email");
      for (const admin of admins) {
        await this.create({
          recipientFirebaseUid: admin.firebaseUid,
          recipientEmail: admin.email,
          role: "admin",
          category: "SUSPICIOUS_ACTIVITY",
          title: `🚨 Admin Action: Schedule Deleted`,
          message: `An interview schedule for ${schedule.position} was deleted. ${students.length} affected candidates and recruiter notified.`,
          type: "warning",
          priority: "high",
          actionUrl: `/admin/logs`,
          affectedItemId: schedule._id,
          affectedItemType: "InterviewSchedule",
          metadata: {
            position: schedule.position,
            affectedCount: students.length,
          },
        });
      }

      console.log(`✅ Schedule deletion notifications sent`);
      return true;
    } catch (err) {
      console.error("❌ Error notifying about schedule deletion:", err.message);
      return false;
    }
  }

  /**
   * ADMIN ACTION WARNING - User deletion
   */
  async adminDeletedUser(deletedUser, userType = "student") {
    try {
      const Admin = require("../models/Admin");

      // Notify the deleted user
      await this.create({
        recipientFirebaseUid: deletedUser.firebaseUid,
        recipientEmail: deletedUser.email,
        role: userType,
        category: "ACCOUNT_DELETED",
        title: `⚠️ Account Deactivated`,
        message: `Your account has been deactivated by administrators. If you believe this was an error, please contact support immediately.`,
        type: "warning",
        priority: "high",
        actionUrl: `/`,
        affectedItemId: deletedUser._id,
        affectedItemType: userType.charAt(0).toUpperCase() + userType.slice(1),
        metadata: {
          userType: userType,
          userName: deletedUser.fullName || deletedUser.email,
        },
      });

      // Notify all admins about the deletion
      const admins = await Admin.find().select("firebaseUid email");
      for (const admin of admins) {
        await this.create({
          recipientFirebaseUid: admin.firebaseUid,
          recipientEmail: admin.email,
          role: "admin",
          category: "SUSPICIOUS_ACTIVITY",
          title: `🚨 Admin Action: ${userType.charAt(0).toUpperCase() + userType.slice(1)} Deleted`,
          message: `A ${userType} account (${deletedUser.fullName || deletedUser.email}) has been deleted by administrators.`,
          type: "warning",
          priority: "high",
          actionUrl: `/admin/logs`,
          affectedItemId: deletedUser._id,
          affectedItemType: userType.charAt(0).toUpperCase() + userType.slice(1),
          metadata: {
            userType: userType,
            userName: deletedUser.fullName || deletedUser.email,
          },
        });
      }

      console.log(`✅ User deletion notifications sent`);
      return true;
    } catch (err) {
      console.error("❌ Error notifying about user deletion:", err.message);
      return false;
    }
  }
}

module.exports = NotificationManager;
