import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cpms-xtz8.onrender.com";

const Setup2FA = () => {
  const navigate = useNavigate();

  const [qrCode, setQrCode] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem("userRole") || "student";

  useEffect(() => {
    const loadQR = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return navigate(`/login/${role}`);

        const idToken = await user.getIdToken();

        const res = await axios.post(
          `${API_BASE}/api/auth/2fa/setup`,
          { role },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        if (res.data.alreadyEnabled) {
          navigate("/verify-2fa");
          return;
        }

        setQrCode(res.data.qrCode);
      } catch (err) {
        console.error("2FA setup error:", err.response?.data || err.message);
        alert(err.response?.data?.error || "Failed to setup 2FA");
      } finally {
        setLoading(false);
      }
    };

    loadQR();
  }, []);

  const handleVerifySetup = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return navigate(`/login/${role}`);

      const idToken = await user.getIdToken();

      await axios.post(
        `${API_BASE}/api/auth/2fa/verify-setup`,
        { role, otp },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      sessionStorage.setItem("twoFactorVerified", "true");


      // Redirect to dashboard
      if (role === "student") navigate("/student");
      else if (role === "recruiter") navigate("/recruiter");
      else if (role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      console.error("2FA verify setup error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Invalid OTP");
    }
  };

  if (loading) return <p style={{ padding: "30px" }}>Loading 2FA setup...</p>;

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
          Setup Authenticator App (2FA)
        </h2>
        <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
          Scan this QR code using Google Authenticator / Microsoft Authenticator.
        </p>

        {qrCode && (
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <img
              src={qrCode}
              alt="2FA QR Code"
              style={{ width: "240px", borderRadius: "12px" }}
            />
          </div>
        )}

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

        <button
          onClick={handleVerifySetup}
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
          Verify & Enable 2FA
        </button>
      </div>
    </div>
  );
};

export default Setup2FA;