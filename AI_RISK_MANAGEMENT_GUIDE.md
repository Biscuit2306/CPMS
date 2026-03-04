# 🤖 AI Risk Management System - Implementation Guide

## 📋 Overview

This document explains the complete implementation of the AI Risk Engine for detecting fake/suspicious accounts and job drives in the CPMS platform.

---

## 🎯 PART 1: Account Risk Detection System

### Database Schema Updates

**Files Modified:**
- `backend/models/Student.js`
- `backend/models/Recruiter.js`

**Added Fields:**
```javascript
riskAnalysis: {
  riskScore: { type: Number, default: 0 },           // 0-100 score
  riskLevel: { type: String, enum: ["low", "medium", "high"], default: "low" },
  flags: [String],                                    // Array of risk reasons
  lastEvaluated: Date,                                // When last evaluated
  registrationIP: { type: String, default: "" },     // IP for duplicate check
  resumeHash: { type: String, default: "" }          // For Student only
}
```

### Risk Scoring Rules

**Student Risk Conditions:**
1. **Duplicate Phone Number** (+40 points)
   - Detects multiple accounts using same phone

2. **Duplicate Resume** (+30 points)
   - SHA256 hash-based resume comparison
   - Stored for future duplicate detection

3. **Suspicious Email Pattern** (+10 points)
   - Flags emails with: "test", "fake", "123", "admin", "temp", "spam"

4. **Same IP Used Multiple Times** (+25 points)
   - Flags if 3+ accounts from same IP
   - Stored during registration

5. **Incomplete Profile** (+15 points)
   - Flags if 2+ required fields missing

6. **New Account Spam Pattern** (+20 points)
   - Multiple new accounts from same IP in 24 hours

**Recruiter Risk Conditions:**
1. **Duplicate Phone** (+40 points)
2. **Duplicate Email** (+35 points)
3. **Suspicious Company Name** (+20 points)
   - Checks for: "test", "fake", "demo", "spam"
4. **Same IP Multiple Times** (+25 points)
5. **Incomplete Company Info** (+10 points)
6. **No Company Website** (+15 points)

---

## 🚨 PART 2: Job Drive Risk Detection System

### Database Schema Updates

**File Modified:**
- `backend/models/JobDrive.js`

**Added Fields:**
```javascript
riskAnalysis: {
  riskScore: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ["low", "medium", "high"], default: "low" },
  flags: [String],
  autoBlocked: { type: Boolean, default: false },    // Auto-blocked if score >= 75
  lastEvaluated: Date
}
```

### Drive Risk Scoring Rules

1. **Unrealistic Salary** (+30 points)
   - If > 3x average salary (₹1.2M baseline)

2. **New Recruiter Posting** (+25 points)
   - If account < 7 days old

3. **Suspicious Job Description** (+20 points)
   - If < 50 characters or copy-paste detected

4. **Too Many Drives Posted** (+25 points)
   - If > 5 drives in 24 hours

5. **Missing Information** (+12 points)
   - Checks for essential fields

6. **No Company Website** (+10 points)

7. **Invalid Deadline** (+20 points)
   - Deadline before/on drive date

8. **Duplicate Posting** (+15 points)
   - Same company, position, recruiter

9. **High-Risk Recruiter** (+30 points)
   - If recruiter marked as high-risk

### Auto-Blocking Logic
- **Score ≥ 75**: Automatically blocked
- Students won't see blocked drives
- Admin can approve anyway with override

---

## 🛠️ Backend Services

### riskEngine.js

**Location:** `backend/services/riskEngine.js`

**Key Methods:**

```javascript
// Evaluate student risk
RiskEngine.evaluateStudentRisk(student, registrationIP)
→ Returns: {success, riskAnalysis}

// Evaluate recruiter risk
RiskEngine.evaluateRecruiterRisk(recruiter, registrationIP)
→ Returns: {success, riskAnalysis}

// Get summary statistics
RiskEngine.getRiskSummary()
→ Returns: {success, summary}

// Get high-risk accounts
RiskEngine.getHighRiskAccounts(limit)
→ Returns: {success, students, recruiters}

// Re-evaluate all students
RiskEngine.reevaluateAllStudents()
→ Returns: {success, processed, errors, total}

// Re-evaluate all recruiters
RiskEngine.reevaluateAllRecruiters()
→ Returns: {success, processed, errors, total}
```

