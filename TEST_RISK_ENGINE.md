#!/bin/bash
# POSTMAN COLLECTION TEST - Risk Engine Verification
# Copy and paste these into Postman to test the fixed risk engine

# ============================================
# TEST 1: Create a HIGH-RISK Job Drive
# ============================================
# Method: POST
# URL: http://localhost:5000/job-drives
# Headers:
#   Content-Type: application/json

{
  "recruiterFirebaseUid": "risk-test-recruiter-001",
  "driveData": {
    "company": "SuspiciousCompany",
    "position": "Remote Developer",
    "salary": "100000000",
    "location": "Remote",
    "applicationDeadline": "2025-02-28",
    "date": "2025-02-24",
    "jobDescription": "Good job",
    "companyWebsite": "",
    "companySize": "5"
  }
}

# Expected Response:
# ✅ Status: 201 Created
# ✅ newDrive.status: "blocked" (if score >= 75)
# ✅ newDrive.riskAnalysis.riskScore: 60-80
# ✅ newDrive.riskAnalysis.riskLevel: "high"
# ✅ newDrive.riskAnalysis.flags: ["Unrealistic salary", "Short job description", "No company website"]
# ✅ newDrive.riskAnalysis.autoBlocked: true

# Console should show:
# ✅ [11b] Risk evaluation completed: HIGH risk (score: 70+)
# ✅ [11c] Drive AUTO-BLOCKED due to high risk

---

# ============================================
# TEST 2: Create a MEDIUM-RISK Job Drive
# ============================================
# Method: POST
# URL: http://localhost:5000/job-drives
# Headers:
#   Content-Type: application/json

{
  "recruiterFirebaseUid": "risk-test-recruiter-002",
  "driveData": {
    "company": "ModerateCompany",
    "position": "Frontend Developer",
    "salary": "2000000",
    "location": "Bangalore, India",
    "applicationDeadline": "2025-03-31",
    "date": "2025-02-24",
    "jobDescription": "We are looking for an experienced frontend developer with 5+ years of experience in React and Node.js to join our growing team.",
    "companyWebsite": "https://moderate-company.com",
    "companySize": "50-100"
  }
}

# Expected Response:
# ✅ Status: 201 Created
# ✅ newDrive.status: "active" (not blocked)
# ✅ newDrive.riskAnalysis.riskScore: 30-45
# ✅ newDrive.riskAnalysis.riskLevel: "low" or "medium"
# ✅ newDrive.riskAnalysis.flags: [] (few or none)
# ✅ newDrive.riskAnalysis.autoBlocked: false

# Console should show:
# ✅ [11b] Risk evaluation completed: LOW risk (score: 20-30)

---

# ============================================
# TEST 3: Re-evaluate a Drive's Risk
# ============================================
# Method: POST
# URL: http://localhost:5000/risk/re-evaluate/:driveId
# Headers:
#   Content-Type: application/json

# Replace :driveId with the JobDrive _id from TEST 1

# Expected Response:
# ✅ Status: 200 OK
# ✅ riskAnalysis with updated scores
# ✅ Same flags as original evaluation

---

# ============================================
# TEST 4: Get Risk Summary
# ============================================
# Method: GET
# URL: http://localhost:5000/risk/summary

# Expected Response:
# ✅ Status: 200 OK
# ✅ totalDrives: 3 (from tests 1-3)
# ✅ highRiskCount: 1 (TEST 1)
# ✅ mediumRiskCount: 1 (TEST 2)
# ✅ lowRiskCount: 1 (if any)
# ✅ blockedCount: 1 (TEST 1)

---

# ============================================
# TEST 5: Get Detailed Risk Report
# ============================================
# Method: GET
# URL: http://localhost:5000/risk/details/:driveId

# Replace :driveId with the JobDrive _id from TEST 1

# Expected Response:
# ✅ Status: 200 OK
# ✅ Full riskAnalysis object
# ✅ riskScore: 70+
# ✅ riskLevel: "high"
# ✅ flags: ["Unrealistic salary", "Short job description", "No company website", ...]
# ✅ autoBlocked: true
# ✅ status: "blocked"

---

# ============================================
# DEBUGGING: Check MongoDB Directly
# ============================================

# In MongoDB Compass or mongosh:

# Check embedded model (Recruiter):
use cpms_db
db.recruiters.findOne(
  { firebaseUid: "risk-test-recruiter-001" },
  { jobDrives: 1 }
)

