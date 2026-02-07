import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Building2, Users, TrendingUp, Briefcase, Bell, FileText } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import InterviewFeature from '../InterviewFeature';
import ProjectEvaluator from '../ProjectEvaluator';
import '../../styles/student-css/studentdashboard.css';

const StudentDashboard = () => {
  const placementStats = [
    { icon: Building2, label: 'Companies Registered', value: '45', color: '#7c3aed' },
    { icon: Users, label: 'Students Placed', value: '320', color: '#06b6d4' },
    { icon: TrendingUp, label: 'Placement Rate', value: '85%', color: '#10b981' },
    { icon: Briefcase, label: 'Job Offers', value: '12', color: '#f59e0b' }
  ];

  const upcomingDrives = [
    { company: 'TCS', date: 'Jan 28, 2026', role: 'Software Engineer', package: '3.6 LPA' },
    { company: 'Infosys', date: 'Feb 2, 2026', role: 'System Engineer', package: '4.0 LPA' },
    { company: 'Wipro', date: 'Feb 5, 2026', role: 'Project Engineer', package: '3.8 LPA' }
  ];

  const appliedCompanies = [
    { company: 'Google', status: 'Interview Scheduled', date: 'Jan 30, 2026' },
    { company: 'Microsoft', status: 'Applied', date: 'Jan 25, 2026' },
    { company: 'Amazon', status: 'Test Cleared', date: 'Jan 26, 2026' }
  ];

  return (
    <StudentLayout>
      <div className="student-welcome-banner">
        <div className="student-welcome-content">
          <div className="student-welcome-text">
            <h1>Welcome back, John!</h1>
            <p>Track your placement journey and upcoming opportunities</p>
          </div>
          <div className="student-welcome-illustration">
            <GraduationCap size={80} />
          </div>
        </div>
      </div>

      <div className="student-stats-grid">
        {placementStats.map((stat, index) => (
          <div key={index} className="student-stat-card">
            <div className="student-stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="student-stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="student-content-grid">
        <div className="student-card">
          <div className="student-card-header">
            <h2>Upcoming Placement Drives</h2>
            <Link to="/student/job-drives" className="student-see-all">See all</Link>
          </div>
          <div className="student-drives-list">
            {upcomingDrives.map((drive, index) => (
              <div key={index} className="student-drive-item">
                <div className="student-drive-icon">
                  <Building2 size={24} />
                </div>
                <div className="student-drive-info">
                  <h3>{drive.company}</h3>
                  <p className="student-drive-role">{drive.role}</p>
                  <div className="student-drive-meta">
                    <span className="student-drive-date">{drive.date}</span>
                    <span className="student-drive-package">{drive.package}</span>
                  </div>
                </div>
                <button className="student-apply-btn">Apply</button>
              </div>
            ))}
          </div>
        </div>

        <div className="student-card">
          <div className="student-card-header">
            <h2>Application Status</h2>
            <Link to="/student/applications" className="student-see-all">See all</Link>
          </div>
          <div className="student-applications-list">
            {appliedCompanies.map((app, index) => (
              <div key={index} className="student-application-item">
                <div className="student-app-company">
                  <div className="student-company-logo">
                    {app.company.charAt(0)}
                  </div>
                  <div className="student-app-details">
                    <h3>{app.company}</h3>
                    <p className="student-app-date">{app.date}</p>
                  </div>
                </div>
                <span className={`student-status-badge student-status-${app.status.toLowerCase().replace(' ', '-')}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="student-card">
        <div className="student-card-header">
          <h2>Recent Notices</h2>
          <a href="#" className="student-see-all">See all</a>
        </div>
        <div className="student-notices-list">
          <div className="student-notice-item">
            <div className="student-notice-icon">
              <Bell size={20} />
            </div>
            <div className="student-notice-content">
              <h3>Pre-Placement Talk - Amazon</h3>
              <p>Join the pre-placement talk scheduled for January 27, 2026 at 10:00 AM in the auditorium.</p>
              <span className="student-notice-time">2 hours ago</span>
            </div>
          </div>
          <div className="student-notice-item">
            <div className="student-notice-icon">
              <FileText size={20} />
            </div>
            <div className="student-notice-content">
              <h3>Update Your Resume</h3>
              <p>Please update your resume in the student portal before January 26, 2026.</p>
              <span className="student-notice-time">1 day ago</span>
            </div>
          </div>
        </div>
      </div>

      <InterviewFeature />
      <ProjectEvaluator />
    </StudentLayout>
  );
};

export default StudentDashboard;