import React, { useState, useEffect } from 'react';
import { Mail, Phone, Briefcase, Eye, MoreVertical, Download, CheckCircle, X, FileText } from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { useRecruiter } from '../../context/RecruiterContext';
import '../../styles/RecruiterCSS/recruitercandidates.css';

const Candidates = () => {
  const [activeMenu, setActiveMenu] = useState('candidates');
  const { drives, getApplications, updateApplicationStatus, getAllCandidates, fetchDrives, recruiter } = useRecruiter();
  const [allApplications, setAllApplications] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch all candidates
  useEffect(() => {
    const fetchAllApplications = async () => {
      try {
        setLoading(true);
        console.log('📋 DEBUG: Drives available:', drives.length);
        console.log('📋 DEBUG: Drives data:', JSON.stringify(drives, null, 2));
        
        const combined = await getAllCandidates();
        console.log('✅ Got candidates:', combined.length);
        console.log('📋 DEBUG: Candidates data:', JSON.stringify(combined, null, 2));
        
        setAllApplications(combined);
        if (drives.length > 0 && !selectedDrive) {
          setSelectedDrive(drives[0]._id);
        }
      } catch (err) {
        console.error('❌ Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    // Always fetch, even if drives is empty initially
    fetchAllApplications();
  }, [drives]);

  // Manual refresh function
  const handleRefreshCandidates = async () => {
    console.log('🔄 Manual refresh triggered');
    try {
      setLoading(true);
      // Refetch drives from backend
      if (recruiter?.firebaseUid) {
        await fetchDrives(recruiter.firebaseUid);
        console.log('✅ Drives refreshed');
      }
    } catch (err) {
      console.error('❌ Failed to refresh:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (driveId, candidateId, newStatus) => {
    try {
      await updateApplicationStatus(driveId, candidateId, newStatus);
      // Update the local state
      setAllApplications(allApplications.map(app => 
        app.studentId === candidateId && app.driveId === driveId 
          ? {...app, applicationStatus: newStatus} 
          : app
      ));
      alert(`Application status updated to: ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
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

  let displayedCandidates = allApplications;
  if (selectedDrive) {
    displayedCandidates = allApplications.filter(app => app.driveId === selectedDrive);
  }

  const CandidateModal = ({ candidate, onClose }) => {
    if (!candidate) return null;
    
    return (
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
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>{candidate.studentName}</h2>
            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'grid', gap: '15px' }}>
            <div className="recruiter-candidate-row">
              <Mail size={16} />
              <span>{candidate.studentEmail}</span>
            </div>
            <div className="recruiter-candidate-row">
              <Phone size={16} />
              <span>{candidate.studentPhone}</span>
            </div>
            <div className="recruiter-candidate-row">
              <Briefcase size={16} />
              <span>{candidate.studentBranch} • CGPA: {candidate.studentCGPA}</span>
            </div>
            <div className="recruiter-candidate-row">
              <span style={{ fontWeight: 'bold' }}>Position:</span>
              <span>{candidate.position}</span>
            </div>
            
            {candidate.studentResume && (
              <div style={{
                padding: '12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FileText size={18} color="#0ea5e9" />
                <a 
                  href={candidate.studentResume} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: '500' }}
                >
                  Download Resume
                </a>
              </div>
            )}

            {candidate.studentGithub && (
              <div>
                <strong>GitHub:</strong>{' '}
                <a href={candidate.studentGithub} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9' }}>
                  {candidate.studentGithub}
                </a>
              </div>
            )}

            {candidate.studentLinkedin && (
              <div>
                <strong>LinkedIn:</strong>{' '}
                <a href={candidate.studentLinkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9' }}>
                  {candidate.studentLinkedin}
                </a>
              </div>
            )}

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                Update Status:
              </label>
              <select 
                onChange={(e) => {
                  handleStatusChange(candidate.driveId, candidate.studentId, e.target.value);
                  onClose();
                }}
                defaultValue={candidate.applicationStatus}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview-scheduled">Interview Scheduled</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
      <div className="recruiter-dashboard-content">
        <div className="recruiter-page-header">
          <div>
            <h1>Candidate Management</h1>
            <p>Review and manage student applications</p>
          </div>
          <div className="recruiter-header-actions">
            <button 
              onClick={handleRefreshCandidates}
              disabled={loading}
              style={{
                padding: '10px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginRight: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {loading ? '⏳ Refreshing...' : '🔄 Refresh Candidates'}
            </button>
            <button className="recruiter-export-btn">
              <Download size={18} />
              Export Data
            </button>
          </div>
        </div>

        {/* Drive Filter */}
        <div style={{marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <button 
            className={`recruiter-filter-btn ${!selectedDrive ? 'active' : ''}`}
            onClick={() => setSelectedDrive(null)}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              backgroundColor: !selectedDrive ? '#0ea5e9' : 'white',
              color: !selectedDrive ? 'white' : 'black'
            }}
          >
            All Drives ({allApplications.length})
          </button>
          {drives.map(drive => (
            <button 
              key={drive._id}
              className={`recruiter-filter-btn ${selectedDrive === drive._id ? 'active' : ''}`}
              onClick={() => setSelectedDrive(drive._id)}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                cursor: 'pointer',
                backgroundColor: selectedDrive === drive._id ? '#0ea5e9' : 'white',
                color: selectedDrive === drive._id ? 'white' : 'black'
              }}
            >
              {drive.position} ({displayedCandidates.filter(c => c.driveId === drive._id).length})
            </button>
          ))}
        </div>

        {loading ? (
          <p>Loading applications...</p>
        ) : (
          <div className="recruiter-candidates-grid">
            {displayedCandidates && displayedCandidates.length > 0 ? (
              displayedCandidates.map((candidate) => (
                <div key={candidate._id || candidate.studentId} className="recruiter-candidate-card">
                  <div className="recruiter-candidate-header">
                    <div className="recruiter-candidate-avatar-large">
                      {candidate.studentName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="recruiter-candidate-info">
                      <h3>{candidate.studentName}</h3>
                      <p>{candidate.studentBranch} • CGPA: {candidate.studentCGPA}</p>
                      <span className="recruiter-cgpa-badge">Applied: {new Date(candidate.applicationDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="recruiter-candidate-details">
                    <div className="recruiter-candidate-row">
                      <Mail size={16} />
                      <span>{candidate.studentEmail}</span>
                    </div>
                    <div className="recruiter-candidate-row">
                      <Phone size={16} />
                      <span>{candidate.studentPhone}</span>
                    </div>
                    <div className="recruiter-candidate-row">
                      <Briefcase size={16} />
                      <span>{candidate.position}</span>
                    </div>
                    <div className="recruiter-candidate-row">
                      <span className="recruiter-label">Year:</span>
                      <span>{candidate.studentYear}</span>
                    </div>
                    <div className="recruiter-candidate-row">
                      <span className="recruiter-label">Roll No:</span>
                      <span>{candidate.studentRollNo}</span>
                    </div>
                    <div className="recruiter-candidate-row">
                      <span className="recruiter-label">Status:</span>
                      <span 
                        className={`recruiter-status-badge recruiter-status-${candidate.applicationStatus.toLowerCase().replace(' ', '-')}`}
                        style={{color: getStatusColor(candidate.applicationStatus), padding: '4px 8px', borderRadius: '4px', backgroundColor: getStatusColor(candidate.applicationStatus) + '20'}}
                      >
                        {candidate.applicationStatus}
                      </span>
                    </div>
                    {/* Student Application Links */}
                    <div style={{marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb'}}>
                      <p style={{margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#666'}}>Application Links:</p>
                      <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                        {candidate.studentResume && (
                          <a href={candidate.studentResume} target="_blank" rel="noopener noreferrer" 
                            style={{padding: '6px 12px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px', color: '#0ea5e9', textDecoration: 'none', border: '1px solid #ddd'}}
                          >
                            📄 Resume
                          </a>
                        )}
                        {candidate.studentPortfolio && (
                          <a href={candidate.studentPortfolio} target="_blank" rel="noopener noreferrer"
                            style={{padding: '6px 12px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px', color: '#0ea5e9', textDecoration: 'none', border: '1px solid #ddd'}}
                          >
                            🌐 Portfolio
                          </a>
                        )}
                        {candidate.studentGithub && (
                          <a href={candidate.studentGithub} target="_blank" rel="noopener noreferrer"
                            style={{padding: '6px 12px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px', color: '#0ea5e9', textDecoration: 'none', border: '1px solid #ddd'}}
                          >
                            🔗 GitHub
                          </a>
                        )}
                        {candidate.studentLinkedin && (
                          <a href={candidate.studentLinkedin} target="_blank" rel="noopener noreferrer"
                            style={{padding: '6px 12px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px', color: '#0ea5e9', textDecoration: 'none', border: '1px solid #ddd'}}
                          >
                            💼 LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="recruiter-candidate-actions" style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <select 
                      onChange={(e) => handleStatusChange(candidate.driveId, candidate.studentId, e.target.value)}
                      defaultValue={candidate.applicationStatus}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview-scheduled">Interview Scheduled</option>
                      <option value="selected">Selected</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button 
                      className="recruiter-view-profile-btn"
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setShowModal(true);
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px'}}>
                <p>No applications yet for this drive.</p>
              </div>
            )}
          </div>
        )}
      </div>
      {showModal && (
        <CandidateModal 
          candidate={selectedCandidate} 
          onClose={() => {
            setShowModal(false);
            setSelectedCandidate(null);
          }}
        />
      )}
    </RecruiterLayout>
  );
};

export default Candidates;