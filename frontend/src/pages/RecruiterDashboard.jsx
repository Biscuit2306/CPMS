import React, { useState } from 'react';
import { Bell, Calendar, Briefcase, FileText, User, LogOut, Menu, X, TrendingUp, Users, CheckCircle, Settings, Award, Clock, BarChart, Mail } from 'lucide-react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import '../styles/recruiterdashboard.css';
import { Link } from "react-router-dom";

const RecruiterDashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('match');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const stats = [
    { number: '24', label: 'Active Jobs', trend: '+12%', icon: Briefcase },
    { number: '487', label: 'Total Candidates', trend: '+8%', icon: Users },
    { number: '18', label: 'Interviews Today', trend: '3 Scheduled', icon: Calendar },
    { number: '7', label: 'Pending Offers', trend: '2 Accepted', icon: Mail }
  ];

  const candidates = [
    { id: 1, name: 'Sarah Johnson', role: 'Software Engineer', status: 'Interview', email: 'sarah.j@email.com', phone: '(555) 123-4567', match: 95, location: 'San Francisco, CA', experience: '5 years', skills: ['React', 'Node.js', 'Python'], appliedDate: '2024-01-15', salary: '$140k', resumeScore: 92 },
    { id: 2, name: 'Michael Chen', role: 'Product Manager', status: 'Offer', email: 'm.chen@email.com', phone: '(555) 234-5678', match: 92, location: 'New York, NY', experience: '7 years', skills: ['Strategy', 'Analytics', 'Agile'], appliedDate: '2024-01-10', salary: '$150k', resumeScore: 88 },
    { id: 3, name: 'Emily Rodriguez', role: 'UX Designer', status: 'Review', email: 'emily.r@email.com', phone: '(555) 345-6789', match: 88, location: 'Austin, TX', experience: '4 years', skills: ['Figma', 'UI/UX', 'Prototyping'], appliedDate: '2024-01-18', salary: '$120k', resumeScore: 85 },
    { id: 4, name: 'James Wilson', role: 'DevOps Engineer', status: 'Interview', email: 'j.wilson@email.com', phone: '(555) 456-7890', match: 90, location: 'Seattle, WA', experience: '6 years', skills: ['AWS', 'Docker', 'Kubernetes'], appliedDate: '2024-01-12', salary: '$135k', resumeScore: 90 },
    { id: 5, name: 'Priya Patel', role: 'Data Scientist', status: 'Screening', email: 'priya.p@email.com', phone: '(555) 567-8901', match: 94, location: 'Boston, MA', experience: '5 years', skills: ['Python', 'ML', 'SQL'], appliedDate: '2024-01-20', salary: '$145k', resumeScore: 94 },
    { id: 6, name: 'Alex Thompson', role: 'Frontend Developer', status: 'Rejected', email: 'alex.t@email.com', phone: '(555) 678-9012', match: 65, location: 'Denver, CO', experience: '2 years', skills: ['React', 'CSS', 'JavaScript'], appliedDate: '2024-01-16', salary: '$95k', resumeScore: 70 }
  ];

  const interviews = [
    { id: 1, candidate: 'Sarah Johnson', time: 'Today, 2:00 PM', type: 'Technical', interviewer: 'Alex Morgan', status: 'upcoming' },
    { id: 2, candidate: 'James Wilson', time: 'Today, 4:30 PM', type: 'Cultural Fit', interviewer: 'Taylor Smith', status: 'upcoming' },
    { id: 3, candidate: 'Priya Patel', time: 'Tomorrow, 10:00 AM', type: 'Screening', interviewer: 'Jordan Lee', status: 'scheduled' }
  ];

  const recentActivity = [
    { id: 1, action: 'Offer accepted', candidate: 'Michael Chen', time: '10 min ago', type: 'success' },
    { id: 2, action: 'Interview completed', candidate: 'Sarah Johnson', time: '1 hour ago', type: 'info' },
    { id: 3, action: 'New application', candidate: 'Priya Patel', time: '2 hours ago', type: 'new' },
    { id: 4, action: 'Candidate rejected', candidate: 'Alex Thompson', time: '3 hours ago', type: 'reject' }
  ];

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || c.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  }).sort((a, b) => {
    if (sortBy === 'match') return b.match - a.match;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'date') return new Date(b.appliedDate) - new Date(a.appliedDate);
    return 0;
  });

  return (
    <div className="recruiter-dashboard">
      <Navbar />

      <div className="recruiter-dashboard__layout">
        {/* Sidebar */}
        <aside className={`recruiter-dashboard__sidebar ${sidebarOpen ? 'recruiter-dashboard__sidebar--open' : ''}`}>
          <div className="recruiter-dashboard__sidebar-header">
            <div className="recruiter-dashboard__user-profile">
              <div className="recruiter-dashboard__avatar">HR</div>
              <div className="recruiter-dashboard__user-details">
                <h4>HR Manager</h4>
                <p>Talent Acquisition</p>
              </div>
            </div>
          </div>

          <div className="recruiter-dashboard__sidebar-content">
            <nav className="recruiter-dashboard__nav">
              <a href="#" className="recruiter-dashboard__nav-item recruiter-dashboard__nav-item--active">
                <TrendingUp size={20} />
                <span>Dashboard</span>
                <div className="recruiter-dashboard__nav-indicator"></div>
              </a>

              <Link
                to="/JobPosting"
                className="recruiter-dashboard__nav-item"
                onClick={() => setSidebarOpen(false)}
              >
                <Briefcase size={20} />
                <span>JobPosting</span>
              </Link>

              <a href="#" className="recruiter-dashboard__nav-item">
                <Users size={20} />
                <span>Candidates</span>
              </a>
              
              <a href="#" className="recruiter-dashboard__nav-item">
                <Calendar size={20} />
                <span>Interviews</span>
              </a>
              
              <a href="#" className="recruiter-dashboard__nav-item">
                <BarChart size={20} />
                <span>Analytics</span>
              </a>
              
              <a href="#" className="recruiter-dashboard__nav-item">
                <Award size={20} />
                <span>Offers</span>
              </a>

              <a href="#" className="recruiter-dashboard__nav-item">
                <Settings size={20} />
                <span>Settings</span>
              </a>
            </nav>
          </div>

          <div className="recruiter-dashboard__sidebar-footer">
            <button className="recruiter-dashboard__logout-btn">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="recruiter-dashboard__main">
          <div className="recruiter-dashboard__content">
            {/* Welcome Section */}
            <div className="recruiter-dashboard__welcome">
              <div className="recruiter-dashboard__welcome-text-wrapper">
                <h2 className="recruiter-dashboard__welcome-title">
                  Welcome back, <span className="highlight-name">HR Team!</span>
                </h2>
                <p className="recruiter-dashboard__welcome-text">
                  Here's what's happening with your recruitment today.
                </p>
              </div>
              <div className="recruiter-dashboard__quick-actions">
                <button className="recruiter-dashboard__action-btn">
                  <Bell size={18} />
                  <span className="recruiter-dashboard__notification-badge">5</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="recruiter-dashboard__stats-grid">
              {stats.map((stat, i) => (
                <div key={i} className={`recruiter-dashboard__stat-card recruiter-dashboard__stat-card--${i % 4 === 0 ? 'blue' : i % 4 === 1 ? 'green' : i % 4 === 2 ? 'orange' : 'purple'}`}>
                  <div className="recruiter-dashboard__stat-icon-wrapper">
                    <stat.icon size={24} />
                  </div>
                  <div className="recruiter-dashboard__stat-info">
                    <p className="recruiter-dashboard__stat-label">{stat.label}</p>
                    <p className="recruiter-dashboard__stat-value">{stat.number}</p>
                    <span className="recruiter-dashboard__stat-change positive">{stat.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Content Grid */}
            <div className="recruiter-dashboard__content-grid">
              {/* Today's Interviews */}
              <div className="recruiter-dashboard__card recruiter-dashboard__card--wide">
                <div className="recruiter-dashboard__card-header">
                  <h3 className="recruiter-dashboard__card-title">
                    <Calendar className="recruiter-dashboard__title-icon" size={24} />
                    Today's Interviews
                  </h3>
                  <button className="recruiter-dashboard__view-all-btn" onClick={() => setShowScheduleModal(true)}>
                    Schedule New
                  </button>
                </div>

                <div className="recruiter-dashboard__interview-list">
                  {interviews.map(int => (
                    <div key={int.id} className="recruiter-dashboard__interview-item">
                      <div className="recruiter-dashboard__interview-logo">
                        {int.candidate.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="recruiter-dashboard__interview-details">
                        <div className="recruiter-dashboard__interview-header">
                          <h4 className="recruiter-dashboard__interview-candidate">{int.candidate}</h4>
                          <span className={`recruiter-dashboard__status-badge recruiter-dashboard__status-badge--${int.status}`}>
                            {int.status}
                          </span>
                        </div>
                        <p className="recruiter-dashboard__interview-type">{int.type}</p>
                        <p className="recruiter-dashboard__interview-time">
                          <Clock size={14} />
                          {int.time} • with {int.interviewer}
                        </p>
                      </div>
                      <div className="recruiter-dashboard__interview-actions">
                        <button className="recruiter-dashboard__btn-small recruiter-dashboard__btn-small--blue">
                          Join
                        </button>
                        <button className="recruiter-dashboard__btn-small">
                          Reschedule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recruiter-dashboard__card">
                <div className="recruiter-dashboard__card-header">
                  <h3 className="recruiter-dashboard__card-title">
                    <FileText className="recruiter-dashboard__title-icon" size={24} />
                    Recent Activity
                  </h3>
                </div>

                <div className="recruiter-dashboard__activity-list">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="recruiter-dashboard__activity-item">
                      <div className="recruiter-dashboard__activity-header">
                        <p className="recruiter-dashboard__activity-company">{activity.candidate}</p>
                        <p className="recruiter-dashboard__activity-date">{activity.time}</p>
                      </div>
                      <p className={`recruiter-dashboard__activity-status recruiter-dashboard__activity-status--${activity.type}`}>
                        {activity.action}
                      </p>
                      <div className="recruiter-dashboard__progress-bar">
                        <div 
                          className="recruiter-dashboard__progress-fill"
                          style={{ width: `${activity.type === 'success' ? 100 : activity.type === 'info' ? 80 : activity.type === 'new' ? 20 : 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Candidates Section */}
            <div className="recruiter-dashboard__card">
              <div className="recruiter-dashboard__card-header">
                <h3 className="recruiter-dashboard__card-title">
                  <Users className="recruiter-dashboard__title-icon" size={24} />
                  Top Candidates ({filteredCandidates.length})
                </h3>
                <div className="recruiter-dashboard__filters">
                  <div className="recruiter-dashboard__tabs">
                    {['all', 'interview', 'offer', 'review', 'screening'].map(tab => (
                      <button
                        key={tab}
                        className={`recruiter-dashboard__tab ${activeTab === tab ? 'recruiter-dashboard__tab--active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                  <select className="recruiter-dashboard__select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="match">Best Match</option>
                    <option value="name">Name</option>
                    <option value="date">Recent</option>
                  </select>
                </div>
              </div>

              <div className="recruiter-dashboard__candidates-list">
                {filteredCandidates.slice(0, 4).map(c => (
                  <div key={c.id} className="recruiter-dashboard__candidate-item">
                    <div className="recruiter-dashboard__candidate-avatar">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="recruiter-dashboard__candidate-info">
                      <h4 className="recruiter-dashboard__candidate-name">{c.name}</h4>
                      <p className="recruiter-dashboard__candidate-role">{c.role}</p>
                      <div className="recruiter-dashboard__candidate-meta">
                        <span>{c.location}</span>
                        <span>{c.experience}</span>
                      </div>
                      <div className="recruiter-dashboard__candidate-skills">
                        {c.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="recruiter-dashboard__skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div className="recruiter-dashboard__candidate-right">
                      <div className="recruiter-dashboard__match-score">
                        <span className="recruiter-dashboard__match-value">{c.match}%</span>
                        <span className="recruiter-dashboard__match-label">Match</span>
                      </div>
                      <span className={`recruiter-dashboard__status-badge recruiter-dashboard__status-badge--${c.status.toLowerCase()}`}>
                        {c.status}
                      </span>
                      <button className="recruiter-dashboard__btn-view" onClick={() => setSelectedCandidate(c)}>
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="recruiter-dashboard__overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="recruiter-dashboard__modal" onClick={(e) => e.stopPropagation()}>
            <button className="recruiter-dashboard__close" onClick={() => setSelectedCandidate(null)}>×</button>
            
            <div className="recruiter-dashboard__modal-top">
              <div className="recruiter-dashboard__modal-avatar">
                {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h2 className="recruiter-dashboard__modal-name">{selectedCandidate.name}</h2>
              <p className="recruiter-dashboard__modal-role">{selectedCandidate.role}</p>
              <div className="recruiter-dashboard__modal-scores">
                <div className="recruiter-dashboard__modal-score">
                  <div className="recruiter-dashboard__modal-score-num">{selectedCandidate.match}%</div>
                  <div className="recruiter-dashboard__modal-score-label">Match Score</div>
                </div>
                <div className="recruiter-dashboard__modal-score">
                  <div className="recruiter-dashboard__modal-score-num">{selectedCandidate.resumeScore}%</div>
                  <div className="recruiter-dashboard__modal-score-label">Resume Score</div>
                </div>
              </div>
            </div>

            <div className="recruiter-dashboard__modal-body">
              <div className="recruiter-dashboard__modal-section">
                <h3 className="recruiter-dashboard__modal-subtitle">Contact Information</h3>
                <div className="recruiter-dashboard__details">
                  <div className="recruiter-dashboard__detail">
                    <span className="recruiter-dashboard__detail-label">Email</span>
                    <span className="recruiter-dashboard__detail-value">{selectedCandidate.email}</span>
                  </div>
                  <div className="recruiter-dashboard__detail">
                    <span className="recruiter-dashboard__detail-label">Phone</span>
                    <span className="recruiter-dashboard__detail-value">{selectedCandidate.phone}</span>
                  </div>
                  <div className="recruiter-dashboard__detail">
                    <span className="recruiter-dashboard__detail-label">Location</span>
                    <span className="recruiter-dashboard__detail-value">{selectedCandidate.location}</span>
                  </div>
                  <div className="recruiter-dashboard__detail">
                    <span className="recruiter-dashboard__detail-label">Experience</span>
                    <span className="recruiter-dashboard__detail-value">{selectedCandidate.experience}</span>
                  </div>
                  <div className="recruiter-dashboard__detail">
                    <span className="recruiter-dashboard__detail-label">Expected Salary</span>
                    <span className="recruiter-dashboard__detail-value">{selectedCandidate.salary}</span>
                  </div>
                  <div className="recruiter-dashboard__detail">
                    <span className="recruiter-dashboard__detail-label">Applied Date</span>
                    <span className="recruiter-dashboard__detail-value">
                      {new Date(selectedCandidate.appliedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="recruiter-dashboard__modal-section">
                <h3 className="recruiter-dashboard__modal-subtitle">Skills</h3>
                <div className="recruiter-dashboard__modal-skills">
                  {selectedCandidate.skills.map((skill, i) => (
                    <span key={i} className="recruiter-dashboard__skill-tag-modal">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="recruiter-dashboard__modal-section">
                <h3 className="recruiter-dashboard__modal-subtitle">Status</h3>
                <span className={`recruiter-dashboard__status-badge recruiter-dashboard__status-badge--${selectedCandidate.status.toLowerCase()}`}>
                  {selectedCandidate.status}
                </span>
              </div>
            </div>

            <div className="recruiter-dashboard__modal-actions">
              <button className="recruiter-dashboard__btn-action" onClick={() => setShowEmailModal(true)}>
                Send Email
              </button>
              <button className="recruiter-dashboard__btn-action">
                Download Resume
              </button>
              <button className="recruiter-dashboard__btn-action recruiter-dashboard__btn-action--primary" onClick={() => setShowScheduleModal(true)}>
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RecruiterDashboardPage;