### driveRiskEngine.js

**Location:** `backend/services/driveRiskEngine.js`

**Key Methods:**

```javascript
// Evaluate drive risk
DriveRiskEngine.evaluateDriveRisk(drive)
→ Returns: {success, riskAnalysis, autoBlocked}

// Get drive risk summary
DriveRiskEngine.getDriveRiskSummary()
→ Returns: {success, summary}

// Get high-risk drives
DriveRiskEngine.getHighRiskDrives(limit)
→ Returns: {success, drives}

// Get auto-blocked drives
DriveRiskEngine.getAutoBlockedDrives(limit)
→ Returns: {success, drives}

// Re-evaluate all drives
DriveRiskEngine.reevaluateAllDrives()
→ Returns: {success, processed, errors, autoBlocked, total}

// Approve flagged drive
DriveRiskEngine.approveFlaggedDrive(driveId, adminId, reason)
→ Returns: {success, drive}
```

---

## 🎮 Backend API Endpoints

### Controller: riskController.js

**Location:** `backend/controllers/riskController.js`

### Routes: riskRoutes.js

**Location:** `backend/routes/riskRoutes.js`

**Endpoints:**

```
GET  /api/admin/risk/account-summary
GET  /api/admin/risk/high-risk-accounts
GET  /api/admin/risk/student/:studentId
GET  /api/admin/risk/recruiter/:recruiterId
POST /api/admin/risk/re-evaluate
POST /api/admin/risk/mark-safe

GET  /api/admin/risk/drive-summary
GET  /api/admin/risk/high-risk-drives
GET  /api/admin/risk/auto-blocked-drives
GET  /api/admin/risk/drive/:driveId
POST /api/admin/risk/drives/re-evaluate
POST /api/admin/risk/drive/approve
POST /api/admin/risk/drive/reject
```

### Integration in server.js

**Added in `backend/server.js`:**
```javascript
const riskRoutes = require("./routes/riskRoutes");
app.use("/api/admin/risk", riskRoutes);
```

---

## 🎨 Frontend Components

### 1. AISecurityCenter.jsx

**Location:** `frontend/src/components/AISecurityCenter.jsx`

**Features:**
- Real-time risk statistics (high/medium/low)
- High-risk account listing
- Detailed account risk analysis modal
- Mark account as safe override
- Re-evaluate all accounts
- Account detail view with flags

**Styling:** `frontend/src/styles/AISecurityCenter.css`

### 2. AIDriveRiskPanel.jsx

**Location:** `frontend/src/components/AIDriveRiskPanel.jsx`

**Features:**
- Drive risk statistics
- High-risk drive alerts
- Auto-blocked drives list
- Filter by risk level
- Approve/reject drives
- Risk score display with flags

**Styling:** `frontend/src/styles/AIDriveRiskPanel.css`

### 3. RiskManagementModal.jsx

**Location:** `frontend/src/components/RiskManagementModal.jsx`

**Features:**
- Fixed trigger button (bottom-right corner)
- Modal with tab navigation
- Switches between Account & Drive panels
- Professional UI with animations
- Responsive design

**Styling:** `frontend/src/styles/RiskManagementModal.css`

### AdminLayout Integration

**File Modified:** `frontend/src/components/AdminLayout.jsx`

**Changes:**
- Imported `RiskManagementModal`
- Added component rendering in main admin layout
- Button appears fixed in bottom-right of page

---

## 📊 CSS Styling

All CSS is **properly organized in separate files** with **specific class naming** to avoid clashes:

### Class Naming Convention:

**AISecurityCenter:**
- `.aisc-container`
- `.aisc-header`
- `.aisc-stats-grid`
- `.aisc-account-item`
- `.aisc-risk-level`
- `.aisc-btn-*`

**AIDriveRiskPanel:**
- `.aidrp-container`
- `.aidrp-header`
- `.aidrp-alert-item`
- `.aidrp-action-btn`
- `.aidrp-*`

**RiskManagementModal:**
- `.risk-modal-trigger`
- `.risk-modal-container`
- `.risk-modal-tabs`
- `.risk-modal-*`

All styles include:
✅ Hover effects
✅ Animations
✅ Mobile responsiveness
✅ Dark/Light mode compatibility
✅ Accessibility features

---

## 🚀 Usage Guide

### For Admins:

