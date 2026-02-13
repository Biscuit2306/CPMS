import React, { useState } from "react";
import { auth } from "../firebase";
import { reload } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyAndContinue = async () => {
    setIsLoading(true);
    setError("");

    try {
      await reload(auth.currentUser);

      if (!auth.currentUser?.emailVerified) {
        setError("Email not verified yet. Please check your inbox and verify your email.");
        setIsLoading(false);
        return;
      }

      const firebaseUid = auth.currentUser.uid;

      const res = await axios.post(
        `${API_BASE}/api/auth/resolve-login`,
        { firebaseUid, requestedRole: localStorage.getItem("userRole") || "student" }
      );

      const role = res.data.role;

      if (role === "student") navigate("/student");
      else if (role === "recruiter") navigate("/recruiter");
      else if (role === "admin") navigate("/admin");
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.response?.data?.error || err.message || "Verification failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Verify your email</h2>
      <p>
        We've sent a verification link to your email.<br />
        Click the link, then come back and continue.
      </p>

      {error && (
        <div style={{
          backgroundColor: "#fee",
          color: "#c33",
          padding: "12px",
          borderRadius: "4px",
          marginBottom: "20px",
          border: "1px solid #fcc"
        }}>
          {error}
        </div>
      )}

      <button 
        onClick={handleVerifyAndContinue}
        disabled={isLoading}
        style={{
          padding: "10px 20px",
          backgroundColor: isLoading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isLoading ? "not-allowed" : "pointer"
        }}
      >
        {isLoading ? "Verifying..." : "I have verified my email"}
      </button>
    </div>
  );
};

export default VerifyEmail;
