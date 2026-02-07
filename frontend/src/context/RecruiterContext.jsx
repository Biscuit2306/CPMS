import { createContext, useContext, useEffect, useState } from "react";
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRecruiter(null);
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
      } catch (err) {
        console.error("Failed to fetch recruiter", err);
        
        // Create recruiter object with Firebase displayName as fallback
        setRecruiter({
          firebaseUid: user.uid,
          fullName: user.displayName || user.email?.split('@')[0] || "Recruiter",
          email: user.email || "",
          phone: "",
          companyName: "",
          designation: "",
          companyWebsite: "",
          companySize: ""
        });
        setError(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const updateRecruiter = async (updatedData) => {
    try {
      setLoading(true);
      setError(null);
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const res = await axios.put(
        `${API_BASE}/api/recruiter/profile/${user.uid}`,
        updatedData
      );
      // Handle response format: { success: true, data: recruiter }
      const recruiterData = res.data.data || res.data;
      setRecruiter(recruiterData);
      return recruiterData;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Failed to update recruiter", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecruiterContext.Provider value={{ recruiter, loading, error, updateRecruiter }}>
      {children}
    </RecruiterContext.Provider>
  );
}

/* =========================
   HOOK
========================= */
export const useRecruiter = () => {
  const context = useContext(RecruiterContext);
  if (!context) {
    throw new Error("useRecruiter must be used inside RecruiterProvider");
  }
  return context;
};
