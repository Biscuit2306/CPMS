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

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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

      // ✅ reset 2FA session every login (SESSION ONLY)
      sessionStorage.setItem("twoFactorVerified", "false");

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
        }
      );

      const backendRole = res.data.role;
      const userData = res.data.user;
      const twoFactorEnabled = res.data.twoFactorEnabled;

      localStorage.setItem("userRole", backendRole);
      localStorage.setItem("userData", JSON.stringify(userData));

      // 🔥 MANDATORY 2FA FLOW
      if (!twoFactorEnabled) {
        navigate("/setup-2fa");
        return;
      }

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

      // ✅ reset 2FA session every login (SESSION ONLY)
      sessionStorage.setItem("twoFactorVerified", "false");

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
      });

      const { role: backendRole, user: userData, twoFactorEnabled } = res.data;

      localStorage.setItem("userRole", backendRole);
      localStorage.setItem("userData", JSON.stringify(userData));

      // 🔥 MANDATORY 2FA FLOW
      if (!twoFactorEnabled) {
        navigate("/setup-2fa");
        return;
      }

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
                className={`unified-login-btn unified-login-btn-${role}`}
                style={{ marginTop: "12px", background: "#db4437" }}
              >
                Login with Google
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

        {/* Right Side */}
        <div className={`unified-login-right unified-login-right-${role}`}>
          <div className="unified-welcome-content"></div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;