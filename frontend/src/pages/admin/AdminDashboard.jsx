import React, { useEffect, useState } from 'react';
import { Shield, Users, UserCheck, Building2, TrendingUp, CheckCircle, Activity, AlertCircle, BarChart3, Target, Zap, Award, UserPlus, FileText, Calendar } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/admin-css/admindashboard.css';

const AdminDashboard = () => {
  const { admin, stats, students, recruiters, jobDrives, schedules, statsLoading } = useAdmin();
  const visibleDrives = (jobDrives || []).filter(drive =>
    !drive?.isDeleted && drive?.status !== 'deleted' && !drive?.isBlocked && drive?.status !== 'blocked'
  );
  const [scheduleStats, setScheduleStats] = useState({
    upcoming: 0,
    completed: 0,
    totalScheduled: 0,
  });
  
  const adminName = admin?.fullName || 'Admin';
  const adminRole = admin?.adminRole || 'System Administrator';
  
  // Calculate schedule statistics
  useEffect(() => {
    if (schedules && schedules.length > 0) {
      const upcoming = schedules.filter(s => new Date(s.date) > new Date()).length;
      const completed = schedules.filter(s => s.status === 'completed').length;
      let totalCandidates = 0;
      
      schedules.forEach(s => {
        if (s.candidates && Array.isArray(s.candidates)) {
          totalCandidates += s.candidates.length;
        }
      });
      
      setScheduleStats({
        upcoming,
        completed,
        totalScheduled: totalCandidates,
      });
    }
  }, [schedules]);
  
  const systemStats = [
    { icon: Users, label: 'Total Students', value: stats.totalStudents || '0', color: '#0ea5e9' },
    { icon: UserCheck, label: 'Active Recruiters', value: stats.activeRecruiters || '0', color: '#10b981' },
    { icon: Building2, label: 'Partner Companies', value: stats.partnerCompanies || '0', color: '#f59e0b' },
    { icon: TrendingUp, label: 'Placement Rate', value: `${stats.placementRate || 0}%`, color: '#8b5cf6' },
    { icon: Calendar, label: 'Upcoming Interviews', value: scheduleStats.upcoming || '0', color: '#ec4899' },
    { icon: UserPlus, label: 'Candidates Scheduled', value: scheduleStats.totalScheduled || '0', color: '#06b6d4' }
  ];

  const systemLogs = visibleDrives.slice(0, 4).map((drive, index) => ({
    id: index,
    action: 'New drive created',
    user: drive.company,
    details: `${drive.position} position in ${drive.location}`,
    timestamp: new Date(drive.createdAt).toLocaleDateString(),
    type: index % 2 === 0 ? 'success' : 'info'
  }));

  const activeDrives = visibleDrives.filter(d => (d.status || 'active') === 'active').length;
  const totalApplications = visibleDrives.reduce((sum, drive) => sum + (drive.applications?.length || 0), 0);
  const selectedStudents = visibleDrives.reduce((sum, drive) => 
    sum + (drive.applications?.filter(a => a.applicationStatus === 'selected').length || 0), 0
  );

  return (
    <AdminLayout>
      <div className="dashboard-wrapper">
        {/* Welcome Banner */}
        <div className="dashboard-hero-banner">
          <div className="dashboard-hero-content">
            <div className="dashboard-hero-text">
              <h1>Welcome back, {adminName}!</h1>
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
              <h2>Recent Job Drives</h2>
              <a href="/admin/placements" className="dashboard-link">View all</a>
            </div>
            <div className="dashboard-activity-feed">
              {systemLogs.length > 0 ? (
                systemLogs.map((log) => (
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
                ))
              ) : (
                <p style={{textAlign: 'center', padding: '20px'}}>No recent drives</p>
              )}
            </div>
          </div>

          {/* Right Column - System Overview */}
          <div className="dashboard-section-card">
            <div className="dashboard-section-header">
              <h2>Interview Schedules</h2>
              <a href="/admin/schedules" className="dashboard-link">View all</a>
            </div>
            <div className="dashboard-overview-list">
              <div className="dashboard-overview-row">
                <div className="dashboard-overview-badge" style={{ backgroundColor: '#ec489915', color: '#ec4899' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <h4>Upcoming Interviews</h4>
                  <p>{scheduleStats.upcoming} Scheduled</p>
                </div>
              </div>
              <div className="dashboard-overview-row">
                <div className="dashboard-overview-badge" style={{ backgroundColor: '#06b6d415', color: '#06b6d4' }}>
                  <UserPlus size={24} />
                </div>
                <div>
                  <h4>Candidates in Interviews</h4>
                  <p>{scheduleStats.totalScheduled} Total</p>
                </div>
              </div>
              <div className="dashboard-overview-row">
                <div className="dashboard-overview-badge" style={{ backgroundColor: '#10b98115', color: '#10b981' }}>
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h4>Completed Interviews</h4>
                  <p>{scheduleStats.completed} Total</p>
                </div>
              </div>
              <div className="dashboard-overview-row">
                <div className="dashboard-overview-badge" style={{ backgroundColor: '#f59e0b15', color: '#f59e0b' }}>
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h4>Total Schedules</h4>
                  <p>{schedules?.length || 0} Created</p>
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
              <button className="dashboard-action-button" onClick={() => window.location.href = '/admin/students'}>
                <UserPlus size={20} />
                <span>Manage Students</span>
              </button>
              <button className="dashboard-action-button" onClick={() => window.location.href = '/admin/recruiters'}>
                <UserCheck size={20} />
                <span>Manage Recruiters</span>
              </button>
              <button className="dashboard-action-button" onClick={() => window.location.href = '/admin/placements'}>
                <Building2 size={20} />
                <span>Manage Drives</span>
              </button>
              <button className="dashboard-action-button">
                <FileText size={20} />
                <span>Generate Report</span>
              </button>
            </div>
          </div>

          {/* Recent Statistics */}
          <div className="dashboard-section-card">
            <div className="dashboard-section-header">
              <h2>Placement Breakdown</h2>
            </div>
            <div className="dashboard-dept-list">
              <div className="dashboard-dept-row">
                <div className="dashboard-dept-labels">
                  <span>Application Receives</span>
                  <span>{totalApplications}</span>
                </div>
                <div className="dashboard-dept-bar-track">
                  <div className="dashboard-dept-bar-fill dashboard-dept-bar-primary" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div className="dashboard-dept-row">
                <div className="dashboard-dept-labels">
                  <span>Shortlisted</span>
                  <span>{visibleDrives.reduce((sum, d) => sum + (d.applications?.filter(a => a.applicationStatus === 'shortlisted').length || 0), 0)}</span>
                </div>
                <div className="dashboard-dept-bar-track">
                  <div className="dashboard-dept-bar-fill dashboard-dept-bar-secondary" style={{ width: `${visibleDrives.reduce((sum, d) => sum + (d.applications?.filter(a => a.applicationStatus === 'shortlisted').length || 0), 0) / (totalApplications || 1) * 100 || 0}%` }}></div>
                </div>
              </div>
              <div className="dashboard-dept-row">
                <div className="dashboard-dept-labels">
                  <span>Selected</span>
                  <span>{selectedStudents}</span>
                </div>
                <div className="dashboard-dept-bar-track">
                  <div className="dashboard-dept-bar-fill dashboard-dept-bar-tertiary" style={{ width: `${selectedStudents / totalApplications * 100 || 0}%` }}></div>
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