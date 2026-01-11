import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/about.css";
import { Target, Users, Award, Lightbulb, Heart, Shield, Zap, Globe, TrendingUp, CheckCircle, Building} from "lucide-react";

function About() {
  return (
    <div className="about-page">
      <Navbar />

      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-badge">About Us</span>
          <h1 className="about-hero-title">
            Empowering Students to <br />
            <span className="highlight-text">Achieve Their Dreams</span>
          </h1>
          <p className="about-hero-text">
            We're revolutionizing campus placements by creating a seamless bridge 
            between talented students and leading companies worldwide.
          </p>
        </div>
        
        <div className="about-hero-image">
          <div className="floating-card floating-card-1">
            <Users size={32} />
            <h3>10K+</h3>
            <p>Students</p>
          </div>
          <div className="floating-card floating-card-2">
            <Building size={32} />
            <h3>500+</h3>
            <p>Companies</p>
          </div>
          <div className="floating-card floating-card-3">
            <Award size={32} />
            <h3>95%</h3>
            <p>Success Rate</p>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="mission-vision-section">
        <div className="mission-vision-container">
          <div className="mission-box">
            <div className="mission-icon">
              <Target size={48} />
            </div>
            <h2>Our Mission</h2>
            <p>
              To streamline the campus placement process by providing a comprehensive, 
              user-friendly platform that connects talented students with their ideal career 
              opportunities, fostering growth and success for both students and organizations.
            </p>
          </div>

          <div className="vision-box">
            <div className="vision-icon">
              <Lightbulb size={48} />
            </div>
            <h2>Our Vision</h2>
            <p>
              To become the leading campus placement platform globally, recognized for 
              innovation, reliability, and excellence in bridging the gap between education 
              and employment, empowering the next generation of professionals.
            </p>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="our-story-section">
        <div className="story-content">
          <div className="story-text">
            <span className="story-badge">Our Journey</span>
            <h2>How We Started</h2>
            <p>
              Founded in 2020, our platform was born from a simple observation: the campus 
              placement process was fragmented, stressful, and inefficient for both students 
              and recruiters.
            </p>
            <p>
              A group of passionate educators and tech enthusiasts came together with a vision 
              to transform this experience. What started as a small pilot program in three 
              colleges has now grown into a nationwide platform serving hundreds of institutions.
            </p>
            <p>
              Today, we're proud to have facilitated thousands of successful placements, 
              helping students launch their careers and companies find exceptional talent.
            </p>
            
            <div className="story-stats">
              <div className="story-stat">
                <h3>2020</h3>
                <p>Year Founded</p>
              </div>
              <div className="story-stat">
                <h3>200+</h3>
                <p>Partner Colleges</p>
              </div>
              <div className="story-stat">
                <h3>50K+</h3>
                <p>Placements</p>
              </div>
            </div>
          </div>

          <div className="story-visual">
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h4>2020</h4>
                  <p>Platform launched with 3 colleges</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h4>2021</h4>
                  <p>Expanded to 50+ institutions</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h4>2023</h4>
                  <p>Reached 100K active users</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>2026</h4>
                  <p>Leading platform nationwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="core-values-section">
        <h2>Our Core Values</h2>
        <p className="section-subtitle">
          The principles that guide everything we do
        </p>

        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">
              <Heart size={40} />
            </div>
            <h3>Student-Centric</h3>
            <p>Every decision we make prioritizes student success and well-being</p>
          </div>

          <div className="value-card">
            <div className="value-icon">
              <Shield size={40} />
            </div>
            <h3>Integrity</h3>
            <p>We maintain transparency and honesty in all our interactions</p>
          </div>

          <div className="value-card">
            <div className="value-icon">
              <Zap size={40} />
            </div>
            <h3>Innovation</h3>
            <p>Continuously improving through cutting-edge technology and ideas</p>
          </div>

          <div className="value-card">
            <div className="value-icon">
              <Globe size={40} />
            </div>
            <h3>Inclusivity</h3>
            <p>Creating equal opportunities for students from all backgrounds</p>
          </div>

          <div className="value-card">
            <div className="value-icon">
              <TrendingUp size={40} />
            </div>
            <h3>Excellence</h3>
            <p>Striving for the highest quality in service and support</p>
          </div>

          <div className="value-card">
            <div className="value-icon">
              <Users size={40} />
            </div>
            <h3>Collaboration</h3>
            <p>Building strong partnerships between students, colleges, and companies</p>
          </div>
        </div>
      </section>

      {/* WHAT SETS US APART */}
      <section className="differentiators-section">
        <div className="differentiators-container">
          <div className="differentiators-image">
            <div className="diff-graphic">
              <div className="diff-circle diff-circle-1">
                <CheckCircle size={32} />
              </div>
              <div className="diff-circle diff-circle-2">
                <CheckCircle size={32} />
              </div>
              <div className="diff-circle diff-circle-3">
                <CheckCircle size={32} />
              </div>
              <div className="diff-center">
                <Award size={48} />
                <p>Excellence</p>
              </div>
            </div>
          </div>

          <div className="differentiators-content">
            <h2>What Sets Us Apart</h2>
            <p className="diff-intro">
              We don't just manage placements—we transform careers
            </p>

            <div className="diff-list">
              <div className="diff-item">
                <div className="diff-number">01</div>
                <div className="diff-text">
                  <h4>AI-Powered Matching</h4>
                  <p>Our intelligent algorithms match students with roles that align perfectly with their skills, interests, and career goals.</p>
                </div>
              </div>

              <div className="diff-item">
                <div className="diff-number">02</div>
                <div className="diff-text">
                  <h4>End-to-End Support</h4>
                  <p>From profile creation to offer acceptance, we provide comprehensive guidance and support at every step of the journey.</p>
                </div>
              </div>

              <div className="diff-item">
                <div className="diff-number">03</div>
                <div className="diff-text">
                  <h4>Real-Time Analytics</h4>
                  <p>Detailed insights and reports help students track their progress and make informed decisions about their career path.</p>
                </div>
              </div>

              <div className="diff-item">
                <div className="diff-number">04</div>
                <div className="diff-text">
                  <h4>Industry Partnerships</h4>
                  <p>Strong relationships with 500+ top companies ensure access to the best opportunities across diverse sectors.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="team-section">
        <h2>Meet Our Team</h2>
        <p className="section-subtitle">
          Passionate professionals dedicated to your success
        </p>

        <div className="team-grid">
          <div className="team-card">
            <div className="team-avatar">
              <div className="avatar-placeholder">AK</div>
            </div>
            <h3>Amit Kumar</h3>
            <p className="team-role">Founder & CEO</p>
            <p className="team-bio">15+ years in EdTech, passionate about bridging education and employment</p>
          </div>

          <div className="team-card">
            <div className="team-avatar">
              <div className="avatar-placeholder">SP</div>
            </div>
            <h3>Sneha Patel</h3>
            <p className="team-role">Chief Technology Officer</p>
            <p className="team-bio">Expert in AI/ML with a vision for innovation in recruitment technology</p>
          </div>

          <div className="team-card">
            <div className="team-avatar">
              <div className="avatar-placeholder">RG</div>
            </div>
            <h3>Rohan Gupta</h3>
            <p className="team-role">Head of Operations</p>
            <p className="team-bio">Specialized in scaling platforms and ensuring seamless user experiences</p>
          </div>

          <div className="team-card">
            <div className="team-avatar">
              <div className="avatar-placeholder">PS</div>
            </div>
            <h3>Priya Sharma</h3>
            <p className="team-role">Head of Partnerships</p>
            <p className="team-bio">Building bridges between colleges and leading companies worldwide</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="about-cta">
        <h2>Ready to Transform Your Career?</h2>
        <p>Join thousands of students who have found their dream jobs through our platform</p>
        <button className="about-cta-button">
          Get Started Today →
        </button>
      </section>

      <Footer />
    </div>
  );
}

export default About;