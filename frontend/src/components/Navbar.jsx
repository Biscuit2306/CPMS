import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, ArrowRight } from 'lucide-react';
import '../styles/navbar.css';

const Navbar = ({ onGetStartedClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (onGetStartedClick) {
      onGetStartedClick();
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <div className="navbar-logo-icon">
            <Sparkles size={24} />
          </div>
          <span className="navbar-logo-text">PlacementHub</span>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'navbar-menu-open' : ''}`}>
          <a href="#home" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </a>
          <a href="#about" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
            About
          </a>
          <button className="navbar-btn navbar-btn-desktop" onClick={handleGetStarted}>
            Sign In <ArrowRight size={18} />
          </button>

        </div>


        <button
          className="navbar-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;