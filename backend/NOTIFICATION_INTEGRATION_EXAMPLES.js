/**
 * 🔔 NOTIFICATION SYSTEM - QUICK REFERENCE & INTEGRATION GUIDE
 * Copy-paste these snippets into your controllers
 */

// ════════════════════════════════════════════════════════════════
// 📌 QUICK SETUP
// ════════════════════════════════════════════════════════════════

// 1. In server.js, add:
/*
const http = require('http');
const io = require('socket.io');
const notificationSocket = require('./utils/notificationSocket');
const notificationScheduler = require('./utils/notificationScheduler');

const server = http.createServer(app);
const socketIO = io(server, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true }
});

// Initialize notifications
notificationSocket.initialize(socketIO);
notificationScheduler.startScheduler();

// Mount routes
app.use('/api/notifications', require('./routes/notificationRoutes'));

server.listen(5000);
*/

// 2. In package.json, add:
/*
"dependencies": {
  "socket.io": "^4.x.x",
  "node-cron": "^3.x.x"
}
*/

// ════════════════════════════════════════════════════════════════
// 📄 COPY TO YOUR CONTROLLERS
// ════════════════════════════════════════════════════════════════

const notificationEvents = require('../utils/notificationEvents');
const notificationSocket = require('../utils/notificationSocket');

// ════════════════════════════════════════════════════════════════
// 🎓 STUDENT RELATED NOTIFICATIONS
// ════════════════════════════════════════════════════════════════

/**
 * CONTROLLER: Student applies for job
 */
