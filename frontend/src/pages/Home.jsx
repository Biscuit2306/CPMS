import React, { useState, useEffect } from 'react';
import { Sparkles, Target, BarChart3, Lock, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PortalModal from '../components/PortalModal';
import '../styles/home.css';

const Home = () => {
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const stats = [
    { number: '500+', label: 'Companies' },
    { number: '50+', label: 'Colleges' },
    { number: '10K+', label: 'Students' },
    { number: '95%', label: 'Success Rate' }
  ];

  const features = [
    {
      id: 1,
      title: 'Smart Matching',
      description: 'AI-powered job matching based on skills, interests, and career goals',
      icon: Target
    },
    {
      id: 2,
      title: 'Real-time Tracking',
      description: 'Track your application status and get instant updates on opportunities',
      icon: BarChart3
    },
    {
      id: 3,
      title: 'Secure Platform',
      description: 'Enterprise-grade security to protect your data and privacy',
      icon: Lock
    },
    {
      id: 4,
      title: 'Career Resources',
      description: 'Access resume templates, interview tips, and career guidance',
      icon: BookOpen
    }
  ];

  return (
    <div className="home-page">
      {/* Animated Background */}
      <div className="home-bg-wrapper">
        <div className="home-gradient-orb home-orb-1"></div>
        <div className="home-gradient-orb home-orb-2"></div>
        <div className="home-gradient-orb home-orb-3"></div>
        <div 
          className="home-mouse-follower"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`
          }}
        ></div>
      </div>

      {/* Navigation */}
      <Navbar onGetStartedClick={() => setIsPortalModalOpen(true)} />

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-container">
          <div className="home-hero-content">
            <div className="home-badge">
              <Sparkles size={16} />
              <span>Welcome to Campus Placement Portal</span>
            </div>
            
            <h1 className="home-hero-title">
              Connect Your
              <span className="home-gradient-text"> Future</span>
            </h1>
            
            <p className="home-hero-subtitle">
              Bridging the gap between talent and opportunity. 
              Your journey to a successful career starts here.
            </p>

            <button 
              className="home-cta-button"
              onClick={() => setIsPortalModalOpen(true)}
            >
              Get Started Now
            </button>

            {/* Stats */}
            <div className="home-stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="home-stat-card">
                  <div className="home-stat-number">{stat.number}</div>
                  <div className="home-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="home-features-section">
            <h2 className="home-section-title">Why Choose Us?</h2>
            <div className="home-features-grid">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div 
                    key={feature.id} 
                    className="home-feature-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="home-feature-icon">
                      <IconComponent size={48} strokeWidth={1.5} />
                    </div>
                    <h3 className="home-feature-title">{feature.title}</h3>
                    <p className="home-feature-description">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How It Works Section */}
          <div className="home-process-section">
            <h2 className="home-section-title">How It Works</h2>
            <div className="home-process-grid">
              <div className="home-process-step">
                <div className="home-step-number">1</div>
                <h3 className="home-step-title">Create Your Profile</h3>
                <p className="home-step-description">Sign up and build your comprehensive profile with your skills, education, and career preferences</p>
              </div>
              <div className="home-process-arrow">→</div>
              <div className="home-process-step">
                <div className="home-step-number">2</div>
                <h3 className="home-step-title">Get Matched</h3>
                <p className="home-step-description">Our AI algorithm matches you with the best opportunities based on your profile and aspirations</p>
              </div>
              <div className="home-process-arrow">→</div>
              <div className="home-process-step">
                <div className="home-step-number">3</div>
                <h3 className="home-step-title">Apply & Succeed</h3>
                <p className="home-step-description">Apply to positions, track your applications, and land your dream job with our support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Portal Selection Modal */}
      <PortalModal 
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
      />
    </div>
  );
};

export default Home;