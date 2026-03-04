// =====================================================================
// EXACT CODE CHANGES NEEDED IN backend/routes/jobDriveRoutes.js
// =====================================================================

// LINE ~193: Fix the newDrive object creation
// ────────────────────────────────────────────────────────────────────

// BEFORE (WRONG):
const newDrive_before = {
  _id: new mongoose.Types.ObjectId(),
  company: String(driveData.company || ""),
  position: String(driveData.position || ""),
  salary: String(driveData.salary || ""),  // ❌ STRING
  location: String(driveData.location || ""),
  date: driveData.date ? new Date(driveData.date) : new Date(),
  applicationDeadline: driveData.applicationDeadline ? new Date(driveData.applicationDeadline) : new Date(),
  jobDescription: String(driveData.jobDescription || ""),
  status: String(driveData.status || "active"),
  eligibilityCriteria: driveData.eligibilityCriteria || { minCGPA: 0, allowedBranches: [], yearsEligible: [] },
  rounds: driveData.rounds || [],
  createdAt: new Date(),
  applicants: [],
  // ❌ MISSING: recruiterId
  // ❌ MISSING: companyWebsite
  // ❌ MISSING: companySize
};

// AFTER (CORRECT):
const newDrive_after = {
  _id: new mongoose.Types.ObjectId(),
  company: String(driveData.company || ""),
  position: String(driveData.position || ""),
  salary: Number(driveData.salary) || 0,  // ✅ NUMBER
  location: String(driveData.location || ""),
  date: driveData.date ? new Date(driveData.date) : new Date(),
  applicationDeadline: driveData.applicationDeadline ? new Date(driveData.applicationDeadline) : new Date(),
  jobDescription: String(driveData.jobDescription || ""),
  status: String(driveData.status || "active"),
  companyWebsite: String(driveData.companyWebsite || ""),  // ✅ ADDED
  companySize: String(driveData.companySize || ""),        // ✅ ADDED
  eligibilityCriteria: driveData.eligibilityCriteria || { minCGPA: 0, allowedBranches: [], yearsEligible: [] },
  rounds: driveData.rounds || [],
  createdAt: new Date(),
  applicants: [],
  recruiterId: recruiter._id.toString() || recruiter.firebaseUid,  // ✅ ADDED
};

// ────────────────────────────────────────────────────────────────────

// LINE ~223: Fix the JobDrive collection save
// ────────────────────────────────────────────────────────────────────

// BEFORE (INCONSISTENT):
const jobDriveDoc_before = new JobDrive({
  recruiterId: recruiter._id.toString() || recruiter.firebaseUid,
  company: newDrive_before.company,
  position: newDrive_before.position,
  location: newDrive_before.location,
  salary: newDrive_before.salary,
  jobDescription: newDrive_before.jobDescription,
  date: newDrive_before.date,
  applicationDeadline: newDrive_before.applicationDeadline,
  eligibilityCriteria: newDrive_before.eligibilityCriteria,
  rounds: newDrive_before.rounds,
  status: newDrive_before.status,
  companyWebsite: driveData.companyWebsite || "",  // ❌ Different source!
  companySize: driveData.companySize || "",        // ❌ Different source!
  applications: [],
});

// AFTER (CONSISTENT):
const jobDriveDoc_after = new JobDrive({
  recruiterId: recruiter._id.toString() || recruiter.firebaseUid,
  company: newDrive_after.company,
  position: newDrive_after.position,
  location: newDrive_after.location,
  salary: newDrive_after.salary,
  jobDescription: newDrive_after.jobDescription,
  date: newDrive_after.date,
  applicationDeadline: newDrive_after.applicationDeadline,
  eligibilityCriteria: newDrive_after.eligibilityCriteria,
  rounds: newDrive_after.rounds,
  status: newDrive_after.status,
  companyWebsite: newDrive_after.companyWebsite,  // ✅ Consistent source
  companySize: newDrive_after.companySize,        // ✅ Consistent source
  applications: [],
});

