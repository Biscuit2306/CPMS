// ============================================================
// 🚨 CRITICAL ISSUES IN RISK ENGINE
// ============================================================

// ISSUE #1: MISSING recruiterId IN EMBEDDED DRIVE
// ============================================================
// Location: backend/routes/jobDriveRoutes.js (Line ~193)
//
// PROBLEM:
const newDrive_problem1 = {
  _id: new mongoose.Types.ObjectId(),
  company: String(driveData.company || ""),
  // ... other fields ...
  // ❌ MISSING: recruiterId: recruiter._id.toString() or recruiter.firebaseUid
};
//
// WHY IT'S CRITICAL:
// - When evaluateDriveRisk(newDrive) is called, it tries to do:
//   const recruiter = await Recruiter.findById(drive.recruiterId);
// - Without recruiterId, this will ALWAYS return null
// - All recruiter-dependent checks will fail silently
// - Queries like JobDrive.countDocuments({ recruiterId: drive.recruiterId, ... }) won't work
//
// AFFECTED RISK CHECKS:
// 1. New Recruiter Account detection (needs recruiter.createdAt)
// 2. Too Many Drives in Short Time (queries by recruiterId)
// 3. Duplicate Job Posting (queries by recruiterId)
// 4. Recruiter Verification Status (needs recruiter object)
//
// FIX:
const newDrive_fix1 = {
  _id: new mongoose.Types.ObjectId(),
  company: String(driveData.company || ""),
  position: String(driveData.position || ""),
  salary: String(driveData.salary || ""),
  location: String(driveData.location || ""),
  date: driveData.date ? new Date(driveData.date) : new Date(),
  applicationDeadline: driveData.applicationDeadline ? new Date(driveData.applicationDeadline) : new Date(),
  jobDescription: String(driveData.jobDescription || ""),
  status: String(driveData.status || "active"),
  eligibilityCriteria: driveData.eligibilityCriteria || { minCGPA: 0, allowedBranches: [], yearsEligible: [] },
  rounds: driveData.rounds || [],
  createdAt: new Date(),
  applicants: [],
  // ✅ ADD THIS:
  recruiterId: recruiter._id.toString() || recruiter.firebaseUid,
};

// ─────────────────────────────────────────────────────────────

// ISSUE #2: PASSING UNSAVED DOCUMENT TO RISK ENGINE
// ============================================================
// Location: backend/routes/jobDriveRoutes.js (Line ~244)
//
// PROBLEM:
// The code does:
const riskResult_unsaved = await DriveRiskEngine.evaluateDriveRisk(newDrive);
//
// At this point, newDrive is:
// - NOT saved to the database
// - Doesn't have a valid _id that matches any database record
// - Missing properties that the JobDrive model would add on save
//
// WHY IT'S CRITICAL:
// - In DriveRiskEngine.evaluateDriveRisk(), queries like:
//   const similarDrives = await JobDrive.countDocuments({
//     company: drive.company,
//     position: drive.position,
//     _id: { $ne: drive._id },
//   });
// - Will try to match against drive._id which doesn't exist in database
// - Other properties might be in wrong format (missing type conversion)
//
// FIX:
// Should pass the SAVED JobDrive document instead:
const riskResult_saved = await DriveRiskEngine.evaluateDriveRisk(jobDriveDoc);
// where jobDriveDoc is the saved document from:
// await jobDriveDoc.save();

// ─────────────────────────────────────────────────────────────

// ISSUE #3: SALARY FORMAT MISMATCH IN RISK CHECKS
// ============================================================
// Location: backend/routes/jobDriveRoutes.js (Line ~201)
// And: backend/services/driveRiskEngine.js (Line ~24)
//
// PROBLEM:
// In jobDriveRoutes.js:
const salary_string = String(driveData.salary || "");  // Converts to STRING

// In driveRiskEngine.js:
let salaryValue = typeof drive.salary === "string" ? parseInt(drive.salary) : drive.salary;
//
// If salary is "₹5000000" or has non-numeric characters, parseInt will:
// - Return NaN or truncated value
// - Cause all salary comparisons to fail
// - AVERAGE_SALARY comparison: (NaN > 3600000) = false always
//
// BETTER FIX:
// Use consistent number format throughout
const salary_number = Number(driveData.salary) || 0;  // Parse as number immediately

// And in risk engine, validate:
if (isNaN(salaryValue)) {
  console.warn("Invalid salary format:", drive.salary);
  // Don't skip the check, use a default or flag as suspicious
}

