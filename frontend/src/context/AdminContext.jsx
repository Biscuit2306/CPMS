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

  const updateAdmin = async (updatedData) => {
    try {
      setLoading(true);
      setError(null);
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const res = await axios.put(
        `${API_BASE}/api/admin/profile/${user.uid}`,
        updatedData
      );
      // Handle response format: { success: true, data: admin }
      const adminData = res.data.data || res.data;
      setAdmin(adminData);
      return adminData;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Failed to update admin", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminContext.Provider value={{ admin, loading, error, updateAdmin }}>
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
