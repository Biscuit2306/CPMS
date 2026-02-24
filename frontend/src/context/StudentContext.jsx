import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const StudentContext = createContext(null);

/* =========================
   PROVIDER
========================= */
export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobDrives, setJobDrives] = useState([]);
  const [drivesLoading, setDrivesLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStudent(null);
        setJobDrives([]);
        setApplications([]);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE}/api/students/dashboard/${user.uid}`
        );
        const studentData = res.data;

        // Use Firebase displayName if database fullName is empty
        if (!studentData.fullName && user.displayName) {
          studentData.fullName = user.displayName;
        }

        setStudent(studentData);
        setError(null);

        // Fetch job drives, applications, and all available schedules
        await Promise.all([
          fetchJobDrives(),
          fetchApplications(user.uid),
          fetchAllSchedules(),
        ]);
      } catch (err) {
        console.error("Failed to fetch student", err);

        // Create student object with Firebase displayName as fallback
        setStudent({
          firebaseUid: user.uid,
          fullName: user.displayName || user.email?.split("@")[0] || "Student",
          email: user.email || "",
          phone: "",
          branch: "",
          rollNo: "",
          dob: "",
          address: "",
          linkedin: "",
          github: "",
          portfolio: "",
          resume: "",
          year: "",
          cgpa: "",
          skills: [],
          projects: [],
          certifications: [],
        });
        setError(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // ─── Fetch Job Drives ────────────────────────────────────────────────────────
  const fetchJobDrives = async () => {
    try {
      setDrivesLoading(true);
      console.log("📨 Fetching job drives from:", `${API_BASE}/api/drives`);
      const res = await axios.get(`${API_BASE}/api/drives`);
      console.log("✅ Fetched drives:", res.data.data?.length || 0);

      const drivesData = Array.isArray(res.data?.data) ? res.data.data : [];
      setJobDrives(drivesData);
      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch job drives", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch job drives. Please try again.";
      setError(errorMsg);
      setJobDrives([]);
    } finally {
      setDrivesLoading(false);
    }
  };

  // ─── Fetch Applications ──────────────────────────────────────────────────────
  // 🔥 CRITICAL: Also updates student object so status badges stay in sync
  const fetchApplications = async (uid) => {
    try {
      if (!uid || typeof uid !== "string") {
        throw new Error("Invalid user ID");
      }

      console.log("🔄 StudentContext: fetchApplications called for uid:", uid);
      const res = await axios.get(`${API_BASE}/api/students/dashboard/${uid}`);

      console.log("📦 Backend response:", {
        fullName: res.data?.fullName,
        applicationsCount: res.data?.applications?.length || 0,
        applications: res.data?.applications || [],
      });

      if (res.data?.applications && Array.isArray(res.data.applications)) {
        console.log("✅ Got applications:", res.data.applications.length);
        res.data.applications.forEach((app, idx) => {
          console.log(
            `  [${idx}] Drive: ${app.driveId}, Status: ${app.applicationStatus}, Position: ${app.position}`
          );
        });

        setApplications(res.data.applications);

        // 🔥 CRITICAL: Update student object too so status banners re-render
        const updatedStudent = { ...res.data };
        console.log("✅ Updating student object with fresh data");
        console.log(
          `   New applications count: ${updatedStudent.applications?.length || 0}`
        );
        setStudent(updatedStudent);
      } else {
        console.log("⚠️ No applications found in response");
        setApplications([]);
        if (res.data) {
          setStudent({ ...res.data, applications: [] });
        }
      }

      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch applications", err);
      console.error("   Error message:", err.message);
      console.error("   Response:", err.response?.data);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch your applications. Please try again.";
      setError(errorMsg);
      setApplications([]);
    }
  };

  // ─── Update Student Profile ──────────────────────────────────────────────────
  const updateStudent = async (updatedData) => {
    try {
      setLoading(true);
      setError(null);
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      if (!updatedData || Object.keys(updatedData).length === 0) {
        throw new Error("No changes provided for profile update");
      }

      const res = await axios.put(
        `${API_BASE}/api/students/profile/${user.uid}`,
        updatedData
      );

      const studentData = res.data?.data || res.data;
      if (!studentData) throw new Error("Invalid response from server");

      setStudent(studentData);
      setError(null);
      return studentData;
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile. Please try again.";
      setError(errorMsg);
      console.error("Failed to update student", err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Apply for a Drive ───────────────────────────────────────────────────────
  const applyForDrive = async (recruiterId, driveId) => {
    try {
      const user = auth.currentUser;
      console.log("🎯 APPLY FOR DRIVE - Frontend request started");
      console.log("  User UID:", user?.uid);
      console.log("  Recruiter ID:", recruiterId);
      console.log("  Drive ID:", driveId);

      if (!user) throw new Error("User not authenticated");
      if (!driveId) throw new Error("Drive ID is required");
      if (!recruiterId) throw new Error("Recruiter ID is required");

      if (applications.find((app) => app.driveId === driveId)) {
        throw new Error("You have already applied to this job drive");
      }

      const url = `${API_BASE}/api/drives/${recruiterId}/${driveId}/apply`;
      console.log("  Making POST request to:", url);

      const res = await axios.post(url, {
        studentFirebaseUid: user.uid,
        studentId: user.uid,
        email: user.email,
      });

      console.log("  ✅ Apply response:", res.data);

      await Promise.all([fetchApplications(user.uid), fetchJobDrives()]);
      console.log("  ✅ Data refreshed after apply");

      return res.data;
    } catch (err) {
      console.error("❌ Failed to apply for drive", err);
      console.error("  Status:", err.response?.status);
      console.error("  Error data:", err.response?.data);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to apply for this job drive. Please try again.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // ─── Withdraw Application ────────────────────────────────────────────────────
  const withdrawApplication = async (driveId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      if (!driveId || typeof driveId !== "string") {
        throw new Error("Invalid job drive ID");
      }

      await axios.delete(`${API_BASE}/api/drives/${driveId}/withdraw`, {
        data: {
          studentFirebaseUid: user.uid,
          studentId: user.uid,
          email: user.email,
        },
      });

      setApplications(applications.filter((app) => app.driveId !== driveId));
      setError(null);
      await fetchApplications(user.uid);

      return { success: true, message: "Application withdrawn successfully" };
    } catch (err) {
      console.error("Failed to withdraw application", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to withdraw application. Please try again.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // ─── Get Single Drive Details ────────────────────────────────────────────────
  const getDriveDetails = useCallback(async (recruiterId, driveId) => {
    try {
      if (!recruiterId || typeof recruiterId !== "string") {
        throw new Error("Invalid recruiter ID");
      }
      if (!driveId || typeof driveId !== "string") {
        throw new Error("Invalid job drive ID");
      }

      const res = await axios.get(
        `${API_BASE}/api/drives/${recruiterId}/${driveId}`
      );

      const driveData = res.data?.data || res.data;
      if (!driveData) throw new Error("Invalid response from server");

      setError(null);
      return driveData;
    } catch (err) {
      console.error("Failed to fetch drive details", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch job drive details. Please try again.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // ─── Fetch Student-Specific Schedules ────────────────────────────────────────
  const fetchSchedules = async (uid) => {
    try {
      if (!uid || typeof uid !== "string") {
        throw new Error("Invalid user ID");
      }

      setSchedulesLoading(true);
      const res = await axios.get(`${API_BASE}/api/schedules/student/${uid}`);

      const schedulesData = Array.isArray(res.data?.data) ? res.data.data : [];
      setSchedules(schedulesData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch schedules", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch your schedules. Please refresh.";
      setError(errorMsg);
      setSchedules([]);
    } finally {
      setSchedulesLoading(false);
    }
  };

  // ─── Fetch All Schedules (public + personal, merged) ────────────────────────
  const fetchAllSchedules = async () => {
    try {
      setSchedulesLoading(true);
      console.log("📅 Fetching all available schedules for student");

      // If student UID isn't available yet, fall back to public schedules only
      const currentUid = auth.currentUser?.uid;
      if (!currentUid) {
        console.warn("Student UID not available, fetching all public schedules");
        const res = await axios.get(`${API_BASE}/api/schedules`);
        const schedulesData = Array.isArray(res.data?.data) ? res.data.data : [];
        console.log("✅ Loaded", schedulesData.length, "public schedules");
        setSchedules(schedulesData);
        return;
      }

      // Fetch public and personal schedules in parallel
      const [publicRes, personalRes] = await Promise.all([
        axios.get(`${API_BASE}/api/schedules`),
        axios.get(`${API_BASE}/api/schedules/student/${currentUid}`),
      ]);

      const publicSchedules = Array.isArray(publicRes.data?.data)
        ? publicRes.data.data
        : [];
      const personalSchedules = Array.isArray(personalRes.data?.data)
        ? personalRes.data.data
        : [];

      // Merge: personal versions take priority (they carry candidate status)
      const scheduleMap = new Map();
      personalSchedules.forEach((s) => scheduleMap.set(s._id, s));
      publicSchedules.forEach((s) => {
        if (!scheduleMap.has(s._id)) scheduleMap.set(s._id, s);
      });

      const mergedSchedules = Array.from(scheduleMap.values());
      console.log(
        `✅ Loaded ${mergedSchedules.length} total schedules (${publicSchedules.length} public + ${personalSchedules.length} personal)`
      );
      setSchedules(mergedSchedules);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch all schedules", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to load available schedules. Please try again.";
      setError(errorMsg);
      setSchedules([]);
    } finally {
      setSchedulesLoading(false);
    }
  };

  // ─── Sync Student to Interview Schedules ────────────────────────────────────
  const syncStudentSchedules = useCallback(async () => {
    try {
      if (!student?.firebaseUid) return;
      console.log("🔄 Syncing student to interview schedules");

      await axios.post(`${API_BASE}/api/drives/sync-schedules`, {
        studentFirebaseUid: student.firebaseUid,
      });

      console.log("✅ Sync completed - refreshing schedules");
      await fetchAllSchedules();
    } catch (err) {
      console.error("Sync schedules error:", err.message);
      // Non-critical — don't surface error to user
    }
  }, [student, fetchAllSchedules]);

  return (
    <StudentContext.Provider
      value={{
        student,
        loading,
        error,
        updateStudent,
        jobDrives,
        drivesLoading,
        applications,
        fetchJobDrives,
        fetchApplications,
        applyForDrive,
        withdrawApplication,
        getDriveDetails,
        schedules,
        schedulesLoading,
        fetchSchedules,
        fetchAllSchedules,
        syncStudentSchedules,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

/* =========================
   HOOK
========================= */
export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used inside StudentProvider");
  }
  return context;
};