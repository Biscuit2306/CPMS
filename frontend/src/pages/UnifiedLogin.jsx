import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../styles/unifiedlogin.css";
import axios from "axios";
import { auth, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cpms-xtz8.onrender.com";

const UnifiedLogin = ({ role: propRole, isModal = false }) => {
  const navigate = useNavigate();
  const { role: paramRole } = useParams();
  const role = propRole || paramRole || "student";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const roleConfig = {
    student: {
      title: "Student Login",
      subtitle: "Enter your student credentials",
      forgotPasswordText: "Forgot Password?",
      loginButtonText: "Login as Student",
      signupText: "Don't have an account?",
      signupLinkText: "Sign up",
      signupLink: "/register/student",
    },
    admin: {
      title: "Admin Login",
      subtitle: "Enter your admin credentials",
      forgotPasswordText: "Forgot Password?",
      loginButtonText: "Login as Admin",
      signupText: "Don't have an account?",
      signupLinkText: "Register as Admin",
      signupLink: "/register/admin",
    },
    recruiter: {
      title: "Recruiter Login",
      subtitle: "Enter your recruiter credentials",
      forgotPasswordText: "Forgot Password?",
      loginButtonText: "Login as Recruiter",
      signupText: "Don't have an account?",
      signupLinkText: "Register as Recruiter",
      signupLink: "/register/recruiter",
    },
  };

  const config = roleConfig[role] || roleConfig.student;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ------------------------
  // FORGOT PASSWORD
  // ------------------------
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    const email = formData.email.trim();

    if (!email) {
      alert("Please enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (err) {
      console.error("Reset password failed:", err);

      // Firebase sometimes hides user-not-found for security
      if (err.code === "auth/user-not-found") {
        alert("No account found with this email.");
        return;
      }

      alert("Failed to send reset email. Try again.");
    }
  };

  // ------------------------
  // EMAIL + PASSWORD LOGIN
  // ------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // ⚠️ Email verification check removed - not mandatory for CPMS
      // Users can login and verify email later if needed

      const idToken = await cred.user.getIdToken();

      const res = await axios.post(
        `${API_BASE}/api/auth/resolve-login`,
        {
          requestedRole: role,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          withCredentials: true, // ✅ Include cookies
        }
      );

      const backendRole = res.data.role;
      const userData = res.data.user;
      const twoFactorEnabled = res.data.twoFactorEnabled;

      localStorage.setItem("userRole", backendRole);
      localStorage.setItem("userData", JSON.stringify(userData));

      // 🔥 2FA FLOW
      if (!twoFactorEnabled) {
        navigate("/setup-2fa");
        return;
      }

      // ✅ CHECK IF TRUSTED DEVICE (skip 2FA if valid)
      try {
        console.log("🔍 Checking if device is trusted...");
        
        const trustRes = await axios.post(
          `${API_BASE}/api/auth/check-trusted-device`,
          { role: backendRole },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
            withCredentials: true, // ✅ Include cookies
          }
        );

        console.log("📡 Trusted device response:", trustRes.data);

        if (trustRes.data.trusted) {
          // ✅ Device is trusted, skip 2FA
          console.log("✅ Device is TRUSTED - Skipping 2FA");
          localStorage.setItem("twoFactorVerified", "true");
          if (backendRole === "student") navigate("/student");
          else if (backendRole === "recruiter") navigate("/recruiter");
          else if (backendRole === "admin") navigate("/admin");
          else navigate("/");
          return;
        }
      } catch (trustErr) {
        console.warn("Trusted device check failed, requiring 2FA:", trustErr.message);
      }

      // ❌ Device not trusted, require 2FA
      console.log("❌ Device NOT trusted - Requiring 2FA");
      localStorage.setItem("twoFactorVerified", "false");
      navigate("/verify-2fa");
    } catch (err) {
      console.error("Login failed:", err);

      // 🔥 Fix: handle Firebase login errors properly
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        alert(
          "Invalid email/password.\n\nIf you signed up using Google, please login with Google OR use 'Forgot Password' to create a password."
        );
        return;
      }

      alert("Login failed. Try again.");
    }
  };

  // ------------------------
  // GOOGLE LOGIN
  // ------------------------
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const idToken = await user.getIdToken();

      const payload = {
        requestedRole: role,
        email: user.email || "",
        fullName: user.displayName || "",
        phone: user.phoneNumber || "",
      };

      const res = await axios.post(`${API_BASE}/api/auth/google-login`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        withCredentials: true, // ✅ Include cookies
      });

      const { role: backendRole, user: userData, twoFactorEnabled } = res.data;

      localStorage.setItem("userRole", backendRole);
      localStorage.setItem("userData", JSON.stringify(userData));

      // 🔥 2FA FLOW
      if (!twoFactorEnabled) {
        navigate("/setup-2fa");
        return;
      }

      // ✅ CHECK IF TRUSTED DEVICE (skip 2FA if valid)
      try {
        console.log("🔍 Checking if device is trusted...");
        
        const trustRes = await axios.post(
          `${API_BASE}/api/auth/check-trusted-device`,
          { role: backendRole },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
            withCredentials: true, // ✅ Include cookies
          }
        );

        console.log("📡 Trusted device response:", trustRes.data);

        if (trustRes.data.trusted) {
          // ✅ Device is trusted, skip 2FA
          console.log("✅ Device is TRUSTED - Skipping 2FA");
          localStorage.setItem("twoFactorVerified", "true");
          if (backendRole === "student") navigate("/student");
          else if (backendRole === "recruiter") navigate("/recruiter");
          else if (backendRole === "admin") navigate("/admin");
          else navigate("/");
          return;
        }
      } catch (trustErr) {
        console.warn("Trusted device check failed, requiring 2FA:", trustErr.message);
      }

      // ❌ Device not trusted, require 2FA
      console.log("❌ Device NOT trusted - Requiring 2FA");
      localStorage.setItem("twoFactorVerified", "false");
      navigate("/verify-2fa");
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") return;

      console.error("Google login failed:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Google login failed");
    }
  };

  return (
    <div
      className={`unified-login-container unified-login-container-${role} ${
        isModal ? "unified-login-modal-mode" : ""
      }`}
    >
      {/* Animated Background Orbs */}
      <div className="unified-login-orb-container">
        <div className="unified-orb orb-1"></div>
        <div className="unified-orb orb-2"></div>
        <div className="unified-orb orb-3"></div>
      </div>

      <div className={`unified-login-card unified-login-card-${role}`}>
        {/* Left Side */}
        <div className={`unified-login-left unified-login-left-${role}`}>
          <div className="unified-login-form-wrapper">
            <h2 className={`unified-login-title unified-login-title-${role}`}>
              {config.title}
            </h2>
            <p className={`unified-login-subtitle unified-login-subtitle-${role}`}>
              {config.subtitle}
            </p>

            <form onSubmit={handleSubmit} className="unified-login-form">
              <div className="unified-form-group">
                <label className={`unified-form-label unified-form-label-${role}`}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`unified-form-input unified-form-input-${role}`}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="unified-form-group">
                <label className={`unified-form-label unified-form-label-${role}`}>
                  Password
                </label>
                <div className="unified-password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`unified-form-input unified-form-input-${role}`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={`unified-password-toggle unified-password-toggle-${role}`}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="unified-forgot-password">
                <a
                  href="#"
                  onClick={handleForgotPassword}
                  className={`unified-forgot-link unified-forgot-link-${role}`}
                >
                  {config.forgotPasswordText}
                </a>
              </div>

              <button
                type="submit"
                className={`unified-login-btn unified-login-btn-${role}`}
              >
                {config.loginButtonText}
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className={`unified-google-btn unified-google-btn-${role}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
                </svg>
                Google Login
              </button>

              {config.signupText && (
                <div className={`unified-signup-link unified-signup-link-${role}`}>
                  <span>{config.signupText} </span>
                  <Link
                    to={config.signupLink}
                    className={`unified-signup-text unified-signup-text-${role}`}
                  >
                    {config.signupLinkText}
                  </Link>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Side with Animations */}
        <div className={`unified-login-right unified-login-right-${role}`}>
          <div className="unified-floating-shape unified-shape-1"></div>
          <div className="unified-floating-shape unified-shape-2"></div>
          <div className="unified-floating-shape unified-shape-3"></div>
          
          <div className="unified-welcome-content">
            <h2>Welcome Back</h2>
            <p>Access your account and continue your journey</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;