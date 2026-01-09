import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/register.css";

function Register() {
  return (
    <div className="register-page">
      <Navbar />

      <div className="register-container">
        <h2>Create Account</h2>

        <form className="register-form">
          <div className="form-group">
            <label>Role</label>
            <select>
              <option value="">Select role</option>
              <option value="student">Student</option>
              <option value="recruiter">Recruiter</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input type="text" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" />
          </div>

          <button className="primary-btn">Register</button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default Register;
