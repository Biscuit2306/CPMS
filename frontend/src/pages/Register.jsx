import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/register.css";

function Register() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    studentId: "",
    collegeName: "",
    companyId: "",
    companyName: ""
  });

  // Update formData on input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) return alert("Please select a role");

    const { name, username, email, password, studentId, collegeName, companyId, companyName } = formData;

    try {
      // 1️⃣ Create user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUid = userCred.user.uid;

      // 2️⃣ Prepare payload for backend
      const payload = {
        firebaseUid,
        role: selectedRole,
        name,
        username,
        email
      };

      if (selectedRole === "student") {
        payload.studentId = studentId;
        payload.collegeName = collegeName;
      } else if (selectedRole === "recruiter") {
        payload.companyId = companyId;
        payload.companyName = companyName;
      }

      // 3️⃣ Send payload to backend
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Registration failed");

      alert("User registered successfully in Firebase and MongoDB!");
      navigate("/login"); // ✅ redirect to login page
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="register-page">
      <Navbar />

      <main className="register-main">
        <div className="register-container">
          <h2>Create Account</h2>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Select role</option>
                <option value="student">Student</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {selectedRole === "student" && (
              <>
                <div className="form-group">
                  <label>Student ID</label>
                  <input
                    type="text"
                    name="studentId"
                    placeholder="Enter your student ID"
                    value={formData.studentId}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>College Name</label>
                  <input
                    type="text"
                    name="collegeName"
                    placeholder="Enter your college name"
                    value={formData.collegeName}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {selectedRole === "recruiter" && (
              <>
                <div className="form-group">
                  <label>Company ID</label>
                  <input
                    type="text"
                    name="companyId"
                    placeholder="Enter your company ID"
                    value={formData.companyId}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Enter your company name"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <button type="submit" className="primary-btn">
              Register
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Register;
