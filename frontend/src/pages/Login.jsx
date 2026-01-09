import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/login.css";

function Login() {
  return (
    <div className="login-page">
      <Navbar />

      <div className="login-container">
        <h2>Login</h2>

        <form className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter email" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter password" />
          </div>

          <button className="primary-btn">Login</button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default Login;
