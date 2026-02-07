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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStudent(null);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE}/api/students/dashboard/${user.uid}`
        );
        setStudent(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch student", err);
        setStudent(null);
        setError(err.message || "Failed to load student profile");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const updateStudent = async (updatedData) => {
    try {
      setLoading(true);
      setError(null);
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const res = await axios.put(
        `${API_BASE}/api/students/profile/${user.uid}`,
        updatedData
      );
      setStudent(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Failed to update student", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentContext.Provider value={{ student, loading, error, updateStudent }}>
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
