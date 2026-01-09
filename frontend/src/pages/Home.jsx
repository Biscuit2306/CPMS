import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/home.css";

function Home() {
  return (
    <div className="home-page">
      <Navbar />

      {/* HERO SECTION */}
      <section className="home-hero">
        <span className="hero-badge">Campus Recruitment Platform</span>

        <h1>
          College Campus <br /> Placement Management System
        </h1>

        <p>
          A centralized digital platform that streamlines student placements,
          recruiter coordination, and campus hiring processes efficiently.
        </p>

        <div className="hero-actions">
          <button className="primary-btn">Get Started</button>
          <button className="secondary-btn">Learn More</button>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="home-stats">
        <div className="stat-card">
          <h3>500+</h3>
          <p>Students Placed</p>
        </div>
        <div className="stat-card">
          <h3>120+</h3>
          <p>Recruiting Companies</p>
        </div>
        <div className="stat-card">
          <h3>95%</h3>
          <p>Placement Rate</p>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="home-features">
        <h2>Platform Capabilities</h2>
        <p className="section-subtitle">
          Designed to simplify and digitize the entire campus placement process
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            Student Profile & Resume Management
          </div>
          <div className="feature-card">
            Company Job & Internship Listings
          </div>
          <div className="feature-card">
            Placement Tracking & Reports
          </div>
          <div className="feature-card">
            Real-Time Notifications & Updates
          </div>
        </div>
      </section>
        <Footer />
    </div>
  );
}

export default Home;
