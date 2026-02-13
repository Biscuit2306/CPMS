import React, { useState, useEffect } from 'react';
import { Trash2, AlertCircle, Lock } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import InterviewFeature from '../InterviewFeature';
import ProjectEvaluator from '../ProjectEvaluator';
import { useStudent } from '../../context/StudentContext';
import '../../styles/student-css/studentdashboard.css';
import '../../styles/student-css/studentapplications.css';


const StudentApplications = () => {
  const { applications, loading, withdrawApplication } = useStudent();
  const [appList, setAppList] = useState([]);

  useEffect(() => {
    if (applications) {
      // Filter out blocked/deleted drives - safety net frontend filter
      const filteredApps = applications.filter(app => {
        return !app.isBlocked && !app.isDeleted && app.status !== 'blocked' && app.status !== 'deleted';
      });
      setAppList(filteredApps);
    }
  }, [applications]);

  const handleWithdraw = async (driveId) => {
    if (window.confirm('Are you sure you want to withdraw your application?')) {
      try {
        await withdrawApplication(driveId);
        setAppList(appList.filter(app => app.driveId !== driveId));
        alert('Application withdrawn successfully');
      } catch (err) {
        console.error('Error withdrawing:', err);
        alert('Failed to withdraw application');
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'shortlisted': return '#10b981';
      case 'interview-scheduled': return '#f59e0b';
      case 'selected': return '#8b5cf6';
      case 'rejected': return '#ef4444';
      default: return '#0ea5e9';
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="student-page-header">
          <h1>My Applications</h1>
          <p>Loading...</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="student-page-header">
        <div>
          <h1>My Applications</h1>
          <p>Track your application status and interview schedules</p>
        </div>
      </div>

      <div className="student-applications-grid">
        {appList && appList.length > 0 ? (
          appList.map((app, index) => (
            <div key={app._id || index} className="student-application-card" style={app.isBlocked || app.blockedDrive ? { opacity: 0.6, position: 'relative' } : {}}>
              {(app.isBlocked || app.blockedDrive) && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  backdropFilter: 'blur(2px)'
                }}>
                  <div style={{
                    backgroundColor: '#fff',
                    padding: '16px',
                    borderRadius: '6px',
                    textAlign: 'center',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                  }}>
                    <Lock size={32} style={{ color: '#f59e0b', marginBottom: '8px' }} />
                    <p style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>Job Drive Blocked</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>This job drive has been blocked by admin</p>
                  </div>
                </div>
              )}
              <div className="student-application-card-header">
                <div className="student-company-logo-large">
                  {app.company?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3>{app.company || 'Unknown Company'}</h3>
                  <p className="student-application-role">{app.position || 'Unknown Position'}</p>
                </div>
              </div>
              <div className="student-application-details">
                <div className="student-application-info-row">
                  <span className="student-info-label">Package:</span>
                  <span className="student-info-value">{app.salary || 'N/A'}</span>
                </div>
                <div className="student-application-info-row">
                  <span className="student-info-label">Location:</span>
                  <span className="student-info-value">{app.location || 'N/A'}</span>
                </div>
                <div className="student-application-info-row">
                  <span className="student-info-label">Applied Date:</span>
                  <span className="student-info-value">
                    {app.applicationDate ? new Date(app.applicationDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="student-application-info-row">
                  <span className="student-info-label">Status:</span>
                  <span 
                    className={`student-status-badge student-status-${app.applicationStatus?.toLowerCase().replace(' ', '-')}`}
                    style={{
                      color: getStatusColor(app.applicationStatus),
                      backgroundColor: getStatusColor(app.applicationStatus) + '20',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    {app.applicationStatus ? 
                      app.applicationStatus.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                      : 'Applied'
                    }
                  </span>
                </div>
              </div>
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button className="student-view-details-btn" style={{flex: 1}} disabled={app.isBlocked || app.blockedDrive}>View Details</button>
                <button 
                  className="student-withdraw-btn"
                  onClick={() => handleWithdraw(app.driveId)}
                  disabled={app.isBlocked || app.blockedDrive}
                  style={{
                    flex: 0.5,
                    backgroundColor: app.isBlocked || app.blockedDrive ? '#ccc' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: app.isBlocked || app.blockedDrive ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Trash2 size={16} />
                  Withdraw
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px'}}>
            <p>You haven't applied to any drives yet. Visit the Job Drives section to apply!</p>
          </div>
        )}
      </div>

      <InterviewFeature />
      <ProjectEvaluator />
    </StudentLayout>
  );
};

export default StudentApplications;