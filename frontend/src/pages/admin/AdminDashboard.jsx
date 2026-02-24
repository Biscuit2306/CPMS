import React, { useEffect, useState } from 'react';
import { Shield, Users, UserCheck, Building2, TrendingUp, CheckCircle, Activity, AlertCircle, BarChart3, Target, Zap, Award, UserPlus, FileText, Calendar, Mail, Download, Send, X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import API from '../../services/api';
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
  const [loading, setLoading] = useState(false);

  // ─── Modal States for Admin Quick Actions ───────────────────────
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showRecruitersModal, setShowRecruitersModal] = useState(false);
  const [showDrivesModal, setShowDrivesModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);

  // ─── Report Form State ──────────────────────────────────────────
  const [reportForm, setReportForm] = useState({
    reportType: 'overview',
    dateFrom: '',
    dateTo: '',
  });

  const [reportPreview, setReportPreview] = useState(null);
  
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

  // ─── Admin Quick Action Handlers ────────────────────────────────
  const generatePlacementReport = async () => {
    try {
      setLoading(true);
      const totalApplicants = visibleDrives.reduce((sum, drive) => sum + (drive.applications?.length || 0), 0);
      const selectedCandidates = visibleDrives.reduce((sum, drive) =>
        sum + (drive.applications?.filter(a => a.applicationStatus === 'selected').length || 0), 0
      );
      const activeDrives = visibleDrives.filter(d => d.status === 'active').length;
      const successRate = totalApplicants > 0 ? Math.round((selectedCandidates / totalApplicants) * 100) : 0;

      // Save to backend
      await API.post('/reports', {
        adminFirebaseUid: admin?.firebaseUid,
        reportType: reportForm.reportType,
        dateFrom: reportForm.dateFrom || null,
        dateTo: reportForm.dateTo || null,
        totalApplicants,
        selectedCandidates,
        activeDrives,
        successRate,
      });

      const reportData = {
        generatedAt: new Date().toLocaleString(),
        reportType: reportForm.reportType,
        dateRange: reportForm.dateFrom && reportForm.dateTo
          ? `${reportForm.dateFrom} to ${reportForm.dateTo}`
          : 'All time',
        statistics: { totalApplicants, selectedCandidates, activeDrives, successRate: `${successRate}%` },
        drives: visibleDrives.slice(0, 5).map(drive => ({
          company: drive?.company || 'Company',
          position: drive?.position || 'Position',
          applicants: drive?.applications?.length || 0,
          date: drive?.date ? new Date(drive.date).toLocaleDateString() : 'N/A',
        })),
      };

      setReportPreview(reportData);
      setShowReportModal(false);
      setShowReportPreview(true);
      alert('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!reportPreview) return;

    const reportContent = [
      ['CPMS - Admin Placement Report'],
      ['Generated on:', reportPreview.generatedAt],
      ['Report Type:', reportPreview.reportType],
      ['Date Range:', reportPreview.dateRange],
      [''],
      ['OVERVIEW STATISTICS'],
      ['Metric', 'Value'],
      ['Total Applicants', reportPreview.statistics.totalApplicants],
      ['Selected Candidates', reportPreview.statistics.selectedCandidates],
      ['Active Drives', reportPreview.statistics.activeDrives],
      ['Success Rate', reportPreview.statistics.successRate],
      [''],
      ['ACTIVE JOB DRIVES'],
      ['Company', 'Position', 'Applications', 'Date'],
      ...reportPreview.drives.map(drive => [drive.company, drive.position, drive.applicants, drive.date]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([reportContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CPMS_Admin_Report_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setShowReportPreview(false);
    setReportPreview(null);
    setReportForm({ reportType: 'overview', dateFrom: '', dateTo: '' });
  };

  // ─── Delete Handler Functions ───────────────────────────────────
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      setLoading(true);
      console.log('🗑️ Deleting student:', studentId);
      const response = await API.delete(`/admin/students/${studentId}`);
      console.log('✅ Delete response:', response.data);
      alert('Student deleted successfully!');
      // Refresh by reloading the page
      window.location.reload();
    } catch (error) {
      console.error('Error deleting student:', error);
      console.error('❌ Full error response:', error.response);
      alert('Failed to delete student: ' + (error.response?.data?.error || error.response?.statusText || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecruiter = async (recruiterId) => {
    if (!window.confirm('Are you sure you want to delete this recruiter?')) return;
    
    try {
      setLoading(true);
      console.log('🗑️ Deleting recruiter:', recruiterId);
      const response = await API.delete(`/admin/recruiters/${recruiterId}`);
      console.log('✅ Delete response:', response.data);
      alert('Recruiter deleted successfully!');
      // Refresh by reloading the page
      window.location.reload();
    } catch (error) {
      console.error('Error deleting recruiter:', error);
      console.error('❌ Full error response:', error.response);
      alert('Failed to delete recruiter: ' + (error.response?.data?.error || error.response?.statusText || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDrive = async (driveId) => {
    if (!window.confirm('Are you sure you want to delete this job drive?')) return;
    
    try {
      setLoading(true);
      console.log('🗑️ Deleting job drive:', driveId);
      const response = await API.delete(`/admin/job-drives/${driveId}`);
      console.log('✅ Delete response:', response.data);
      alert('Job drive deleted successfully!');
      // Refresh by reloading the page
      window.location.reload();
    } catch (error) {
      console.error('Error deleting job drive:', error);
      console.error('❌ Full error response:', error.response);
      alert('Failed to delete job drive: ' + (error.response?.data?.error || error.response?.statusText || error.message));
    } finally {
      setLoading(false);
    }
  };

  // ─── Modal Overlay Styles ───────────────────────────────────────
  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  };
  const modalStyle = {
    background: 'white', borderRadius: '12px', width: '95%',
    padding: '1.5rem', cursor: 'default', maxHeight: '85vh', overflowY: 'auto',
  };
  const inputStyle = { padding: '0.7rem', border: '1px solid #e9d5f0', borderRadius: '8px', fontSize: '0.95rem', width: '100%' };
  const selectStyle = { ...inputStyle, background: '#fafafa', cursor: 'pointer', fontWeight: '500', color: '#1f2937', border: '2px solid #e9d5f0' };
  const cancelBtnStyle = { padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #e9d5f0', background: '#f1f5f9', cursor: 'pointer', fontWeight: '500' };
  const submitBtnStyle = { padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: '#4F1C51', color: 'white', cursor: 'pointer', fontWeight: '500' };
  
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
              <button className="dashboard-action-button" onClick={() => setShowStudentsModal(true)} title="View and manage students">
                <UserPlus size={20} />
                <span>Manage Students</span>
              </button>
              <button className="dashboard-action-button" onClick={() => setShowRecruitersModal(true)} title="View and manage recruiters">
                <UserCheck size={20} />
                <span>Manage Recruiters</span>
              </button>
              <button className="dashboard-action-button" onClick={() => setShowDrivesModal(true)} title="View and manage job drives">
                <Building2 size={20} />
                <span>Manage Drives</span>
              </button>
              <button className="dashboard-action-button" onClick={() => setShowReportModal(true)} title="Generate placement report">
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

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ADMIN QUICK ACTION MODALS                               */}
        {/* ═══════════════════════════════════════════════════════ */}

        {/* Manage Students Modal */}
        {showStudentsModal && (
          <div style={overlayStyle} onClick={() => setShowStudentsModal(false)}>
            <div style={{ ...modalStyle, maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>Manage Students</h3>
                <button onClick={() => setShowStudentsModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '60vh', overflowY: 'auto', marginBottom: '1.5rem' }}>
                {students && students.length > 0 ? (
                  students.map((student, idx) => (
                    <div key={idx} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>{student.fullName || 'N/A'}</h4>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#6b7280' }}>Email: {student.email || 'N/A'}</p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#6b7280' }}>Branch: {student.branch || 'N/A'}</p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: '#dbeafe', color: '#1e40af', borderRadius: '4px', display: 'inline-block' }}>
                          Apps: {student.applications?.length || 0}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDeleteStudent(student._id)}
                        disabled={loading}
                        title="Delete this student"
                        style={{ 
                          padding: '0.5rem 0.8rem', 
                          background: '#fee2e2', 
                          color: '#dc2626', 
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                          marginLeft: '1rem',
                          opacity: loading ? 0.7 : 1
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No students found</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowStudentsModal(false)} style={cancelBtnStyle}>Close</button>
                <button onClick={() => window.location.href = '/admin/students'} style={submitBtnStyle}>Full Management</button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Recruiters Modal */}
        {showRecruitersModal && (
          <div style={overlayStyle} onClick={() => setShowRecruitersModal(false)}>
            <div style={{ ...modalStyle, maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>Manage Recruiters</h3>
                <button onClick={() => setShowRecruitersModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '60vh', overflowY: 'auto', marginBottom: '1.5rem' }}>
                {recruiters && recruiters.length > 0 ? (
                  recruiters.map((recruiter, idx) => (
                    <div key={idx} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>{recruiter.fullName || 'N/A'}</h4>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#6b7280' }}>Company: {recruiter.companyName || 'N/A'}</p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#6b7280' }}>Email: {recruiter.email || 'N/A'}</p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: '#dcfce7', color: '#15803d', borderRadius: '4px', display: 'inline-block' }}>
                          Drives: {recruiter.jobDrives?.length || 0}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDeleteRecruiter(recruiter._id)}
                        disabled={loading}
                        title="Delete this recruiter"
                        style={{ 
                          padding: '0.5rem 0.8rem', 
                          background: '#fee2e2', 
                          color: '#dc2626', 
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                          marginLeft: '1rem',
                          opacity: loading ? 0.7 : 1
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No recruiters found</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowRecruitersModal(false)} style={cancelBtnStyle}>Close</button>
                <button onClick={() => window.location.href = '/admin/recruiters'} style={submitBtnStyle}>Full Management</button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Drives Modal */}
        {showDrivesModal && (
          <div style={overlayStyle} onClick={() => setShowDrivesModal(false)}>
            <div style={{ ...modalStyle, maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>Manage Drives</h3>
                <button onClick={() => setShowDrivesModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '60vh', overflowY: 'auto', marginBottom: '1.5rem' }}>
                {visibleDrives && visibleDrives.length > 0 ? (
                  visibleDrives.map((drive, idx) => (
                    <div key={idx} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>{drive.position}</h4>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#6b7280' }}>Company: {drive.company || 'N/A'}</p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#6b7280' }}>Location: {drive.location || 'N/A'}</p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#6b7280' }}>Salary: {drive.salary || 'N/A'}</p>
                        <div style={{ marginTop: '0.5rem' }}>
                          <p style={{ margin: '0 0.25rem 0 0', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: '#fef3c7', color: '#92400e', borderRadius: '4px', display: 'inline-block', marginRight: '0.5rem' }}>
                            {drive.status}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: '#f0fdf4', color: '#166534', borderRadius: '4px', display: 'inline-block' }}>
                            Apps: {drive.applications?.length || 0}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteDrive(drive._id)}
                        disabled={loading}
                        title="Delete this job drive"
                        style={{ 
                          padding: '0.5rem 0.8rem', 
                          background: '#fee2e2', 
                          color: '#dc2626', 
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                          marginLeft: '1rem',
                          opacity: loading ? 0.7 : 1
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No drives found</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowDrivesModal(false)} style={cancelBtnStyle}>Close</button>
                <button onClick={() => window.location.href = '/admin/placements'} style={submitBtnStyle}>Full Management</button>
              </div>
            </div>
          </div>
        )}

        {/* Generate Report Modal */}
        {showReportModal && (
          <div style={overlayStyle} onClick={() => setShowReportModal(false)}>
            <div style={{ ...modalStyle, maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>Generate Placement Report</h3>
                <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>Report Type</label>
                  <select value={reportForm.reportType} onChange={e => setReportForm({ ...reportForm, reportType: e.target.value })} style={selectStyle}>
                    <option value="overview">Overview Report</option>
                    <option value="detailed">Detailed Report</option>
                    <option value="monthly">Monthly Summary</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>From Date</label>
                    <input type="date" value={reportForm.dateFrom} onChange={e => setReportForm({ ...reportForm, dateFrom: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>To Date</label>
                    <input type="date" value={reportForm.dateTo} onChange={e => setReportForm({ ...reportForm, dateTo: e.target.value })} style={inputStyle} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowReportModal(false)} style={cancelBtnStyle}>Cancel</button>
                <button onClick={generatePlacementReport} disabled={loading} style={{ ...submitBtnStyle, opacity: loading ? 0.7 : 1 }}>{loading ? 'Generating...' : 'Generate'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Report Preview Modal */}
        {showReportPreview && reportPreview && (
          <div style={overlayStyle} onClick={() => setShowReportPreview(false)}>
            <div style={{ ...modalStyle, maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>Placement Report Preview</h3>
                <button onClick={() => setShowReportPreview(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
              </div>
              <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0.5rem 0' }}><strong>Generated:</strong> {reportPreview.generatedAt}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Report Type:</strong> {reportPreview.reportType}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Period:</strong> {reportPreview.dateRange}</p>
              </div>
              <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <h4 style={{ marginTop: 0, color: '#1f2937' }}>📊 Statistics</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><p style={{ margin: '0.5rem 0' }}><strong>Total Applicants:</strong> {reportPreview.statistics.totalApplicants}</p></div>
                  <div><p style={{ margin: '0.5rem 0' }}><strong>Selected:</strong> {reportPreview.statistics.selectedCandidates}</p></div>
                  <div><p style={{ margin: '0.5rem 0' }}><strong>Active Drives:</strong> {reportPreview.statistics.activeDrives}</p></div>
                  <div><p style={{ margin: '0.5rem 0' }}><strong>Success Rate:</strong> {reportPreview.statistics.successRate}</p></div>
                </div>
              </div>
              <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                <h4 style={{ marginTop: 0, color: '#1f2937' }}>🏢 Active Drives</h4>
                {reportPreview.drives.map((drive, idx) => (
                  <p key={idx} style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#4b5563' }}>
                    {drive.company} - {drive.position} ({drive.applicants} applications)
                  </p>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowReportPreview(false)} style={cancelBtnStyle}>Close</button>
                <button onClick={downloadReport} style={{ ...submitBtnStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Download size={16} />Download CSV</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;