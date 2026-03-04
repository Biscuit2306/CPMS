import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Users, Building2, TrendingUp, CheckCircle,
  UserPlus, Mail, FileText, Calendar, BarChart3, Target,
  Zap, Download, Send
} from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { useRecruiter } from '../../context/RecruiterContext';
import API from '../../services/api';
import '../../styles/RecruiterCSS/recruiterdashboard.css';

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // ─── Modal Visibility State ───────────────────────────────────
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCreateDriveModal, setShowCreateDriveModal] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);

  const { recruiter, drives = [], drivesLoading, createDrive, searchQuery } = useRecruiter();
  const recruiterName = recruiter?.fullName || 'Recruiter';

  // ─── Stats Calculation ────────────────────────────────────────
  const drivesArray = Array.isArray(drives) ? drives : [];
  const queryLower = (searchQuery || '').trim().toLowerCase();
  // compute filtered drives when query present
  const filteredDrivesArray = queryLower
    ? drivesArray.filter(d =>
        (d.company || '').toLowerCase().includes(queryLower) ||
        (d.position || '').toLowerCase().includes(queryLower) ||
        (d.location || '').toLowerCase().includes(queryLower)
      )
    : drivesArray;
  // statistics should apply to whatever subset the recruiter is currently viewing
  const totalApplicants = filteredDrivesArray.reduce((sum, drive) => sum + (drive?.applicants?.length || 0), 0);
  const selectedCandidates = filteredDrivesArray.reduce((sum, drive) =>
    sum + (drive?.applicants?.filter(a => a?.applicationStatus === 'selected').length || 0), 0
  );
  const activeDrivesCount = filteredDrivesArray.filter(d => d?.status === 'active').length;
  const successRate = totalApplicants > 0 ? Math.round((selectedCandidates / totalApplicants) * 100) : 0;

  const recruitmentStats = [
    { icon: Users,       label: 'Total Applicants',    value: totalApplicants.toString(), color: '#0ea5e9' },
    { icon: CheckCircle, label: 'Selected Candidates', value: selectedCandidates.toString(), color: '#10b981' },
    { icon: Building2,   label: 'Active Drives',       value: activeDrivesCount.toString(), color: '#f59e0b' },
    { icon: TrendingUp,  label: 'Success Rate',        value: `${successRate}%`, color: '#8b5cf6' },
  ];

  // ─── Recent Applications ──────────────────────────────────────
  const recentApplications = drivesArray
    .flatMap(drive =>
      (drive?.applicants || []).map(applicant => ({
        ...applicant,
        role: drive?.position || 'Unknown Position',
        company: recruiter?.companyName || 'Unknown Company',
        driveId: drive?._id,
      }))
    )
    .sort((a, b) => {
      const dateA = a?.appliedAt ? new Date(a.appliedAt) : new Date(0);
      const dateB = b?.appliedAt ? new Date(b.appliedAt) : new Date(0);
      return dateB - dateA;
    })
    .slice(0, 5);

  // filter applications by query as well
  const filteredRecentApplications = queryLower
    ? recentApplications.filter(app =>
        (app.studentName || '').toLowerCase().includes(queryLower) ||
        (app.company || '').toLowerCase().includes(queryLower) ||
        (app.role || '').toLowerCase().includes(queryLower)
      )
    : recentApplications;

  // ─── Form State ───────────────────────────────────────────────
  const [scheduleForm, setScheduleForm] = useState({
    jobDriveId: '', position: '', interviewType: 'Technical Interview',
    date: '', time: '10:00 AM', venue: 'Conference Room A',
    platform: 'Offline', meetingLink: '', capacity: 50, description: '',
  });

  const [notificationForm, setNotificationForm] = useState({
    recipientType: 'all', subject: '', message: '',
  });

  const [reportForm, setReportForm] = useState({
    reportType: 'overview', dateFrom: '', dateTo: '',
  });

  const [reportPreview, setReportPreview] = useState(null);

  const [driveForm, setDriveForm] = useState({
    company: '', position: '', salary: '', location: '',
    date: '', applicationDeadline: '', jobDescription: '',
    eligibilityCriteria: { minCGPA: 0, allowedBranches: ['CSE', 'IT', 'ECE'], yearsEligible: ['Final Year'] },
    rounds: ['Online Test', 'Technical Interview', 'HR Round'],
  });

  // ─── Submit Handlers ──────────────────────────────────────────
  const submitScheduleInterview = async () => {
    if (!scheduleForm.jobDriveId || !scheduleForm.position || !scheduleForm.date || !scheduleForm.time) {
      alert('Please fill all required fields');
      return;
    }
    try {
      setLoading(true);
      await API.post('/schedules', {
        recruiterFirebaseUid: recruiter?.firebaseUid,
        jobDriveId: scheduleForm.jobDriveId,
        position: scheduleForm.position,
        interviewType: scheduleForm.interviewType,
        date: scheduleForm.date,
        time: scheduleForm.time,
        venue: scheduleForm.venue,
        platform: scheduleForm.platform,
        meetingLink: scheduleForm.meetingLink,
        capacity: scheduleForm.capacity,
        description: scheduleForm.description,
        company: recruiter?.companyName || '',
      });
      setShowScheduleModal(false);
      setScheduleForm({ jobDriveId: '', position: '', interviewType: 'Technical Interview', date: '', time: '10:00 AM', venue: 'Conference Room A', platform: 'Offline', meetingLink: '', capacity: 50, description: '' });
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const submitNotification = async () => {
    if (!notificationForm.subject || !notificationForm.message) {
      alert('Please fill all required fields');
      return;
    }
    try {
      setLoading(true);
      await API.post('/notifications/send', {
        recipientType: notificationForm.recipientType,
        subject: notificationForm.subject,
        message: notificationForm.message,
      });
      setShowNotificationModal(false);
      setNotificationForm({ recipientType: 'all', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const generatePlacementReport = async () => {
    try {
      setLoading(true);
      await API.post('/reports', {
        recruiterFirebaseUid: recruiter?.firebaseUid,
        reportType: reportForm.reportType,
        dateFrom: reportForm.dateFrom || null,
        dateTo: reportForm.dateTo || null,
        totalApplicants,
        selectedCandidates,
        activeDrives: activeDrivesCount,
        successRate,
        company: recruiter?.companyName || '',
      });

      const reportData = {
        generatedAt: new Date().toLocaleString(),
        reportType: reportForm.reportType,
        dateRange: reportForm.dateFrom && reportForm.dateTo
          ? `${reportForm.dateFrom} to ${reportForm.dateTo}`
          : 'All time',
        statistics: { totalApplicants, selectedCandidates, activeDrives: activeDrivesCount, successRate: `${successRate}%` },
        drives: drivesArray.slice(0, 3).map(drive => ({
          company: recruiter?.companyName || 'Company',
          position: drive?.position || 'Position',
          applicants: drive?.applicants?.length || 0,
          date: drive?.date ? new Date(drive.date).toLocaleDateString() : 'N/A',
        })),
      };

      setReportPreview(reportData);
      setShowReportModal(false);
      setShowReportPreview(true);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!reportPreview) return;

    const reportContent = [
      ['Recruiter Dashboard Report'],
      ['Generated on:', reportPreview.generatedAt],
      ['Report Type:', reportPreview.reportType],
      ['Date Range:', reportPreview.dateRange],
      [''],
      ['Overview Statistics'],
      ['Metric', 'Value'],
      ['Total Applicants', reportPreview.statistics.totalApplicants],
      ['Selected Candidates', reportPreview.statistics.selectedCandidates],
      ['Active Drives', reportPreview.statistics.activeDrives],
      ['Success Rate', reportPreview.statistics.successRate],
      [''],
      ['Active Drives'],
      ['Company', 'Position', 'Applicants', 'Date'],
      ...reportPreview.drives.map(drive => [drive.company, drive.position, drive.applicants, drive.date]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([reportContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Placement_Report_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setShowReportPreview(false);
    setReportPreview(null);
    setReportForm({ reportType: 'overview', dateFrom: '', dateTo: '' });
  };

  const submitCreateDrive = async () => {
    if (!driveForm.company || !driveForm.position || !driveForm.salary || !driveForm.location || !driveForm.date || !driveForm.applicationDeadline) {
      alert('Please fill all required fields');
      return;
    }
    try {
      setLoading(true);
      await createDrive({
        ...driveForm,
        date: new Date(driveForm.date),
        applicationDeadline: new Date(driveForm.applicationDeadline),
        status: 'active',
        applicants: [],
      });
      setShowCreateDriveModal(false);
      setDriveForm({
        company: '', position: '', salary: '', location: '', date: '', applicationDeadline: '', jobDescription: '',
        eligibilityCriteria: { minCGPA: 0, allowedBranches: ['CSE', 'IT', 'ECE'], yearsEligible: ['Final Year'] },
        rounds: ['Online Test', 'Technical Interview', 'HR Round'],
      });
    } catch (error) {
      console.error('Error creating drive:', error);
      alert('Failed to create drive: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared Modal Overlay Style ───────────────────────────────
  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  };
  const modalStyle = {
    background: 'white', borderRadius: '12px', width: '95%',
    padding: '1.5rem', cursor: 'default',
  };
  const inputStyle = { padding: '0.7rem', border: '1px solid #e9d5f0', borderRadius: '8px', fontSize: '0.95rem' };
  const selectStyle = { ...inputStyle, background: '#fafafa', cursor: 'pointer', fontWeight: '500', color: '#1f2937', border: '2px solid #e9d5f0' };
  const cancelBtnStyle = { padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #e9d5f0', background: '#f1f5f9', cursor: 'pointer', fontWeight: '500' };
  const submitBtnStyle = { padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: '#4F1C51', color: 'white', cursor: 'pointer', fontWeight: '500' };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
      

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

        {/* Active Drives + Recent Applications */}
        <div className="recruiter-content-grid">
          <div className="recruiter-card">
            <div className="recruiter-card-header">
              <h2>Active Placement Drives</h2>
              <Link to="/recruiter/drives" className="recruiter-see-all">See all</Link>
            </div>
            <div className="recruiter-drives-list">
              {drivesLoading ? (
                <div className="dashboard-placeholder">Loading drives...</div>
              ) : filteredDrivesArray.length === 0 ? (
                <div className="dashboard-placeholder">
                  {queryLower
                    ? `No drives match "${searchQuery}"`
                    : 'No drives yet'}
                </div>
              ) : (
                filteredDrivesArray.slice(0, 3).map((drive) => (
                  <div key={drive?._id} className="recruiter-drive-item">
                    <div className="recruiter-drive-icon"><Building2 size={24} /></div>
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

          <div className="recruiter-card">
            <div className="recruiter-card-header">
              <h2>Recent Applications</h2>
              <Link to="/recruiter/candidates" className="recruiter-see-all">See all</Link>
            </div>
            <div className="recruiter-applications-list">
              {filteredRecentApplications.length === 0 ? (
                <div className="dashboard-placeholder">
                  {queryLower
                    ? `No applications match "${searchQuery}"`
                    : 'No applications yet'}
                </div>
              ) : (
                filteredRecentApplications.map((app, index) => (
                  <div key={index} className="recruiter-application-item">
                    <div className="recruiter-app-candidate">
                      <div className="recruiter-candidate-avatar">
                        {(app.studentName || 'S').split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="recruiter-app-details">
                        <h3>{app.studentName || 'Candidate'}</h3>
                        <p className="recruiter-app-role">{app.role} • CGPA: {app.studentCGPA || 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`recruiter-status-badge recruiter-status-${(app.applicationStatus || 'applied').toLowerCase().replace(' ', '-')}`}>
                      {app.applicationStatus === 'selected' ? 'Selected' : app.applicationStatus === 'rejected' ? 'Rejected' : 'Applied'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions + Analytics */}
        <div className="recruiter-content-grid">
          <div className="recruiter-card">
            <div className="recruiter-card-header"><h2>Quick Actions</h2></div>
            <div className="recruiter-quick-actions">
              <button className="recruiter-action-btn" onClick={() => setShowScheduleModal(true)} title="Schedule interviews with candidates">
                <UserPlus size={20} /><span>Schedule Interview</span>
              </button>
              <button className="recruiter-notification-action-btn" onClick={() => setShowNotificationModal(true)} title="Send notifications to candidates">
                <Mail size={20} /><span>Send Notification</span>
              </button>
              <button className="recruiter-generate-action-btn" onClick={() => setShowReportModal(true)} title="Generate placement report">
                <FileText size={20} /><span>Generate Report</span>
              </button>
              <button className="recruiter-drive-action-btn" onClick={() => setShowCreateDriveModal(true)} title="Create a new placement drive">
                <Calendar size={20} /><span>Create Drive</span>
              </button>
            </div>
          </div>

          <div className="recruiter-card">
            <div className="recruiter-card-header"><h2>Placement Analytics</h2></div>
            <div className="recruiter-analytics-summary">
              <div className="recruiter-analytics-item">
                <div className="recruiter-analytics-icon"><BarChart3 size={24} /></div>
                <div><h4>Avg. Package</h4><p>₹14.2 LPA</p></div>
              </div>
              <div className="recruiter-analytics-item">
                <div className="recruiter-analytics-icon"><Target size={24} /></div>
                <div><h4>Placement Goal</h4><p>75% Achieved</p></div>
              </div>
              <div className="recruiter-analytics-item">
                <div className="recruiter-analytics-icon"><Zap size={24} /></div>
                <div><h4>Active Offers</h4><p>156 Pending</p></div>
              </div>
            </div>
          </div>
        </div>
      

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODALS                                                  */}
      {/* ═══════════════════════════════════════════════════════ */}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div style={overlayStyle} onClick={() => setShowScheduleModal(false)}>
          <div style={{ ...modalStyle, maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>Schedule Interview</h3>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <select value={scheduleForm.jobDriveId} onChange={e => setScheduleForm({ ...scheduleForm, jobDriveId: e.target.value })} style={selectStyle} required>
                <option value="">Select Job Drive *</option>
                {drivesArray.map(drive => <option key={drive._id} value={drive._id}>{drive.position} - {drive.company}</option>)}
              </select>
              <input type="text" placeholder="Position *" value={scheduleForm.position} onChange={e => setScheduleForm({ ...scheduleForm, position: e.target.value })} style={inputStyle} />
              <select value={scheduleForm.interviewType} onChange={e => setScheduleForm({ ...scheduleForm, interviewType: e.target.value })} style={{ ...inputStyle, background: '#fafafa', cursor: 'pointer' }}>
                <option value="Technical Interview">Technical Interview</option>
                <option value="HR Interview">HR Interview</option>
                <option value="Group Discussion">Group Discussion</option>
                <option value="Final Round">Final Round</option>
              </select>
              <input type="date" value={scheduleForm.date} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} style={inputStyle} required />
              <input type="time" value={scheduleForm.time} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })} style={inputStyle} required />
              <input type="text" placeholder="Venue" value={scheduleForm.venue} onChange={e => setScheduleForm({ ...scheduleForm, venue: e.target.value })} style={inputStyle} />
              <select value={scheduleForm.platform} onChange={e => setScheduleForm({ ...scheduleForm, platform: e.target.value })} style={{ ...inputStyle, background: '#fafafa', cursor: 'pointer' }}>
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              <input type="text" placeholder="Meeting Link (if Online)" value={scheduleForm.meetingLink} onChange={e => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })} style={inputStyle} />
              <input type="number" placeholder="Capacity" value={scheduleForm.capacity} onChange={e => setScheduleForm({ ...scheduleForm, capacity: parseInt(e.target.value) })} style={inputStyle} />
              <textarea placeholder="Description (Optional)" value={scheduleForm.description} onChange={e => setScheduleForm({ ...scheduleForm, description: e.target.value })} style={{ ...inputStyle, minHeight: '80px', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowScheduleModal(false)} style={cancelBtnStyle}>Cancel</button>
              <button onClick={submitScheduleInterview} disabled={loading} style={{ ...submitBtnStyle, opacity: loading ? 0.7 : 1 }}>{loading ? 'Scheduling...' : 'Schedule'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showNotificationModal && (
        <div style={overlayStyle} onClick={() => setShowNotificationModal(false)}>
          <div style={{ ...modalStyle, maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>Send Notification</h3>
              <button onClick={() => setShowNotificationModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <select value={notificationForm.recipientType} onChange={e => setNotificationForm({ ...notificationForm, recipientType: e.target.value })} style={selectStyle}>
                <option value="all">All Candidates</option>
                <option value="selected">Selected Candidates</option>
                <option value="applied">Applied Candidates</option>
              </select>
              <input type="text" placeholder="Subject" value={notificationForm.subject} onChange={e => setNotificationForm({ ...notificationForm, subject: e.target.value })} style={inputStyle} />
              <textarea placeholder="Message" value={notificationForm.message} onChange={e => setNotificationForm({ ...notificationForm, message: e.target.value })} style={{ ...inputStyle, minHeight: '100px', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowNotificationModal(false)} style={cancelBtnStyle}>Cancel</button>
              <button onClick={submitNotification} disabled={loading} style={{ ...submitBtnStyle, opacity: loading ? 0.7 : 1 }}>
                <Send size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showReportModal && (
        <div style={overlayStyle} onClick={() => setShowReportModal(false)}>
          <div style={{ ...modalStyle, maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>Generate Report</h3>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <select value={reportForm.reportType} onChange={e => setReportForm({ ...reportForm, reportType: e.target.value })} style={selectStyle}>
                <option value="overview">Overview Report</option>
                <option value="detailed">Detailed Report</option>
                <option value="candidates">Candidates Report</option>
                <option value="drives">Drives Report</option>
              </select>
              <input type="date" value={reportForm.dateFrom} onChange={e => setReportForm({ ...reportForm, dateFrom: e.target.value })} placeholder="From Date (Optional)" style={inputStyle} />
              <input type="date" value={reportForm.dateTo} onChange={e => setReportForm({ ...reportForm, dateTo: e.target.value })} placeholder="To Date (Optional)" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowReportModal(false)} style={cancelBtnStyle}>Cancel</button>
              <button onClick={generatePlacementReport} disabled={loading} style={{ ...submitBtnStyle, opacity: loading ? 0.7 : 1 }}>
                <BarChart3 size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Drive Modal */}
      {showCreateDriveModal && (
        <div className="recruiter-modal-overlay" onClick={() => setShowCreateDriveModal(false)}>
          <div className="recruiter-modal-content" onClick={e => e.stopPropagation()}>
            <div className="recruiter-modal-header">
              <h3>Create Placement Drive</h3>
              <button onClick={() => setShowCreateDriveModal(false)} className="recruiter-modal-close-btn">×</button>
            </div>
            <div className="recruiter-modal-form-group">
              <input type="text" placeholder="Company Name *" value={driveForm.company} onChange={e => setDriveForm({ ...driveForm, company: e.target.value })} className="recruiter-modal-input" required />
              <input type="text" placeholder="Position *" value={driveForm.position} onChange={e => setDriveForm({ ...driveForm, position: e.target.value })} className="recruiter-modal-input" required />
              <input type="text" placeholder="Salary *" value={driveForm.salary} onChange={e => setDriveForm({ ...driveForm, salary: e.target.value })} className="recruiter-modal-input" required />
              <input type="text" placeholder="Location" value={driveForm.location} onChange={e => setDriveForm({ ...driveForm, location: e.target.value })} className="recruiter-modal-input" />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="date" value={driveForm.date} onChange={e => setDriveForm({ ...driveForm, date: e.target.value })} className="recruiter-modal-input" style={{ flex: 1 }} required title="Drive Date" />
                <input type="date" value={driveForm.applicationDeadline} onChange={e => setDriveForm({ ...driveForm, applicationDeadline: e.target.value })} className="recruiter-modal-input" style={{ flex: 1 }} required title="Application Deadline" />
              </div>
              <textarea placeholder="Job Description" value={driveForm.jobDescription} onChange={e => setDriveForm({ ...driveForm, jobDescription: e.target.value })} className="recruiter-modal-textarea" />
            </div>
            <div className="recruiter-modal-actions">
              <button onClick={() => setShowCreateDriveModal(false)} className="recruiter-modal-cancel-btn">Cancel</button>
              <button onClick={submitCreateDrive} disabled={loading} className="recruiter-modal-submit-btn">{loading ? 'Creating...' : 'Create Drive'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {showReportPreview && reportPreview && (
        <div style={overlayStyle} onClick={() => setShowReportPreview(false)}>
          <div style={{ ...modalStyle, maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: '#1f2937' }}>Placement Report Preview</h3>
              <button onClick={() => setShowReportPreview(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <div style={{ background: '#f9f5fb', borderRadius: '10px', padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Report Type</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', textTransform: 'capitalize' }}>{reportPreview.reportType} Report</p>
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Generated On</p>
                  <p style={{ fontSize: '0.95rem', fontWeight: '500', color: '#1f2937' }}>{reportPreview.generatedAt}</p>
                </div>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Date Range</p>
                <p style={{ fontSize: '0.95rem', fontWeight: '500', color: '#1f2937' }}>{reportPreview.dateRange}</p>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}>Overview Statistics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Total Applicants', value: reportPreview.statistics.totalApplicants, color: '#0ea5e9' },
                  { label: 'Selected', value: reportPreview.statistics.selectedCandidates, color: '#10b981' },
                  { label: 'Active Drives', value: reportPreview.statistics.activeDrives, color: '#f59e0b' },
                  { label: 'Success Rate', value: reportPreview.statistics.successRate, color: '#8b5cf6' },
                ].map((stat, i) => (
                  <div key={i} style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px' }}>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{stat.label}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {reportPreview.drives?.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}>Top Active Drives</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e9d5f0' }}>
                        {['Company', 'Position', 'Applicants', 'Date'].map(h => (
                          <th key={h} style={{ textAlign: h === 'Applicants' ? 'center' : 'left', padding: '0.8rem', fontWeight: '700', color: '#1f2937' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportPreview.drives.map((drive, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e9d5f0' }}>
                          <td style={{ padding: '0.8rem', color: '#1f2937' }}>{drive.company}</td>
                          <td style={{ padding: '0.8rem', color: '#1f2937' }}>{drive.position}</td>
                          <td style={{ padding: '0.8rem', color: '#1f2937', textAlign: 'center' }}>{drive.applicants}</td>
                          <td style={{ padding: '0.8rem', color: '#1f2937' }}>{drive.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowReportPreview(false)} style={{ ...cancelBtnStyle, padding: '0.7rem 1.5rem', fontWeight: '600', color: '#1f2937' }}>Close</button>
              <button onClick={downloadReport} disabled={loading} style={{ ...submitBtnStyle, padding: '0.7rem 1.5rem', fontWeight: '600', opacity: loading ? 0.7 : 1 }}>
                <Download size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </RecruiterLayout>
  );
};

export default Dashboard;