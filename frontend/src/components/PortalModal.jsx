import React, { useEffect } from 'react';
import { X, Users, Building2, GraduationCap, ChevronRight, ArrowRight } from 'lucide-react';
import '../styles/portal.css';

const PortalModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const userPortals = [
    {
      id: 1,
      title: 'Companies',
      icon: Building2,
      description: 'Post job opportunities and recruit top talent from our campus',
      gradient: 'portal-gradient-green',
      path: '/company-login',
      features: ['Post Jobs', 'View Candidates', 'Track Applications', 'Manage Interviews']
    },
    {
      id: 2,
      title: 'Colleges',
      icon: GraduationCap,
      description: 'Manage placement activities and track student progress',
      gradient: 'portal-gradient-orange',
      path: '/college-login',
      features: ['Manage Students', 'Coordinate Drives', 'Generate Reports', 'Analytics Dashboard']
    },
    {
      id: 3,
      title: 'Students',
      icon: Users,
      description: 'Apply for jobs, track applications, and build your career',
      gradient: 'portal-gradient-blue',
      path: '/student-login',
      features: ['Apply for Jobs', 'Build Profile', 'Track Status', 'Job Matching']
    }
  ];

  const handlePortalClick = (path) => {
    console.log(`Navigating to: ${path}`);
    // Add your navigation logic here
    // window.location.href = path;
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="portal-overlay" onClick={handleBackdropClick}>
      <div className="portal-modal">
        <button className="portal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>

        <div className="portal-header">
          <h2 className="portal-title">Choose Your Portal</h2>
          <p className="portal-subtitle">
            Select your role to access the appropriate dashboard
          </p>
        </div>

        <div className="portal-cards-grid">
          {userPortals.map((portal, index) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                className="portal-card"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handlePortalClick(portal.path)}
              >
                <div className={`portal-card-icon ${portal.gradient}`}>
                  <Icon size={32} />
                </div>

                <h3 className="portal-card-title">{portal.title}</h3>
                <p className="portal-card-description">{portal.description}</p>

                <ul className="portal-card-features">
                  {portal.features.map((feature, idx) => (
                    <li key={idx} className="portal-card-feature">
                      <ChevronRight size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`portal-card-btn ${portal.gradient}`}>
                  Continue
                  <ArrowRight size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PortalModal; 