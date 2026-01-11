// StudentDashboard.jsx
import React, { useState } from 'react';
import { Bell, Calendar, Briefcase, FileText, User, LogOut, Menu, X, TrendingUp, Users, CheckCircle, Home, Settings, Award, Clock } from 'lucide-react';
import '../styles/studentdashboard.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const upcomingDrives = [
    { company: 'Google', date: 'Jan 15, 2026', role: 'Software Engineer', status: 'Applied', logo: '🔵' },
    { company: 'Microsoft', date: 'Jan 18, 2026', role: 'Data Analyst', status: 'Shortlisted', logo: '🟦' },
    { company: 'Amazon', date: 'Jan 22, 2026', role: 'Full Stack Developer', status: 'Not Applied', logo: '🟠' }
  ];

  const recentApplications = [
    { company: 'TCS', status: 'Under Review', date: 'Jan 5', progress: 60 },
    { company: 'Infosys', status: 'Interview Scheduled', date: 'Jan 3', progress: 80 },
    { company: 'Wipro', status: 'Rejected', date: 'Dec 28', progress: 100 }
  ];

  return (
    <div className="student-dashboard">
      <Navbar />

      <div className="student-dashboard__layout">
        {/* Enhanced Sidebar */}
        <aside className={`student-dashboard__sidebar ${sidebarOpen ? 'student-dashboard__sidebar--open' : ''}`}>
          <div className="student-dashboard__sidebar-header">
            <div className="student-dashboard__user-profile">
              <div className="student-dashboard__avatar">JD</div>
              <div className="student-dashboard__user-details">
                <h4>John Doe</h4>
                <p>B.Tech CSE</p>
              </div>
            </div>
          </div>

          <div className="student-dashboard__sidebar-content">
            <nav className="student-dashboard__nav">
              <a href="#" className="student-dashboard__nav-item student-dashboard__nav-item--active">
                <TrendingUp size={20} />
                <span>Dashboard</span>
                <div className="student-dashboard__nav-indicator"></div>
              </a>

              <Link
                to="/pages/jobdrives"
                className="student-dashboard__nav-item"
                onClick={() => setSidebarOpen(false)}
              >
                <Briefcase size={20} />
                <span>Job Drives</span>
              </Link>

              <a href="#" className="student-dashboard__nav-item">
                <FileText size={20} />
                <span>Applications</span>
              </a>
              
              <a href="#" className="student-dashboard__nav-item">
                <Calendar size={20} />
                <span>Schedule</span>
              </a>
              
              <a href="#" className="student-dashboard__nav-item">
                <Award size={20} />
                <span>Achievements</span>
              </a>
              
              <a href="#" className="student-dashboard__nav-item">
                <User size={20} />
                <span>Profile</span>
              </a>

              <a href="#" className="student-dashboard__nav-item">
                <Settings size={20} />
                <span>Settings</span>
              </a>
            </nav>
          </div>

          <div className="student-dashboard__sidebar-footer">
            <button className="student-dashboard__logout-btn">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="student-dashboard__main">
          <div className="student-dashboard__content">
            {/* Welcome Section */}
            <div className="student-dashboard__welcome">
              <div className="student-dashboard__welcome-text-wrapper">
                <h2 className="student-dashboard__welcome-title">
                  Welcome back, <span className="highlight-name">John!</span>
                </h2>
                <p className="student-dashboard__welcome-text">
                  Here's what's happening with your placement journey today.
                </p>
              </div>
              <div className="student-dashboard__quick-actions">
                <button className="student-dashboard__action-btn">
                  <Bell size={18} />
                  <span className="student-dashboard__notification-badge">3</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="student-dashboard__stats-grid">
              <div className="student-dashboard__stat-card student-dashboard__stat-card--blue">
                <div className="student-dashboard__stat-icon-wrapper">
                  <FileText size={24} />
                </div>
                <div className="student-dashboard__stat-info">
                  <p className="student-dashboard__stat-label">Total Applications</p>
                  <p className="student-dashboard__stat-value">12</p>
                  <span className="student-dashboard__stat-change positive">+2 this week</span>
                </div>
              </div>

              <div className="student-dashboard__stat-card student-dashboard__stat-card--green">
                <div className="student-dashboard__stat-icon-wrapper">
                  <CheckCircle size={24} />
                </div>
                <div className="student-dashboard__stat-info">
                  <p className="student-dashboard__stat-label">Shortlisted</p>
                  <p className="student-dashboard__stat-value">5</p>
                  <span className="student-dashboard__stat-change positive">+1 this week</span>
                </div>
              </div>

              <div className="student-dashboard__stat-card student-dashboard__stat-card--orange">
                <div className="student-dashboard__stat-icon-wrapper">
                  <Users size={24} />
                </div>
                <div className="student-dashboard__stat-info">
                  <p className="student-dashboard__stat-label">Interviews</p>
                  <p className="student-dashboard__stat-value">3</p>
                  <span className="student-dashboard__stat-change">Upcoming</span>
                </div>
              </div>

              <div className="student-dashboard__stat-card student-dashboard__stat-card--purple">
                <div className="student-dashboard__stat-icon-wrapper">
                  <Award size={24} />
                </div>
                <div className="student-dashboard__stat-info">
                  <p className="student-dashboard__stat-label">Offers</p>
                  <p className="student-dashboard__stat-value">1</p>
                  <span className="student-dashboard__stat-change positive">Congratulations!</span>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="student-dashboard__content-grid">
              {/* Upcoming Drives */}
              <div className="student-dashboard__card student-dashboard__card--wide">
                <div className="student-dashboard__card-header">
                  <h3 className="student-dashboard__card-title">
                    <Calendar className="student-dashboard__title-icon" size={24} />
                    Upcoming Placement Drives
                  </h3>
                  <button className="student-dashboard__view-all-btn">View All</button>
                </div>

                <div className="student-dashboard__drives-list">
                  {upcomingDrives.map((drive, idx) => (
                    <div key={idx} className="student-dashboard__drive-item">
                      <div className="student-dashboard__drive-logo">{drive.logo}</div>
                      <div className="student-dashboard__drive-details">
                        <div className="student-dashboard__drive-header">
                          <h4 className="student-dashboard__drive-company">{drive.company}</h4>
                          <span
                            className={`student-dashboard__status-badge student-dashboard__status-badge--${drive.status
                              .toLowerCase()
                              .replace(' ', '-')}`}
                          >
                            {drive.status}
                          </span>
                        </div>
                        <p className="student-dashboard__drive-role">{drive.role}</p>
                        <p className="student-dashboard__drive-date">
                          <Clock size={14} />
                          {drive.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Applications */}
              <div className="student-dashboard__card">
                <div className="student-dashboard__card-header">
                  <h3 className="student-dashboard__card-title">
                    <FileText className="student-dashboard__title-icon" size={24} />
                    Recent Activity
                  </h3>
                </div>

                <div className="student-dashboard__activity-list">
                  {recentApplications.map((app, idx) => (
                    <div key={idx} className="student-dashboard__activity-item">
                      <div className="student-dashboard__activity-header">
                        <p className="student-dashboard__activity-company">{app.company}</p>
                        <p className="student-dashboard__activity-date">{app.date}</p>
                      </div>
                      <p
                        className={`student-dashboard__activity-status student-dashboard__activity-status--${app.status
                          .toLowerCase()
                          .replace(' ', '-')}`}
                      >
                        {app.status}
                      </p>
                      <div className="student-dashboard__progress-bar">
                        <div 
                          className="student-dashboard__progress-fill"
                          style={{ width: `${app.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}