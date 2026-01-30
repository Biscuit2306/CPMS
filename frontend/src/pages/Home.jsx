import "../styles/home.css";
import { Users, Building2, TrendingUp, Award, CheckCircle, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="home-page">
      < Navbar />
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

        {/* Hero Illustration */}
        <div className="hero-illustration">
          <div className="illustration-card illustration-card-1">
            <Users size={40} />
            <p>Students</p>
          </div>
          <div className="illustration-card illustration-card-2">
            <Building2 size={40} />
            <p>Companies</p>
          </div>
          <div className="illustration-card illustration-card-3">
            <TrendingUp size={40} />
            <p>Success</p>
          </div>
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
            <div className="feature-icon">📋</div>
            <h3>Student Profile & Resume Management</h3>
            <p>Create comprehensive profiles and manage multiple resume versions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Company Job & Internship Listings</h3>
            <p>Browse opportunities from top recruiting companies</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Placement Tracking & Reports</h3>
            <p>Real-time analytics and detailed placement reports</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Real-Time Notifications & Updates</h3>
            <p>Stay informed about deadlines and opportunities</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="home-how-it-works">
        <h2>How It Works</h2>
        <p className="section-subtitle">
          Simple steps to kickstart your placement journey
        </p>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create Your Profile</h3>
              <p>Sign up and build your academic and professional profile with all necessary details</p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Browse Opportunities</h3>
              <p>Explore job drives, internships, and placement opportunities from top companies</p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Apply & Track</h3>
              <p>Submit applications and track your progress through each recruitment stage</p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Get Placed</h3>
              <p>Receive offers and start your professional career with leading organizations</p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="home-benefits">
        <div className="benefits-container">
          <div className="benefits-text">
            <h2>Why Choose Our Platform?</h2>
            <p className="benefits-intro">
              Experience a seamless placement process with features designed for success
            </p>

            <div className="benefits-list">
              <div className="benefit-item">
                <CheckCircle className="benefit-icon" />
                <div>
                  <h4>Centralized Dashboard</h4>
                  <p>Access all placement activities from one unified interface</p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle className="benefit-icon" />
                <div>
                  <h4>Smart Matching</h4>
                  <p>Get matched with opportunities that align with your skills and preferences</p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle className="benefit-icon" />
                <div>
                  <h4>Automated Workflows</h4>
                  <p>Reduce manual tasks with automated application and scheduling processes</p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle className="benefit-icon" />
                <div>
                  <h4>Data Security</h4>
                  <p>Your personal and academic information is protected with enterprise-grade security</p>
                </div>
              </div>
            </div>
          </div>

          <div className="benefits-visual">
            <div className="visual-card visual-card-1">
              <Award size={48} />
              <h3>Top Recruiters</h3>
              <p>Access to 120+ leading companies</p>
            </div>
            <div className="visual-card visual-card-2">
              <TrendingUp size={48} />
              <h3>High Success Rate</h3>
              <p>95% placement achievement</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="home-testimonials">
        <h2>Student Success Stories</h2>
        <p className="section-subtitle">
          Hear from students who landed their dream jobs through our platform
        </p>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-avatar">RS</div>
            <p className="testimonial-text">
              "The platform made my placement journey so smooth! I got placed at Google within 3 weeks of registration."
            </p>
            <h4>Rahul Sharma</h4>
            <p className="testimonial-role">Software Engineer at Google</p>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-avatar">PK</div>
            <p className="testimonial-text">
              "Real-time notifications kept me updated about every opportunity. Highly recommended for all students!"
            </p>
            <h4>Priya Kapoor</h4>
            <p className="testimonial-role">Data Analyst at Microsoft</p>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-avatar">AM</div>
            <p className="testimonial-text">
              "The best part was tracking all my applications in one place. It reduced my stress during placement season."
            </p>
            <h4>Amit Mehta</h4>
            <p className="testimonial-role">Full Stack Developer at Amazon</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="home-cta">
        <h2>Ready to Start Your Placement Journey?</h2>
        <p>Join thousands of students who have successfully landed their dream jobs</p>
        <button className="cta-button">
          Get Started Today <ArrowRight size={20} />
        </button>
      </section>
    <Footer />
    </div>
  );
}

export default Home;

