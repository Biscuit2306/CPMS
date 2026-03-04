# 🔌 Risk Analysis Integration Points

## How to Integrate Risk Analysis into Your Existing Code

### 1. On Student Registration/Creation

**File:** `backend/routes/authRoutes.js` or `backend/controllers/authController.js`

**Add to student creation:**

```javascript
const RiskEngine = require("../services/riskEngine");

// After student is created in database
const newStudent = new Student({ /* fields */ });
await newStudent.save();

// Evaluate risk immediately
const registrationIP = req.ip || req.connection.remoteAddress;
const riskResult = await RiskEngine.evaluateStudentRisk(newStudent, registrationIP);

if (riskResult.success) {
  await newStudent.save(); // Save updated risk analysis
  console.log(`✅ Student risk evaluated: ${riskResult.riskAnalysis.riskLevel}`);
} else {
  console.error("❌ Risk evaluation failed:", riskResult.error);
}

res.json({ success: true, student: newStudent });
```

---

### 2. On Recruiter Registration/Creation

**File:** `backend/routes/recruiterRoutes.js` or `backend/controllers/recruiterController.js`

**Add to recruiter creation:**

```javascript
const RiskEngine = require("../services/riskEngine");

// After recruiter is created
const newRecruiter = new Recruiter({ /* fields */ });
await newRecruiter.save();

// Evaluate risk immediately
const registrationIP = req.ip || req.connection.remoteAddress;
const riskResult = await RiskEngine.evaluateRecruiterRisk(newRecruiter, registrationIP);

if (riskResult.success) {
  await newRecruiter.save();
  console.log(`✅ Recruiter risk evaluated: ${riskResult.riskAnalysis.riskLevel}`);
}

res.json({ success: true, recruiter: newRecruiter });
```

---

### 3. On Student Profile Update

**File:** `backend/controllers/studentController.js`

**Add to profile update endpoint:**

```javascript
const RiskEngine = require("../services/riskEngine");

// After updating student profile
const updatedStudent = await Student.findByIdAndUpdate(
  studentId,
  updateData,
  { new: true }
);

// Re-evaluate risk
const riskResult = await RiskEngine.evaluateStudentRisk(updatedStudent);
if (riskResult.success) {
  await updatedStudent.save();
}

res.json({ success: true, student: updatedStudent });
```

---

### 4. On Recruiter Profile Update

**File:** `backend/controllers/recruiterController.js`

**Add to profile update endpoint:**

```javascript
const RiskEngine = require("../services/riskEngine");

// After updating recruiter profile
const updatedRecruiter = await Recruiter.findByIdAndUpdate(
  recruiterId,
  updateData,
  { new: true }
);

// Re-evaluate risk
const riskResult = await RiskEngine.evaluateRecruiterRisk(updatedRecruiter);
if (riskResult.success) {
  await updatedRecruiter.save();
}

res.json({ success: true, recruiter: updatedRecruiter });
```

---

### 5. On Job Drive Creation

**File:** `backend/controllers/jobDriveController.js` or `backend/routes/jobDriveRoutes.js`

**Add to drive creation:**

```javascript
const DriveRiskEngine = require("../services/driveRiskEngine");

// After creating new drive
const newDrive = new JobDrive({ /* fields */ });
await newDrive.save();

// Evaluate drive risk
const riskResult = await DriveRiskEngine.evaluateDriveRisk(newDrive);

if (riskResult.success) {
  await newDrive.save();
  
  // If auto-blocked, notify recruiter
  if (riskResult.autoBlocked) {
    console.log(`⚠️ Drive auto-blocked due to risk: ${riskResult.riskAnalysis.riskScore}%`);
    // Send notification to recruiter
    // sendNotification(recruiter, "Your drive was blocked for review");
  }
}

res.json({ success: true, drive: newDrive });
```

---

### 6. Setup Daily Cron Job

**File:** `backend/server.js`

**Add before server.listen():**

