import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cpms-xtz8.onrender.com";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(null);

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

        const res = await fetch(`${API_BASE}/api/auth/resolve-login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            requestedRole: localStorage.getItem("userRole") || "student",
          }),
        });

        const data = await res.json();

        setRole(data.role);
        setTwoFactorEnabled(data.twoFactorEnabled);
      } catch (err) {
        console.error("Role fetch failed:", err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || (user && (role === null || twoFactorEnabled === null))) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login/student" replace />;
  }

  // 🔥 Force Setup if 2FA not enabled
  if (!twoFactorEnabled) {
    return <Navigate to="/setup-2fa" replace />;
  }

  // 🔥 Force Verify OTP every login session
  const twoFactorVerified = sessionStorage.getItem("twoFactorVerified") === "true";

  if (!twoFactorVerified) {
    return <Navigate to="/verify-2fa" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;