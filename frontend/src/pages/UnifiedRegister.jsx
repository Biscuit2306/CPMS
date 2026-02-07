import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../styles/unifiedregister.css";
import { auth, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const UnifiedRegister = () => {
  const { role: urlRole } = useParams();
  const navigate = useNavigate();

  // 🔐 ROLE LOCKED FROM URL
  const role = ["student", "recruiter", "admin"].includes(urlRole)
    ? urlRole
    : "student";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",

    studentId: "",
    branch: "",
    graduationYear: "",
    cgpa: "",

    companyName: "",
    designation: "",
    companyWebsite: "",
    companySize: "",

    collegeName: "",
    employeeId: "",
    adminRole: "",
    department: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const togglePasswordVisibility = () =>
    setShowPassword((prev) => !prev);

  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    setIsLoading(true);

    const cred = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );

    // optional — keep or remove
    await sendEmailVerification(cred.user);

    await axios.post(`${API_BASE}/api/auth/register`, {
      firebaseUid: cred.user.uid,
      role,
      ...formData,
    });

    // ✅ DIRECT DASHBOARD REDIRECT
    if (role === "student") navigate("/student");
    else if (role === "recruiter") navigate("/recruiter");
    else if (role === "admin") navigate("/admin");

  } catch (err) {
    alert(err.response?.data?.message || err.message);
  } finally {
    setIsLoading(false);
  }
};

 const handleGoogleSignIn = async () => {
  try {
    setIsLoading(true);

    const result = await signInWithPopup(auth, googleProvider);

    const res = await axios.post(
      `${API_BASE}/api/auth/register`,
      {
        firebaseUid: result.user.uid,
        role,
        email: result.user.email,
        fullName: result.user.displayName || "",
        phone: result.user.phoneNumber || "",
      }
    );

    // ✅ SAVE ROLE LOCALLY
    localStorage.setItem("userRole", role);
    localStorage.setItem("userData", JSON.stringify(res.data.user));

    // ✅ DIRECT DASHBOARD REDIRECT
    if (role === "student") navigate("/student");
    else if (role === "recruiter") navigate("/recruiter");
    else if (role === "admin") navigate("/admin");

  } catch (err) {
    alert(err.response?.data?.message || err.message);
  } finally {
    setIsLoading(false);
  }
};


  const getRoleContent = () => {
    switch (role) {
      case "student":
        return {
          icon: "🎓",
          title: "Student Registration",
          subtitle: "Join PlacementHub to kickstart your career",
          description:
            "Access exclusive job opportunities, company insights, and placement resources tailored for students.",
          features: [
            "Browse Job Openings",
            "Track Applications",
            "Upload Resume",
            "Get Placement Updates",
          ],
        };
      case "recruiter":
        return {
          icon: "💼",
          title: "Recruiter Registration",
          subtitle: "Find the best talent for your company",
          description:
            "Connect with top candidates, post job openings, and streamline your campus recruitment process.",
          features: [
            "Post Job Openings",
            "View Student Profiles",
            "Schedule Interviews",
            "Manage Applications",
          ],
        };
      case "admin":
        return {
          icon: "👨‍💼",
          title: "Admin Registration",
          subtitle: "Manage your institution's placement process",
          description:
            "Oversee placements, coordinate with recruiters, and track student progress all in one place.",
          features: [
            "Manage Students",
            "Coordinate Drives",
            "Generate Reports",
            "Track Placements",
          ],
        };
      default:
        return {
          icon: "🎓",
          title: "Student Registration",
          subtitle: "Join PlacementHub to kickstart your career",
          description:
            "Access exclusive job opportunities, company insights, and placement resources.",
          features: [
            "Browse Jobs",
            "Track Applications",
            "Upload Resume",
            "Get Updates",
          ],
        };
    }
  };

  const roleContent = getRoleContent();

  return (
    <div className={`register-container role-${role}`}>
      {/* Decorative Elements */}
      <div className="decorative-circle circle-1"></div>
      <div className="decorative-circle circle-2"></div>
      <div className="decorative-circle circle-3"></div>

      <div className="register-wrapper">
        <div className="register-card">
          {/* LEFT SIDE - Branding & Information */}
          <div className="register-left">
            <div className="brand-section">
              <div className="logo-section">
                <div className="logo-icon">{roleContent.icon}</div>
                <h1 className="logo-text">
                  Placement<span>Hub</span>
                </h1>
              </div>

              <div className="welcome-content">
                <h2 className="welcome-title">{roleContent.title}</h2>
                <p className="welcome-subtitle">{roleContent.subtitle}</p>
                <p className="welcome-description">{roleContent.description}</p>
              </div>

              <div className="features-list">
                <h3 className="features-title">What you'll get:</h3>
                <ul className="features-items">
                  {roleContent.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Registration Form */}
          <div className="register-right">
            <div className="form-container">
              {/* Google Sign In */}
              <button
                type="button"
                className="google-btn"
                onClick={handleGoogleSignIn}
              >
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="divider">
                <span>or register with email</span>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="register-form">
                {/* Common Fields */}
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="+91 xxxxx xxxxx"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="password-toggle"
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className="password-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="password-toggle"
                      >
                        {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Role-Specific Fields */}
                {role === "student" && (
                  <div className="form-grid role-fields">
                    <div className="form-group">
                      <label className="form-label">Student ID</label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="STU123456"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Branch</label>
                      <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        className="form-input"
                        required
                      >
                        <option value="">Select Branch</option>
                        <option value="CSE">Computer Science</option>
                        <option value="IT">Information Technology</option>
                        <option value="ECE">Electronics & Communication</option>
                        <option value="EEE">Electrical Engineering</option>
                        <option value="MECH">Mechanical Engineering</option>
                        <option value="CIVIL">Civil Engineering</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Graduation Year</label>
                      <select
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        className="form-input"
                        required
                      >
                        <option value="">Select Year</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">CGPA</label>
                      <input
                        type="text"
                        name="cgpa"
                        value={formData.cgpa}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="8.5"
                        required
                      />
                    </div>
                  </div>
                )}

                {role === "recruiter" && (
                  <div className="form-grid role-fields">
                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Tech Corp Inc."
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Designation</label>
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="HR Manager"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Company Website</label>
                      <input
                        type="url"
                        name="companyWebsite"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="https://company.com"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Company Size</label>
                      <select
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleChange}
                        className="form-input"
                        required
                      >
                        <option value="">Select Size</option>
                        <option value="1-50">1-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </select>
                    </div>
                  </div>
                )}

                {role === "admin" && (
                  <div className="form-grid role-fields">
                    <div className="form-group">
                      <label className="form-label">College Name</label>
                      <input
                        type="text"
                        name="collegeName"
                        value={formData.collegeName}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="ABC Institute"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Employee ID</label>
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="EMP123"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Role</label>
                      <select
                        name="adminRole"
                        value={formData.adminRole}
                        onChange={handleChange}
                        className="form-input"
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="placement_officer">
                          Placement Officer
                        </option>
                        <option value="hod">Head of Department</option>
                        <option value="dean">Dean</option>
                        <option value="principal">Principal</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="form-input"
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="placement_cell">Placement Cell</option>
                        <option value="CSE">Computer Science</option>
                        <option value="IT">Information Technology</option>
                        <option value="ECE">Electronics & Communication</option>
                        <option value="EEE">Electrical Engineering</option>
                        <option value="MECH">Mechanical Engineering</option>
                        <option value="CIVIL">Civil Engineering</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    <>Create Account</>
                  )}
                </button>

                {/* Login Link */}
                <div className="login-link">
                  Already have an account?
                  <Link to={`/login/${role}`} className="login-text">
                    Sign In
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedRegister;