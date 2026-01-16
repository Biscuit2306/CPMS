import React, { useState } from 'react';
import {
  Bell, Calendar, Briefcase, User, LogOut, Menu, X,
  FileText, Clock, TrendingUp, Award, Settings, Building2,
  Search, Filter, CheckCircle, XCircle, AlertCircle, Eye,
  Download, MoreVertical
} from 'lucide-react';
import { Link } from "react-router-dom";
import '../styles/applications.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Applications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const applications = [
    {
      id: 1,
      company: 'Google',
      logo: '🔵',
      role: 'Software Engineer',
      appliedDate: 'Jan 5, 2026',
      status: 'Shortlisted',
      stage: 'Technical Round',
      nextStep: 'Interview scheduled for Jan 18',
      package: '₹18-25 LPA',
      location: 'Bangalore',
      progress: 75
    },
    {
      id: 2,
      company: 'Microsoft',
      logo: '🟦',
      role: 'Data Analyst',
      appliedDate: 'Jan 3, 2026',
      status: 'Interview Scheduled',
      stage: 'HR Round',
      nextStep: 'HR interview on Jan 15',
      package: '₹12-18 LPA',
      location: 'Hyderabad',
      progress: 60
    },
    {
      id: 3,
      company: 'Amazon',
      logo: '🟠',
      role: 'Full Stack Developer',
      appliedDate: 'Dec 28, 2025',
      status: 'Under Review',
      stage: 'Resume Screening',
      nextStep: 'Awaiting response',
      package: '₹15-22 LPA',
      location: 'Pune',
      progress: 40
    },
    {
      id: 4,
      company: 'TCS',
      logo: '🔷',
      role: 'System Engineer',
      appliedDate: 'Dec 20, 2025',
      status: 'Accepted',
      stage: 'Offer Received',
      nextStep: 'Complete joining formalities',
      package: '₹3.5-4.5 LPA',
      location: 'Multiple',
      progress: 100
    },
    {
      id: 5,
      company: 'Wipro',
      logo: '🟣',
      role: 'Project Engineer',
      appliedDate: 'Dec 15, 2025',
      status: 'Rejected',
      stage: 'Technical Round',
      nextStep: 'Application closed',
      package: '₹3.5-5 LPA',
      location: 'Chennai',
      progress: 50
    },
    {
      id: 6,
      company: 'Infosys',
      logo: '🟢',
      role: 'Software Developer',
      appliedDate: 'Jan 8, 2026',
      status: 'Applied',
      stage: 'Application Submitted',
      nextStep: 'Waiting for response',
      package: '₹4.5-6 LPA',
      location: 'Bangalore',
      progress: 20
    }
  ];

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' ||
      app.status.toLowerCase().replace(' ', '-') === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return <CheckCircle size={20} />;
      case 'rejected':
        return <XCircle size={20} />;
      case 'interview scheduled':
      case 'shortlisted':
        return <AlertCircle size={20} />;
      default:
        return <Clock size={20} />;
    }
  };

  return (
    <div className="applications">
      <Navbar />

      <div className="applications__layout">
        {/* Enhanced Sidebar */}
        <aside className={`applications__sidebar ${sidebarOpen ? 'applications__sidebar--open' : ''}`}>
          <div className="applications__sidebar-header">
            <div className="applications__user-profile">
              <div className="applications__avatar">JD</div>
              <div className="applications__user-details">
                <h4>John Doe</h4>
                <p>B.Tech CSE</p>
              </div>
            </div>
          </div>

          <div className="applications__sidebar-content">
            <nav className="applications__nav">
              <Link to="/student" className="applications__nav-item">
                <TrendingUp size={20} />
                <span>Dashboard</span>
              </Link>

              <Link to="/pages/jobdrives" className="applications__nav-item">
                <Building2 size={20} />
                <span>Job Drives</span>
              </Link>

              <Link
                to="/applications"
                className="applications__nav-item applications__nav-item--active"
              >
                <FileText size={20} />
                <span>Applications</span>
                <div className="applications__nav-indicator"></div>
              </Link>

              <Link to="/schedulepage" className="applications__nav-item">
                <Calendar size={20} />
                <span>Schedule</span>
              </Link>

              <Link to="/achievements" className="applications__nav-item">
                <Award size={20} />
                <span>Achievements</span>
              </Link>

              <Link to="/profile" className="applications__nav-item">
                <User size={20} />
                <span>Profile</span>
              </Link>

              <Link to="/settings" className="applications__nav-item">
                <Settings size={20} />
                <span>Settings</span>
              </Link>
            </nav>
          </div>

          <div className="applications__sidebar-footer">
            <button className="applications__logout-btn">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="applications__main">
          <div className="applications__content">
            {/* Header */}
            <div className="applications__header">
              <div className="applications__header-text">
                <h2 className="applications__title">
                  My <span className="highlight-text">Applications</span>
                </h2>
                <p className="applications__subtitle">
                  Track and manage all your placement applications
                </p>
              </div>
              <div className="applications__stats-summary">
                <div className="applications__stat-item">
                  <FileText size={20} className="applications__stat-item-icon" />
                  <div>
                    <p className="applications__stat-item-value">{applications.length}</p>
                    <p className="applications__stat-item-label">Total</p>
                  </div>
                </div>
                <div className="applications__stat-item">
                  <CheckCircle size={20} className="applications__stat-item-icon applications__stat-item-icon--success" />
                  <div>
                    <p className="applications__stat-item-value">
                      {applications.filter(a => a.status === 'Accepted').length}
                    </p>
                    <p className="applications__stat-item-label">Accepted</p>
                  </div>
                </div>
                <div className="applications__stat-item">
                  <Clock size={20} className="applications__stat-item-icon applications__stat-item-icon--pending" />
                  <div>
                    <p className="applications__stat-item-value">
                      {applications.filter(a => a.status !== 'Accepted' && a.status !== 'Rejected').length}
                    </p>
                    <p className="applications__stat-item-label">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="applications__toolbar">
              <div className="applications__search-box">
                <Search size={20} className="applications__search-icon" />
                <input
                  type="text"
                  placeholder="Search by company or role..."
                  className="applications__search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="applications__filters">
                <button
                  className={`applications__filter-btn ${selectedFilter === 'all' ? 'applications__filter-btn--active' : ''}`}
                  onClick={() => setSelectedFilter('all')}
                >
                  All
                </button>
                <button
                  className={`applications__filter-btn ${selectedFilter === 'shortlisted' ? 'applications__filter-btn--active' : ''}`}
                  onClick={() => setSelectedFilter('shortlisted')}
                >
                  Shortlisted
                </button>
                <button
                  className={`applications__filter-btn ${selectedFilter === 'interview-scheduled' ? 'applications__filter-btn--active' : ''}`}
                  onClick={() => setSelectedFilter('interview-scheduled')}
                >
                  Interviews
                </button>
                <button
                  className={`applications__filter-btn ${selectedFilter === 'accepted' ? 'applications__filter-btn--active' : ''}`}
                  onClick={() => setSelectedFilter('accepted')}
                >
                  Accepted
                </button>
                <button
                  className={`applications__filter-btn ${selectedFilter === 'rejected' ? 'applications__filter-btn--active' : ''}`}
                  onClick={() => setSelectedFilter('rejected')}
                >
                  Rejected
                </button>
              </div>
            </div>

            {/* Applications List */}
            <div className="applications__list">
              {filteredApplications.map((app) => (
                <div key={app.id} className="applications__card">
                  <div className="applications__card-left">
                    <div className="applications__company-logo">{app.logo}</div>
                    <div className="applications__company-details">
                      <h3 className="applications__company-name">{app.company}</h3>
                      <p className="applications__role-name">{app.role}</p>
                      <div className="applications__meta">
                        <span className="applications__meta-item">
                          <Calendar size={14} />
                          Applied: {app.appliedDate}
                        </span>
                        <span className="applications__meta-item">
                          <Briefcase size={14} />
                          {app.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="applications__card-center">
                    <div className="applications__stage-info">
                      <p className="applications__stage-label">Current Stage</p>
                      <p className="applications__stage-name">{app.stage}</p>
                      <p className="applications__next-step">{app.nextStep}</p>
                    </div>

                    <div className="applications__progress-wrapper">
                      <div className="applications__progress-bar">
                        <div
                          className={`applications__progress-fill applications__progress-fill--${app.status.toLowerCase().replace(' ', '-')}`}
                          style={{ width: `${app.progress}%` }}
                        ></div>
                      </div>
                      <span className="applications__progress-text">{app.progress}%</span>
                    </div>
                  </div>

                  <div className="applications__card-right">
                    <div className={`applications__status-badge applications__status-badge--${app.status.toLowerCase().replace(' ', '-')}`}>
                      {getStatusIcon(app.status)}
                      <span>{app.status}</span>
                    </div>
                    <p className="applications__package">{app.package}</p>
                    <div className="applications__actions">
                      <button className="applications__action-btn" title="View Details">
                        <Eye size={16} />
                      </button>
                      <button className="applications__action-btn" title="Download">
                        <Download size={16} />
                      </button>
                      <button className="applications__action-btn" title="More">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredApplications.length === 0 && (
              <div className="applications__no-results">
                <FileText size={48} />
                <p>No applications found matching your search</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}