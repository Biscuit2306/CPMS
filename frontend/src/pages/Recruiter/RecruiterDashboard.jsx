import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Building2, TrendingUp, CheckCircle, UserPlus, Mail, FileText, Calendar, BarChart3, Target, Zap } from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { useRecruiter } from '../../context/RecruiterContext';
import '../../styles/RecruiterCSS/recruiterdashboard.css';

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const { recruiter, drives = [], drivesLoading } = useRecruiter();
  
  const recruiterName = recruiter?.fullName || 'Recruiter';

  // Calculate stats from real data
  const drivesArray = Array.isArray(drives) ? drives : [];
  const totalApplicants = drivesArray.reduce((sum, drive) => sum + (drive?.applicants?.length || 0), 0);
  const selectedCandidates = drivesArray.reduce((sum, drive) => 
    sum + (drive?.applicants?.filter(a => a?.applicationStatus === 'selected').length || 0), 0
  );
  const activeDrivesCount = drivesArray.filter(d => d?.status === 'active').length;
  const successRate = totalApplicants > 0 ? Math.round((selectedCandidates / totalApplicants) * 100) : 0;

  const recruitmentStats = [
    { icon: Users, label: 'Total Applicants', value: totalApplicants.toString(), color: '#0ea5e9' },
    { icon: CheckCircle, label: 'Selected Candidates', value: selectedCandidates.toString(), color: '#10b981' },
    { icon: Building2, label: 'Active Drives', value: activeDrivesCount.toString(), color: '#f59e0b' },
    { icon: TrendingUp, label: 'Success Rate', value: `${successRate}%`, color: '#8b5cf6' }
  ];

  // Recent applications from all drives
  const recentApplications = (drivesArray || [])
    .flatMap(drive => 
      (drive?.applicants || []).map(applicant => ({
        ...applicant,
        role: drive?.position || 'Unknown Position',
        company: recruiter?.companyName || 'Unknown Company',
        driveId: drive?._id
      }))
    )
    .sort((a, b) => {
      const dateA = a?.appliedAt ? new Date(a.appliedAt) : new Date(0);
      const dateB = b?.appliedAt ? new Date(b.appliedAt) : new Date(0);
      return dateB - dateA;
    })
    .slice(0, 5);

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
                  {React.createElement(stat.icon, { size: 24 })}
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
                <Link to="/recruiter/drives" className="recruiter-see-all">See all</Link>
              </div>
              <div className="recruiter-drives-list">
                {drivesLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>Loading drives...</div>
                ) : !drivesArray || drivesArray.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>No drives yet</div>
                ) : (
                  drivesArray.slice(0, 3).map((drive) => (
                    <div key={drive?._id} className="recruiter-drive-item">
                      <div className="recruiter-drive-icon">
                        <Building2 size={24} />
                      </div>
                      <div className="recruiter-drive-info">
                        <h3>{recruiter?.companyName || 'Company'}</h3>
                        <p className="recruiter-drive-role">{drive?.position || 'Position'}</p>
                        <div className="recruiter-drive-meta">
                          <span className="recruiter-drive-date">{drive?.date ? new Date(drive.date).toLocaleDateString() : 'N/A'}</span>
                          <span className="recruiter-drive-applicants">{drive?.applicants?.length || 0} applicants</span>
                        </div>
                      </div>
                      <button className="recruiter-manage-btn">Manage</button>
                    </div>
                  ))
                )}
              </div>
            </div>
{/* Recent Applications */}
<div className="recruiter-card">
  <div className="recruiter-card-header">
    <h2>Recent Applications</h2>
    <Link to="/recruiter/candidates" className="recruiter-see-all">
      See all
    </Link>
  </div>

  <div className="recruiter-applications-list">
    {recentApplications.length === 0 ? (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        No applications yet
      </div>
    ) : (
      recentApplications.map((app, index) => (
        <div key={index} className="recruiter-application-item">
          <div className="recruiter-app-candidate">
            <div className="recruiter-candidate-avatar">
              {(app.studentName || 'S')
                .split(' ')
                .map(n => n[0])
                .join('')
                .substring(0, 2)}
            </div>

            <div className="recruiter-app-details">
              <h3>{app.studentName || 'Candidate'}</h3>
              <p className="recruiter-app-role">
                {app.role} • CGPA: {app.studentCGPA || 'N/A'}
              </p>
            </div>
          </div>

          <span
            className={`recruiter-status-badge recruiter-status-${(
              app.applicationStatus || 'applied'
            )
              .toLowerCase()
              .replace(' ', '-')}`}
          >
            {app.applicationStatus === 'selected'
              ? 'Selected'
              : app.applicationStatus === 'rejected'
              ? 'Rejected'
              : 'Applied'}
          </span>
        </div>
      ))
    )}
  </div>
</div>
</div>   {/* <-- ADD THIS LINE */}

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