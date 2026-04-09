import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cpms-xtz8.onrender.com";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      try {
        const idToken = await firebaseUser.getIdToken();
        const res = await fetch(
          `${API_BASE}/api/auth/resolve-login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`
            },
            body: JSON.stringify({
              firebaseUid: firebaseUser.uid,
              requestedRole: localStorage.getItem("userRole") || "student"
            })
          }
        );
        const data = await res.json();
        setRole(data.role);
      } catch (err) {
        console.error("Role fetch failed:", err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ⏳ Wait until BOTH auth + role are ready
  if (loading || (user && role === null)) {
    return <p>Loading...</p>;
  }

  // 🔒 Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Logged in but wrong role
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Allowed
  return children;
};

export default ProtectedRoute;