// ────────────────────────────────────────────────────────────────────

// LINE ~244: Fix the risk evaluation - USE SAVED DOCUMENT
// ────────────────────────────────────────────────────────────────────

// BEFORE (PASSES UNSAVED OBJECT):
const riskResult_before = await DriveRiskEngine.evaluateDriveRisk(newDrive);  // ❌ UNSAVED

if (riskResult_before.success) {
  // ...
} else {
  console.error("Risk evaluation failed:", riskResult.error);
}

// AFTER (PASSES SAVED OBJECT + ERROR HANDLING):
if (!jobDriveDoc) {
  throw new Error("Cannot evaluate risk - JobDrive document was not saved");
}

console.log("[DEBUG] Risk Engine Input:");
console.log("  - _id:", jobDriveDoc._id);
console.log("  - recruiterId:", jobDriveDoc.recruiterId);
console.log("  - salary:", jobDriveDoc.salary, "type:", typeof jobDriveDoc.salary);
console.log("  - companyWebsite:", jobDriveDoc.companyWebsite || "NONE");

const riskResult_after = await DriveRiskEngine.evaluateDriveRisk(jobDriveDoc);  // ✅ SAVED

if (!riskResult_after || !riskResult_after.success) {
  console.error("[ERROR] Risk evaluation failed:", riskResult_after?.error || "Unknown error");
  
  // PROVIDE DEFAULT - don't fail silently
  newDrive_after.riskAnalysis = {
    riskScore: 0,
    riskLevel: "low",
    flags: [riskResult_after?.error || "Risk evaluation could not be performed"],
    autoBlocked: false,
    lastEvaluated: new Date(),
  };
} else {
  newDrive_after.riskAnalysis = riskResult_after.riskAnalysis;
  
  console.log("[SUCCESS] Risk analysis completed");
  console.log("  - Score:", riskResult.riskAnalysis.riskScore);
  console.log("  - Level:", riskResult.riskAnalysis.riskLevel);
  console.log("  - AutoBlocked:", riskResult.autoBlocked);
  console.log("  - Flags:", riskResult.riskAnalysis.flags);
  
  if (riskResult.autoBlocked) {
    console.log("[AUTO-BLOCK] Setting drive status to 'blocked'");
    newDrive.status = "blocked";
  }
  
  // Save risk analysis to database
  const driveIndex = recruiter.jobDrives.findIndex(d => d._id.toString() === newDrive._id.toString());
  if (driveIndex !== -1) {
    recruiter.jobDrives[driveIndex] = newDrive;
    await recruiter.save();
  }
  
  if (riskResult.autoBlocked) {
    await JobDrive.findByIdAndUpdate(
      jobDriveDoc._id,
      { riskAnalysis: riskResult.riskAnalysis, status: "blocked" },
      { new: true }
    );
  } else {
    await JobDrive.findByIdAndUpdate(
      jobDriveDoc._id,
      { riskAnalysis: riskResult.riskAnalysis },
      { new: true }
    );
  }
}

// ────────────────────────────────────────────────────────────────────

// SUMMARY OF CHANGES:
// ────────────────────────────────────────────────────────────────────
// 
// 1. newDrive.salary: String → Number (fixes parseInt NaN issue)
// 2. ADD newDrive.companyWebsite: String  (enables website risk check)
// 3. ADD newDrive.companySize: String (for consistency)  
// 4. ADD newDrive.recruiterId (enables all recruiter-based checks)
// 5. jobDriveDoc uses newDrive fields consistently (not driveData)
// 6. Risk evaluation MUST use jobDriveDoc (saved), not newDrive (embedded)
// 7. Add proper error handling with default riskAnalysis
// 8. Add detailed console logging for debugging
//
// WITHOUT these changes, the risk engine will NEVER work correctly.
// ────────────────────────────────────────────────────────────────────
