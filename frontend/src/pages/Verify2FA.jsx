import React, { useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cpms-xtz8.onrender.com";

const Verify2FA = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const role = localStorage.getItem("userRole") || "student";

  const handleVerifyLogin = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return navigate(`/login/${role}`);

      const idToken = await user.getIdToken();

      console.log("🔐 Verifying 2FA code with rememberDevice:", rememberDevice);

      const response = await axios.post(
        `${API_BASE}/api/auth/2fa/verify-login`,
        { role, otp, rememberDevice },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          withCredentials: true, // ✅ Include cookies in request
        }
      );

      console.log("✅ 2FA verification successful", response.data);

      // ✅ Store 2FA verification in localStorage (persistent across tabs)
      localStorage.setItem("twoFactorVerified", "true");
      localStorage.setItem("twoFactorVerifiedAt", new Date().toISOString());

      if (role === "student") navigate("/student");
      else if (role === "recruiter") navigate("/recruiter");
      else if (role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      console.error("2FA verify login error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Invalid OTP");
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "40px", background: "#0f172a" }}>
      <div
        style={{
          maxWidth: "520px",
          margin: "0 auto",
          background: "#111827",
          padding: "28px",
          borderRadius: "16px",
          color: "white",
        }}
      >
        <h2 style={{ fontSize: "22px", marginBottom: "8px" }}>
          Enter Authenticator Code
        </h2>
        <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
          Enter the 6-digit OTP from your Authenticator App.
        </p>

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#0b1220",
            color: "white",
            marginBottom: "14px",
          }}
        />

        <label style={{ display: "flex", alignItems: "center", marginBottom: "14px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            style={{
              marginRight: "8px",
              width: "18px",
              height: "18px",
              cursor: "pointer",
            }}
          />
          <span style={{ color: "#cbd5e1", fontSize: "14px" }}>
            Remember this device for 7 days
          </span>
        </label>

        <button
          onClick={handleVerifyLogin}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
};

export default Verify2FA;