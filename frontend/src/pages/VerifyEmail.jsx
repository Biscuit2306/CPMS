import React from "react";
import { auth } from "../firebase";
import { reload } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const VerifyEmail = () => {
  const navigate = useNavigate();

  const handleVerifyAndContinue = async () => {
    await reload(auth.currentUser);

    if (!auth.currentUser?.emailVerified) {
      alert("Email not verified yet. Please check your inbox.");
      return;
    }

    const firebaseUid = auth.currentUser.uid;

    // Get role from backend
    const res = await axios.post(
      `${API_BASE}/api/auth/resolve-login`,
      { firebaseUid, requestedRole: localStorage.getItem("userRole") || "student" }
    );

    const role = res.data.role;

    // Redirect
    if (role === "student") navigate("/student");
    else if (role === "recruiter") navigate("/recruiter");
    else if (role === "admin") navigate("/admin");
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Verify your email</h2>
      <p>
        We’ve sent a verification link to your email.<br />
        Click the link, then come back and continue.
      </p>

      <button onClick={handleVerifyAndContinue}>
        I have verified my email
      </button>
    </div>
  );
};

export default VerifyEmail;