# Should show:
# {
#   _id: ObjectId(...),
#   firebaseUid: "risk-test-recruiter-001",
#   jobDrives: [
#     {
#       _id: ObjectId(...),
#       company: "SuspiciousCompany",
#       salary: 100000000,           // ✅ Should be NUMBER
#       recruiterId: "...",           // ✅ Should be present
#       companyWebsite: "",           // ✅ Should be present
#       companySize: "5",             // ✅ Should be present
#       riskAnalysis: {
#         riskScore: 75,              // ✅ Should be 75+
#         riskLevel: "high",          // ✅ Should be "high"
#         flags: [...],               // ✅ Should have multiple flags
#         autoBlocked: true,          // ✅ Should be true
#         lastEvaluated: Date
#       },
#       status: "blocked"             // ✅ Should be "blocked"
#     }
#   ]
# }

# Check collection model (JobDrive):
db.jobdrives.findOne({ 
  recruiterId: new ObjectId("...") 
})

# Should show:
# {
#   _id: ObjectId(...),
#   recruiterId: ObjectId("..."),      // ✅ Should be ObjectId (different from embedded)
#   company: "SuspiciousCompany",
#   salary: 100000000,                 // ✅ Should be NUMBER
#   companyWebsite: "",                // ✅ Should be present
#   companySize: "5",                  // ✅ Should be present
#   riskAnalysis: {
#     riskScore: 75,                   // ✅ Should match embedded model
#     riskLevel: "high",               // ✅ Should match
#     flags: [...],                    // ✅ Should match
#     autoBlocked: true,               // ✅ Should match
#     lastEvaluated: Date
#   },
#   status: "blocked"                  // ✅ Should match
# }

---

# ============================================
# CONSOLE LOGS CHECKLIST
# ============================================

# When creating TEST 1 drive, you should see:
#
# ✓ [7] Found/created recruiter: (name or uid)
# ✓ [8] Drive object prepared
# ✓ [9] Current drives count: 0
# ✓ [10] Drive pushed, new count: 1
# ✅ [11] Drive created successfully: (ObjectId)
# 💾 [11.5] Saving drive to JobDrive collection...
# ✅ [11.6] Drive saved to JobDrive collection: (ObjectId)
# 🚨 [11a] Starting risk evaluation for new drive...
# ✅ [11b] Risk evaluation completed: HIGH risk (score: 75)
# ⛔ [11c] Drive AUTO-BLOCKED due to high risk (75/100)
#    Flags: Unrealistic salary detected, Short job description, Missing company website, New recruiter account
# ✅ [11d] Drive risk analysis saved to Recruiter collection
# ✅ [11e] Drive risk analysis saved to JobDrive collection
# 🔔 [12] Sending notifications to ALL students...

# If you DON'T see these logs, check:
# 1. Is backend actually restarted after fixes?
# 2. Are there any error logs above?
# 3. Is the risk engine being called?

---

# ============================================
# RISK SCORE CALCULATION REFERENCE
# ============================================

# For test data in TEST 1:
# {
#   "salary": "100000000",                    # 100M INR
#   "jobDescription": "Good job"              # Very short
#   "companyWebsite": ""                      # Empty = missing
#   "companySize": "5"                        # Tiny company
#   "position": "Remote Developer"            # Generic
#   "applicationDeadline": "2025-02-28"       # Soon deadline
# }

# Risk checks triggered:
# 1. Unrealistic salary: 100M > 36M limit → +30 points
# 2. Short job description: < 50 chars → +10 points
# 3. No company website: empty string → +10 points
# 4. Tiny company size: 5 people → +10 points
# 5. Missing essential info: varies
# 6. New recruiter: varies (depends on account age)
# 7. Suspicious description: varies
# 8. Deadline too soon: 2025-02-28 (4 days) → +20 points
# 9. Duplicate posting: No duplicates → +0 points

# TOTAL ESTIMATED: 30 + 10 + 10 + 10 + 20 = 80+ points = HIGH RISK + AUTO-BLOCK

---

# ============================================
# VERIFICATION CHECKLIST
# ============================================

[  ] Backend started successfully on port 5000
[  ] TEST 1 POST returns 201 status
[  ] Console shows [11b] with HIGH risk score 75+
[  ] Console shows [11c] with AUTO-BLOCKED message
[  ] Response shows riskAnalysis.autoBlocked = true
[  ] Response shows status = "blocked"
[  ] TEST 2 POST returns 201 status
[  ] Console shows [11b] with LOW/MEDIUM risk
[  ] Response shows riskAnalysis.autoBlocked = false
[  ] Response shows status = "active"
[  ] MongoDB embedded model has recruiterId
[  ] MongoDB embedded model has salary as NUMBER
[  ] MongoDB collection model has recruiterId
[  ] MongoDB collection model has salary as NUMBER
[  ] Both models have identical riskAnalysis data
[  ] TEST 4 GET risk/summary shows correct counts
[  ] TEST 5 GET risk/details shows full analysis

# Once ALL checkboxes are marked, the risk engine is working correctly!

