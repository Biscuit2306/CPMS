import React, { useState } from 'react';
import {
  Bell, Calendar, Briefcase, User, LogOut, Menu, X,
  Search, Filter, MapPin, DollarSign, Users, Clock,
  ChevronRight, Building2, TrendingUp, Award, Settings, FileText
} from 'lucide-react';
import { Link } from "react-router-dom";
import '../styles/jobdrives.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function JobDrives() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const jobDrives = [
    {
      id: 1,
      company: 'Google',
      logo: '🔵',
      role: 'Software Engineer',
      type: 'Full-time',
      location: 'Bangalore',
      package: '₹18-25 LPA',
      openings: 15,
      deadline: 'Jan 15, 2026',
      eligibility: 'B.Tech CSE/IT - CGPA 7.5+',
      status: 'Open',
      registeredStudents: 45,
      description: 'Looking for talented engineers to join our cloud platform team.'
    },
    {
      id: 2,
      company: 'Microsoft',
      logo: '🟦',
      role: 'Data Analyst',
      type: 'Full-time',
      location: 'Hyderabad',
      package: '₹12-18 LPA',
      openings: 10,
      deadline: 'Jan 18, 2026',
      eligibility: 'All branches - CGPA 7.0+',
      status: 'Open',
      registeredStudents: 67,
      description: 'Join our data insights team to work on cutting-edge analytics.'
    },
    {
      id: 3,
      company: 'Amazon',
      logo: '🟠',
      role: 'Full Stack Developer',
      type: 'Full-time',
      location: 'Pune',
      package: '₹15-22 LPA',
      openings: 20,
      deadline: 'Jan 22, 2026',
      eligibility: 'B.Tech - CGPA 7.0+',
      status: 'Open',
      registeredStudents: 89,
      description: 'Build scalable web applications for millions of customers.'
    },
    {
      id: 4,
      company: 'TCS',
      logo: '🔷',
      role: 'System Engineer',
      type: 'Full-time',
      location: 'Multiple',
      package: '₹3.5-4.5 LPA',
      openings: 100,
      deadline: 'Jan 12, 2026',
      eligibility: 'All branches - CGPA 6.0+',
      status: 'Closing Soon',
      registeredStudents: 234,
      description: 'Join India\'s largest IT services company.'
    },
    {
      id: 5,
      company: 'Infosys',
      logo: '🟢',
      role: 'Software Developer',
      type: 'Full-time',
      location: 'Bangalore',
      package: '₹4.5-6 LPA',
      openings: 80,
      deadline: 'Jan 20, 2026',
      eligibility: 'All branches - CGPA 6.5+',
      status: 'Open',
      registeredStudents: 178,
      description: 'Work on innovative digital transformation projects.'
    },
    {
      id: 6,
      company: 'Wipro',
      logo: '🟣',
      role: 'Project Engineer',
      type: 'Full-time',
      location: 'Chennai',
      package: '₹3.5-5 LPA',
      openings: 60,
      deadline: 'Jan 8, 2026',
      eligibility: 'All branches - CGPA 6.0+',
      status: 'Closed',
      registeredStudents: 156,
      description: 'Be part of global technology consulting projects.'
    }
  ];

  const filteredDrives = jobDrives.filter(drive => {
    const matchesSearch =
      drive.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' ||
      drive.status.toLowerCase().replace(' ', '-') === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="job-drives">
      <Navbar />

      <div className="job-drives__layout">
        {/* Enhanced Sidebar */}
        <aside className={`job-drives__sidebar ${sidebarOpen ? 'job-drives__sidebar--open' : ''}`}>
          <div className="job-drives__sidebar-header">
            <div className="job-drives__user-profile">
              <div className="job-drives__avatar">JD</div>
              <div className="job-drives__user-details">
                <h4>John Doe</h4>
                <p>B.Tech CSE</p>
              </div>
            </div>
          </div>

          <div className="job-drives__sidebar-content">
            <nav className="job-drives__nav">
              <Link to="/student" className="job-drives__nav-item">
                <TrendingUp size={20} />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/job-drives"
                className="job-drives__nav-item job-drives__nav-item--active"
              >
                <Building2 size={20} />
                <span>Job Drives</span>
                <div className="job-drives__nav-indicator"></div>
              </Link>

              <Link to="/applications" className="job-drives__nav-item">
                <FileText size={20} />
                <span>Applications</span>
              </Link>

              <Link to="/schedulepage" className="job-drives__nav-item">
                <Calendar size={20} />
                <span>Schedule</span>
              </Link>

              <Link to="/achievements" className="job-drives__nav-item">
                <Award size={20} />
                <span>Achievements</span>
              </Link>

              <Link to="/profile" className="job-drives__nav-item">
                <User size={20} />
                <span>Profile</span>
              </Link>

              <Link to="/settings" className="job-drives__nav-item">
                <Settings size={20} />
                <span>Settings</span>
              </Link>
            </nav>
          </div>

          <div className="job-drives__sidebar-footer">
            <button className="job-drives__logout-btn">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="job-drives__main">
          <div className="job-drives__content">
            {/* Header */}
            <div className="job-drives__header">
              <div className="job-drives__header-text">
                <h2 className="job-drives__title">
                  Placement <span className="highlight-text">Drives</span>
                </h2>
                <p className="job-drives__subtitle">
                  Browse and apply to campus recruitment drives
                </p>
              </div>
              <div className="job-drives__stats-summary">
                <div className="job-drives__stat-item">
                  <Building2 size={20} className="job-drives__stat-item-icon" />
                  <div>
                    <p className="job-drives__stat-item-value">{jobDrives.length}</p>
                    <p className="job-drives__stat-item-label">Total Drives</p>
                  </div>
                </div>
                <div className="job-drives__stat-item">
                  <Users size={20} className="job-drives__stat-item-icon" />
                  <div>
                    <p className="job-drives__stat-item-value">
                      {jobDrives.reduce((sum, drive) => sum + drive.openings, 0)}
                    </p>
                    <p className="job-drives__stat-item-label">Total Openings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="job-drives__toolbar">
              <div className="job-drives__search-box">
                <Search size={20} className="job-drives__search-icon" />
                <input
                  type="text"
                  placeholder="Search by company or role..."
                  className="job-drives__search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="job-drives__filters">
                <button
                  className={`job-drives__filter-btn ${selectedFilter === 'all' ? 'job-drives__filter-btn--active' : ''}`}
                  onClick={() => setSelectedFilter('all')}
                >
                  All
                </button>
                <button
                  className={`job-drives__filter-btn ${selectedFilter === 'open' ? 'job-drives__filter-btn--active' : ''}`}
                  onClick={() => setSelectedFilter('open')}
                >
                  Open
                </button>
                <button
                  className={`job-drives__filter-btn ${selectedFilter === 'closing-soon' ? 'job-drives__filter-btn--active' : ''}`}
                  onClick={() => setSelectedFilter('closing-soon')}
                >
                  Closing Soon
                </button>
                <button
                  className={`job-drives__filter-btn ${selectedFilter === 'closed' ? 'job-drives__filter-btn--active' : ''}`}
                  onClick={() => setSelectedFilter('closed')}
                >
                  Closed
                </button>
              </div>
            </div>

            {/* Job Cards Grid */}
            <div className="job-drives__grid">
              {filteredDrives.map((drive) => (
                <div key={drive.id} className="job-drives__card">
                  <div className="job-drives__card-header">
                    <div className="job-drives__company-info">
                      <span className="job-drives__company-logo">{drive.logo}</span>
                      <div>
                        <h3 className="job-drives__company-name">{drive.company}</h3>
                        <p className="job-drives__role-title">{drive.role}</p>
                      </div>
                    </div>
                    <span className={`job-drives__status-badge job-drives__status-badge--${drive.status.toLowerCase().replace(' ', '-')}`}>
                      {drive.status}
                    </span>
                  </div>

                  <p className="job-drives__description">{drive.description}</p>

                  <div className="job-drives__details-grid">
                    <div className="job-drives__detail-item">
                      <MapPin size={16} />
                      <span>{drive.location}</span>
                    </div>
                    <div className="job-drives__detail-item">
                      <DollarSign size={16} />
                      <span>{drive.package}</span>
                    </div>
                    <div className="job-drives__detail-item">
                      <Users size={16} />
                      <span>{drive.openings} openings</span>
                    </div>
                    <div className="job-drives__detail-item">
                      <Clock size={16} />
                      <span>{drive.deadline}</span>
                    </div>
                  </div>

                  <div className="job-drives__eligibility">
                    <strong>Eligibility:</strong> {drive.eligibility}
                  </div>

                  <div className="job-drives__card-footer">
                    <span className="job-drives__registered">
                      <Users size={14} />
                      {drive.registeredStudents} registered
                    </span>
                    <button
                      className="job-drives__apply-btn"
                      disabled={drive.status === 'Closed'}
                    >
                      {drive.status === 'Closed' ? 'Closed' : 'Apply Now'}
                      {drive.status !== 'Closed' && <ChevronRight size={18} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredDrives.length === 0 && (
              <div className="job-drives__no-results">
                <Briefcase size={48} />
                <p>No job drives found matching your search</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}