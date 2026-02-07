import React, { useEffect, useState } from 'react';
import { X, Users, Building2, GraduationCap, ChevronRight, ArrowRight } from 'lucide-react';
import UnifiedLogin from '../pages/UnifiedLogin';
import '../styles/portal.css';

const PortalModal = ({ isOpen, onClose, onPortalSelect }) => {
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

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
        if (showLogin) {
          handleBackToPortals();
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, showLogin, onClose]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowLogin(false);
      setSelectedPortal(null);
    }
  }, [isOpen]);

  const userPortals = [
    {
      id: 1,
      title: 'Companies',
      icon: Building2,
      description: 'Post job opportunities and recruit top talent from our campus',
      gradient: 'portal-gradient-green',
      type: 'recruiter',
      features: ['Post Jobs', 'View Candidates', 'Track Applications', 'Manage Interviews']
    },
    {
      id: 2,
      title: 'Colleges',
      icon: GraduationCap,
      description: 'Manage placement activities and track student progress',
      gradient: 'portal-gradient-orange',
      type: 'admin',
      features: ['Manage Students', 'Coordinate Drives', 'Generate Reports', 'Analytics Dashboard']
    },
    {
      id: 3,
      title: 'Students',
      icon: Users,
      description: 'Apply for jobs, track applications, and build your career',
      gradient: 'portal-gradient-blue',
      type: 'student',
      features: ['Apply for Jobs', 'Build Profile', 'Track Status', 'Job Matching']
    }
  ];

  const handlePortalClick = (type, e) => {
    // Prevent event if it's coming from the button
    if (e && e.target.tagName === 'BUTTON') {
      return;
    }
    
    console.log('Portal clicked:', type); // Debug log
    setSelectedPortal(type);
    setShowLogin(true);
    if (onPortalSelect) {
      onPortalSelect(type);
    }
  };

  const handleButtonClick = (type, e) => {
    e.stopPropagation(); // Stop event from bubbling to card
    console.log('Button clicked for portal:', type); // Debug log
    setSelectedPortal(type);
    setShowLogin(true);
    if (onPortalSelect) {
      onPortalSelect(type);
    }
  };

  const handleBackToPortals = () => {
    setShowLogin(false);
    setSelectedPortal(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (showLogin) {
        handleBackToPortals();
      } else {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="portal-overlay" onClick={handleBackdropClick}>
      {/* Show login directly in overlay without card wrapper */}
      {showLogin && selectedPortal ? (
        <>
          <button className="portal-back-btn-absolute" onClick={handleBackToPortals} aria-label="Back to portals">
            <ArrowRight size={24} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <div className="portal-login-fullscreen">
            <UnifiedLogin role={selectedPortal} isModal={true} />
          </div>
        </>
      ) : (
        <div className="portal-modal">
          {/* Close Button */}
          <button className="portal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={24} />
          </button>

          {/* Portal Selection View */}
          <div className="portal-content">
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
                    onClick={(e) => handlePortalClick(portal.type, e)}
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

                    <button 
                      className={`portal-card-btn ${portal.gradient}`}
                      onClick={(e) => handleButtonClick(portal.type, e)}
                    >
                      Continue
                      <ArrowRight size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalModal;