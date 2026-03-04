require('dotenv').config();
const mongoose = require('mongoose');
const Recruiter = require('./models/Recruiter');
const Student = require('./models/Student');
const InterviewSchedule = require('./models/InterviewSchedule');
const Notification = require('./models/Notification');

async function debug() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected\n');

    // Get active job drives
    const recruiters = await Recruiter.find();
    console.log('🔎 ACTIVE JOB DRIVES:');
    recruiters.forEach(r => {
      r.jobDrives?.forEach(d => {
        if (d.status !== 'deleted' && !d.isDeleted) {
          console.log(`\n  Drive ID: ${d._id}`);
          console.log(`  Position: ${d.position} @ ${d.company}`);
          console.log(`  Status: ${d.status}`);
          console.log(`  Applications: ${d.applications?.length || 0}`);
        }
      });
    });

    // Get student applications
    const students = await Student.find();
    console.log('\n\n🔎 STUDENT APPLICATIONS:');
    students.forEach(s => {
      if (s.applications?.length > 0) {
        console.log(`\nStudent: ${s.fullName} (${s.firebaseUid})`);
        s.applications.forEach(app => {
          console.log(`  - Drive ID: ${app.driveId}`);
          console.log(`    Position: ${app.position}`);
          console.log(`    Status: ${app.applicationStatus}`);
        });
      }
    });

    // Check interview schedules
    const schedules = await InterviewSchedule.find();
    console.log('\n\n🔎 INTERVIEW SCHEDULES:');
    schedules.forEach(s => {
      console.log(`\nSchedule ID: ${s._id}`);
      console.log(`  Position: ${s.position}`);
      console.log(`  Job Drive ID: ${s.jobDriveId}`);
      console.log(`  Date: ${new Date(s.date).toLocaleDateString()}`);
      console.log(`  Company: ${s.company}`);
    });

    // Check notifications for schedule
    const notifs = await Notification.find({ category: 'student_interview_scheduled' });
    console.log(`\n\n🔔 SCHEDULE NOTIFICATIONS: ${notifs.length}`);
    notifs.forEach(n => {
      console.log(`  - To: ${n.recipientEmail}`);
      console.log(`    Title: ${n.title}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Debug complete');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

debug();
