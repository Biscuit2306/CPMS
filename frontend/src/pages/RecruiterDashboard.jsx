import React, { useState } from 'react';
import { Briefcase, LayoutDashboard, Users, FileText, Calendar, TrendingUp, Settings, LogOut, Search, Building2, Award, Mail, Phone, Edit2, Save, Menu, X, Filter, MapPin, Clock, DollarSign, UserCheck, UserPlus, CheckCircle, AlertCircle, BarChart3, PieChart, Target, Zap, Download, Upload, Eye, Trash2, MoreVertical, User, Activity, Shield } from 'lucide-react';
import '../styles/recruiterdashboard.css';

const RecruiterDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const recruitmentStats = [
    { icon: Users, label: 'Total Applicants', value: '1,247', color: '#0ea5e9' },
    { icon: CheckCircle, label: 'Selected Candidates', value: '320', color: '#10b981' },
    { icon: Building2, label: 'Active Drives', value: '8', color: '#f59e0b' },
    { icon: TrendingUp, label: 'Success Rate', value: '85%', color: '#8b5cf6' }
  ];

  const activeDrives = [
    { company: 'TechCorp Solutions', date: 'Jan 28, 2026', role: 'Software Engineer', applicants: 145, package: '12-15 LPA' },
    { company: 'InnovateTech', date: 'Feb 2, 2026', role: 'Full Stack Developer', applicants: 98, package: '10-12 LPA' },
    { company: 'Digital Dynamics', date: 'Feb 5, 2026', role: 'Data Scientist', applicants: 67, package: '15-18 LPA' }
  ];

  const recentApplications = [
    { name: 'Rahul Sharma', status: 'Interview Scheduled', date: 'Jan 30, 2026', role: 'Software Engineer', company: 'TechCorp', cgpa: '8.5' },
    { name: 'Priya Patel', status: 'Under Review', date: 'Jan 25, 2026', role: 'Full Stack Developer', company: 'InnovateTech', cgpa: '8.9' },
    { name: 'Amit Kumar', status: 'Shortlisted', date: 'Jan 26, 2026', role: 'Data Scientist', company: 'Digital Dynamics', cgpa: '9.1' },
    { name: 'Sneha Reddy', status: 'Rejected', date: 'Jan 20, 2026', role: 'Backend Developer', company: 'CloudWorks', cgpa: '7.8' },
    { name: 'Arjun Verma', status: 'Selected', date: 'Jan 15, 2026', role: 'DevOps Engineer', company: 'TechCorp', cgpa: '8.7' }
  ];

  const allCandidates = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@college.edu', phone: '+91 9876543210', branch: 'CSE', cgpa: '8.5', year: 'Final Year', status: 'Shortlisted', appliedFor: 'Software Engineer' },
    { id: 2, name: 'Priya Patel', email: 'priya.patel@college.edu', phone: '+91 9876543211', branch: 'IT', cgpa: '8.9', year: 'Final Year', status: 'Under Review', appliedFor: 'Full Stack Developer' },
    { id: 3, name: 'Amit Kumar', email: 'amit.kumar@college.edu', phone: '+91 9876543212', branch: 'CSE', cgpa: '9.1', year: 'Final Year', status: 'Interview Scheduled', appliedFor: 'Data Scientist' },
    { id: 4, name: 'Sneha Reddy', email: 'sneha.reddy@college.edu', phone: '+91 9876543213', branch: 'ECE', cgpa: '7.8', year: 'Final Year', status: 'Rejected', appliedFor: 'Backend Developer' },
    { id: 5, name: 'Arjun Verma', email: 'arjun.verma@college.edu', phone: '+91 9876543214', branch: 'CSE', cgpa: '8.7', year: 'Final Year', status: 'Selected', appliedFor: 'DevOps Engineer' },
    { id: 6, name: 'Kavya Singh', email: 'kavya.singh@college.edu', phone: '+91 9876543215', branch: 'IT', cgpa: '8.3', year: 'Final Year', status: 'Shortlisted', appliedFor: 'Frontend Developer' },
    { id: 7, name: 'Rohan Desai', email: 'rohan.desai@college.edu', phone: '+91 9876543216', branch: 'CSE', cgpa: '8.8', year: 'Final Year', status: 'Under Review', appliedFor: 'Backend Developer' },
    { id: 8, name: 'Ananya Iyer', email: 'ananya.iyer@college.edu', phone: '+91 9876543217', branch: 'IT', cgpa: '9.0', year: 'Final Year', status: 'Shortlisted', appliedFor: 'ML Engineer' }
  ];

  const allDrives = [
    { id: 1, company: 'TechCorp Solutions', date: 'Jan 28, 2026', role: 'Software Engineer', package: '12-15 LPA', location: 'Mumbai', type: 'On Campus', applicants: 145, status: 'Active' },
    { id: 2, company: 'InnovateTech', date: 'Feb 2, 2026', role: 'Full Stack Developer', package: '10-12 LPA', location: 'Bangalore', type: 'On Campus', applicants: 98, status: 'Active' },
    { id: 3, company: 'Digital Dynamics', date: 'Feb 5, 2026', role: 'Data Scientist', package: '15-18 LPA', location: 'Pune', type: 'On Campus', applicants: 67, status: 'Active' },
    { id: 4, company: 'CloudWorks', date: 'Feb 10, 2026', role: 'Cloud Engineer', package: '14-16 LPA', location: 'Hyderabad', type: 'Off Campus', applicants: 52, status: 'Scheduled' },
    { id: 5, company: 'NextGen AI', date: 'Feb 12, 2026', role: 'ML Engineer', package: '18-22 LPA', location: 'Bangalore', type: 'Off Campus', applicants: 89, status: 'Scheduled' },
    { id: 6, company: 'SecureNet', date: 'Jan 20, 2026', role: 'Security Analyst', package: '11-13 LPA', location: 'Mumbai', type: 'On Campus', applicants: 76, status: 'Completed' }
  ];

  const scheduleData = [
    { id: 1, company: 'TechCorp Solutions', type: 'Technical Interview', date: 'Jan 30, 2026', time: '10:00 AM', venue: 'Conference Room A', candidates: 12, status: 'Upcoming' },
    { id: 2, company: 'InnovateTech', type: 'Aptitude Test', date: 'Feb 2, 2026', time: '2:00 PM', venue: 'Lab Room 101', candidates: 45, status: 'Upcoming' },
    { id: 3, company: 'Digital Dynamics', type: 'Pre-Placement Talk', date: 'Jan 27, 2026', time: '11:00 AM', venue: 'Auditorium', candidates: 150, status: 'Upcoming' },
    { id: 4, company: 'CloudWorks', type: 'HR Round', date: 'Jan 28, 2026', time: '9:00 AM', venue: 'Online Platform', candidates: 8, status: 'Completed' },
    { id: 5, company: 'NextGen AI', type: 'Group Discussion', date: 'Feb 5, 2026', time: '3:00 PM', venue: 'Conference Room B', candidates: 20, status: 'Upcoming' },
    { id: 6, company: 'SecureNet', type: 'Technical Test', date: 'Feb 8, 2026', time: '10:30 AM', venue: 'Computer Lab 2', candidates: 35, status: 'Upcoming' }
  ];

  const companyStats = [
    { id: 1, company: 'TechCorp Solutions', totalHires: 45, avgPackage: '13.5 LPA', successRate: '88%', active: true },
    { id: 2, company: 'InnovateTech', totalHires: 32, avgPackage: '11 LPA', successRate: '82%', active: true },
    { id: 3, company: 'Digital Dynamics', totalHires: 28, avgPackage: '16 LPA', successRate: '85%', active: true },
    { id: 4, company: 'CloudWorks', totalHires: 38, avgPackage: '14.5 LPA', successRate: '90%', active: false },
    { id: 5, company: 'NextGen AI', totalHires: 15, avgPackage: '20 LPA', successRate: '78%', active: true },
    { id: 6, company: 'SecureNet', totalHires: 22, avgPackage: '12 LPA', successRate: '80%', active: false },
    { id: 7, company: 'DataCrunch Analytics', totalHires: 19, avgPackage: '15 LPA', successRate: '83%', active: true },
    { id: 8, company: 'WebScale Systems', totalHires: 27, avgPackage: '13 LPA', successRate: '86%', active: true }
  ];

  const [activeProfileTab, setActiveProfileTab] = useState('personal');

  const profileData = {
    name: 'Dr. Anjali Mehta',
    email: 'anjali.mehta@college.edu',
    phone: '+91 9876543200',
    designation: 'Training & Placement Officer',
    department: 'Career Development Cell',
    experience: '12 Years',
    education: 'Ph.D. in Management',
    specialization: 'Human Resource Management',
    dob: '22/05/1982',
    address: 'Mumbai, Maharashtra, India',
    linkedin: 'linkedin.com/in/anjalimehta',
    employeeId: 'EMP2015025'
  };

  const profileTabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  const recentActivity = [
    { action: 'Created placement drive', company: 'TechCorp Solutions', timestamp: '2 hours ago', type: 'drive' },
    { action: 'Shortlisted candidates', company: 'InnovateTech', timestamp: '5 hours ago', type: 'candidate' },
    { action: 'Scheduled interview', company: 'Digital Dynamics', timestamp: '1 day ago', type: 'schedule' },
    { action: 'Sent notifications', company: 'All Students', timestamp: '2 days ago', type: 'notification' }
  ];

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'drives', icon: Briefcase, label: 'Placement Drives' },
    { id: 'candidates', icon: Users, label: 'Candidates' },
    { id: 'schedule', icon: Calendar, label: 'Schedule' },
    { id: 'companies', icon: Building2, label: 'Companies' },
    { id: 'profile', icon: Settings, label: 'Profile' }
  ];

  // Render different content based on active menu
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return renderDashboard();
      case 'drives':
        return renderDrives();
      case 'candidates':
        return renderCandidates();
      case 'schedule':
        return renderSchedule();
      case 'companies':
        return renderCompanies();
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  // Dashboard Page
  const renderDashboard = () => (
    <>
      {/* Welcome Banner */}
      <div className="recruiter-welcome-banner">
        <div className="recruiter-welcome-content">
          <div className="recruiter-welcome-text">
            <h1>Welcome back, Dr. Mehta!</h1>
            <p>Manage recruitment drives and candidate placements efficiently</p>
          </div>
          <div className="recruiter-welcome-illustration">
            <Briefcase size={80} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="recruiter-stats-grid">
        {recruitmentStats.map((stat, index) => (
          <div key={index} className="recruiter-stat-card">
            <div className="recruiter-stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="recruiter-stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="recruiter-content-grid">
        {/* Active Drives */}
        <div className="recruiter-card">
          <div className="recruiter-card-header">
            <h2>Active Placement Drives</h2>
            <a href="#" className="recruiter-see-all" onClick={(e) => { e.preventDefault(); setActiveMenu('drives'); }}>See all</a>
          </div>
          <div className="recruiter-drives-list">
            {activeDrives.map((drive, index) => (
              <div key={index} className="recruiter-drive-item">
                <div className="recruiter-drive-icon">
                  <Building2 size={24} />
                </div>
                <div className="recruiter-drive-info">
                  <h3>{drive.company}</h3>
                  <p className="recruiter-drive-role">{drive.role}</p>
                  <div className="recruiter-drive-meta">
                    <span className="recruiter-drive-date">{drive.date}</span>
                    <span className="recruiter-drive-applicants">{drive.applicants} applicants</span>
                  </div>
                </div>
                <button className="recruiter-manage-btn">Manage</button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="recruiter-card">
          <div className="recruiter-card-header">
            <h2>Recent Applications</h2>
            <a href="#" className="recruiter-see-all" onClick={(e) => { e.preventDefault(); setActiveMenu('candidates'); }}>See all</a>
          </div>
          <div className="recruiter-applications-list">
            {recentApplications.slice(0, 3).map((app, index) => (
              <div key={index} className="recruiter-application-item">
                <div className="recruiter-app-candidate">
                  <div className="recruiter-candidate-avatar">
                    {app.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="recruiter-app-details">
                    <h3>{app.name}</h3>
                    <p className="recruiter-app-role">{app.role} • CGPA: {app.cgpa}</p>
                  </div>
                </div>
                <span className={`recruiter-status-badge recruiter-status-${app.status.toLowerCase().replace(' ', '-')}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Analytics */}
      <div className="recruiter-content-grid">
        <div className="recruiter-card">
          <div className="recruiter-card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="recruiter-quick-actions">
            <button className="recruiter-action-btn">
              <UserPlus size={20} />
              <span>Schedule Interview</span>
            </button>
            <button className="recruiter-action-btn">
              <Mail size={20} />
              <span>Send Notification</span>
            </button>
            <button className="recruiter-action-btn">
              <FileText size={20} />
              <span>Generate Report</span>
            </button>
            <button className="recruiter-action-btn">
              <Calendar size={20} />
              <span>Create Drive</span>
            </button>
          </div>
        </div>

        <div className="recruiter-card">
          <div className="recruiter-card-header">
            <h2>Placement Analytics</h2>
          </div>
          <div className="recruiter-analytics-summary">
            <div className="recruiter-analytics-item">
              <div className="recruiter-analytics-icon">
                <BarChart3 size={24} />
              </div>
              <div>
                <h4>Avg. Package</h4>
                <p>₹14.2 LPA</p>
              </div>
            </div>
            <div className="recruiter-analytics-item">
              <div className="recruiter-analytics-icon">
                <Target size={24} />
              </div>
              <div>
                <h4>Placement Goal</h4>
                <p>75% Achieved</p>
              </div>
            </div>
            <div className="recruiter-analytics-item">
              <div className="recruiter-analytics-icon">
                <Zap size={24} />
              </div>
              <div>
                <h4>Active Offers</h4>
                <p>156 Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Drives Page
  const renderDrives = () => (
    <>
      <div className="recruiter-page-header">
        <div>
          <h1>Placement Drives</h1>
          <p>Manage and monitor all recruitment drives</p>
        </div>
        <div className="recruiter-header-actions">
          <div className="recruiter-filter-section">
            <button className={`recruiter-filter-btn ${filterCategory === 'all' ? 'active' : ''}`} onClick={() => setFilterCategory('all')}>
              All Drives
            </button>
            <button className={`recruiter-filter-btn ${filterCategory === 'active' ? 'active' : ''}`} onClick={() => setFilterCategory('active')}>
              Active
            </button>
            <button className={`recruiter-filter-btn ${filterCategory === 'scheduled' ? 'active' : ''}`} onClick={() => setFilterCategory('scheduled')}>
              Scheduled
            </button>
            <button className={`recruiter-filter-btn ${filterCategory === 'completed' ? 'active' : ''}`} onClick={() => setFilterCategory('completed')}>
              Completed
            </button>
          </div>
          <button className="recruiter-add-drive-btn">
            <UserPlus size={20} />
            Create Drive
          </button>
        </div>
      </div>

      <div className="recruiter-drives-grid">
        {allDrives
          .filter(drive => filterCategory === 'all' || drive.status.toLowerCase() === filterCategory)
          .map((drive) => (
            <div key={drive.id} className="recruiter-drive-card">
              <div className="recruiter-drive-card-header">
                <div className="recruiter-company-logo-large">
                  {drive.company.charAt(0)}
                </div>
                <div className="recruiter-drive-title">
                  <h3>{drive.company}</h3>
                  <span className={`recruiter-drive-status-badge ${drive.status.toLowerCase()}`}>{drive.status}</span>
                </div>
              </div>
              <h4 className="recruiter-job-role">{drive.role}</h4>
              <div className="recruiter-drive-details">
                <div className="recruiter-drive-detail-item">
                  <DollarSign size={16} />
                  <span>{drive.package}</span>
                </div>
                <div className="recruiter-drive-detail-item">
                  <MapPin size={16} />
                  <span>{drive.location}</span>
                </div>
                <div className="recruiter-drive-detail-item">
                  <Calendar size={16} />
                  <span>{drive.date}</span>
                </div>
                <div className="recruiter-drive-detail-item">
                  <Users size={16} />
                  <span>{drive.applicants} Applicants</span>
                </div>
              </div>
              <div className="recruiter-drive-actions">
                <button className="recruiter-view-btn">
                  <Eye size={16} />
                  View Details
                </button>
                <button className="recruiter-manage-action-btn">
                  <Settings size={16} />
                  Manage
                </button>
              </div>
            </div>
          ))}
      </div>
    </>
  );

  // Candidates Page
  const renderCandidates = () => (
    <>
      <div className="recruiter-page-header">
        <div>
          <h1>Candidate Management</h1>
          <p>Review and manage student applications</p>
        </div>
        <div className="recruiter-header-actions">
          <button className="recruiter-export-btn">
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      <div className="recruiter-candidates-grid">
        {allCandidates.map((candidate) => (
          <div key={candidate.id} className="recruiter-candidate-card">
            <div className="recruiter-candidate-header">
              <div className="recruiter-candidate-avatar-large">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="recruiter-candidate-info">
                <h3>{candidate.name}</h3>
                <p>{candidate.branch} • {candidate.year}</p>
                <span className="recruiter-cgpa-badge">CGPA: {candidate.cgpa}</span>
              </div>
            </div>
            <div className="recruiter-candidate-details">
              <div className="recruiter-candidate-row">
                <Mail size={16} />
                <span>{candidate.email}</span>
              </div>
              <div className="recruiter-candidate-row">
                <Phone size={16} />
                <span>{candidate.phone}</span>
              </div>
              <div className="recruiter-candidate-row">
                <Briefcase size={16} />
                <span>{candidate.appliedFor}</span>
              </div>
              <div className="recruiter-candidate-row">
                <span className="recruiter-label">Status:</span>
                <span className={`recruiter-status-badge recruiter-status-${candidate.status.toLowerCase().replace(' ', '-')}`}>
                  {candidate.status}
                </span>
              </div>
            </div>
            <div className="recruiter-candidate-actions">
              <button className="recruiter-view-profile-btn">
                <Eye size={16} />
                View Profile
              </button>
              <button className="recruiter-action-menu-btn">
                <MoreVertical size={16} />
                Actions
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  // Schedule Page
  const renderSchedule = () => (
    <>
      <div className="recruiter-page-header">
        <div>
          <h1>Interview Schedule</h1>
          <p>Manage upcoming interviews and placement events</p>
        </div>
        <button className="recruiter-add-schedule-btn">
          <Calendar size={20} />
          Schedule Event
        </button>
      </div>

      <div className="recruiter-schedule-grid">
        {scheduleData.map((schedule) => (
          <div key={schedule.id} className="recruiter-schedule-card">
            <div className="recruiter-schedule-header">
              <div className="recruiter-schedule-company">
                <div className="recruiter-company-logo-small">
                  {schedule.company.charAt(0)}
                </div>
                <div>
                  <h3>{schedule.company}</h3>
                  <span className="recruiter-schedule-type">{schedule.type}</span>
                </div>
              </div>
              <span className={`recruiter-schedule-status recruiter-schedule-${schedule.status.toLowerCase()}`}>
                {schedule.status}
              </span>
            </div>
            <div className="recruiter-schedule-details">
              <div className="recruiter-schedule-info">
                <Calendar size={18} />
                <span>{schedule.date}</span>
              </div>
              <div className="recruiter-schedule-info">
                <Clock size={18} />
                <span>{schedule.time}</span>
              </div>
              <div className="recruiter-schedule-info">
                <MapPin size={18} />
                <span>{schedule.venue}</span>
              </div>
              <div className="recruiter-schedule-info">
                <Users size={18} />
                <span>{schedule.candidates} Candidates</span>
              </div>
            </div>
            {schedule.status === 'Upcoming' && (
              <div className="recruiter-schedule-actions">
                <button className="recruiter-edit-schedule-btn">
                  <Edit2 size={16} />
                  Edit
                </button>
                <button className="recruiter-notify-btn">
                  <Mail size={16} />
                  Notify
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );

  // Companies Page
  const renderCompanies = () => (
    <>
      <div className="recruiter-page-header">
        <div>
          <h1>Recruiting Companies</h1>
          <p>Track company partnerships and hiring statistics</p>
        </div>
        <button className="recruiter-add-company-btn">
          <Building2 size={20} />
          Add Company
        </button>
      </div>

      <div className="recruiter-companies-grid">
        {companyStats.map((company) => (
          <div key={company.id} className="recruiter-company-card">
            <div className="recruiter-company-card-header">
              <div className="recruiter-company-logo-xl">
                {company.company.charAt(0)}
              </div>
              <div className="recruiter-company-title">
                <h3>{company.company}</h3>
                <span className={`recruiter-active-badge ${company.active ? 'active' : 'inactive'}`}>
                  {company.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="recruiter-company-stats">
              <div className="recruiter-company-stat">
                <span className="recruiter-stat-label">Total Hires</span>
                <span className="recruiter-stat-value">{company.totalHires}</span>
              </div>
              <div className="recruiter-company-stat">
                <span className="recruiter-stat-label">Avg. Package</span>
                <span className="recruiter-stat-value">{company.avgPackage}</span>
              </div>
              <div className="recruiter-company-stat">
                <span className="recruiter-stat-label">Success Rate</span>
                <span className="recruiter-stat-value">{company.successRate}</span>
              </div>
            </div>
            <button className="recruiter-company-details-btn">
              <Eye size={18} />
              View Details
            </button>
          </div>
        ))}
      </div>
    </>
  );

  // Profile Page - Render Functions
  const renderPersonalInfo = () => (
    <div className="recruiter-profile-card">
      <div className="recruiter-profile-header">
        <div className="recruiter-profile-avatar">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali" alt="Profile" />
          {editMode && (
            <button className="recruiter-avatar-upload-btn">
              <Upload size={16} />
            </button>
          )}
        </div>
        <div className="recruiter-profile-basic">
          <h2>{profileData.name}</h2>
          <p>{profileData.designation}</p>
          <p className="recruiter-profile-dept">{profileData.department}</p>
        </div>
      </div>

      <div className="recruiter-profile-section">
        <h3>Contact Information</h3>
        <div className="recruiter-profile-grid">
          <div className="recruiter-profile-field">
            <label>Email</label>
            <div className="recruiter-profile-value">
              <Mail size={16} />
              {editMode ? <input type="email" defaultValue={profileData.email} /> : <span>{profileData.email}</span>}
            </div>
          </div>
          <div className="recruiter-profile-field">
            <label>Phone</label>
            <div className="recruiter-profile-value">
              <Phone size={16} />
              {editMode ? <input type="tel" defaultValue={profileData.phone} /> : <span>{profileData.phone}</span>}
            </div>
          </div>
          <div className="recruiter-profile-field">
            <label>Date of Birth</label>
            <div className="recruiter-profile-value">
              <Calendar size={16} />
              {editMode ? <input type="text" defaultValue={profileData.dob} /> : <span>{profileData.dob}</span>}
            </div>
          </div>
          <div className="recruiter-profile-field">
            <label>Address</label>
            <div className="recruiter-profile-value">
              <MapPin size={16} />
              {editMode ? <input type="text" defaultValue={profileData.address} /> : <span>{profileData.address}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="recruiter-profile-section">
        <h3>Professional Links</h3>
        <div className="recruiter-profile-grid">
          <div className="recruiter-profile-field">
            <label>LinkedIn</label>
            {editMode ? <input type="text" defaultValue={profileData.linkedin} /> : <span>{profileData.linkedin}</span>}
          </div>
          <div className="recruiter-profile-field">
            <label>Employee ID</label>
            <span>{profileData.employeeId}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfessional = () => (
    <div className="recruiter-profile-card">
      <div className="recruiter-profile-section">
        <h3>Professional Details</h3>
        <div className="recruiter-profile-grid">
          <div className="recruiter-profile-field">
            <label>Designation</label>
            <span>{profileData.designation}</span>
          </div>
          <div className="recruiter-profile-field">
            <label>Department</label>
            <span>{profileData.department}</span>
          </div>
          <div className="recruiter-profile-field">
            <label>Experience</label>
            <span>{profileData.experience}</span>
          </div>
          <div className="recruiter-profile-field">
            <label>Education</label>
            <span>{profileData.education}</span>
          </div>
          <div className="recruiter-profile-field">
            <label>Specialization</label>
            <span>{profileData.specialization}</span>
          </div>
          <div className="recruiter-profile-field">
            <label>Employee ID</label>
            <span>{profileData.employeeId}</span>
          </div>
        </div>
      </div>

      <div className="recruiter-profile-section">
        <h3>Work History</h3>
        <div className="recruiter-work-history">
          {[
            { position: 'Training & Placement Officer', organization: 'Current College', duration: '2015 - Present', description: 'Managing campus placement drives and corporate relations' },
            { position: 'Placement Coordinator', organization: 'Tech Institute', duration: '2012 - 2015', description: 'Coordinated recruitment activities and student training programs' },
            { position: 'Career Counselor', organization: 'Education Academy', duration: '2008 - 2012', description: 'Provided career guidance and placement support to students' }
          ].map((item, idx) => (
            <div key={idx} className="recruiter-work-item">
              <h4>{item.position}</h4>
              <p className="recruiter-work-org">{item.organization}</p>
              <p className="recruiter-work-duration">{item.duration}</p>
              <p className="recruiter-work-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="recruiter-profile-section">
        <h3>Certifications & Training</h3>
        <div className="recruiter-certifications">
          {[
            { name: 'Certified Placement Professional (CPP)', org: 'National Association of Colleges', year: '2018' },
            { name: 'Human Resource Management Certificate', org: 'SHRM', year: '2016' },
            { name: 'Career Development Facilitator', org: 'Center for Credentialing & Education', year: '2014' }
          ].map((cert, idx) => (
            <div key={idx} className="recruiter-cert-item">
              <div className="recruiter-cert-icon">
                <Award size={24} />
              </div>
              <div className="recruiter-cert-content">
                <h4>{cert.name}</h4>
                <p>{cert.org} • {cert.year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="recruiter-profile-card">
      <div className="recruiter-profile-section">
        <h3>Recent Activity</h3>
        <div className="recruiter-activity-list">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="recruiter-activity-item">
              <div className="recruiter-activity-left">
                <div className="recruiter-activity-icon">
                  {activity.type === 'drive' && <Briefcase size={20} />}
                  {activity.type === 'candidate' && <Users size={20} />}
                  {activity.type === 'schedule' && <Calendar size={20} />}
                  {activity.type === 'notification' && <Mail size={20} />}
                </div>
                <div className="recruiter-activity-details">
                  <span className="recruiter-activity-action">{activity.action}</span>
                  <span className="recruiter-activity-company">{activity.company}</span>
                </div>
              </div>
              <span className="recruiter-activity-time">{activity.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="recruiter-profile-section">
        <h3>Performance Metrics</h3>
        <div className="recruiter-metrics-grid">
          <div className="recruiter-metric-card">
            <div className="recruiter-metric-icon">
              <Briefcase size={24} />
            </div>
            <div className="recruiter-metric-content">
              <h4>Total Drives</h4>
              <p>8 Active</p>
            </div>
          </div>
          <div className="recruiter-metric-card">
            <div className="recruiter-metric-icon">
              <Users size={24} />
            </div>
            <div className="recruiter-metric-content">
              <h4>Students Placed</h4>
              <p>145 This Year</p>
            </div>
          </div>
          <div className="recruiter-metric-card">
            <div className="recruiter-metric-icon">
              <Building2 size={24} />
            </div>
            <div className="recruiter-metric-content">
              <h4>Companies</h4>
              <p>12 Partnerships</p>
            </div>
          </div>
          <div className="recruiter-metric-card">
            <div className="recruiter-metric-icon">
              <TrendingUp size={24} />
            </div>
            <div className="recruiter-metric-content">
              <h4>Success Rate</h4>
              <p>88% Average</p>
            </div>
          </div>
        </div>
      </div>

      <div className="recruiter-profile-section">
        <h3>Monthly Statistics</h3>
        <div className="recruiter-stats-bars">
          {[
            { month: 'January 2026', drives: 12, percentage: 92 },
            { month: 'December 2025', drives: 10, percentage: 78 },
            { month: 'November 2025', drives: 8, percentage: 65 }
          ].map((stat, idx) => (
            <div key={idx} className="recruiter-stat-bar-item">
              <div className="recruiter-stat-bar-header">
                <span className="recruiter-stat-month">{stat.month}</span>
                <span className="recruiter-stat-count">{stat.drives} Drives</span>
              </div>
              <div className="recruiter-stat-bar-track">
                <div className="recruiter-stat-bar-fill" style={{ width: `${stat.percentage}%` }}></div>
              </div>
              <span className="recruiter-stat-percentage">{stat.percentage}% Success Rate</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <>
      <div className="recruiter-page-header">
        <div>
          <h1>Profile Settings</h1>
          <p>Manage your account information</p>
        </div>
        <button className="recruiter-edit-profile-btn" onClick={() => setEditMode(!editMode)}>
          {editMode ? (
            <>
              <Save size={20} />
              Save Changes
            </>
          ) : (
            <>
              <Edit2 size={20} />
              Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="recruiter-profile-tabs">
        {profileTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveProfileTab(tab.id)}
            className={`recruiter-profile-tab ${activeProfileTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="recruiter-profile-container">
        {activeProfileTab === 'personal' && renderPersonalInfo()}
        {activeProfileTab === 'professional' && renderProfessional()}
        {activeProfileTab === 'activity' && renderActivity()}
      </div>
    </>
  );

  return (
    <div className="recruiter-dashboard-wrapper">
      {/* Sidebar */}
      <aside className={`recruiter-sidebar ${sidebarOpen ? 'recruiter-sidebar-open' : 'recruiter-sidebar-closed'}`}>
        <div className="recruiter-sidebar-content">
          <div className="recruiter-sidebar-header">
            <div className="recruiter-logo">
              <Briefcase size={32} />
            </div>
            {sidebarOpen && <span className="recruiter-logo-text">Recruitment Portal</span>}
          </div>

          <nav className="recruiter-sidebar-nav">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`recruiter-nav-item ${activeMenu === item.id ? 'recruiter-nav-active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
                title={item.label}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          <button className="recruiter-logout-btn">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`recruiter-main-content ${sidebarOpen ? 'recruiter-content-expanded' : 'recruiter-content-full'}`}>
        {/* Top Navbar */}
        <nav className="recruiter-top-navbar">
          <div className="recruiter-navbar-left">
            <button className="recruiter-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="recruiter-search-bar">
              <Search size={20} />
              <input type="text" placeholder="Search candidates, companies, drives..." />
            </div>
          </div>

          <div className="recruiter-navbar-right">
            <button className="recruiter-notification-btn">
              <Mail size={20} />
              <span className="recruiter-notification-badge">5</span>
            </button>
            <div className="recruiter-user-profile">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali" alt="Dr. Anjali Mehta" />
              <div className="recruiter-user-info">
                <span className="recruiter-user-name">Dr. Anjali Mehta</span>
                <span className="recruiter-user-role">Placement Officer</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="recruiter-dashboard-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default RecruiterDashboard;