import React, { useState, useEffect } from 'react';
import { Sparkles, Target, BarChart3, Lock, BookOpen, Zap, BarChart, Shield, BookMarked, ChevronRight, Play } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PortalModal from '../components/PortalModal';
import '../styles/home.css';
import '../styles/trial-home.css';

const Home = () => {
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [navbarScrolled, setNavbarScrolled] = useState(false);

  // Mouse Follower Effect
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

  // Navbar Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setNavbarScrolled(window.pageYOffset > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Create Particles Effect
  useEffect(() => {
    const container = document.getElementById('trial-particles');
    if (container && container.children.length === 0) {
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'trial-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        container.appendChild(particle);
      }
    }
  }, []);

  // Stat Counter Animation
  useEffect(() => {
    const statsSection = document.getElementById('trial-stats');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll('.trial-stat-number');
          counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
              current += step;
              if (current < target) {
                const suffix = target === 95 ? '%' : target === 10000 ? '+' : '+';
                counter.textContent = Math.floor(current).toLocaleString() + suffix;
                requestAnimationFrame(updateCounter);
              } else {
                const suffix = target === 95 ? '%' : target === 10000 ? '+' : '+';
                counter.textContent = target.toLocaleString() + suffix;
              }
            };
            updateCounter();
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
    return () => observer.disconnect();
  }, [showPreloader]);

  // Feature Card 3D Tilt Effect
  useEffect(() => {
    const featureCards = document.querySelectorAll('.trial-feature-card');
    
    featureCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2.5rem)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      });
    });

    return () => {
      featureCards.forEach(card => {
        card.removeEventListener('mousemove', () => {});
        card.removeEventListener('mouseleave', () => {});
      });
    };
  }, [!showPreloader]);

  // Mirror Button Magnetic Effect
  useEffect(() => {
    const buttons = document.querySelectorAll('.trial-mirror-btn');
    
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });

    return () => {
      buttons.forEach(btn => {
        btn.removeEventListener('mousemove', () => {});
        btn.removeEventListener('mouseleave', () => {});
      });
    };
  }, [!showPreloader]);

  // Text Scramble Effect for Hero Title
  useEffect(() => {
    if (showPreloader) return;

    const scrambleText = () => {
      const element = document.getElementById('trial-scrambleText');
      if (!element) return;

      const originalText = element.textContent;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let iterations = 0;
      
      const interval = setInterval(() => {
        element.textContent = originalText
          .split('')
          .map((char, index) => {
            if (index < iterations) {
              return originalText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');
        
        if (iterations >= originalText.length) {
          clearInterval(interval);
        }
        
        iterations += 1/3;
      }, 30);
    };

    const timer = setTimeout(() => {
      scrambleText();
    }, 500);

    return () => clearTimeout(timer);
  }, [showPreloader]);
  useEffect(() => {
    if (showPreloader) return;

    const animateElements = () => {
      const elements = document.querySelectorAll(
        '.trial-section-title, .trial-section-subtitle, .trial-feature-card, .trial-process-step, .trial-cta-card'
      );

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.animation = entry.target.getAttribute('data-animation') || 'trial-slideInUp 0.8s ease-out forwards';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      elements.forEach(el => {
        const delay = el.style.animationDelay || '0s';
        el.setAttribute('data-animation', `trial-slideInUp 0.8s ease-out ${delay}`);
        observer.observe(el);
      });
    };

    animateElements();
  }, [showPreloader]);

  const stats = [
    { number: '500', label: 'Companies' },
    { number: '50', label: 'Colleges' },
    { number: '10000', label: 'Students' },
    { number: '95', label: 'Success Rate' }
  ];

  const features = [
    {
      id: 1,
      title: 'Smart Matching',
      description: 'AI-powered job matching based on skills, interests, and career goals with 95% accuracy.',
      icon: Target,
      color: 'from-purple-500/20 to-purple-600/20'
    },
    {
      id: 2,
      title: 'Real-time Tracking',
      description: 'Track your application status and get instant updates on opportunities as they happen.',
      icon: BarChart3,
      color: 'from-cyan-500/20 to-cyan-600/20'
    },
    {
      id: 3,
      title: 'Secure Platform',
      description: 'Enterprise-grade security with end-to-end encryption to protect your data and privacy.',
      icon: Lock,
      color: 'from-pink-500/20 to-pink-600/20'
    },
    {
      id: 4,
      title: 'Career Resources',
      description: 'Access resume templates, interview tips, and personalized career guidance from experts.',
      icon: BookOpen,
      color: 'from-purple-500/20 to-purple-600/20'
    }
  ];

  const processes = [
    {
      step: 1,
      title: 'Create Your Profile',
      description: 'Sign up and build your comprehensive profile with your skills, education, and career preferences. Our AI analyzes your strengths.'
    },
    {
      step: 2,
      title: 'Get Matched',
      description: 'Our AI algorithm matches you with the best opportunities based on your profile, skills, and career aspirations automatically.'
    },
    {
      step: 3,
      title: 'Apply & Succeed',
      description: 'Apply to positions with one click, track your applications in real-time, and land your dream job with our support.'
    }
  ];

  const portalOptions = [
    {
      id: 'student',
      title: 'Student',
      description: 'Apply for jobs and track applications',
      colorFrom: 'from-blue-500/20',
      colorTo: 'to-blue-600/20',
      iconColor: 'text-blue-400'
    },
    {
      id: 'recruiter',
      title: 'Recruiter',
      description: 'Post jobs and find talent',
      colorFrom: 'from-purple-500/20',
      colorTo: 'to-purple-600/20',
      iconColor: 'text-purple-400'
    },
    {
      id: 'admin',
      title: 'College TPO',
      description: 'Manage placements and reports',
      colorFrom: 'from-cyan-500/20',
      colorTo: 'to-cyan-600/20',
      iconColor: 'text-cyan-400'
    }
  ];

  const handlePortalSelect = (role) => {
    setIsPortalModalOpen(false);
    // Navigation will be handled by PortalModal component
  };

  return (
    <div className="trial-home-page">
      {/* Background */}
      <div className="trial-bg-wrapper">
        <div className="trial-grid-pattern"></div>
        <div className="trial-gradient-orb trial-orb-1"></div>
        <div className="trial-gradient-orb trial-orb-2"></div>
        <div className="trial-gradient-orb trial-orb-3"></div>
        <div 
          className="trial-mouse-follower"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`
          }}
        ></div>
      </div>

      {/* Particles */}
      <div id="trial-particles" className="trial-particles-container"></div>

      {/* Navigation */}
      <nav className={`trial-navbar ${navbarScrolled ? 'scrolled trial-glass-card' : ''}`}>
        <div className="trial-navbar-container">
          <div className="trial-logo-group group cursor-pointer">
            <div className="trial-logo-icon trial-mirror-btn">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="trial-logo-text trial-font-display">
              Campus<span className="trial-gradient-text">Portal</span>
            </span>
          </div>

          <div className="trial-nav-links visible">
            <a href="#home" className="trial-nav-link">Home</a>
            <a href="#features" className="trial-nav-link">Features</a>
            <a href="#process" className="trial-nav-link">How It Works</a>
            <a href="#stats" className="trial-nav-link">Statistics</a>
          </div>

          <button 
            onClick={() => setIsPortalModalOpen(true)}
            className="trial-nav-cta trial-mirror-btn trial-mirror-btn-primary"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="opacity-100 transition-opacity duration-500">
        {/* Hero Section */}
          <section id="home" className="trial-hero">
            <div className="trial-hero-container">
              <div className="trial-hero-content">
                {/* Badge */}
                <div className="trial-hero-badge trial-glass-card">
                  <Sparkles size={16} className="text-purple-400 animate-pulse" />
                  <span className="text-sm text-purple-200 tracking-wide">Welcome to Campus Placement Portal</span>
                </div>

                {/* Title */}
                <h1 className="trial-hero-title trial-font-display">
                  Connect Your
                  <br />
                  <span className="trial-gradient-text" id="trial-scrambleText">Future</span>
                </h1>

                {/* Subtitle */}
                <p className="trial-hero-subtitle">
                  Bridging the gap between talent and opportunity. 
                  Your journey to a successful career starts here with AI-powered matching and real-time tracking.
                </p>

                {/* CTA */}
                <div className="trial-hero-cta-group">
                  <button 
                    onClick={() => setIsPortalModalOpen(true)}
                    className="trial-hero-cta-button primary trial-mirror-btn trial-mirror-btn-primary"
                  >
                    Get Started Now
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="trial-hero-cta-button trial-mirror-btn">
                    <Play size={20} fill="currentColor" />
                    Watch Demo
                  </button>
                </div>

                {/* Stats Grid */}
                <div id="trial-stats" className="trial-stats-grid">
                  {stats.map((stat, index) => (
                    <div key={index} className="trial-stat-card trial-glass-card">
                      <div className="trial-stat-number" data-target={stat.number}>0</div>
                      <div className="trial-stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="trial-scroll-indicator">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="trial-features">
            <div className="trial-hero-container">
              <div className="trial-section-header">
                <h2 className="trial-section-title trial-font-display">
                  Why Choose <span className="trial-gradient-text">Us?</span>
                </h2>
                <p className="trial-section-subtitle">
                  Experience the next generation of campus placement with cutting-edge technology
                </p>
              </div>

              <div className="trial-features-grid">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div 
                      key={feature.id} 
                      className="trial-feature-card trial-glass-card"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className={`trial-feature-icon bg-gradient-to-br ${feature.color}`}>
                        <IconComponent size={32} strokeWidth={1.5} />
                      </div>
                      <h3 className="trial-feature-title">{feature.title}</h3>
                      <p className="trial-feature-description">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Process Section */}
          <section id="process" className="trial-process">
            <div className="trial-hero-container">
              <div className="trial-section-header">
                <h2 className="trial-section-title trial-font-display">
                  How It <span className="trial-gradient-text">Works</span>
                </h2>
                <p className="trial-section-subtitle">
                  Three simple steps to launch your career
                </p>
              </div>

              <div className="trial-process-grid">
                {processes.map((process, index) => (
                  <div 
                    key={index} 
                    className="trial-process-step trial-glass-card"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="trial-step-number">{process.step.toString().padStart(2, '0')}</div>
                    <div className="trial-step-content">
                      <div className="trial-step-badge">{process.step}</div>
                      <h3 className="trial-step-title">{process.title}</h3>
                      <p className="trial-step-description">{process.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="trial-cta-section">
            <div className="trial-hero-container">
              <div className="trial-cta-card trial-glass-card">
                <div className="trial-cta-content">
                  <h2 className="trial-cta-title trial-font-display">
                    Ready to Start Your <span className="trial-gradient-text">Journey?</span>
                  </h2>
                  <p className="trial-cta-subtitle">
                    Join thousands of students who have already transformed their careers with our placement management system.
                  </p>
                  <button 
                    onClick={() => setIsPortalModalOpen(true)}
                    className="trial-cta-button trial-mirror-btn trial-mirror-btn-primary"
                  >
                    Get Started Now
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

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