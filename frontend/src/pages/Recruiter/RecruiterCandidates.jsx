import React, { useState, useEffect } from 'react';
import { Mail, Phone, Briefcase, Eye, MoreVertical, Download, CheckCircle, X, FileText } from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import SkillRankingModal from '../../components/SkillRankingModal';
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
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);

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
      console.log('🔄 STATUS UPDATE REQUEST:');
      console.log('  Drive ID:', driveId);
      console.log('  Candidate ID:', candidateId);
      console.log('  New Status:', newStatus);
      
      await updateApplicationStatus(driveId, candidateId, newStatus);
      
      // 🔥 CRITICAL: Refresh all candidates after status update
      console.log('🔄 Refreshing candidates to reflect status change...');
      const refreshedCandidates = await getAllCandidates();
      setAllApplications(refreshedCandidates);
      
      console.log('✅ Status updated and candidates refreshed');
      alert(`✅ Application status updated to: ${newStatus}`);
    } catch (err) {
      console.error('❌ Error updating status:', err);
      console.error('   Full error details:', err.response || err.message);
      alert(`❌ Failed to update status: ${err.response?.data?.error || err.message}`);
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
        zIndex: 9999
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
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('👀 View Resume clicked for:', {
                      studentName: candidate.studentName,
                      studentId: candidate.studentId,
                      resumePath: candidate.studentResume,
                      hasResume: !!candidate.studentResume
                    });
                    setSelectedResume(candidate.studentResume);
                    setShowResumeModal(true);
                  }}
                  style={{ 
                    color: '#0ea5e9', 
                    textDecoration: 'none', 
                    fontWeight: '500',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: 'inherit'
                  }}
                >
                  View Resume
                </button>
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

  const ResumeModal = ({ resumeUrl, onClose }) => {
    // Convert relative path to full URL
    let fullResumeUrl = resumeUrl;
    if (resumeUrl && !resumeUrl.startsWith('http')) {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      fullResumeUrl = `${API_BASE}${resumeUrl}`;
    }
    
    console.log('🔍 ResumeModal Debug:', {
      originalUrl: resumeUrl,
      fullUrl: fullResumeUrl,
      isEmpty: !resumeUrl,
      isPdfPath: resumeUrl?.toLowerCase().includes('.pdf')
    });
    
    if (!resumeUrl) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ef4444', fontSize: '1.2rem' }}>Resume Not Available</h3>
            <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '0.95rem' }}>The student has not uploaded a resume yet.</p>
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Close
            </button>
          </div>
        </div>
      );
    }
    
    // Check if it's a PDF URL
    const isPdf = fullResumeUrl.toLowerCase().includes('.pdf') || fullResumeUrl.includes('application/pdf');
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '10px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '0',
          width: '95vw',
          height: '95vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>Resume Preview</h2>
            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '32px', cursor: 'pointer', color: '#6b7280', fontWeight: 'bold', padding: '0', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ×
            </button>
          </div>

          {isPdf ? (
            <iframe
              src={fullResumeUrl}
              style={{
                flex: 1,
                width: '100%',
                border: 'none',
                borderRadius: '0px'
              }}
              title="Resume"
              onError={() => {
                console.error('❌ Failed to load PDF:', fullResumeUrl);
                alert('Error loading PDF. Please try downloading instead.');
              }}
            />
          ) : (
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '40px',
              backgroundColor: '#ffffff',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={fullResumeUrl} 
                alt="Resume" 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  console.error('❌ Failed to load image:', fullResumeUrl);
                  alert('Unable to load resume. The file may not exist or is in an unsupported format.');
                }}
              />
            </div>
          )}

          <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              Close
            </button>
            <a 
              href={fullResumeUrl} 
              download
              style={{
                padding: '10px 20px',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Download
            </a>
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
                          <button 
                            onClick={() => {
                              console.log('📄 Resume button clicked for:', {
                                studentName: candidate.studentName,
                                studentId: candidate.studentId,
                                resumePath: candidate.studentResume,
                                hasResume: !!candidate.studentResume
                              });
                              setSelectedResume(candidate.studentResume);
                              setShowResumeModal(true);
                            }}
                            style={{padding: '6px 12px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px', color: '#0ea5e9', textDecoration: 'none', border: '1px solid #ddd', cursor: 'pointer'}}
                          >
                            📄 Resume
                          </button>
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
      {showResumeModal && (
        <ResumeModal 
          resumeUrl={selectedResume}
          onClose={() => {
            setShowResumeModal(false);
            setSelectedResume(null);
          }}
        />
      )}
      {/* Skill Ranking Modal */}
      <SkillRankingModal />
    </RecruiterLayout>
  );
};

export default Candidates;