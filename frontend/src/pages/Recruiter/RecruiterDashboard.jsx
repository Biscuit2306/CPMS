import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Building2, TrendingUp, CheckCircle, UserPlus, Mail, FileText, Calendar, BarChart3, Target, Zap } from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { useRecruiter } from '../../context/RecruiterContext';
import '../../styles/RecruiterCSS/recruiterdashboard.css';

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const { recruiter } = useRecruiter();
  
  const recruiterName = recruiter?.fullName || 'Recruiter';
  const recruiterRole = recruiter?.designation || 'Recruitment Officer';

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
    { name: 'Amit Kumar', status: 'Shortlisted', date: 'Jan 26, 2026', role: 'Data Scientist', company: 'Digital Dynamics', cgpa: '9.1' }
  ];

  return (
    <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
        <div className="recruiter-dashboard-content">
          {/* Welcome Banner */}
          <div className="recruiter-welcome-banner">
            <div className="recruiter-welcome-content">
              <div className="recruiter-welcome-text">
                <h1>Welcome back, {recruiterName}!</h1>
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
                <Link to="/drives" className="recruiter-see-all">See all</Link>
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
                <Link to="/candidates" className="recruiter-see-all">See all</Link>
              </div>
              <div className="recruiter-applications-list">
                {recentApplications.map((app, index) => (
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
        </div>
    </RecruiterLayout>
  );
};

export default Dashboard;