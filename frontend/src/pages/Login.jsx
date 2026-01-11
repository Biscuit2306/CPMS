import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { identifier, password } = formData;

    try {
      let emailToUse = identifier;

      // 🔹 Username → Email lookup
      if (!identifier.includes("@")) {
        const res = await fetch(
          `http://localhost:5000/api/users/username/${identifier}`
        );
        if (!res.ok) throw new Error("Username not found");
        const user = await res.json();
        emailToUse = user.email;
      }

      // 🔹 Firebase Auth
      const userCred = await signInWithEmailAndPassword(
        auth,
        emailToUse,
        password
      );
      const firebaseUid = userCred.user.uid;

      // 🔹 Fetch MongoDB profile
      const res2 = await fetch(
        `http://localhost:5000/api/users/${firebaseUid}`
      );
      if (!res2.ok) throw new Error("User not found");

      const userProfile = await res2.json();

      // 🔐 STORE LOGIN STATE (IMPORTANT)
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: firebaseUid,
          role: userProfile.role,
          name: userProfile.name
        })
      );

      // 🔹 Role-based redirect
      if (userProfile.role === "student") {
        navigate("/student");
      } else if (userProfile.role === "recruiter") {
        navigate("/recruiter");
      } else if (userProfile.role === "admin") {
        navigate("/admin");
      } else {
        throw new Error("Unknown role");
      }

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-page">
      <Navbar />

      <main className="register-main">
        <div className="register-container">
          <h2>Login</h2>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email / Username</label>
              <input
                type="text"
                name="identifier"
                placeholder="Enter email or username"
                value={formData.identifier}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="primary-btn">
              Login
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Login;
