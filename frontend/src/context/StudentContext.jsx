import { createContext, useContext, useEffect, useState } from "react";
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
          fetchAllSchedules()
        ]);
      } catch (err) {
        console.error("Failed to fetch student", err);
        
        // Create student object with Firebase displayName as fallback
        setStudent({
          firebaseUid: user.uid,
          fullName: user.displayName || user.email?.split('@')[0] || "Student",
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
          certifications: []
        });
        setError(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const fetchJobDrives = async () => {
    try {
      setDrivesLoading(true);
      console.log("📨 Fetching job drives from:", `${API_BASE}/api/drives`);
      const res = await axios.get(`${API_BASE}/api/drives`);
      console.log("✅ Fetched drives:", res.data.data?.length || 0);
      
      // Validate response is array
      const drivesData = Array.isArray(res.data?.data) ? res.data.data : [];
      setJobDrives(drivesData);
      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch job drives", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch job drives. Please try again.";
      setError(errorMsg);
      setJobDrives([]);
    } finally {
      setDrivesLoading(false);
    }
  };

  const fetchApplications = async (uid) => {
    try {
      // Validate uid
      if (!uid || typeof uid !== 'string') {
        throw new Error("Invalid user ID");
      }

      const res = await axios.get(`${API_BASE}/api/students/dashboard/${uid}`);
      if (res.data?.applications && Array.isArray(res.data.applications)) {
        setApplications(res.data.applications);
      } else {
        setApplications([]);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch applications", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch your applications. Please try again.";
      setError(errorMsg);
      setApplications([]);
    }
  };

  const updateStudent = async (updatedData) => {
    try {
      // Validate user is authenticated
      setLoading(true);
      setError(null);
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Validate updatedData is provided
      if (!updatedData || Object.keys(updatedData).length === 0) {
        throw new Error("No changes provided for profile update");
      }

      const res = await axios.put(
        `${API_BASE}/api/students/profile/${user.uid}`,
        updatedData
      );
      
      const studentData = res.data?.data || res.data;
      if (!studentData) {
        throw new Error("Invalid response from server");
      }

      setStudent(studentData);
      setError(null);
      return studentData;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to update profile. Please try again.";
      setError(errorMsg);
      console.error("Failed to update student", err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Apply for a job drive
  const applyForDrive = async (recruiterId, driveId) => {
    try {
      const user = auth.currentUser;
      console.log('🎯 APPLY FOR DRIVE - Frontend request started');
      console.log('  User UID:', user?.uid);
      console.log('  Recruiter ID:', recruiterId);
      console.log('  Drive ID:', driveId);
      
      if (!user) throw new Error("User not authenticated");
      if (!driveId) throw new Error("Drive ID is required");
      if (!recruiterId) throw new Error("Recruiter ID is required");

      // Validate student hasn't already applied
      if (applications.find(app => app.driveId === driveId)) {
        throw new Error("You have already applied to this job drive");
      }

      const url = `${API_BASE}/api/drives/${recruiterId}/${driveId}/apply`;
      console.log('  Making POST request to:', url);
      
      const res = await axios.post(url, { 
        studentFirebaseUid: user.uid,
        studentId: user.uid,
        email: user.email
      });

      console.log('  ✅ Apply response:', res.data);

      // Refresh student data and applications
      await Promise.all([
        fetchApplications(user.uid),
        fetchJobDrives()
      ]);
      console.log('  ✅ Data refreshed after apply');

      return res.data;
    } catch (err) {
      console.error("❌ Failed to apply for drive", err);
      console.error("  Status:", err.response?.status);
      console.error("  Error data:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || "Failed to apply for this job drive. Please try again.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Withdraw application
  const withdrawApplication = async (driveId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      
      // Validate driveId
      if (!driveId || typeof driveId !== 'string') {
        throw new Error("Invalid job drive ID");
      }

      // Call API to withdraw application
      await axios.delete(`${API_BASE}/api/drives/${driveId}/withdraw`, {
        data: {
          studentFirebaseUid: user.uid,
          studentId: user.uid,
          email: user.email
        }
      });

      // Remove from local state
      setApplications(applications.filter(app => app.driveId !== driveId));
      setError(null);

      // Refresh applications
      await fetchApplications(user.uid);
      
      return { success: true, message: "Application withdrawn successfully" };
    } catch (err) {
      console.error("Failed to withdraw application", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to withdraw application. Please try again.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Get single drive details
  const getDriveDetails = async (recruiterId, driveId) => {
    try {
      // Validate parameters
      if (!recruiterId || typeof recruiterId !== 'string') {
        throw new Error("Invalid recruiter ID");
      }
      if (!driveId || typeof driveId !== 'string') {
        throw new Error("Invalid job drive ID");
      }

      const res = await axios.get(`${API_BASE}/api/drives/${recruiterId}/${driveId}`);
      
      // Return data with fallback
      const driveData = res.data?.data || res.data;
      if (!driveData) {
        throw new Error("Invalid response from server");
      }
      
      setError(null);
      return driveData;
    } catch (err) {
      console.error("Failed to fetch drive details", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch job drive details. Please try again.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Fetch all upcoming schedules for student
  const fetchSchedules = async (uid) => {
    try {
      // Validate uid
      if (!uid || typeof uid !== 'string') {
        throw new Error("Invalid user ID");
      }

      setSchedulesLoading(true);
      const res = await axios.get(`${API_BASE}/api/schedules/student/${uid}`);
      
      // Validate response is array
      const schedulesData = Array.isArray(res.data?.data) ? res.data.data : [];
      if (!Array.isArray(schedulesData)) {
        console.warn("Invalid schedules data structure, using empty array");
        setSchedules([]);
      } else {
        setSchedules(schedulesData);
      }
      
      setError(null);
    } catch (err) {
      console.error("Failed to fetch schedules", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch your schedules. Please refresh.";
      setError(errorMsg);
      setSchedules([]);
    } finally {
      setSchedulesLoading(false);
    }
  };

  // Fetch all public schedules (for browsing)
  const fetchAllSchedules = async () => {
    try {
      setSchedulesLoading(true);
      console.log("📅 Fetching all available schedules for student");
      const res = await axios.get(`${API_BASE}/api/schedules`);
      
      // Validate response is array
      const schedulesData = Array.isArray(res.data?.data) ? res.data.data : [];
      if (!Array.isArray(schedulesData)) {
        console.warn("Invalid schedules data structure, using empty array");
        setSchedules([]);
      } else {
        console.log("✅ Loaded", schedulesData.length, "schedules");
        setSchedules(schedulesData);
      }
      
      setError(null);
    } catch (err) {
      console.error("Failed to fetch all schedules", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to load available schedules. Please try again.";
      setError(errorMsg);
      setSchedules([]);
    } finally {
      setSchedulesLoading(false);
    }
  };

  return (
    <StudentContext.Provider value={{ 
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
      fetchAllSchedules
    }}>
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
