/**
 * 🔔 NOTIFICATION CONSTANTS
 * Centralized constants for the notification system
 */

// 👥 ROLES
const ROLES = {
  STUDENT: "student",
  RECRUITER: "recruiter",
  ADMIN: "admin",
};

// 📌 STUDENT NOTIFICATION CATEGORIES
const STUDENT_CATEGORIES = {
  // Job Related
  JOB_POSTED: "student_job_posted",
  APPLICATION_SUBMITTED: "student_application_submitted",
  APPLICATION_SHORTLISTED: "student_application_shortlisted",
  APPLICATION_REJECTED: "student_application_rejected",
  
  // Interview Related
  INTERVIEW_SCHEDULED: "student_interview_scheduled",
  INTERVIEW_RESULT: "student_interview_result",
  OFFER_LETTER: "student_offer_letter",
  
  // Admin/Profile
  PROFILE_INCOMPLETE: "student_profile_incomplete",
  DOCUMENT_APPROVED: "student_document_approved",
  DOCUMENT_REJECTED: "student_document_rejected",
  RESUME_VERIFIED: "student_resume_verified",
  
  // Deadlines & Achievements
  DEADLINE_REMINDER: "student_deadline_reminder",
  ACHIEVEMENT_APPROVED: "student_achievement_approved",
  POINTS_ADDED: "student_points_added",
};

// 🏢 RECRUITER NOTIFICATION CATEGORIES
const RECRUITER_CATEGORIES = {
  // Student Activity
  APPLICATION_RECEIVED: "recruiter_application_received",
  APPLICATION_WITHDRAWN: "recruiter_application_withdrawn",
  INTERVIEW_ACCEPTED: "recruiter_interview_accepted",
  
  // Admin Related
  JOB_APPROVED: "recruiter_job_approved",
  JOB_REJECTED: "recruiter_job_rejected",
  
  // Drive Related
  DRIVE_SCHEDULED: "recruiter_drive_scheduled",
  DRIVE_REMINDER: "recruiter_drive_reminder",
  
  // Profile
  PROFILE_INCOMPLETE: "recruiter_profile_incomplete",
  COMPANY_VERIFIED: "recruiter_company_verified",
  JOB_POSTED: "recruiter_job_posted",
};

// 👨‍💼 ADMIN NOTIFICATION CATEGORIES
const ADMIN_CATEGORIES = {
  // Approvals
  RECRUITER_REGISTERED: "admin_recruiter_registered",
  JOB_PENDING: "admin_job_pending",
  ACHIEVEMENT_PENDING: "admin_achievement_pending",
  DOCUMENT_PENDING: "admin_document_pending",
  
  // Alerts
  HIGH_APPLICATIONS: "admin_alert_applications",
  RECRUITER_ACTION: "admin_recruiter_action",
  DRIVE_COMPLETED: "admin_drive_completed",
  SYSTEM_ERROR: "admin_system_error",
};

// 🎨 NOTIFICATION TYPES
const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
};

// 🔴 PRIORITY LEVELS
const PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

// 📋 AFFECTED ITEM TYPES
const ITEM_TYPES = {
  JOB_DRIVE: "JobDrive",
  INTERVIEW_SCHEDULE: "InterviewSchedule",
  STUDENT: "Student",
  APPLICATION: "Application",
  RECRUITER: "Recruiter",
  ADMIN: "Admin",
  ACHIEVEMENT: "Achievement",
};

