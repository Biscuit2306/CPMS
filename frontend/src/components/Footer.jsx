import React from 'react';
import { Heart, Github, Linkedin, Twitter, Mail } from 'lucide-react';
import '../styles/footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'FAQ', href: '#faq' },
      { name: 'Updates', href: '#updates' }
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Careers', href: '#careers' },
      { name: 'Blog', href: '#blog' },
      { name: 'Contact', href: '#contact' }
    ],
    support: [
      { name: 'Help Center', href: '#help' },
      { name: 'Documentation', href: '#docs' },
      { name: 'API Status', href: '#status' },
      { name: 'Terms', href: '#terms' }
    ]
  };

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Mail, href: '#', label: 'Email' }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Footer Top Section */}
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <Heart size={24} />
              </div>
              <span className="footer-logo-text">PlacementHub</span>
            </div>
            <p className="footer-brand-description">
              Connecting talent with opportunity. Building careers, one placement at a time.
            </p>
            <div className="footer-social">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="footer-social-link"
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h3 className="footer-links-title">Product</h3>
              <ul className="footer-links-list">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links-column">
              <h3 className="footer-links-title">Company</h3>
              <ul className="footer-links-list">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links-column">
              <h3 className="footer-links-title">Support</h3>
              <ul className="footer-links-list">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Divider */}
        <div className="footer-divider"></div>

        {/* Footer Bottom Section */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} PlacementHub. All rights reserved. Built with{' '}
            <Heart size={14} className="footer-heart" /> for students.
          </p>
          <div className="footer-legal">
            <a href="#privacy" className="footer-legal-link">Privacy Policy</a>
            <span className="footer-legal-divider">•</span>
            <a href="#terms" className="footer-legal-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;