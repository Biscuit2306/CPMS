import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const AdminContext = createContext(null);

/* =========================
   PROVIDER
========================= */
export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [jobDrives, setJobDrives] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeRecruiters: 0,
    partnerCompanies: 0,
    placementRate: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE}/api/admin/dashboard/${user.uid}`
        );
        let adminData = res.data;
        
        // Use Firebase displayName if database fullName is empty
        if (!adminData.fullName && user.displayName) {
          adminData.fullName = user.displayName;
        }
        
        setAdmin(adminData);
        setError(null);
        
        // Fetch admin data
        await Promise.all([
          fetchStudents(),
          fetchRecruiters(),
          fetchJobDrives(),
          fetchStats(),
          fetchSchedules()
        ]);
      } catch (err) {
        console.error("Failed to fetch admin", err);
        
        // Create admin object with Firebase displayName as fallback
        setAdmin({
          firebaseUid: user.uid,
          fullName: user.displayName || user.email?.split('@')[0] || "Admin",
          email: user.email || "",
          phone: "",
          collegeName: "",
          employeeId: "",
          adminRole: "",
          department: ""
        });
        setError(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/students`);
      
      // Validate response is array
      const studentsData = Array.isArray(res.data?.data) ? res.data.data : [];
      setStudents(studentsData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch students", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch students. Please try again.";
      setError(errorMsg);
      setStudents([]);
    }
  };

  const fetchRecruiters = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/recruiters`);
      
      // Validate response is array
      const recruitersData = Array.isArray(res.data?.data) ? res.data.data : [];
      setRecruiters(recruitersData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch recruiters", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch recruiters. Please try again.";
      setError(errorMsg);
      setRecruiters([]);
    }
  };

  const fetchJobDrives = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/drives`);
      
      // Validate response is array
      let drivesData = Array.isArray(res.data?.data) ? res.data.data : [];

      // Fallback: if admin endpoint returned no drives, try public drives endpoint (legacy or alternate storage)
      if ((!drivesData || drivesData.length === 0)) {
        try {
          const fallback = await axios.get(`${API_BASE}/api/drives`);
          drivesData = Array.isArray(fallback.data?.data) ? fallback.data.data : [];
        } catch (fallbackErr) {
          console.warn('Fallback /api/drives failed', fallbackErr.message);
        }
      }
      // By default hide drives that are marked deleted so UI removes them after admin deletion
      const visibleDrives = Array.isArray(drivesData)
        ? drivesData.filter(d => !(d.isDeleted === true || (d.status && d.status.toLowerCase() === 'deleted')))
        : [];

      setJobDrives(visibleDrives);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch job drives", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch job drives. Please try again.";
      setError(errorMsg);
      setJobDrives([]);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await axios.get(`${API_BASE}/api/admin/stats`);
      
      // Validate response data
      const statsData = res.data?.data || res.data;
      setStats(statsData || {});
      setError(null);
    } catch (err) {
      console.error("Failed to fetch stats", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch statistics. Using calculated stats.";
      setError(errorMsg);
      
      // Calculate stats locally as fallback
      const allApplied = jobDrives.reduce((sum, drive) => sum + (drive.applications?.length || 0), 0);
      const allSelected = jobDrives.reduce((sum, drive) => sum + (drive.applications?.filter(a => a.applicationStatus === 'selected').length || 0), 0);
      
      setStats({
        totalStudents: students.length,
        activeRecruiters: recruiters.length,
        partnerCompanies: new Set(jobDrives.map(d => d.company)).size,
        placementRate: allApplied > 0 ? Math.round((allSelected / allApplied) * 100) : 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      setSchedulesLoading(true);
      const res = await axios.get(`${API_BASE}/api/schedules`);
      
      // Validate response is array
      const schedulesData = Array.isArray(res.data?.data) ? res.data.data : [];
      setSchedules(schedulesData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch schedules", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch schedules. Please try again.";
      setError(errorMsg);
      setSchedules([]);
    } finally {
      setSchedulesLoading(false);
    }
  };

  const updateAdmin = async (updatedData) => {
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
        `${API_BASE}/api/admin/profile/${user.uid}`,
        updatedData
      );
      // Handle response format: { success: true, data: admin }
      const adminData = res.data?.data || res.data;
      if (!adminData) {
        throw new Error("Invalid response from server");
      }

      setAdmin(adminData);
      setError(null);
      return adminData;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to update profile. Please try again.";
      setError(errorMsg);
      console.error("Failed to update admin", err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminContext.Provider value={{ 
      admin, 
      loading, 
      error, 
      updateAdmin,
      students,
      recruiters,
      jobDrives,
      schedules,
      schedulesLoading,
      stats,
      statsLoading,
      fetchStudents,
      fetchRecruiters,
      fetchJobDrives,
      fetchSchedules,
      fetchStats
    }}>
      {children}
    </AdminContext.Provider>
  );
}

/* =========================
   HOOK
========================= */
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used inside AdminProvider");
  }
  return context;
};
