# Job Drives - Database Structure Summary

## ✅ Implementation Complete

You now have **embedded job drives stored directly in the Recruiter collection** and **applications stored in the Student collection**. No separate JobDrive collection needed!

---

## 📊 Database Structure

### **Recruiter Collection**
```javascript
{
  _id: ObjectId,
  firebaseUid: String,
  fullName: String,
  email: String,
  companyName: String,
  designation: String,
  companyWebsite: String,
  companySize: String,
  jobDrives: [           // ✅ Array of job drives posted by this recruiter
    {
      _id: ObjectId,
      position: String,
      salary: String,
      location: String,
      description: String,
      requirements: Array,
      status: String,
      applicationDeadline: Date,
      applicants: [       // Track who applied
        {
          studentId: String,
          studentName: String,
          email: String,
          appliedAt: Date,
          status: String    // pending, selected, rejected
        }
      ],
      createdAt: Date
    }
  ]
}
```

### **Student Collection**
```javascript
{
  _id: ObjectId,
  firebaseUid: String,
  fullName: String,
  email: String,
  branch: String,
  cgpa: String,
  skills: Array,
  applications: [        // ✅ Track student's applications
    {
      driveId: String,
      recruiterId: String,
      companyName: String,
      position: String,
      appliedAt: Date,
      status: String       // pending, selected, rejected
    }
  ]
}
```

---

## 🔄 API Endpoints

### **Job Drives Endpoints** (`/api/drives`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Get all active job drives |
| POST | `/` | Create new job drive |
| GET | `/recruiter/:uid` | Get recruiter's job drives |
| GET | `/:recruiterId/:driveId` | Get single drive details |
| PUT | `/:recruiterId/:driveId` | Update drive details |
| DELETE | `/:recruiterId/:driveId` | Delete a drive |
| POST | `/:recruiterId/:driveId/apply` | Student applies for drive |
| PUT | `/:recruiterId/:driveId/applicant/:studentId` | Update application status |

---

## 💾 How Data Flows

### **When Recruiter Creates a Job Drive:**
1. Recruiter logs in → fetches from `/api/drives/recruiter/:uid`
2. Recruiter creates drive → POST to `/api/drives` with `recruiterFirebaseUid`
3. Drive is stored in `Recruiter.jobDrives` array
4. Context updates local `drives` state

### **When Student Visits Job Portal:**
1. Student logs in
2. Frontend fetches all drives → GET `/api/drives`
3. All active/scheduled drives from all recruiters are returned
4. Student sees all available opportunities

### **When Student Applies:**
1. Student clicks "Apply" on a drive
2. POST to `/api/drives/:recruiterId/:driveId/apply` with `studentFirebaseUid`
3. Adds to:
   - Recruiter's drive `applicants` array
   - Student's `applications` array
4. Both collections updated automatically

### **When Student Views Applications:**
1. Student profile fetches from `/api/students/dashboard/:uid`
2. Student's `applications` array is sent → student sees their applications
3. Shows company name, position, status, application date

### **When Recruiter Reviews Applicants:**
1. Recruiter views drive applications
2. Frontend calls `getApplications()` → returns `drive.applicants`
3. Recruiter can see all students who applied + their details
4. Recruiter updates status → PUT to `/api/drives/:recruiterId/:driveId/applicant/:studentId`
5. Status updates in both Recruiter and Student collections

---

## 📝 Context Methods

### **RecruiterContext** (`useRecruiter()`)
- `createDrive(driveData)` - Create new job drive
- `updateDrive(driveId, data)` - Update drive details
- `deleteDrive(driveId)` - Delete a drive
- `fetchDrives(uid)` - Load recruiter's drives
- `getApplications(driveId)` - Get applicants for a drive
- `updateApplicationStatus(driveId, studentId, status)` - Update candidate status

### **StudentContext** (`useStudent()`)
- `fetchJobDrives()` - Get all available drives
- `fetchApplications(uid)` - Load student's applications
- `applyForDrive(recruiterId, driveId)` - Submit application
- `withdrawApplication(driveId)` - Cancel application
- `getDriveDetails(recruiterId, driveId)` - View drive details

---

## 🎯 Key Benefits

✅ **No separate JobDrive collection** - Everything embedded in existing collections
✅ **Simpler queries** - Recruiter's drives live with their data
✅ **Automatic sync** - When student applies, both collections update together
✅ **Less database overhead** - Fewer collections to manage
✅ **Clean data model** - Relationships are clear: Recruiter→Drives, Student→Applications

---

## 🚀 Files Updated

**Backend:**
- `models/Recruiter.js` - Added `jobDrives` array field
- `routes/jobDriveRoutes.js` - Rewrote to use Recruiter collection
- `routes/recruiterRoutes.js` - Removed JobDrive references
- `routes/studentRoutes.js` - Removed JobDrive references

**Frontend:**
- `context/RecruiterContext.jsx` - Updated to use `/api/drives`
- `context/StudentContext.jsx` - Updated to use `/api/drives`

---

## ✨ Everything is ready to use!

Students can now:
- Browse all available job drives
- Apply for positions
- Track application status
- See recruiter decisions

Recruiters can now:
- Post job drives to their profile
- Manage applicants
- Update candidate status
- Track all their postings
