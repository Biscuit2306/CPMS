# ⚠️ RISK ENGINE DEBUGGING SUMMARY

## What's Wrong: 6 Critical Issues

**The AI Risk Feature doesn't work because the job drive data passed to the risk engine is INCOMPLETE and in the WRONG FORMAT.**

---

## The 6 Issues

### 1. ❌ MISSING `recruiterId` 
- **Impact**: All recruiter checks fail (new account, multiple drives, company verification)
- **Fix**: Add `recruiterId: recruiter._id.toString() || recruiter.firebaseUid` to newDrive

### 2. ❌ MISSING `companyWebsite` 
- **Impact**: Website check is skipped (10-point check never triggers)
- **Fix**: Add `companyWebsite: String(driveData.companyWebsite || "")` to newDrive

### 3. ❌ MISSING `companySize`
- **Impact**: Inconsistent data between embedded and collection models
- **Fix**: Add `companySize: String(driveData.companySize || "")` to newDrive

### 4. ❌ SALARY IS STRING (should be NUMBER)
- **Impact**: `parseInt("5000000")` works, but `parseInt("₹5000000")` returns NaN
- **Impact**: `NaN > 3600000` is always false → salary check never triggers
- **Fix**: Change `salary: String(...)` to `salary: Number(...) || 0`

### 5. ❌ PASSING UNSAVED OBJECT TO RISK ENGINE
- **Impact**: Database queries in risk engine match wrong records (or none)
- **Impact**: Duplicate detection broken
- **Fix**: Pass `jobDriveDoc` (saved document) instead of `newDrive` (embedded object)

### 6. ❌ SILENT ERROR HANDLING
- **Impact**: If risk evaluation fails completely, the drive still gets created
- **Impact**: Errors aren't visible in the response
- **Fix**: Check for null/undefined responses and provide default riskAnalysis

---

## Simple Flowchart: Where It Breaks

```
Job Drive Creation Request
    ↓
Create newDrive object (embedded model)
    ├─ ❌ MISSING: recruiterId
    ├─ ❌ MISSING: companyWebsite  
    ├─ ❌ salary is STRING not NUMBER
    └─ Other fields OK ✅
    ↓
Save to Recruiter.jobDrives[] ✅
    ↓
Create jobDriveDoc from newDrive fields (collection model)
    ├─ Gets same broken data from newDrive
    └─ Save to JobDrive collection ✅
    ↓
Call DriveRiskEngine.evaluateDriveRisk(newDrive) ❌❌❌
    ├─ Receives UNSAVED object (not in database)
    ├─ recruiterId is MISSING → Recruiter query returns null
    ├─ companyWebsite is MISSING → Website check skipped
    ├─ salary is STRING → parseInt might fail
    └─ Database queries match nothing → All checks fail silently
    ↓
Result: 0 risk score, no flags, no blocking ❌
    ↓
Drive created successfully (but risk analysis is broken)
```

---

## What SHOULD Happen

```
Job Drive Creation Request
    ↓
Create newDrive with ALL fields + proper types ✅
    ├─ ✅ recruiterId: recruiter._id.toString()
    ├─ ✅ companyWebsite: String(driveData.companyWebsite || "")
    ├─ ✅ salary: Number(driveData.salary) || 0
    └─ Other fields OK ✅
    ↓
Save to Recruiter.jobDrives[] ✅
    ↓
Create jobDriveDoc from newDrive (consistent) ✅
    └─ Save to JobDrive collection ✅
    ↓
Call DriveRiskEngine.evaluateDriveRisk(jobDriveDoc) ✅
    ├─ Receives SAVED document with valid _id
    ├─ recruiterId exists → Recruiter lookup succeeds
    ├─ companyWebsite exists → Website check runs (+10 if empty)
    ├─ salary is NUMBER → parseInt works correctly
    ├─ Database queries match actual records
    └─ All 9 risk checks execute properly
    ↓
Result: Accurate risk score with flags ✅
    ├─ If score >= 75: Drive auto-blocked ✅
    └─ If score >= 40: Marked as medium/high risk ✅
    ↓
Drive created with proper risk analysis
```

---

## Debug Logging You'll See (Currently)

When you create a test drive, you'll see in console logs:

```
❌ Logs show recruiterId as UNDEFINED in risk engine
❌ Logs show no website check even if empty
✅ Logs show salary value but it's in wrong type
❌ Logs show risk score of 0 or very low despite risky data
```

After fixes, you should see:

```
✅ Logs show recruiterId properly populated
✅ Logs show website check running (empty = +10 points)
✅ Logs show salary as number type
✅ Logs show risk score accurately reflected
✅ Logs show all applicable flags
✅ Logs show auto-block status if >= 75
```

---

## Testing Formula

**Test Job Drive Data:**
```json
{
  "recruiterFirebaseUid": "test-uid-123",
  "driveData": {
    "company": "FakeCompany",
    "position": "Developer",
    "salary": "50000000",
    "location": "Online",  
    "applicationDeadline": "2026-02-24",
    "date": "2026-02-26",
    "jobDescription": "Great job"
  }
}
```

**Expected Risk Triggers:**
- Unrealistic salary (50M) → +30 points
- Short description ("Great job") → +10 points  
- No website → +10 points
- **Total: 50+ points → MEDIUM risk minimum**

**Current Result:** 0-10 points (broken checks skipped)
**After Fix:** 50+ points with correct flags

---

## Files to Review

1. **COMPREHENSIVE_RISK_ANALYSIS.md** - Detailed breakdown of each issue
2. **CODE_CHANGES_NEEDED.js** - Exact code changes required (before/after)
3. **RISK_ENGINE_ISSUES_DOCUMENTED.js** - Code annotations of problems
4. **RISK_ENGINE_DEBUG_SCRIPT.js** - Debug checks you can run

---

## Action Items

1. **Open** `backend/routes/jobDriveRoutes.js`
2. **Find** the `const newDrive = {` section around line 193
3. **Apply** all 6 fixes from CODE_CHANGES_NEEDED.js
4. **Test** with the test data above
5. **Verify** console shows accurate risk scores + flags
6. **Check** auto-blocked drives have status "blocked"

The risk engine itself is fine - it just needs complete, properly-formatted data!

---

## Root Cause Analysis

Why wasn't this caught earlier?
- Embedded model (Recruiter.jobDrives[]) doesn't validate fields as strictly  
- Separate collection model (JobDrive) has stricter schema but gets wrong data
- Risk engine had no validation → silently handled missing recruiter
- Database queries returned no results but didn't error → silent failure
- Error logging was vague → "risk evaluation failed" but unclear why

**Lesson:** The dual-model architecture is causing data consistency issues!

---

## Permanent Solution (Later)

Migrate completely to the JobDrive collection model:
1. Remove jobDrives[] from Recruiter model
2. Query JobDrive for recruiter's drives
3. Single source of truth for all job posting data
4. Consistent schema validation everywhere
5. Risk engine has guaranteed correct data format
