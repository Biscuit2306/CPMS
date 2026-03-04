import React, { useState, useEffect } from 'react';
import { Trash2, AlertCircle, Lock, X, MapPin, Briefcase, DollarSign, Calendar, Building2 } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import InterviewFeature from '../InterviewFeature';
import ProjectEvaluator from '../ProjectEvaluator';
import { useStudent } from '../../context/StudentContext';
import '../../styles/student-css/studentdashboard.css';
import '../../styles/student-css/studentapplications.css';


const StudentApplications = () => {
  const { applications, loading, withdrawApplication, getDriveDetails, searchQuery } = useStudent();
  const [appList, setAppList] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Enrich applications with complete drive details on load
  useEffect(() => {
    const enrichApplications = async () => {
      if (applications && applications.length > 0) {
        // Filter out blocked/deleted drives
        const filteredApps = applications.filter(app => {
          return !app.isBlocked && !app.isDeleted && app.status !== 'blocked' && app.status !== 'deleted';
        });

        // Enrich each application with complete drive details
        const enrichedApps = await Promise.all(
          filteredApps.map(async (app) => {
            try {
              // Check if application already has all required fields
              if (app.salary && app.location && app.company) {
                return app; // Already has complete data
              }

              // Fetch complete drive details to fill in missing fields
              if (app.recruiterId && app.driveId) {
                const driveDetails = await getDriveDetails(app.recruiterId, app.driveId);
                return {
                  ...app,
                  ...driveDetails,
                  // Preserve application-specific fields
                  driveId: app.driveId,
                  recruiterId: app.recruiterId,
                  applicationStatus: app.applicationStatus,
                  applicationDate: app.applicationDate || app.appliedAt,
                };
              }
              return app;
            } catch (err) {
              console.log(`⚠️ Could not enrich application for drive ${app.driveId}:`, err.message);
              return app; // Return original application if enrichment fails
            }
          })
        );

        setAppList(enrichedApps);
      }
    };

    enrichApplications();
  }, [applications, getDriveDetails]);

  const handleViewDetails = async (app) => {
    setSelectedApp(app);
    setShowDetailsModal(true);
    setModalLoading(true);

    try {
      // Try to fetch complete drive details from backend
      // This ensures we have the latest information
      if (app.recruiterId && app.driveId) {
        const driveDetails = await getDriveDetails(app.recruiterId, app.driveId);
        // Merge drive details with application data
        const enrichedApp = {
          ...app,
          ...driveDetails,
          // Preserve application-specific fields
          driveId: app.driveId,
          recruiterId: app.recruiterId,
          applicationStatus: app.applicationStatus,
          applicationDate: app.applicationDate || app.appliedAt,
        };
        setSelectedApp(enrichedApp);
        console.log("✅ Enriched application with complete drive details");
      }
    } catch (err) {
      console.log("⚠️ Could not fetch drive details, using stored application data:", err.message);
      // Continue with stored application data if fetch fails
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedApp(null);
  };

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

  // Filter applications based on search query
  const filteredApplications = appList.filter(app => {
    const query = searchQuery.toLowerCase();
    return query === '' ||
      (app.company || '').toLowerCase().includes(query) ||
      (app.position || '').toLowerCase().includes(query) ||
      (app.location || '').toLowerCase().includes(query) ||
      (app.salary || '').toLowerCase().includes(query);
  });

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
        {filteredApplications && filteredApplications.length > 0 ? (
          filteredApplications.map((app, index) => (
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
                    className={`student-status-badge student-status-${app.applicationStatus?.toLowerCase().replace(/\s+/g, '-')}`}      
                  >
                    {app.applicationStatus ? 
                      app.applicationStatus.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                      : 'Applied'
                    }
                  </span>
                </div>
              </div>
              <div className='student-application-both-btns' >
                <button 
                  className="student-view-details-btn" 
                  onClick={() => handleViewDetails(app)}
                  disabled={app.isBlocked || app.blockedDrive}
                >
                  View Details
                </button>
                <button 
                  className="student-withdraw-btn"
                  onClick={() => handleWithdraw(app.driveId)}
                  disabled={app.isBlocked || app.blockedDrive}
                  
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

      {/* Application Details Modal */}
      {showDetailsModal && selectedApp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            animation: 'slideUp 0.3s ease-out'
          }}>
            {/* Loading State */}
            {modalLoading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 12px'
                  }} />
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Loading details...</p>
                </div>
              </div>
            )}
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              position: 'sticky',
              top: 0,
              backgroundColor: '#fff'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
                Application Details
              </h2>
              <button
                onClick={handleCloseDetailsModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {/* Company & Position Section */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  backgroundColor: getStatusColor(selectedApp.applicationStatus),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px',
                  color: '#fff',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  {selectedApp.company?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                    {selectedApp.company || 'Unknown Company'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                    {selectedApp.position || 'Unknown Position'}
                  </p>
                </div>
              </div>

              {/* Job Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px'
              }}>
                {/* Salary */}
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <DollarSign size={16} style={{ color: '#10b981', marginRight: '8px' }} />
                  <div>
                    <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Package
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {selectedApp.salary || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <MapPin size={16} style={{ color: '#ef4444', marginRight: '8px' }} />
                  <div>
                    <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Location
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {selectedApp.location || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Applied Date */}
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Calendar size={16} style={{ color: '#f59e0b', marginRight: '8px' }} />
                  <div>
                    <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Applied On
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {selectedApp.applicationDate 
                        ? new Date(selectedApp.applicationDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Briefcase size={16} style={{ color: '#8b5cf6', marginRight: '8px' }} />
                  <div>
                    <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Status
                    </p>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '14px', 
                      fontWeight: '600',
                      color: getStatusColor(selectedApp.applicationStatus)
                    }}>
                      {selectedApp.applicationStatus 
                        ? selectedApp.applicationStatus.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')
                        : 'Applied'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              {selectedApp.jobDescription && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    Job Description
                  </h4>
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#4b5563',
                    lineHeight: '1.6',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {selectedApp.jobDescription}
                  </div>
                </div>
              )}

              {/* Company About */}
              {selectedApp.about && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    About Company
                  </h4>
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#4b5563',
                    lineHeight: '1.6'
                  }}>
                    {selectedApp.about || 'No information available'}
                  </div>
                </div>
              )}

              {/* Interview Rounds */}
              {selectedApp.rounds && selectedApp.rounds.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    Interview Process
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {selectedApp.rounds.map((round, idx) => (
                      <div key={idx} style={{
                        padding: '10px 12px',
                        backgroundColor: '#f0f9ff',
                        borderLeft: '3px solid #0ea5e9',
                        borderRadius: '4px',
                        fontSize: '13px',
                        color: '#0369a1'
                      }}>
                        {round}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility Info */}
              {selectedApp.eligibilityCriteria && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    Eligibility Criteria
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    {selectedApp.eligibilityCriteria.minCGPA !== undefined && (
                      <div style={{
                        padding: '10px 12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px',
                        fontSize: '13px'
                      }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                          Min CGPA
                        </p>
                        <p style={{ margin: 0, fontWeight: '600', color: '#1f2937' }}>
                          {selectedApp.eligibilityCriteria.minCGPA || 'N/A'}
                        </p>
                      </div>
                    )}
                    {selectedApp.eligibilityCriteria.yearsEligible?.length > 0 && (
                      <div style={{
                        padding: '10px 12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px',
                        fontSize: '13px'
                      }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                          Years Eligible
                        </p>
                        <p style={{ margin: 0, fontWeight: '600', color: '#1f2937' }}>
                          {selectedApp.eligibilityCriteria.yearsEligible.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Application Deadline */}
              {selectedApp.applicationDeadline && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  borderLeft: '3px solid #f59e0b'
                }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#92400e', fontWeight: '500' }}>
                    Application Deadline
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    {new Date(selectedApp.applicationDeadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '20px 24px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              borderRadius: '0 0 12px 12px'
            }}>
              <button
                onClick={handleCloseDetailsModal}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: '#e5e7eb',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#d1d5db'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleCloseDetailsModal();
                  handleWithdraw(selectedApp.driveId);
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                <Trash2 size={16} />
                Withdraw Application
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <InterviewFeature />
      <ProjectEvaluator />
    </StudentLayout>
  );
};

export default StudentApplications;