// ─────────────────────────────────────────────────────────────

// ISSUE #4: RISK ENGINE EVALUATING WRONG DATA
// ============================================================
// Location: backend/routes/jobDriveRoutes.js (Line ~244)
//
// TIMELINE OF WHAT HAPPENS:
// 1. newDrive created (no recruiterId, unsaved)
// 2. newDrive pushed to recruiter.jobDrives
// 3. recruiter.save() - now embedded drive is saved
// 4. jobDriveDoc created with newDrive fields
// 5. jobDriveDoc.save() - NOW this has a valid _id
// 6. DriveRiskEngine.evaluateDriveRisk(newDrive) - ❌ WRONG OBJECT
//    Should be evaluateDriveRisk(jobDriveDoc) - ✅ CORRECT OBJECT
//
// BECAUSE:
// - newDrive still lacks recruiterId
// - newDrive._id is a generated ObjectId but NOT saved to DB
// - Queries won't find it in database
// - References to drive._id won't match database records

// ─────────────────────────────────────────────────────────────

// ISSUE #5: MISSING companyWebsite IN EMBEDDED DRIVE
// ============================================================
// Location: backend/routes/jobDriveRoutes.js (Line ~193)
//
// PROBLEM:
const newDrive_missing = {
  // ... fields ...
  // ❌ MISSING: companyWebsite
};

// But used in risk check:
if (!drive.companyWebsite || drive.companyWebsite.trim() === "") {
  score += 10;
  flags.push("No company website provided");
}

// And saved to JobDrive collection:
const jobDriveDoc_issue5 = new JobDrive({
  // ...
  companyWebsite: driveData.companyWebsite || "",  // ✅ Added here
  // ...
});

// FIX:
const newDrive_fixed = {
  // ... all fields ...
  companyWebsite: String(driveData.companyWebsite || ""),  // ADD THIS
  companySize: String(driveData.companySize || ""),  // ADD THIS TOO
};

// ─────────────────────────────────────────────────────────────

// ISSUE #6: EMPTY riskResult.success CHECK
// ============================================================
// Location: backend/routes/jobDriveRoutes.js (Line ~248)
//
// PROBLEM:
if (riskResult_issue6.success) {
  // handle success
} else {
  console.error("❌ [11g] Risk evaluation failed:", riskResult_issue6.error);
}

// DriveRiskEngine.evaluateDriveRisk() returns:
// - { success: true, riskAnalysis: {...}, autoBlocked: boolean }
// - { success: false, error: "message" }

// BUT if recruiter is null (due to missing recruiterId):
// Code continues silently, riskAnalysis gets undefined/empty
// Then try to access: riskResult.riskAnalysis.riskLevel - CRASHES

// FIX:
// Make sure riskResult is fully validated
if (!riskResult_issue6 || !riskResult_issue6.success) {
  console.error("❌ Risk evaluation failed:", riskResult_issue6?.error || "Unknown error");
  // Still create empty riskAnalysis or set to default
  newDrive_fixed.riskAnalysis = {
    riskScore: 0,
    riskLevel: "low",
    flags: ["Risk evaluation could not be performed"],
    autoBlocked: false,
    lastEvaluated: new Date(),
  };
} else {
  newDrive_fixed.riskAnalysis = riskResult_issue6.riskAnalysis;
}

// ─────────────────────────────────────────────────────────────

// SUMMARY OF ALL FIXES NEEDED:
// ============================================================
/*
1. ADD recruiterId to newDrive object:
   recruiterId: recruiter._id.toString() || recruiter.firebaseUid

2. ADD companyWebsite and companySize to newDrive object:
   companyWebsite: String(driveData.companyWebsite || ""),
   companySize: String(driveData.companySize || ""),

3. PASS SAVED DOCUMENT to DriveRiskEngine:
   BEFORE: evaluateDriveRisk(newDrive)
   AFTER:  evaluateDriveRisk(jobDriveDoc)

4. FIX salary format (convert to number immediately):
   BEFORE: salary: String(driveData.salary || "")
   AFTER:  salary: Number(driveData.salary) || 0

5. ADD VALIDATION to riskResult handling:
   Check for null/undefined before accessing properties
   Provide default riskAnalysis if evaluation fails

6. ADD ERROR LOGGING to show what's failing:
   Log when recruiter is not found
   Log when database queries return unexpected results
   Log input data format at each step
*/