// 📌 NOTIFICATION TEMPLATES
const TEMPLATES = {
  // 🎓 STUDENT TEMPLATES
  STUDENT: {
    JOB_POSTED: {
      title: "🎉 New Job Posted: {position}",
      message: "{company} is hiring for {position}. Salary: {salary}. Deadline: {deadline}",
      type: NOTIFICATION_TYPES.SUCCESS,
      priority: PRIORITIES.HIGH,
      action: "/student/job-drives/{jobDriveId}",
    },
    APPLICATION_SUBMITTED: {
      title: "✅ Application Submitted",
      message: "Your application for {position} at {company} has been submitted successfully. Good luck!",
      type: NOTIFICATION_TYPES.SUCCESS,
      priority: PRIORITIES.MEDIUM,
      action: "/student/applications",
    },
    APPLICATION_SHORTLISTED: {
      title: "🎉 You've Been Shortlisted!",
      message: "Congratulations! You have been shortlisted for {position} at {company}.",
      type: NOTIFICATION_TYPES.SUCCESS,
      priority: PRIORITIES.HIGH,
      action: "/student/applications",
    },
    APPLICATION_REJECTED: {
      title: "Application Status Update",
      message: "Your application for {position} at {company} has been updated. Reason: {reason}",
      type: NOTIFICATION_TYPES.WARNING,
      priority: PRIORITIES.MEDIUM,
      action: "/student/applications",
    },
    INTERVIEW_SCHEDULED: {
      title: "📅 Interview Scheduled!",
      message: "Your interview for {position} at {company} is on {date} at {time}",
      type: NOTIFICATION_TYPES.SUCCESS,
      priority: PRIORITIES.HIGH,
      action: "/student/interviews",
    },
    INTERVIEW_RESULT: {
      title: "📊 Interview Result: {result}",
      message: "{resultMessage} Check your interview page for details.",
      type: "{resultType}",
      priority: PRIORITIES.HIGH,
      action: "/student/interviews",
    },
    OFFER_LETTER: {
      title: "🎊 Offer Letter Available!",
      message: "Your offer letter from {company} for {position} is ready. Download it now!",
      type: NOTIFICATION_TYPES.SUCCESS,
      priority: PRIORITIES.URGENT,
      action: "/student/offers",
    },
    PROFILE_INCOMPLETE: {
      title: "⚠️ Complete Your Profile",
      message: "Your profile is incomplete. Complete all sections to increase your chances.",
      type: NOTIFICATION_TYPES.WARNING,
      priority: PRIORITIES.MEDIUM,
      action: "/student/profile",
    },
    DOCUMENT_VERIFIED: {
      title: "✅ {docType} Verified",
      message: "Your {docType} has been verified and approved. You're all set!",
      type: NOTIFICATION_TYPES.SUCCESS,
      priority: PRIORITIES.MEDIUM,
      action: "/student/profile",
    },
    DOCUMENT_REJECTED: {
      title: "❌ {docType} Rejected",
      message: "Your {docType} was rejected. Reason: {reason}. Please upload a corrected version.",
      type: NOTIFICATION_TYPES.ERROR,
      priority: PRIORITIES.HIGH,
      action: "/student/profile",
    },
    DEADLINE_REMINDER: {
      title: "⏰ Deadline Closing Soon!",
      message: "Application deadline for {position} at {company} closes in {hoursLeft} hours!",
      type: NOTIFICATION_TYPES.WARNING,
      priority: PRIORITIES.HIGH,
      action: "/student/job-drives/{jobDriveId}",
    },
    ACHIEVEMENT_APPROVED: {
      title: "🏆 Achievement Approved!",
      message: "Your achievement \"{title}\" has been approved and added to your profile!",
      type: NOTIFICATION_TYPES.SUCCESS,
      priority: PRIORITIES.MEDIUM,
      action: "/student/profile",
    },
    POINTS_ADDED: {
      title: "⭐ {points} Credits Added!",
      message: "You earned {points} credits for {reason}. Keep participating!",
      type: NOTIFICATION_TYPES.SUCCESS,
      priority: PRIORITIES.LOW,
      action: "/student/dashboard",
    },
  },

  // 🏢 RECRUITER TEMPLATES
  RECRUITER: {
    APPLICATION_RECEIVED: {
      title: "📧 New Application from {studentName}",
      message: "{studentName} ({branch}) applied for {position}. CGPA: {cgpa}",
      type: NOTIFICATION_TYPES.INFO,
      priority: PRIORITIES.MEDIUM,
      action: "/recruiter/applications/{jobDriveId}",
    },
    APPLICATION_WITHDRAWN: {
      title: "🚪 Application Withdrawn",
      message: "{studentName} has withdrawn their application for {position}",
      type: NOTIFICATION_TYPES.INFO,
      priority: PRIORITIES.LOW,
      action: "/recruiter/applications/{jobDriveId}",
    },
    INTERVIEW_ACCEPTED: {
      title: "✅ Interview Confirmed",
      message: "{studentName} has confirmed their attendance for the interview on {date}",
      type: NOTIFICATION_TYPES.SUCCESS,
      priority: PRIORITIES.MEDIUM,
      action: "/recruiter/schedules/{scheduleId}",
    },
    JOB_APPROVED: {
      title: "✅ Job Posting Approved",
      message: "Your job posting for {position} has been approved. It's now live!",
      type: NOTIFICATION_TYPES.SUCCESS,
      priority: PRIORITIES.HIGH,
      action: "/recruiter/job-drives/{jobDriveId}",
    },
    JOB_REJECTED: {
      title: "❌ Job Posting Rejected",
      message: "Your job posting for {position} was rejected. Reason: {reason}",
      type: NOTIFICATION_TYPES.ERROR,
      priority: PRIORITIES.HIGH,
      action: "/recruiter/job-drives/{jobDriveId}",
    },
    DRIVE_SCHEDULED: {
      title: "📅 Drive Scheduled Successfully",
      message: "Your placement drive for {position} is scheduled for {date}",
      type: NOTIFICATION_TYPES.SUCCESS,
      priority: PRIORITIES.HIGH,
      action: "/recruiter/job-drives/{jobDriveId}",
    },
    DRIVE_REMINDER: {
      title: "🔔 Drive Happening Soon!",
      message: "Your {position} drive is happening in {hoursLeft} hours. Get ready!",
      type: NOTIFICATION_TYPES.WARNING,
      priority: PRIORITIES.HIGH,
      action: "/recruiter/job-drives/{jobDriveId}",
    },
    PROFILE_INCOMPLETE: {
      title: "⚠️ Complete Your Profile",
      message: "Your company profile is incomplete. Complete all sections to post jobs.",
      type: NOTIFICATION_TYPES.WARNING,
      priority: PRIORITIES.MEDIUM,
      action: "/recruiter/profile",
    },
    COMPANY_VERIFIED: {
      title: "✅ Company Verified!",
      message: "{company} has been verified. You can now post job drives!",
      type: NOTIFICATION_TYPES.SUCCESS,
      priority: PRIORITIES.HIGH,
      action: "/recruiter/dashboard",
    },
  },

  // 👨‍💼 ADMIN TEMPLATES
  ADMIN: {
    RECRUITER_REGISTERED: {
      title: "🆕 New Recruiter Registered",
      message: "{recruiterName} from {company} has registered. Verify their details.",
      type: NOTIFICATION_TYPES.INFO,
      priority: PRIORITIES.MEDIUM,
      action: "/admin/recruiters",
    },
    JOB_PENDING: {
      title: "⏳ Job Posting Pending Approval",
      message: "{recruiter} from {company} posted {position}. Review and approve.",
      type: NOTIFICATION_TYPES.WARNING,
      priority: PRIORITIES.HIGH,
      action: "/admin/job-drives",
    },
    ACHIEVEMENT_PENDING: {
      title: "📋 Achievement Pending Verification",
      message: "{studentName} submitted \"{title}\". Verify and approve.",
      type: NOTIFICATION_TYPES.WARNING,
      priority: PRIORITIES.MEDIUM,
      action: "/admin/students",
    },
    DOCUMENT_PENDING: {
      title: "📋 {docType} Pending Verification",
      message: "{studentName} submitted a {docType}. Please review.",
      type: NOTIFICATION_TYPES.WARNING,
      priority: PRIORITIES.MEDIUM,
      action: "/admin/students/{studentId}",
    },
    HIGH_APPLICATIONS: {
      title: "⏰ High Application Count Alert",
      message: "\"{position}\" at {company} has {count} applications.",
      type: NOTIFICATION_TYPES.INFO,
      priority: PRIORITIES.LOW,
      action: "/admin/job-drives/{jobDriveId}",
    },
    DRIVE_COMPLETED: {
      title: "🏁 Drive Completed",
      message: "{company}'s drive for {position} is complete. {selectedCount} selected.",
      type: NOTIFICATION_TYPES.SUCCESS,
      priority: PRIORITIES.MEDIUM,
      action: "/admin/job-drives/{jobDriveId}",
    },
    SYSTEM_ERROR: {
      title: "⚠️ System Error: {errorType}",
      message: "A system error occurred: {message}. Please investigate.",
      type: NOTIFICATION_TYPES.ERROR,
      priority: PRIORITIES.URGENT,
      action: "/admin/logs",
    },
  },
};

// 🔔 BULK THRESHOLD ALERTS
const ALERT_THRESHOLDS = {
  HIGH_APPLICATIONS_COUNT: 50,
  DEADLINE_HOURS_REMINDER: 24,
  DRIVE_HOURS_REMINDER: 24,
};

// 📧 EMAIL SETTINGS
const EMAIL_CONFIG = {
  SEND_ON_CREATION: true,
  BATCH_SEND_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MAX_BATCH_SIZE: 100,
};

// ⏰ SCHEDULED REMINDERS
const SCHEDULED_REMINDERS = {
  DEADLINE_CHECK_INTERVAL: 60 * 60 * 1000, // Every hour
  INTERVIEW_REMINDER_INTERVAL: 60 * 60 * 1000,
  PROFILE_INCOMPLETE_CHECK: 7 * 24 * 60 * 60 * 1000, // Weekly
};

/**
 * Parse template with variables
 * @param {string} template - Template string with {variable} placeholders
 * @param {object} data - Data object with variable values
 * @returns {string} Parsed string
 */
function parseTemplate(template, data = {}) {
  if (!template) return "";
  return template.replace(/{(\w+)}/g, (match, key) => data[key] || match);
}

/**
 * Get notification template for a category
 * @param {string} role - User role
 * @param {string} category - Notification category
 * @returns {object} Template object
 */
function getTemplate(role, category) {
  const roleTemplates = TEMPLATES[role.toUpperCase()];
  if (!roleTemplates) return null;

  // Convert category to uppercase key (e.g., "student_job_posted" -> "JOB_POSTED")
  const key = category.split("_").slice(1).join("_").toUpperCase();
  return roleTemplates[key] || null;
}

module.exports = {
  ROLES,
  STUDENT_CATEGORIES,
  RECRUITER_CATEGORIES,
  ADMIN_CATEGORIES,
  NOTIFICATION_TYPES,
  PRIORITIES,
  ITEM_TYPES,
  TEMPLATES,
  ALERT_THRESHOLDS,
  EMAIL_CONFIG,
  SCHEDULED_REMINDERS,
  parseTemplate,
  getTemplate,
};