```javascript
const cron = require("node-cron"); // Already imported
const RiskEngine = require("./services/riskEngine");
const DriveRiskEngine = require("./services/driveRiskEngine");

// Run daily at 2 AM
cron.schedule("0 2 * * *", async () => {
  try {
    console.log("🔄 [CRON] Starting daily risk re-evaluation...");
    
    const studentResult = await RiskEngine.reevaluateAllStudents();
    const recruiterResult = await RiskEngine.reevaluateAllRecruiters();
    const driveResult = await DriveRiskEngine.reevaluateAllDrives();
    
    console.log("✅ [CRON] Student evaluation:", {
      processed: studentResult.processed,
      errors: studentResult.errors,
      total: studentResult.total
    });
    
    console.log("✅ [CRON] Recruiter evaluation:", {
      processed: recruiterResult.processed,
      errors: recruiterResult.errors,
      total: recruiterResult.total
    });
    
    console.log("✅ [CRON] Drive evaluation:", {
      processed: driveResult.processed,
      errors: driveResult.errors,
      autoBlocked: driveResult.autoBlocked,
      total: driveResult.total
    });
    
  } catch (error) {
    console.error("❌ [CRON] Risk evaluation failed:", error);
  }
});

console.log("✅ Cron job scheduled: Daily risk re-evaluation at 2 AM");
```

---

### 7. Prevent High-Risk Drives from Appearing to Students

**File:** `backend/routes/jobDriveRoutes.js` or controller

**Filter out auto-blocked drives:**

```javascript
// When fetching drives for students
const getPublicDrives = async (req, res) => {
  try {
    // Only show drives that are NOT auto-blocked
    const drives = await JobDrive.find({
      status: { $in: ["active", "scheduled"] },
      isBlocked: false,
      "riskAnalysis.autoBlocked": { $ne: true }
    });
    
    res.json({ success: true, drives });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

### 8. API Response Enhancement

**Show risk warnings to admin API:**

```javascript
// In riskController.js, enhance student response
exports.getStudentRiskDetail = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    
    // Calculate additional metrics
    const createdDaysAgo = Math.floor(
      (Date.now() - student.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    res.json({
      success: true,
      data: {
        student,
        riskAnalysis: student.riskAnalysis,
        metadata: {
          accountAgeDays: createdDaysAgo,
          recentlyCreated: createdDaysAgo < 7,
          neverLogged: !student.lastLogin,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## 🧪 Testing the Integration

### Test 1: Create a Student with Duplicate Phone

```bash
# Using curl or Postman
POST http://localhost:5000/api/auth/register
{
  "email": "test@example.com",
  "password": "Test@123",
  "fullName": "Test User",
  "phone": "+91-9876543210",  // Duplicate
  "branch": "CSE"
}

# Check response - should have riskAnalysis field
```

### Test 2: Create a Drive with Unrealistic Salary

```bash
POST http://localhost:5000/api/drives
{
  "company": "Fake Corp",
  "position": "Developer",
  "salary": "10000000",  // 10M - way above average
  "location": "Any",
  "jobDescription": "job",  // Too short
  "date": "2026-03-01T00:00:00Z",
  "applicationDeadline": "2026-02-28T23:59:59Z"  // Invalid deadline
}

# Check response - should have high risk score and autoBlocked: true
```

### Test 3: Manual Re-evaluation

```bash
POST http://localhost:5000/api/admin/risk/re-evaluate
Authorization: Bearer <admin_token>

# Returns processed count and statistics
```

---

## 🔗 Quick Reference

| Action | Where to Add | Function to Call |
|--------|-------------|-----------------|
| Register Student | Auth Route | `RiskEngine.evaluateStudentRisk()` |
| Register Recruiter | Recruiter Route | `RiskEngine.evaluateRecruiterRisk()` |
| Create Drive | Drive Route | `DriveRiskEngine.evaluateDriveRisk()` |
| Update Student | Student Controller | `RiskEngine.evaluateStudentRisk()` |
| Update Recruiter | Recruiter Controller | `RiskEngine.evaluateRecruiterRisk()` |
| Daily Check | Cron Job | `reevaluateAllStudents/Recruiters/Drives()` |
| Filter Student View | Drive Route | Check `riskAnalysis.autoBlocked` |

---

## 📦 Import Statements

Use these imports anywhere you need risk analysis:

```javascript
// For account risk
const RiskEngine = require("../services/riskEngine");

// For drive risk
const DriveRiskEngine = require("../services/driveRiskEngine");

// In middleware (if needed)
const { evaluateStudentRisk } = RiskEngine;
```

---

## ⚡ Performance Tips

1. **Batch Operations:** If re-evaluating, do it at off-peak hours (cron job)
2. **Cache Results:** Risk scores don't change instantly, no need to re-run during same session
3. **Async Operations:** All methods return promises, use await
4. **Error Handling:** Always check `result.success` before assuming data

---

**Version:** 1.0
**Last Updated:** February 25, 2026
