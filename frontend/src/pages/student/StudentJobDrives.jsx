import React, { useState, useEffect } from 'react';
import { DollarSign, MapPin, Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import InterviewFeature from '../InterviewFeature';
import ProjectEvaluator from '../ProjectEvaluator';
import { useStudent } from '../../context/StudentContext';
import '../../styles/student-css/studentdashboard.css';
import '../../styles/student-css/studentjobdrives.css';


const StudentJobDrives = () => {
  const [filterCategory, setFilterCategory] = useState('all');
  const {
    jobDrives,
    drivesLoading,
    applications,
    applyForDrive,
    getDriveDetails,
    student,
    fetchApplications,
    searchQuery,
  } = useStudent();

  const [appliedDriveIds, setAppliedDriveIds] = useState(
    applications.map(app => app.driveId)
  );
  const [enrichedDrives, setEnrichedDrives] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Enrich drives with complete details ────────────────────────────────────
  useEffect(() => {
    const enrichDrives = async () => {
      if (!jobDrives || jobDrives.length === 0) return;

      const enriched = await Promise.all(
        jobDrives.map(async (drive) => {
          try {
            if (drive.salary && drive.location && drive.position && drive.company) {
              return drive; // Already complete
            }
            if (drive.recruiterId && drive._id) {
              const driveDetails = await getDriveDetails(drive.recruiterId, drive._id);
              return {
                ...drive,
                ...driveDetails,
                _id: drive._id,
                recruiterId: drive.recruiterId,
                status: drive.status,
              };
            }
            return drive;
          } catch (err) {
            console.log(`⚠️ Could not enrich drive ${drive._id}:`, err.message);
            return drive;
          }
        })
      );
      setEnrichedDrives(enriched);
    };

    enrichDrives();
  }, [jobDrives, getDriveDetails]);

  // ─── Sync appliedDriveIds from student.applications ─────────────────────────
  useEffect(() => {
    if (student?.applications && Array.isArray(student.applications)) {
      console.log('📊 StudentJobDrives: Applications updated, count:', student.applications.length);
      const ids = student.applications.map(app => app.driveId);
      setAppliedDriveIds(ids);
    }
  }, [student?.applications]);

  // ─── Initial fetch on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (student?.firebaseUid) {
      console.log('🔄 StudentJobDrives: Initial refresh on mount');
      fetchApplications(student.firebaseUid);
    }
  }, [student?.firebaseUid]);

  // ─── Removed aggressive 3-second polling (was causing infinite loop) ────────
  // Applications now refresh only on mount and when user performs actions
  // (apply, withdraw, etc.) - no constant polling needed

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const getApplicationStatus = (driveId) => {
    if (!student?.applications) return null;
    const app = student.applications.find(a => a.driveId === driveId);
    return app ? app.applicationStatus : null;
  };

  const getStatusMessage = (status) => {
    const messages = {
      'applied': 'Your application is under review',
      'shortlisted': '✨ You have been shortlisted!',
      'interview-scheduled': '📅 Your interview has been scheduled',
      'selected': '🎉 Congratulations! You have been selected!',
      'rejected': '❌ Your application has been rejected',
    };
    return messages[status] || null;
  };

  const getStatusColor = (status) => {
    const colors = {
      'applied': '#0ea5e9',
      'shortlisted': '#f59e0b',
      'interview-scheduled': '#8884d8',
      'selected': '#10b981',
      'rejected': '#ef4444',
    };
    return colors[status] || '#gray';
  };

  // ─── Manual refresh ──────────────────────────────────────────────────────────
  const handleManualRefresh = async () => {
    if (!student?.firebaseUid) return;
    setIsRefreshing(true);
    try {
      console.log('🔄 StudentJobDrives: Manual refresh triggered');
      await fetchApplications(student.firebaseUid);
      setLastRefreshTime(new Date().toLocaleTimeString());
      alert('✅ Applications refreshed successfully!');
    } catch (err) {
      console.error('❌ Manual refresh failed:', err);
      alert('❌ Failed to refresh applications');
    } finally {
      setIsRefreshing(false);
    }
  };

  // ─── Apply handler ───────────────────────────────────────────────────────────
  const handleApply = async (driveId, recruiterId) => {
    try {
      await applyForDrive(recruiterId, driveId);
      setAppliedDriveIds(prev => [...prev, driveId]);
      alert('Applied successfully!');
    } catch (err) {
      console.error('Error applying:', err);
      alert(err.response?.data?.error || 'Failed to apply. You may have already applied to this drive.');
    }
  };

  // ─── Loading state ───────────────────────────────────────────────────────────
  if (drivesLoading) {
    return (
      <StudentLayout>
        <div className="student-page-header">
          <h1>Job Drives</h1>
          <p>Loading available drives...</p>
        </div>
      </StudentLayout>
    );
  }

  // ─── Filter drives ───────────────────────────────────────────────────────────
  const filteredDrives = enrichedDrives.filter(drive => {
    const matchesCategory = 
      filterCategory === 'all' ? true :
      filterCategory === 'on-campus' ? drive.type === 'On Campus' :
      filterCategory === 'off-campus' ? drive.type === 'Off Campus' :
      filterCategory === 'applied' ? appliedDriveIds.includes(drive._id) :
      true;

    const query = searchQuery.toLowerCase();
    const matchesSearch = query === '' || 
      (drive.company || drive.companyName || '').toLowerCase().includes(query) ||
      (drive.position || '').toLowerCase().includes(query) ||
      (drive.location || '').toLowerCase().includes(query) ||
      (drive.salary || '').toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <StudentLayout>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="student-page-header">
        <div className="student-driver-banner-header">
          <h1>Job Drives</h1>
          <p>Browse and apply to upcoming placement drives</p>
        </div>

        <div className="student-filter-section">
          <button
            className={`student-filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
            onClick={() => setFilterCategory('all')}
          >
            All Drives ({enrichedDrives.length})
          </button>
          <button
            className={`student-filter-btn ${filterCategory === 'applied' ? 'active' : ''}`}
            onClick={() => setFilterCategory('applied')}
          >
            My Applications ({appliedDriveIds.length})
          </button>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#4F1C51',
              color: 'white',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isRefreshing ? 0.6 : 1,
              transition: 'all 0.3s',
            }}
          >
            <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
          </button>
        </div>
      </div>

      <div className="student-job-drives-grid">
        {filteredDrives && filteredDrives.length > 0 ? (
          filteredDrives.map((drive) => {
            const hasApplied = appliedDriveIds.includes(drive._id);
            const applicationStatus = getApplicationStatus(drive._id);
            const isDeadlinePassed = new Date(drive.applicationDeadline) < new Date();

            return (
              <div key={drive._id} className="student-job-drive-card">
                {/* Card Header */}
                <div className="student-job-drive-header">
                  <div className="student-company-logo-large">
                    {(drive.company || drive.companyName || drive.position)?.charAt(0) || 'J'}
                  </div>
                  <div className="student-job-drive-title">
                    <h3>{drive.company || drive.companyName || drive.position || 'Company'}</h3>
                    <span className={`student-drive-type-badge ${drive.status?.toLowerCase()}`}>
                      {drive.status === 'active' ? 'Hiring' : drive.status === 'scheduled' ? 'Upcoming' : drive.status}
                    </span>
                  </div>
                </div>

                {/* Role */}
                <h4 className="student-job-role">{drive.position}</h4>

                {/* Details */}
                <div className="student-job-details">
                  <div className="student-job-detail-item">
                    <DollarSign size={16} />
                    <span>{drive.salary || 'N/A'}</span>
                  </div>
                  <div className="student-job-detail-item">
                    <MapPin size={16} />
                    <span>{drive.location || 'N/A'}</span>
                  </div>
                  <div className="student-job-detail-item">
                    <Calendar size={16} />
                    <span>{drive.date ? new Date(drive.date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="student-job-detail-item">
                    <Clock size={16} />
                    <span>Deadline: {drive.applicationDeadline ? new Date(drive.applicationDeadline).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                {/* CGPA & Applicants */}
                <div className="student-drive-CGPA-applicants">
                  <strong>Min CGPA:</strong> {drive.eligibilityCriteria?.minCGPA || 0} |{' '}
                  <strong>Applicants:</strong> {drive.applications?.length || 0}
                </div>

                {/* Application Status Banner */}
                {applicationStatus && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px',
                      backgroundColor: getStatusColor(applicationStatus) + '20',
                      borderLeft: `4px solid ${getStatusColor(applicationStatus)}`,
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: getStatusColor(applicationStatus),
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {applicationStatus === 'rejected' && <AlertCircle size={16} />}
                      {applicationStatus === 'selected' && <CheckCircle size={16} />}
                      {(applicationStatus === 'shortlisted' || applicationStatus === 'interview-scheduled') && (
                        <TrendingUp size={16} />
                      )}
                      <span>{getStatusMessage(applicationStatus)}</span>
                    </div>
                  </div>
                )}

                {/* Apply Button */}
                <button
                  className={`student-job-apply-btn ${hasApplied || isDeadlinePassed ? 'disabled' : ''}`}
                  disabled={hasApplied || isDeadlinePassed || applicationStatus === 'rejected'}
                  onClick={() => handleApply(drive._id, drive.recruiterId)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
                >
                  {applicationStatus === 'rejected' ? (
                    <><AlertCircle size={16} /> Application Rejected</>
                  ) : applicationStatus === 'selected' ? (
                    <><CheckCircle size={16} /> Selected</>
                  ) : hasApplied ? (
                    <><CheckCircle size={16} /> Already Applied</>
                  ) : isDeadlinePassed ? (
                    'Deadline Passed'
                  ) : (
                    'Apply Now'
                  )}
                </button>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <p>No drives available at the moment.</p>
          </div>
        )}
      </div>

      <InterviewFeature />
      <ProjectEvaluator />
    </StudentLayout>
  );
};

export default StudentJobDrives;