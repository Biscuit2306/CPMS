// StudentDashboard.jsx
import React, { useState } from 'react';
import { Bell, Calendar, Briefcase, FileText, User, LogOut, Menu, X, TrendingUp, Users, CheckCircle } from 'lucide-react';
import '../styles/studentdashboard.css';

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const upcomingDrives = [
    { company: 'Google', date: 'Jan 15, 2026', role: 'Software Engineer', status: 'Applied' },
    { company: 'Microsoft', date: 'Jan 18, 2026', role: 'Data Analyst', status: 'Shortlisted' },
    { company: 'Amazon', DataTransfer: 'Jan 22, 2026', role: 'Full Stack Developer', status: 'Not Applied' }
  ];

  const recentApplications = [
    { company: 'TCS', status: 'Under Review', date: 'Jan 5' },
    { company: 'Infosys', status: 'Interview Scheduled', date: 'Jan 3' },
    { company: 'Wipro', status: 'Rejected', date: 'Dec 28' }
  ];

  return (
    <div className="student-dashboard">
      {/* Navbar */}
      {/* <nav className="student-dashboard__navbar">
        <div className="student-dashboard__navbar-container">
          <div className="student-dashboard__navbar-content">
            <div className="student-dashboard__navbar-left">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                className="student-dashboard__menu-btn"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="student-dashboard__navbar-title">Campus Placement Portal</h1>
            </div>
            <div className="student-dashboard__navbar-right">
              <button className="student-dashboard__icon-btn">
                <Bell size={20} />
              </button>
              <div className="student-dashboard__user-info">
                <User size={20} />
                <span className="student-dashboard__user-name">John Doe</span>
              </div>
              <button className="student-dashboard__icon-btn">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav> */}

      <div className="student-dashboard__layout">
        {/* Sidebar */}
        <aside className={`student-dashboard__sidebar ${sidebarOpen ? 'student-dashboard__sidebar--open' : ''}`}>
          <div className="student-dashboard__sidebar-content">
            <nav className="student-dashboard__nav">
              <a href="#" className="student-dashboard__nav-item student-dashboard__nav-item--active">
                <TrendingUp size={20} />
                <span>Dashboard</span>
              </a>
              <a href="#" className="student-dashboard__nav-item">
                <Briefcase size={20} />
                <span>Job Drives</span>
              </a>
              <a href="#" className="student-dashboard__nav-item">
                <FileText size={20} />
                <span>Applications</span>
              </a>
              <a href="#" className="student-dashboard__nav-item">
                <Calendar size={20} />
                <span>Schedule</span>
              </a>
              <a href="#" className="student-dashboard__nav-item">
                <User size={20} />
                <span>Profile</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="student-dashboard__main">
          <div className="student-dashboard__content">
            {/* Welcome Section */}
            <div className="student-dashboard__welcome">
              <h2 className="student-dashboard__welcome-title">Welcome back, John!</h2>
              <p className="student-dashboard__welcome-text">Here's what's happening with your placement journey today.</p>
            </div>

            {/* Stats Cards */}
            <div className="student-dashboard__stats-grid">
              <div className="student-dashboard__stat-card student-dashboard__stat-card--blue">
                <div className="student-dashboard__stat-content">
                  <div>
                    <p className="student-dashboard__stat-label">Total Applications</p>
                    <p className="student-dashboard__stat-value">12</p>
                  </div>
                  <FileText className="student-dashboard__stat-icon" size={40} />
                </div>
              </div>

              <div className="student-dashboard__stat-card student-dashboard__stat-card--green">
                <div className="student-dashboard__stat-content">
                  <div>
                    <p className="student-dashboard__stat-label">Shortlisted</p>
                    <p className="student-dashboard__stat-value">5</p>
                  </div>
                  <CheckCircle className="student-dashboard__stat-icon" size={40} />
                </div>
              </div>

              <div className="student-dashboard__stat-card student-dashboard__stat-card--orange">
                <div className="student-dashboard__stat-content">
                  <div>
                    <p className="student-dashboard__stat-label">Interviews</p>
                    <p className="student-dashboard__stat-value">3</p>
                  </div>
                  <Users className="student-dashboard__stat-icon" size={40} />
                </div>
              </div>

              <div className="student-dashboard__stat-card student-dashboard__stat-card--purple">
                <div className="student-dashboard__stat-content">
                  <div>
                    <p className="student-dashboard__stat-label">Offers</p>
                    <p className="student-dashboard__stat-value">1</p>
                  </div>
                  <Briefcase className="student-dashboard__stat-icon" size={40} />
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="student-dashboard__content-grid">
              {/* Upcoming Drives */}
              <div className="student-dashboard__card student-dashboard__card--wide">
                <h3 className="student-dashboard__card-title">
                  <Calendar className="student-dashboard__title-icon" size={24} />
                  Upcoming Placement Drives
                </h3>
                <div className="student-dashboard__drives-list">
                  {upcomingDrives.map((drive, idx) => (
                    <div key={idx} className="student-dashboard__drive-item">
                      <div className="student-dashboard__drive-header">
                        <h4 className="student-dashboard__drive-company">{drive.company}</h4>
                        <span className={`student-dashboard__status-badge student-dashboard__status-badge--${drive.status.toLowerCase().replace(' ', '-')}`}>
                          {drive.status}
                        </span>
                      </div>
                      <p className="student-dashboard__drive-role">{drive.role}</p>
                      <p className="student-dashboard__drive-date">
                        <Calendar size={14} />
                        {drive.date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Applications */}
              <div className="student-dashboard__card">
                <h3 className="student-dashboard__card-title">
                  <FileText className="student-dashboard__title-icon" size={24} />
                  Recent Activity
                </h3>
                <div className="student-dashboard__activity-list">
                  {recentApplications.map((app, idx) => (
                    <div key={idx} className="student-dashboard__activity-item">
                      <p className="student-dashboard__activity-company">{app.company}</p>
                      <p className={`student-dashboard__activity-status student-dashboard__activity-status--${app.status.toLowerCase().replace(' ', '-')}`}>
                        {app.status}
                      </p>
                      <p className="student-dashboard__activity-date">{app.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}