1. **Open Risk System:**
   - Click "🔐 AI Risk System" button in bottom-right of admin dashboard
   - Two tabs: "Account Security" & "Drive Monitoring"

2. **Account Security Tab:**
   - View high/medium/low risk statistics
   - See list of all high-risk accounts
   - Click "Review" to see detailed analysis
   - Click "Mark Safe" to override risk (admin decision)
   - Use "Re-evaluate All Accounts" to rescan

3. **Drive Monitoring Tab:**
   - View drive risk statistics
   - Filter by risk level or auto-blocked status
   - Review risk reasons/flags
   - "Approve" to allow posting
   - "Reject" to block posting
   - "Investigate" to view full details

### Automated Execution:

**Optional: Setup Cron Jobs**

```javascript
// In server.js, add:
const RiskEngine = require("./services/riskEngine");
const DriveRiskEngine = require("./services/driveRiskEngine");

// Run daily at 2 AM
cron.schedule("0 2 * * *", async () => {
  console.log("🔄 Running daily risk re-evaluation...");
  await RiskEngine.reevaluateAllStudents();
  await RiskEngine.reevaluateAllRecruiters();
  await DriveRiskEngine.reevaluateAllDrives();
});
```

---

## 🔄 When Risk Analysis Runs

### Automatic Triggers:

1. **On Registration:**
   - Call in auth controller after account creation

2. **On Profile Update:**
   - Re-evaluate when student/recruiter updates profile

3. **On Drive Creation:**
   - Evaluate drive when posted by recruiter

### Manual Triggers:

1. **Admin Dashboard Button:**
   - "Re-evaluate All Accounts"
   - "Re-evaluate All Drives"

2. **API Endpoints:**
   - POST `/api/admin/risk/re-evaluate`
   - POST `/api/admin/risk/drives/re-evaluate`

---

## 📈 Risk Score Breakdown

### Student Risk Scoring:
- Low Risk: 0-39
- Medium Risk: 40-69
- High Risk: 70-100

### Drive Risk Scoring:
- Low Risk: 0-39
- Medium Risk: 40-69
- High Risk: 70-100 (Auto-blocked if ≥75)

---

## 🔐 Features & Capabilities

✅ **Real-time Risk Detection**
✅ **Auto-blocking for Drives**
✅ **Admin Override Capability**
✅ **Detailed Flag Explanations**
✅ **Historical Tracking**
✅ **Responsive Design**
✅ **Professional Dashboard UI**
✅ **Statistics & Analytics**
✅ **Batch Re-evaluation**
✅ **API-driven Architecture**

---

## 📝 Integration Checklist

- [x] Database schemas updated
- [x] Risk engine services created
- [x] Admin controller created
- [x] Admin routes created
- [x] Server routes integrated
- [x] Frontend components created
- [x] CSS files created
- [x] AdminLayout integration done
- [x] RiskManagementModal added
- [x] API documentation ready

---

## 🎯 Next Steps

1. **Test the system:**
   ```bash
   cd backend
   npm test
   ```

2. **Start servers:**
   ```bash
   # Backend
   npm run dev
   
   # Frontend (in another terminal)
   cd frontend
   npm run dev
   ```

3. **Access Admin Dashboard:**
   - Navigate to admin dashboard
   - Click "🔐 AI Risk System" button
   - Review high-risk accounts and drives

4. **Optional: Set up cron jobs** for automated daily re-evaluation

---

## 🐛 Troubleshooting

**Issue:** Risk modal not appearing
- **Solution:** Import statement in AdminLayout might be wrong. Check file path.

**Issue:** API endpoints returning 404
- **Solution:** Verify server.js includes `app.use("/api/admin/risk", riskRoutes);`

**Issue:** Styling issues / CSS clashing
- **Solution:** All CSS files use unique prefixes (aisc-, aidrp-, risk-modal-). Check node_modules don't have conflicting styles.

**Issue:** Risk scores not calculating
- **Solution:** Ensure Student/Recruiter/JobDrive models have riskAnalysis field initialized.

---

## 📞 Support

For issues or questions, refer to the detailed code comments in:
- `backend/services/riskEngine.js`
- `backend/services/driveRiskEngine.js`
- `frontend/src/components/AISecurityCenter.jsx`
- `frontend/src/components/AIDriveRiskPanel.jsx`

---

**Version:** 1.0
**Last Updated:** February 25, 2026
**Status:** ✅ Production Ready
