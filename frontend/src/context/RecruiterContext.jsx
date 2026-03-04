import { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const RecruiterContext = createContext(null);

/* =========================
   PROVIDER
========================= */
export function RecruiterProvider({ children }) {
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drives, setDrives] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [drivesLoading, setDrivesLoading] = useState(false);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  // global search term used by the top‑bar search input
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRecruiter(null);
        setDrives([]);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE}/api/recruiter/dashboard/${user.uid}`
        );
        const recruiterData = res.data;

        // Use Firebase displayName if database fullName is empty
        if (!recruiterData.fullName && user.displayName) {
          recruiterData.fullName = user.displayName;
        }

        setRecruiter(recruiterData);
        setError(null);

        // Fetch drives for this recruiter
        await fetchDrives(user.uid);
      } catch (err) {
        console.error("Failed to fetch recruiter", err);

        // Create recruiter object with Firebase displayName as fallback
        setRecruiter({
          firebaseUid: user.uid,
          fullName: user.displayName || user.email?.split("@")[0] || "Recruiter",
          email: user.email || "",
          phone: "",
          companyName: "",
          designation: "",
          companyWebsite: "",
          companySize: "",
        });
        setError(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // ─── Fetch Drives ────────────────────────────────────────────────────────────
  const fetchDrives = async (uid) => {
    try {
      setDrivesLoading(true);
      const res = await axios.get(`${API_BASE}/api/drives/recruiter/${uid}`);
      const drivesData = res.data?.data;
      setDrives(Array.isArray(drivesData) ? drivesData : []);
    } catch (err) {
      console.error("Failed to fetch drives", err);
      setDrives([]);
    } finally {
      setDrivesLoading(false);
    }
  };

  // ─── Create Drive ────────────────────────────────────────────────────────────
  const createDrive = async (driveData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      if (!driveData?.company || !driveData?.position) {
        throw new Error("Company and position are required");
      }

      const payload = {
        recruiterFirebaseUid: user.uid,
        driveData: {
          company: driveData.company,
          position: driveData.position,
          salary: driveData.salary || "",
          location: driveData.location || "",
          jobDescription: driveData.jobDescription || "",
          applicationDeadline: driveData.applicationDeadline || null,
          status: driveData.status || "active",
          eligibilityCriteria: driveData.eligibilityCriteria || {},
          rounds: driveData.rounds || [],
        },
      };

      const res = await axios.post(`${API_BASE}/api/drives`, payload);

      if (user.uid) {
        await fetchDrives(user.uid);
      }

      return res.data?.data || res.data;
    } catch (err) {
      console.error("Failed to create drive", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create job drive. Please try again.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // ─── Update Recruiter Profile ────────────────────────────────────────────────
  const updateRecruiter = async (updatedData) => {
    try {
      setLoading(true);
      setError(null);
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      if (!updatedData || Object.keys(updatedData).length === 0) {
        throw new Error("No changes provided for profile update");
      }

      // Get Firebase ID token for authentication
      const idToken = await user.getIdToken();

      const res = await axios.put(
        `${API_BASE}/api/recruiter/profile/${user.uid}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const recruiterData = res.data?.data || res.data;
      if (!recruiterData) throw new Error("Invalid response from server");

      setRecruiter(recruiterData);
      setError(null);
      return recruiterData;
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile. Please try again.";
      setError(errorMsg);
      console.error("Failed to update recruiter", err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Update Drive ────────────────────────────────────────────────────────────
  const updateDrive = async (driveId, driveData) => {
    try {
      if (!driveId) throw new Error("Drive ID is required");
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const res = await axios.put(
        `${API_BASE}/api/drives/${user.uid}/${driveId}`,
        driveData
      );

      setDrives(drives.map((d) =>
        d._id === driveId ? res.data?.data || res.data : d
      ));
      return res.data?.data || res.data;
    } catch (err) {
      console.error("Failed to update drive", err);
      const errorMsg =
        err.response?.data?.message ||
        "Failed to update job drive. Please try again.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // ─── Delete Drive ────────────────────────────────────────────────────────────
  const deleteDrive = async (driveId) => {
    try {
      if (!driveId) throw new Error("Drive ID is required");
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      await axios.delete(`${API_BASE}/api/drives/${user.uid}/${driveId}`);
      setDrives(drives.filter((d) => d._id !== driveId));
      return { success: true };
    } catch (err) {
      console.error("Failed to delete drive", err);
      const errorMsg =
        err.response?.data?.message ||
        "Failed to delete job drive. Please try again.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // ─── Get Applications for a Drive ───────────────────────────────────────────
  const getApplications = async (driveId) => {
    try {
      if (!driveId) throw new Error("Drive ID is required");
      const drive = drives.find((d) => d._id === driveId);
      if (!drive) throw new Error("Drive not found");
      return drive?.applicants && Array.isArray(drive.applicants)
        ? drive.applicants
        : [];
    } catch (err) {
      console.error("Failed to fetch applications", err);
      return [];
    }
  };

  // ─── Update Application Status ───────────────────────────────────────────────
  // 🔥 CRITICAL: Fetches drives after update to sync status across all pages
  const updateApplicationStatus = async (driveId, studentId, status) => {
    try {
      if (!driveId || !studentId)
        throw new Error("Drive ID and Student ID are required");
      if (
        !["applied", "shortlisted", "interview-scheduled", "selected", "rejected"].includes(status)
      ) {
        throw new Error("Invalid status value");
      }

      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      console.log("📤 Sending status update to backend:");
      console.log(`   URL: ${API_BASE}/api/drives/${user.uid}/${driveId}/applicant/${studentId}`);
      console.log("   Payload:", { status });

      const response = await axios.put(
        `${API_BASE}/api/drives/${user.uid}/${driveId}/applicant/${studentId}`,
        { status }
      );

      console.log("✅ Backend response:", response.data);

      // 🔥 CRITICAL: Refresh drives to sync changes across all pages
      console.log("🔄 Refreshing drives to sync status update...");
      await fetchDrives(user.uid);

      // Also optimistically update local state for immediate UI feedback
      setDrives((prev) =>
        prev.map((d) => {
          if (d._id !== driveId) return d;
          // Handle both `applications` and `applicants` field names
          const updateList = (list) =>
            list?.map((a) =>
              a.studentId === studentId ? { ...a, applicationStatus: status } : a
            );
          return {
            ...d,
            applications: updateList(d.applications),
            applicants: updateList(d.applicants),
          };
        })
      );

      return response.data;
    } catch (err) {
      console.error("❌ Error updating status:", err.message);
      console.error("   Response:", err.response?.data);
      throw err;
    }
  };

  // ─── Get All Candidates (from backend) ──────────────────────────────────────
  const getAllCandidates = async () => {
    try {
      if (!recruiter?.firebaseUid) {
        console.log("📋 No recruiter UID, cannot fetch candidates");
        return [];
      }

      console.log("📋 Fetching candidates from backend for recruiter:", recruiter.firebaseUid);
      const res = await axios.get(
        `${API_BASE}/api/drives/candidates/all/${recruiter.firebaseUid}`
      );
      const candidates = res.data?.data || [];
      console.log("✅ Backend returned", candidates.length, "candidates");
      return candidates;
    } catch (err) {
      console.error("Failed to get candidates from backend", err);
      return [];
    }
  };

  // ─── Get Companies ───────────────────────────────────────────────────────────
  const getCompanies = async () => {
    try {
      const stats = {
        totalApplications: 0,
        shortlistedCount: 0,
        selectedCount: 0,
      };

      drives.forEach((drive) => {
        if (drive.applicants) {
          stats.totalApplications += drive.applicants.length;
          stats.shortlistedCount += drive.applicants.filter(
            (a) => a.applicationStatus === "shortlisted"
          ).length;
          stats.selectedCount += drive.applicants.filter(
            (a) => a.applicationStatus === "selected"
          ).length;
        }
      });

      return [
        {
          id: recruiter?._id || "1",
          company: recruiter?.companyName || "Your Company",
          totalHires: stats.selectedCount,
          avgPackage: recruiter?.avgPackage || "N/A",
          successRate:
            stats.totalApplications > 0
              ? Math.round(
                  ((stats.shortlistedCount + stats.selectedCount) /
                    stats.totalApplications) *
                    100
                ) + "%"
              : "N/A",
          active: true,
          applications: stats.totalApplications,
          website: recruiter?.companyWebsite || "",
          size: recruiter?.companySize || "",
        },
      ];
    } catch (err) {
      console.error("Failed to fetch companies", err);
      return [];
    }
  };

  // ─── Get Interview Schedule ──────────────────────────────────────────────────
  const getInterviewSchedule = async () => {
    try {
      const schedule = [];

      drives.forEach((drive) => {
        if (drive.applicants && drive.applicants.length > 0) {
          const interviewCandidates = drive.applicants.filter(
            (a) =>
              a.applicationStatus === "interview-scheduled" ||
              a.applicationStatus === "shortlisted"
          );

          if (interviewCandidates.length > 0) {
            schedule.push({
              id: drive._id,
              company: recruiter?.companyName || "Your Company",
              type: "Technical Interview",
              date: drive.date
                ? new Date(drive.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "TBD",
              time: "10:00 AM",
              venue: "Conference Room A",
              candidates: interviewCandidates.length,
              status: "Upcoming",
              position: drive.position,
              rounds: drive.rounds || ["Technical Interview", "HR Round"],
            });
          }
        }
      });

      return schedule;
    } catch (err) {
      console.error("Failed to fetch interview schedule", err);
      return [];
    }
  };

  // ─── Fetch Schedules ─────────────────────────────────────────────────────────
  const fetchSchedules = async (uid) => {
    try {
      if (!uid || typeof uid !== "string") {
        throw new Error("Invalid user ID");
      }

      setSchedulesLoading(true);
      const res = await axios.get(`${API_BASE}/api/schedules/recruiter/${uid}`);
      const schedulesData = Array.isArray(res.data?.data) ? res.data.data : [];
      setSchedules(schedulesData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch schedules", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch schedules. Please try again.";
      setError(errorMsg);
      setSchedules([]);
    } finally {
      setSchedulesLoading(false);
    }
  };

  // ─── Create Schedule ─────────────────────────────────────────────────────────
  const createSchedule = async (scheduleData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const driveId = scheduleData?.driveId || scheduleData?.jobDriveId;
      if (!driveId || typeof driveId !== "string") {
        throw new Error("Job drive ID is required");
      }
      if (!scheduleData?.date) throw new Error("Schedule date is required");
      if (!scheduleData?.time) throw new Error("Schedule time is required");

      const payload = {
        recruiterFirebaseUid: user.uid,
        driveId,
        jobDriveId: driveId,
        company: scheduleData.company || "",
        position: scheduleData.position || "",
        interviewType: scheduleData.interviewType || "Technical Interview",
        date: scheduleData.date,
        time: scheduleData.time,
        venue: scheduleData.venue || "",
        platform: scheduleData.platform || "Offline",
        meetingLink: scheduleData.meetingLink || "",
        rounds: scheduleData.rounds || [],
        capacity: scheduleData.capacity || 50,
        description: scheduleData.description || "",
      };

      const res = await axios.post(`${API_BASE}/api/schedules`, payload);
      setError(null);
      await fetchSchedules(user.uid);
      return res.data?.data || res.data;
    } catch (err) {
      console.error("Failed to create schedule", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create schedule. Please try again.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // ─── Update Schedule ─────────────────────────────────────────────────────────
  const updateSchedule = async (scheduleId, scheduleData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      if (!scheduleId || typeof scheduleId !== "string") {
        throw new Error("Invalid schedule ID");
      }
      if (!scheduleData || Object.keys(scheduleData).length === 0) {
        throw new Error("No changes provided for schedule update");
      }

      const res = await axios.put(
        `${API_BASE}/api/schedules/${scheduleId}`,
        scheduleData
      );
      setError(null);
      await fetchSchedules(user.uid);
      return res.data?.data || res.data;
    } catch (err) {
      console.error("Failed to update schedule", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update schedule. Please try again.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // ─── Delete Schedule ─────────────────────────────────────────────────────────
  const deleteSchedule = async (scheduleId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      if (!scheduleId || typeof scheduleId !== "string") {
        throw new Error("Invalid schedule ID");
      }

      await axios.delete(`${API_BASE}/api/schedules/${scheduleId}`);
      setError(null);
      await fetchSchedules(user.uid);
      return { success: true, message: "Schedule deleted successfully" };
    } catch (err) {
      console.error("Failed to delete schedule", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete schedule. Please try again.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // ─── Add Candidates to Schedule ──────────────────────────────────────────────
  const addCandidatesToSchedule = async (scheduleId, candidates) => {
    try {
      if (!scheduleId || typeof scheduleId !== "string") {
        throw new Error("Invalid schedule ID");
      }
      if (!Array.isArray(candidates) || candidates.length === 0) {
        throw new Error("At least one candidate must be selected");
      }
      candidates.forEach((candidate, index) => {
        if (!candidate?.studentId && !candidate?.id) {
          throw new Error("Candidate " + (index + 1) + " has invalid ID");
        }
      });

      const res = await axios.post(
        `${API_BASE}/api/schedules/${scheduleId}/add-candidates`,
        { candidates }
      );
      setError(null);
      return res.data?.data || res.data;
    } catch (err) {
      console.error("Failed to add candidates", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to add candidates to schedule. Please try again.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // ─── Update Candidate Status in Schedule ────────────────────────────────────
  const updateCandidateStatusInSchedule = async (
    scheduleId,
    studentId,
    status,
    feedbackNotes = "",
    score = null
  ) => {
    try {
      if (!scheduleId || typeof scheduleId !== "string") {
        throw new Error("Invalid schedule ID");
      }
      if (!studentId || typeof studentId !== "string") {
        throw new Error("Invalid student ID");
      }

      const validStatuses = [
        "applied",
        "shortlisted",
        "interview-scheduled",
        "selected",
        "rejected",
      ];
      if (!status || !validStatuses.includes(status)) {
        throw new Error(
          "Invalid status. Must be one of: " + validStatuses.join(", ")
        );
      }
      if (
        score !== null &&
        (typeof score !== "number" || score < 0 || score > 100)
      ) {
        throw new Error("Score must be a number between 0 and 100");
      }

      const res = await axios.put(
        `${API_BASE}/api/schedules/${scheduleId}/candidate/${studentId}`,
        { status, feedbackNotes: feedbackNotes || "", score }
      );
      setError(null);
      return res.data?.data || res.data;
    } catch (err) {
      console.error("Failed to update candidate status", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update candidate status. Please try again.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return (
    <RecruiterContext.Provider
      value={{
        recruiter,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        updateRecruiter,
        drives,
        drivesLoading,
        fetchDrives,
        createDrive,
        updateDrive,
        deleteDrive,
        getApplications,
        updateApplicationStatus,
        getAllCandidates,
        getCompanies,
        getInterviewSchedule,
        schedules,
        schedulesLoading,
        fetchSchedules,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        addCandidatesToSchedule,
        updateCandidateStatusInSchedule,
      }}
    >
      {children}
    </RecruiterContext.Provider>
  );
}

/* =========================
   CUSTOM HOOK
========================= */
function useRecruiter() {
  const context = useContext(RecruiterContext);
  if (!context) {
    throw new Error("useRecruiter must be used within RecruiterProvider");
  }
  return context;
}

export { useRecruiter };