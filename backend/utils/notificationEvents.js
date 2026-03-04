/**
 * 🔔 EVENT-DRIVEN NOTIFICATION SYSTEM
 * Centralized event emitter for triggering notifications across the application
 * 
 * Usage:
 * const notificationEvents = require('./notificationEvents');
 * notificationEvents.studentJobShortlisted(student, jobDrive, recruiter);
 */

const EventEmitter = require("events");
const NotificationManager = require("./notificationManager");

class NotificationEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.notificationManager = new NotificationManager();
    this.setupListeners();
  }

  /**
   * Setup all event listeners
   */
  setupListeners() {
    // 🎓 STUDENT EVENTS
    this.on("student:job-posted", (student, jobDrive, recruiter) =>
      this.notificationManager.studentJobPosted(student, jobDrive, recruiter)
    );

    this.on("student:application-submitted", (student, jobDrive, recruiter) =>
      this.notificationManager.studentApplicationSubmitted(student, jobDrive, recruiter)
    );

    this.on("student:application-shortlisted", (student, jobDrive, recruiter) =>
      this.notificationManager.studentApplicationShortlisted(student, jobDrive, recruiter)
    );

    this.on("student:application-rejected", (student, jobDrive, recruiter, reason) =>
      this.notificationManager.studentApplicationRejected(student, jobDrive, recruiter, reason)
    );

    this.on("student:interview-scheduled", (student, schedule) =>
      this.notificationManager.studentInterviewScheduled(student, schedule)
    );

    this.on("student:interview-result", (student, schedule, result) =>
      this.notificationManager.studentInterviewResult(student, schedule, result)
    );

    this.on("student:offer-letter", (student, jobDrive, recruiter) =>
      this.notificationManager.studentOfferLetter(student, jobDrive, recruiter)
    );

    this.on("student:profile-incomplete", (student) =>
      this.notificationManager.studentProfileIncomplete(student)
    );

    this.on("student:document-verified", (student, documentType) =>
      this.notificationManager.studentDocumentVerified(student, documentType)
    );

    this.on("student:document-rejected", (student, documentType, reason) =>
      this.notificationManager.studentDocumentRejected(student, documentType, reason)
    );

    this.on("student:deadline-reminder", (student, jobDrive, recruiter, hoursLeft) =>
      this.notificationManager.studentDeadlineReminder(student, jobDrive, recruiter, hoursLeft)
    );

    this.on("student:achievement-approved", (student, achievement) =>
      this.notificationManager.studentAchievementApproved(student, achievement)
    );

    this.on("student:points-added", (student, points, reason) =>
      this.notificationManager.studentPointsAdded(student, points, reason)
    );

    // 🏢 RECRUITER EVENTS
    this.on("recruiter:application-received", (recruiter, jobDrive, student) =>
      this.notificationManager.recruiterApplicationReceived(recruiter, jobDrive, student)
    );

    this.on("recruiter:application-withdrawn", (recruiter, jobDrive, student) =>
      this.notificationManager.recruiterApplicationWithdrawn(recruiter, jobDrive, student)
    );

    this.on("recruiter:interview-confirmed", (recruiter, schedule, student) =>
      this.notificationManager.recruiterInterviewConfirmed(recruiter, schedule, student)
    );

    this.on("recruiter:job-approved", (recruiter, jobDrive) =>
      this.notificationManager.recruiterJobApproved(recruiter, jobDrive)
    );

    this.on("recruiter:job-rejected", (recruiter, jobDrive, reason) =>
      this.notificationManager.recruiterJobRejected(recruiter, jobDrive, reason)
    );

    this.on("recruiter:drive-scheduled", (recruiter, jobDrive) =>
      this.notificationManager.recruiterDriveScheduled(recruiter, jobDrive)
    );

    this.on("recruiter:drive-reminder", (recruiter, jobDrive, hoursLeft) =>
      this.notificationManager.recruiterDriveReminder(recruiter, jobDrive, hoursLeft)
    );

    this.on("recruiter:profile-incomplete", (recruiter) =>
      this.notificationManager.recruiterProfileIncomplete(recruiter)
    );

    this.on("recruiter:company-verified", (recruiter) =>
      this.notificationManager.recruiterCompanyVerified(recruiter)
    );

    // 👨‍💼 ADMIN EVENTS
    this.on("admin:recruiter-registered", (admin, recruiter) =>
      this.notificationManager.adminRecruiterRegistered(admin, recruiter)
    );

    this.on("admin:job-pending", (admin, jobDrive, recruiter) =>
      this.notificationManager.adminJobPendingApproval(admin, jobDrive, recruiter)
    );

    this.on("admin:achievement-pending", (admin, student, achievement) =>
      this.notificationManager.adminAchievementPending(admin, student, achievement)
    );

    this.on("admin:document-pending", (admin, student, documentType) =>
      this.notificationManager.adminDocumentPending(admin, student, documentType)
    );

    this.on("admin:high-applications", (admin, jobDrive, recruiter, count) =>
      this.notificationManager.adminHighApplicationAlert(admin, jobDrive, recruiter, count)
    );

    this.on("admin:drive-completed", (admin, jobDrive, recruiter, selectedCount) =>
      this.notificationManager.adminDriveCompleted(admin, jobDrive, recruiter, selectedCount)
    );

    this.on("admin:system-error", (admin, message, errorType) =>
      this.notificationManager.adminSystemError(admin, message, errorType)
    );

    this.on("admin:recruiter-deleted-job", (admin, recruiter, jobDrive, reason) =>
      this.notificationManager.adminRecruiterDeletedJob(admin, recruiter, jobDrive, reason)
    );

    // 🔔 BROADCAST EVENTS
    this.on("broadcast:students-job-posted", (students, jobDrive, recruiter) =>
      this.notificationManager.notifyStudentsAboutJob(students, jobDrive, recruiter)
    );
  }

  /**
   * Get notification manager instance
   */
  getManager() {
    return this.notificationManager;
  }
}

// Create singleton instance
const notificationEvents = new NotificationEventEmitter();

module.exports = notificationEvents;
