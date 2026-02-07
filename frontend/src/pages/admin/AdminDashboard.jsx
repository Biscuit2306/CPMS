import React from 'react';
import { Shield, Users, UserCheck, Building2, TrendingUp, CheckCircle, Activity, AlertCircle, BarChart3, Target, Zap, Award, UserPlus, FileText } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin-css/admindashboard.css';

const AdminDashboard = () => {
  const systemStats = [
    { icon: Users, label: 'Total Students', value: '2,847', color: '#0ea5e9' },
    { icon: UserCheck, label: 'Active Recruiters', value: '12', color: '#10b981' },
    { icon: Building2, label: 'Partner Companies', value: '45', color: '#f59e0b' },
    { icon: TrendingUp, label: 'Placement Rate', value: '92%', color: '#8b5cf6' }
  ];

  const systemLogs = [
    { id: 1, action: 'New company registered', user: 'Admin', details: 'NextGen AI added to system', timestamp: 'Jan 24, 2026 10:30 AM', type: 'success' },
    { id: 2, action: 'Drive created', user: 'Dr. Anjali Mehta', details: 'TechCorp Software Engineer drive', timestamp: 'Jan 24, 2026 09:15 AM', type: 'info' },
    { id: 3, action: 'Student account activated', user: 'System', details: 'Batch of 150 students activated', timestamp: 'Jan 23, 2026 04:45 PM', type: 'success' },
    { id: 4, action: 'Failed login attempt', user: 'Unknown', details: 'Multiple failed attempts detected', timestamp: 'Jan 23, 2026 02:20 PM', type: 'warning' }
  ];

  return (
    <AdminLayout>
      <div className="dashboard-wrapper">
        {/* Welcome Banner */}
        <div className="dashboard-hero-banner">
          <div className="dashboard-hero-content">
            <div className="dashboard-hero-text">
              <h1>Welcome back, Dr. Patel!</h1>
              <p>Manage and oversee the entire campus placement system</p>
            </div>
            <div className="dashboard-hero-icon">
              <Shield size={80} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-stats-container">
          {systemStats.map((stat, index) => (
            <div key={index} className="dashboard-stat-box">
              <div className="dashboard-stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div className="dashboard-stat-info">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="dashboard-main-grid">
          {/* Left Column - Activities */}
          <div className="dashboard-section-card">
            <div className="dashboard-section-header">
              <h2>Recent Activities</h2>
              <a href="#" className="dashboard-link">View all</a>
            </div>
            <div className="dashboard-activity-feed">
              {systemLogs.map((log) => (
                <div key={log.id} className="dashboard-activity-row">
                  <div className={`dashboard-activity-badge dashboard-activity-badge-${log.type}`}>
                    {log.type === 'success' && <CheckCircle size={20} />}
                    {log.type === 'info' && <Activity size={20} />}
                    {log.type === 'warning' && <AlertCircle size={20} />}
                  </div>
                  <div className="dashboard-activity-content">
                    <h4>{log.action}</h4>
                    <p>{log.details}</p>
                    <span className="dashboard-activity-timestamp">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - System Overview */}
          <div className="dashboard-section-card">
            <div className="dashboard-section-header">
              <h2>System Overview</h2>
            </div>
            <div className="dashboard-overview-list">
              <div className="dashboard-overview-row">
                <div className="dashboard-overview-badge">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h4>Active Drives</h4>
                  <p>8 Ongoing</p>
                </div>
              </div>
              <div className="dashboard-overview-row">
                <div className="dashboard-overview-badge">
                  <Target size={24} />
                </div>
                <div>
                  <h4>Placement Target</h4>
                  <p>85% Achieved</p>
                </div>
              </div>
              <div className="dashboard-overview-row">
                <div className="dashboard-overview-badge">
                  <Zap size={24} />
                </div>
                <div>
                  <h4>Avg. Package</h4>
                  <p>₹14.2 LPA</p>
                </div>
              </div>
              <div className="dashboard-overview-row">
                <div className="dashboard-overview-badge">
                  <Award size={24} />
                </div>
                <div>
                  <h4>Students Placed</h4>
                  <p>1,247 Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Two Column Layout */}
        <div className="dashboard-main-grid">
          {/* Quick Actions */}
          <div className="dashboard-section-card">
            <div className="dashboard-section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="dashboard-actions-grid">
              <button className="dashboard-action-button">
                <UserPlus size={20} />
                <span>Add Student</span>
              </button>
              <button className="dashboard-action-button">
                <UserCheck size={20} />
                <span>Add Recruiter</span>
              </button>
              <button className="dashboard-action-button">
                <Building2 size={20} />
                <span>Add Company</span>
              </button>
              <button className="dashboard-action-button">
                <FileText size={20} />
                <span>Generate Report</span>
              </button>
            </div>
          </div>

          {/* Department Statistics */}
          <div className="dashboard-section-card">
            <div className="dashboard-section-header">
              <h2>Department Statistics</h2>
            </div>
            <div className="dashboard-dept-list">
              <div className="dashboard-dept-row">
                <div className="dashboard-dept-labels">
                  <span>Computer Science</span>
                  <span>92%</span>
                </div>
                <div className="dashboard-dept-bar-track">
                  <div className="dashboard-dept-bar-fill dashboard-dept-bar-primary" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div className="dashboard-dept-row">
                <div className="dashboard-dept-labels">
                  <span>Information Technology</span>
                  <span>88%</span>
                </div>
                <div className="dashboard-dept-bar-track">
                  <div className="dashboard-dept-bar-fill dashboard-dept-bar-secondary" style={{ width: '88%' }}></div>
                </div>
              </div>
              <div className="dashboard-dept-row">
                <div className="dashboard-dept-labels">
                  <span>Electronics</span>
                  <span>75%</span>
                </div>
                <div className="dashboard-dept-bar-track">
                  <div className="dashboard-dept-bar-fill dashboard-dept-bar-tertiary" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;