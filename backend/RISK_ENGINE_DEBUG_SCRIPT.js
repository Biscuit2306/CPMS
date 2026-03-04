// ============================================================
// 🔍 RISK ENGINE DEBUGGING SCRIPT
// ============================================================
// This script helps debug why the risk engine isn't working

const mongoose = require("mongoose");
const JobDrive = require("./models/JobDrive");
const Recruiter = require("./models/Recruiter");
const DriveRiskEngine = require("./services/driveRiskEngine");

async function debugRiskEngine() {
  try {
    console.log("\n" + "=".repeat(70));
    console.log("🔍 DRIVE RISK ENGINE DEBUG ANALYSIS");
    console.log("=".repeat(70));

    // ─────────────────────────────────────────────────────────────
    // ISSUE 1: Check JobDrive Collection Structure
    // ─────────────────────────────────────────────────────────────
    console.log("\n📊 [1] CHECKING JOBDRIVE COLLECTION STRUCTURE\n");
    
    const sampleDrive = await JobDrive.findOne();
    if (!sampleDrive) {
      console.log("❌ NO DRIVES FOUND IN JOBDRIVE COLLECTION!");
      console.log("   This means drives aren't being saved to the collection.");
    } else {
      console.log("✅ Found sample drive:");
      console.log(`   _id: ${sampleDrive._id}`);
      console.log(`   company: ${sampleDrive.company}`);
      console.log(`   position: ${sampleDrive.position}`);
      console.log(`   recruiterId: ${sampleDrive.recruiterId} (type: ${typeof sampleDrive.recruiterId})`);
      console.log(`   salary: ${sampleDrive.salary} (type: ${typeof sampleDrive.salary})`);
      console.log(`   jobDescription: ${sampleDrive.jobDescription ? sampleDrive.jobDescription.substring(0, 50) : "EMPTY"}...`);
      console.log(`   companyWebsite: ${sampleDrive.companyWebsite || "EMPTY"}`);
      console.log(`   date: ${sampleDrive.date}`);
      console.log(`   applicationDeadline: ${sampleDrive.applicationDeadline}`);
      console.log(`   riskAnalysis exists: ${!!sampleDrive.riskAnalysis}`);
      if (sampleDrive.riskAnalysis) {
        console.log(`      - riskScore: ${sampleDrive.riskAnalysis.riskScore}`);
        console.log(`      - riskLevel: ${sampleDrive.riskAnalysis.riskLevel}`);
        console.log(`      - autoBlocked: ${sampleDrive.riskAnalysis.autoBlocked}`);
        console.log(`      - flags: ${JSON.stringify(sampleDrive.riskAnalysis.flags)}`);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // ISSUE 2: Check Recruiter Collection
    // ─────────────────────────────────────────────────────────────
    console.log("\n📊 [2] CHECKING RECRUITER COLLECTION\n");
    
    const sampleRecruiter = await Recruiter.findOne({ jobDrives: { $exists: true, $not: { $size: 0 } } });
    if (!sampleRecruiter) {
      console.log("❌ NO RECRUITERS WITH JOB DRIVES FOUND!");
    } else {
      console.log("✅ Found sample recruiter:");
      console.log(`   _id: ${sampleRecruiter._id}`);
      console.log(`   firebaseUid: ${sampleRecruiter.firebaseUid}`);
      console.log(`   fullName: ${sampleRecruiter.fullName}`);
      console.log(`   companyName: ${sampleRecruiter.companyName || "EMPTY"}`);
      console.log(`   createdAt: ${sampleRecruiter.createdAt}`);
      console.log(`   jobDrives count: ${sampleRecruiter.jobDrives.length}`);
      
      if (sampleRecruiter.jobDrives.length > 0) {
        const firstDrive = sampleRecruiter.jobDrives[0];
        console.log(`\n   First Drive in Recruiter (EMBEDDED MODEL):`);
        console.log(`      - _id: ${firstDrive._id}`);
        console.log(`      - company: ${firstDrive.company}`);
        console.log(`      - position: ${firstDrive.position}`);
        console.log(`      - recruiterId: ${firstDrive.recruiterId || "MISSING!"}`);
        console.log(`      - salary: ${firstDrive.salary}`);
        console.log(`      - jobDescription: ${firstDrive.jobDescription ? firstDrive.jobDescription.substring(0, 50) : "EMPTY"}...`);
        console.log(`      - companyWebsite: ${firstDrive.companyWebsite || "EMPTY"}`);
        console.log(`      - date: ${firstDrive.date}`);
        console.log(`      - applicationDeadline: ${firstDrive.applicationDeadline}`);
        console.log(`      - riskAnalysis exists: ${!!firstDrive.riskAnalysis}`);
        if (firstDrive.riskAnalysis) {
          console.log(`         - riskScore: ${firstDrive.riskAnalysis.riskScore}`);
          console.log(`         - riskLevel: ${firstDrive.riskAnalysis.riskLevel}`);
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // ISSUE 3: Compare Embedded vs Collection Model
    // ─────────────────────────────────────────────────────────────
    console.log("\n📊 [3] DATA MODEL COMPARISON\n");
    
    const collectionDrives = await JobDrive.find().limit(1);
    const recruiterDrives = await Recruiter.findOne({ jobDrives: { $exists: true, $not: { $size: 0 } } });

    if (collectionDrives.length > 0 && recruiterDrives && recruiterDrives.jobDrives.length > 0) {
      const cDrive = collectionDrives[0];
      const eDrive = recruiterDrives.jobDrives[0];

      console.log("Embedded Model (Recruiter.jobDrives[]):");
      console.log(`  - has recruiterId: ${!!eDrive.recruiterId}`);
      console.log(`  - has riskAnalysis: ${!!eDrive.riskAnalysis}`);
      console.log(`  - salary is string: ${typeof eDrive.salary === 'string'}`);
      console.log(`\nCollection Model (JobDrive collection):`);
      console.log(`  - has recruiterId: ${!!cDrive.recruiterId}`);
      console.log(`  - has riskAnalysis: ${!!cDrive.riskAnalysis}`);
      console.log(`  - salary is string: ${typeof cDrive.salary === 'string'}`);
    }

    // ─────────────────────────────────────────────────────────────
    // ISSUE 4: Test Risk Engine Directly
    // ─────────────────────────────────────────────────────────────
    console.log("\n📊 [4] TESTING RISK ENGINE EVALUATION\n");
    
    if (collectionDrives.length > 0) {
      const testDrive = collectionDrives[0];
      console.log(`Testing risk evaluation on drive: ${testDrive.company} - ${testDrive.position}`);
      console.log(`   Input drive has recruiterId: ${!!testDrive.recruiterId}`);
      console.log(`   Input drive has salary: ${!!testDrive.salary} (value: ${testDrive.salary})`);
      console.log(`   Input drive has jobDescription: ${!!testDrive.jobDescription} (length: ${testDrive.jobDescription?.length || 0})`);
      
      try {
        const riskResult = await DriveRiskEngine.evaluateDriveRisk(testDrive);
        console.log(`\n✅ Risk evaluation succeeded:`);
        console.log(`   Success: ${riskResult.success}`);
        if (riskResult.success) {
          console.log(`   Risk Score: ${riskResult.riskAnalysis.riskScore}/100`);
          console.log(`   Risk Level: ${riskResult.riskAnalysis.riskLevel}`);
          console.log(`   Auto-Blocked: ${riskResult.autoBlocked}`);
          console.log(`   Flags:`);
          riskResult.riskAnalysis.flags.forEach(flag => console.log(`      • ${flag}`));
        } else {
          console.log(`   Error: ${riskResult.error}`);
        }
      } catch (err) {
        console.log(`❌ Risk evaluation failed with error:`);
        console.log(`   ${err.message}`);
        console.log(`   Stack: ${err.stack}`);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // ISSUE 5: Check Missing recruiterId in embedded drives
    // ─────────────────────────────────────────────────────────────
    console.log("\n📊 [5] CHECKING FOR MISSING RECRUITER ID IN EMBEDDED DRIVES\n");
    
    const allRecruiters = await Recruiter.find({ jobDrives: { $exists: true, $not: { $size: 0 } } }).limit(5);
    
    let missingRecruiterIdCount = 0;
    allRecruiters.forEach((recruiter, idx) => {
      recruiter.jobDrives.forEach((drive, driveIdx) => {
        if (!drive.recruiterId) {
          missingRecruiterIdCount++;
          console.log(`❌ Recruiter #${idx + 1} -> Drive #${driveIdx + 1}: MISSING recruiterId`);
          console.log(`   Drive: ${drive.company} - ${drive.position}`);
        }
      });
    });

    if (missingRecruiterIdCount === 0) {
      console.log("✅ All embedded drives have recruiterId");
    } else {
      console.log(`\n⚠️ FOUND ${missingRecruiterIdCount} drives without recruiterId!`);
    }

    // ─────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────
    console.log("\n" + "=".repeat(70));
    console.log("📋 SUMMARY OF ISSUES");
    console.log("=".repeat(70));
    console.log(`\n1. ❌ ISSUE: newDrive object in jobDriveRoutes lacks recruiterId`);
    console.log(`   IMPACT: DriveRiskEngine can't lookup recruiter or query database`);
    console.log(`   RESULT: Risk evaluation fails silently or produces invalid results`);
    
    console.log(`\n2. ❌ ISSUE: newDrive passed to evaluateDriveRisk instead of saved document`);
    console.log(`   IMPACT: Missing _id field for duplicate detection queries`);
    console.log(`   RESULT: Queries fail or find duplicates incorrectly`);
    
    console.log(`\n3. ⚠️ Check how data flows from creation to evaluation`);
    console.log(`   ACTION NEEDED: Add comprehensive logging to riskEvaluation init`);
    
    console.log("\n" + "=".repeat(70) + "\n");

  } catch (err) {
    console.error("❌ Debug script error:", err);
  }
}

// Export for use
module.exports = { debugRiskEngine };

// Run if called directly
if (require.main === module) {
  require("dotenv").config();
  const mongoUri = process.env.MONGO_URI;
  
  mongoose.connect(mongoUri)
    .then(() => {
      console.log("✅ Connected to MongoDB");
      return debugRiskEngine();
    })
    .then(() => process.exit(0))
    .catch(err => {
      console.error("Fatal error:", err);
      process.exit(1);
    });
}