async function applyForJob(req, res) {
  try {
    const { studentId, jobDriveId } = req.body;

    // Your existing logic...
    const application = await Application.create({
      studentId,
      jobDriveId,
    });

    // Get details
    const student = await Student.findById(studentId);
    const jobDrive = await JobDrive.findById(jobDriveId).populate(
      "recruiterId"
    );
    const recruiter = jobDrive.recruiterId;

    // ✅ TRIGGER NOTIFICATIONS
    notificationEvents.emit("student:application-submitted", student, jobDrive, recruiter);
    notificationEvents.emit("recruiter:application-received", recruiter, jobDrive, student);

    // ✅ REAL-TIME SOCKET.IO
    notificationSocket.notifyUser(student.firebaseUid, {
      title: "✅ Application Submitted",
      message: `Your application for ${jobDrive.position} has been submitted!`,
      type: "success",
      actionUrl: `/student/applications`,
    });

    res.json({ success: true, application });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * CONTROLLER: Recruiter shortlists student
 */
async function shortlistStudent(req, res) {
  try {
    const { applicationId } = req.params;

    const application = await Application.findByIdAndUpdate(applicationId, {
      status: "shortlisted",
    });

    // Get details
    const student = await Student.findById(application.studentId);
    const jobDrive = await JobDrive.findById(application.jobDriveId).populate(
      "recruiterId"
    );
    const recruiter = jobDrive.recruiterId;

    // ✅ TRIGGER NOTIFICATIONS
    notificationEvents.emit(
      "student:application-shortlisted",
      student,
      jobDrive,
      recruiter
    );

    // ✅ REAL-TIME
    notificationSocket.notifyUser(student.firebaseUid, {
      title: "🎉 You've Been Shortlisted!",
      message: `Congratulations! You've been shortlisted for ${jobDrive.position}`,
      type: "success",
      priority: "high",
      actionUrl: `/student/applications`,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * CONTROLLER: Schedule interview
 */
async function scheduleInterview(req, res) {
  try {
    const { studentIds, jobDriveId, date, time } = req.body;

    const schedule = await InterviewSchedule.create({
      jobDriveId,
      candidates: studentIds,
      date,
      time,
    });

    // Get details
    const [students, jobDrive] = await Promise.all([
      Student.find({ _id: { $in: studentIds } }),
      JobDrive.findById(jobDriveId).populate("recruiterId"),
    ]);

    // Notify each student
    for (const student of students) {
      // ✅ TRIGGER NOTIFICATIONS
      notificationEvents.emit("student:interview-scheduled", student, {
        _id: schedule._id,
        company: jobDrive.recruiterId.companyName,
        position: jobDrive.position,
        date,
        time,
      });

      // ✅ REAL-TIME
      notificationSocket.notifyUser(student.firebaseUid, {
        title: "📅 Interview Scheduled!",
        message: `Interview on ${new Date(date).toLocaleDateString()} at ${time}`,
        type: "success",
        priority: "high",
        actionUrl: `/student/interviews`,
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * CONTROLLER: Declare interview result
 */
async function declareInterviewResult(req, res) {
  try {
    const { scheduleId, studentId, result } = req.body;

    const schedule = await InterviewSchedule.findByIdAndUpdate(scheduleId, {
      status: result === "passed" ? "completed_pass" : "completed_fail",
    });

    // Get student and job details
    const student = await Student.findById(studentId);
    const jobDrive = await JobDrive.findById(schedule.jobDriveId).populate(
      "recruiterId"
    );

    // ✅ TRIGGER NOTIFICATIONS
    const resultStatus = result === "passed" ? "passed" : "failed";
    notificationEvents.emit("student:interview-result", student, schedule, resultStatus);

    // ✅ REAL-TIME
    const messageText =
      result === "passed"
        ? "🎉 Congratulations! You passed the interview!"
        : "Thank you for participating!";

    notificationSocket.notifyUser(student.firebaseUid, {
      title: `📊 Interview Result: ${result.toUpperCase()}`,
      message: messageText,
      type: result === "passed" ? "success" : "info",
      priority: "high",
      actionUrl: `/student/interviews`,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * CONTROLLER: Resume verified
 */
async function verifyResume(req, res) {
  try {
    const { studentId } = req.params;

    const student = await Student.findByIdAndUpdate(studentId, {
      resumeVerified: true,
    });

    // ✅ TRIGGER NOTIFICATIONS
    notificationEvents.emit("student:document-verified", student, "Resume");

    // ✅ REAL-TIME
    notificationSocket.notifyUser(student.firebaseUid, {
      title: "✅ Resume Verified",
      message: "Your resume has been verified and approved!",
      type: "success",
      actionUrl: `/student/profile`,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * CONTROLLER: Approve achievement
 */
async function approveAchievement(req, res) {
  try {
    const { achievementId } = req.params;

    const achievement = await Achievement.findByIdAndUpdate(achievementId, {
      status: "approved",
    });

    // Get student
    const student = await Student.findById(achievement.studentId);

    // ✅ TRIGGER NOTIFICATIONS
    notificationEvents.emit("student:achievement-approved", student, achievement);

    // ✅ REAL-TIME
    notificationSocket.notifyUser(student.firebaseUid, {
      title: "🏆 Achievement Approved!",
      message: `Your achievement "${achievement.title}" has been approved!`,
      type: "success",
      actionUrl: `/student/profile`,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ════════════════════════════════════════════════════════════════
// 🏢 RECRUITER RELATED NOTIFICATIONS
// ════════════════════════════════════════════════════════════════

/**
 * CONTROLLER: Recruiter posts job
 */
async function postJob(req, res) {
  try {
    const { recruiterId } = req.params;
    const jobData = req.body;

    const jobDrive = await JobDrive.create({
      ...jobData,
      recruiterId,
      status: "pending", // Wait for admin approval
    });

    // Get recruiter and admin
    const recruiter = await Recruiter.findById(recruiterId);
    const admins = await Admin.find().select("firebaseUid email");

    // ✅ TRIGGER ADMIN NOTIFICATION
    for (const admin of admins) {
      notificationEvents.emit("admin:job-pending", admin, jobDrive, recruiter);

      notificationSocket.notifyUser(admin.firebaseUid, {
        title: "⏳ Job Posting Pending Approval",
        message: `${recruiter.fullName} posted ${jobDrive.position}. Review now.`,
        type: "warning",
        priority: "high",
        actionUrl: `/admin/job-drives`,
      });
    }

    res.json({ success: true, jobDrive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * CONTROLLER: Admin approves recruiter's job
 */
async function approveJob(req, res) {
  try {
    const { jobDriveId } = req.params;

    const jobDrive = await JobDrive.findByIdAndUpdate(jobDriveId, {
      status: "active",
    }).populate("recruiterId");

    const recruiter = jobDrive.recruiterId;

    // ✅ TRIGGER NOTIFICATIONS
    notificationEvents.emit("recruiter:job-approved", recruiter, jobDrive);

    // Send to matching students
    const students = await Student.find({
      branch: { $in: jobDrive.requiredBranches },
      cgpa: { $gte: jobDrive.minimumCGPA },
    });

    notificationEvents.emit(
      "broadcast:students-job-posted",
      students,
      jobDrive,
      recruiter
    );

    // ✅ REAL-TIME - Notify recruiter
    notificationSocket.notifyUser(recruiter.firebaseUid, {
      title: "✅ Job Posting Approved",
      message: `Your ${jobDrive.position} posting is now live!`,
      type: "success",
      priority: "high",
      actionUrl: `/recruiter/job-drives/${jobDrive._id}`,
    });

    // ✅ REAL-TIME - Notify students
    for (const student of students) {
      notificationSocket.notifyUser(student.firebaseUid, {
        title: `🎉 ${jobDrive.position} at ${recruiter.companyName}`,
        message: `Salary: ${jobDrive.salary}. Apply now!`,
        type: "success",
        priority: "high",
        actionUrl: `/student/job-drives/${jobDrive._id}`,
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * CONTROLLER: Recruit confirms interview
 */
async function confirmInterview(req, res) {
  try {
    const { scheduleId, studentId } = req.params;

    const schedule = await InterviewSchedule.findById(scheduleId).populate(
      "recruiterId"
    );

    const student = await Student.findByIdAndUpdate(studentId, {
      interviewConfirmed: true,
    });

    // ✅ TRIGGER NOTIFICATIONS
    notificationEvents.emit("recruiter:interview-accepted", schedule.recruiterId, schedule, student);

    // ✅ REAL-TIME
    notificationSocket.notifyUser(schedule.recruiterId.firebaseUid, {
      title: `✅ ${student.fullName} Confirmed Interview`,
      message: `They will attend on ${new Date(schedule.date).toLocaleDateString()}`,
      type: "success",
      actionUrl: `/recruiter/schedules/${schedule._id}`,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ════════════════════════════════════════════════════════════════
// 👨‍💼 ADMIN RELATED NOTIFICATIONS
// ════════════════════════════════════════════════════════════════

/**
 * CONTROLLER: New recruiter registration
 */
async function registerRecruiter(req, res) {
  try {
    const recruiterData = req.body;
    const recruiter = await Recruiter.create(recruiterData);

    // Get all admins
    const admins = await Admin.find().select("firebaseUid email");

    // ✅ TRIGGER NOTIFICATIONS TO ALL ADMINS
    for (const admin of admins) {
      notificationEvents.emit("admin:recruiter-registered", admin, recruiter);

      notificationSocket.notifyUser(admin.firebaseUid, {
        title: "🆕 New Recruiter Registered",
        message: `${recruiter.fullName} from ${recruiter.companyName} registered. Verify them.`,
        type: "info",
        priority: "medium",
        actionUrl: `/admin/recruiters`,
      });
    }

    res.json({ success: true, recruiter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * CONTROLLER: Verify company
 */
async function verifyCompany(req, res) {
  try {
    const { recruiterId } = req.params;

    const recruiter = await Recruiter.findByIdAndUpdate(recruiterId, {
      companyVerified: true,
    });

    // ✅ TRIGGER NOTIFICATIONS
    notificationEvents.emit("recruiter:company-verified", recruiter);

    // ✅ REAL-TIME
    notificationSocket.notifyUser(recruiter.firebaseUid, {
      title: "✅ Company Verified!",
      message: `${recruiter.companyName} is verified. You can now post drives!`,
      type: "success",
      priority: "high",
      actionUrl: `/recruiter/dashboard`,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * CONTROLLER: Complete drive
 */
async function completeDrive(req, res) {
  try {
    const { jobDriveId } = req.params;
    const { selectedStudentIds } = req.body;

    const jobDrive = await JobDrive.findByIdAndUpdate(jobDriveId, {
      status: "completed",
    }).populate("recruiterId");

    // Get admins
    const admins = await Admin.find().select("firebaseUid email");

    // ✅ TRIGGER ADMIN NOTIFICATIONS
    for (const admin of admins) {
      notificationEvents.emit(
        "admin:drive-completed",
        admin,
        jobDrive,
        jobDrive.recruiterId,
        selectedStudentIds.length
      );

      notificationSocket.notifyUser(admin.firebaseUid, {
        title: "🏁 Drive Completed",
        message: `${jobDrive.company} drive ended. ${selectedStudentIds.length} selected.`,
        type: "success",
        actionUrl: `/admin/job-drives/${jobDrive._id}`,
      });
    }

    // Offer letter notification to selected students
    for (const studentId of selectedStudentIds) {
      const student = await Student.findById(studentId);
      notificationEvents.emit("student:offer-letter", student, jobDrive, jobDrive.recruiterId);

      notificationSocket.notifyUser(student.firebaseUid, {
        title: "🎊 Offer Letter Available!",
        message: `Your offer letter from ${jobDrive.company} is ready!`,
        type: "success",
        priority: "urgent",
        actionUrl: `/student/offers`,
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ════════════════════════════════════════════════════════════════
// 📧 BROADCAST NOTIFICATIONS (TO MULTIPLE USERS)
// ════════════════════════════════════════════════════════════════

/**
 * Notify all students about a new job
 */
async function broadcastJobToStudents(jobDriveId) {
  try {
    const jobDrive = await JobDrive.findById(jobDriveId).populate("recruiterId");

    // Find matching students
    const students = await Student.find({
      branch: { $in: jobDrive.requiredBranches },
      cgpa: { $gte: jobDrive.minimumCGPA },
    });

    // ✅ TRIGGER BROADCAST EVENT
    notificationEvents.emit(
      "broadcast:students-job-posted",
      students,
      jobDrive,
      jobDrive.recruiterId
    );

    // ✅ REAL-TIME TO EACH STUDENT
    for (const student of students) {
      notificationSocket.notifyUser(student.firebaseUid, {
        title: `🎉 New Job: ${jobDrive.position}`,
        message: `${jobDrive.company} is hiring. Apply by ${new Date(jobDrive.applicationDeadline).toLocaleDateString()}`,
        type: "success",
        priority: "high",
        actionUrl: `/student/job-drives/${jobDrive._id}`,
      });
    }

    console.log(`✅ Broadcast to ${students.length} students`);
  } catch (err) {
    console.error("Broadcast error:", err);
  }
}

// ════════════════════════════════════════════════════════════════
// 🔦 UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════════

/**
 * Check notification count for user
 */
async function getUnreadCount(firebaseUid) {
  const count = await Notification.countDocuments({
    recipientFirebaseUid: firebaseUid,
    read: false,
  });
  return count;
}

/**
 * Get all notifications for user
 */
async function getUserNotifications(firebaseUid, limit = 50) {
  const notifications = await Notification.find({
    recipientFirebaseUid: firebaseUid,
  })
    .sort({ createdAt: -1 })
    .limit(limit);
  return notifications;
}

/**
 * Clear all notifications for user
 */
async function clearUserNotifications(firebaseUid) {
  const result = await Notification.deleteMany({
    recipientFirebaseUid: firebaseUid,
  });
  return result.deletedCount;
}

module.exports = {
  // STUDENT
  applyForJob,
  shortlistStudent,
  scheduleInterview,
  declareInterviewResult,
  verifyResume,
  approveAchievement,

  // RECRUITER
  postJob,
  approveJob,
  confirmInterview,

  // ADMIN
  registerRecruiter,
  verifyCompany,
  completeDrive,
  broadcastJobToStudents,

  // UTILITIES
  getUnreadCount,
  getUserNotifications,
  clearUserNotifications,
};
