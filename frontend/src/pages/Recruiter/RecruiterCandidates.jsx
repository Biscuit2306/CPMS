import React, { useState, useEffect } from 'react';
import { Mail, Phone, Briefcase, Eye, MoreVertical, Download, CheckCircle, X, FileText, Sparkles } from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import SkillRankingModal from '../../components/SkillRankingModal';
import { useRecruiter } from '../../context/RecruiterContext';
import '../../styles/RecruiterCSS/recruitercandidates.css';

const Candidates = () => {
  const [activeMenu, setActiveMenu] = useState('candidates');
  const { drives, getApplications, updateApplicationStatus, getAllCandidates, fetchDrives, recruiter, searchQuery } = useRecruiter();
  const [allApplications, setAllApplications] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [showSkillRanking, setShowSkillRanking] = useState(false);
  const [selectedDriveForRanking, setSelectedDriveForRanking] = useState(null);


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
    switch (status) {
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
  // apply global search filter
  const query = (searchQuery || '').trim().toLowerCase();
  if (query) {
    displayedCandidates = displayedCandidates.filter(c =>
      (c.studentName || '').toLowerCase().includes(query) ||
      (c.studentEmail || '').toLowerCase().includes(query) ||
      (c.position || '').toLowerCase().includes(query)
    );
  }

  const CandidateModal = ({ candidate, onClose }) => {
    if (!candidate) return null;

    return (
      <div className="rc-modal-overlay">
        <div className="rc-modal-box">
          <div className="rc-modal-header">
            <h2 className="rc-modal-title">{candidate.studentName}</h2>
            <button onClick={onClose} className="rc-modal-close-btn">×</button>
          </div>

          <div className="rc-modal-body">
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
              <span className="rc-modal-label">Position:</span>
              <span>{candidate.position}</span>
            </div>

            {candidate.studentResume && (
              <div className="rc-modal-resume-row">
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
                  className="rc-modal-resume-btn"
                >
                  View Resume
                </button>
              </div>
            )}

            {candidate.studentGithub && (
              <div>
                <strong>GitHub:</strong>{' '}
                <a href={candidate.studentGithub} target="_blank" rel="noopener noreferrer" className="rc-modal-link">
                  {candidate.studentGithub}
                </a>
              </div>
            )}

            {candidate.studentLinkedin && (
              <div>
                <strong>LinkedIn:</strong>{' '}
                <a href={candidate.studentLinkedin} target="_blank" rel="noopener noreferrer" className="rc-modal-link">
                  {candidate.studentLinkedin}
                </a>
              </div>
            )}

            <div className="rc-modal-status-section">
              <label className="rc-modal-status-label">Update Status:</label>
              <select
                onChange={(e) => {
                  handleStatusChange(candidate.driveId, candidate.studentId, e.target.value);
                  onClose();
                }}
                defaultValue={candidate.applicationStatus}
                className="rc-modal-status-select"
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
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cpms-xtz8.onrender.com";
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
        <div className="rc-modal-overlay rc-modal-overlay--dark">
          <div className="rc-resume-empty-box">
            <h3 className="rc-resume-empty-title">Resume Not Available</h3>
            <p className="rc-resume-empty-desc">The student has not uploaded a resume yet.</p>
            <button onClick={onClose} className="rc-resume-empty-close-btn">Close</button>
          </div>
        </div>
      );
    }

    // Check if it's a PDF URL
    const isPdf = fullResumeUrl.toLowerCase().includes('.pdf') || fullResumeUrl.includes('application/pdf');

    return (
      <div className="rc-modal-overlay rc-modal-overlay--dark rc-modal-overlay--padded">
        <div className="rc-resume-viewer-box">
          <div className="rc-resume-viewer-header">
            <h2 className="rc-resume-viewer-title">Resume Preview</h2>
            <button onClick={onClose} className="rc-resume-viewer-close-btn">×</button>
          </div>

          {isPdf ? (
            <iframe
              src={fullResumeUrl}
              className="rc-resume-iframe"
              title="Resume"
              onError={() => {
                console.error('❌ Failed to load PDF:', fullResumeUrl);
                alert('Error loading PDF. Please try downloading instead.');
              }}
            />
          ) : (
            <div className="rc-resume-img-wrapper">
              <img
                src={fullResumeUrl}
                alt="Resume"
                className="rc-resume-img"
                onError={(e) => {
                  console.error('❌ Failed to load image:', fullResumeUrl);
                  alert('Unable to load resume. The file may not exist or is in an unsupported format.');
                }}
              />
            </div>
          )}

          <div className="rc-resume-viewer-footer">
            <button onClick={onClose} className="rc-resume-footer-close-btn">Close</button>
            <a href={fullResumeUrl} download className="rc-resume-footer-download-btn">Download</a>
          </div>
        </div>
      </div>
    );
  };

  // New Modal: AI Ranking Results
  return (
    <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
      <div className="recruiter-dashboard-content">
        <div className="recruiter-page-header">
          <div>
            <h1>Candidate Management</h1>
            <p>Review and manage student applications</p>
          </div>
          <div className="recruiter-header-actions">
            <button className="rc-refresh-btn" onClick={handleRefreshCandidates} disabled={loading}>
              {loading ? '⏳ Refreshing...' : '🔄 Refresh Candidates'}
            </button>
            <button className="recruiter-export-btn">
              <Download size={18} />
              Export Data
            </button>
          </div>
        </div>
        {/* Drive Filter */}
        <div className="rc-drive-filter-bar">
          <button
            className={`rc-drive-filter-btn ${!selectedDrive ? ' rc-drive-filter-btn--active' : ''}`}
            onClick={() => setSelectedDrive(null)}
          >
            All Drives ({allApplications.length})
          </button>
          {drives.map(drive => (
            <button
              key={drive._id}
              className={`rc-drive-filter-btn${selectedDrive === drive._id ? ' rc-drive-filter-btn--active' : ''}`}
              onClick={() => setSelectedDrive(drive._id)}
            >
              {drive.position} ({displayedCandidates.filter(c => c.driveId === drive._id).length})
            </button>
          ))}

          {/* AI Rank Candidates Button */}
          {selectedDrive && displayedCandidates.length > 0 && (
            <button className="rc-ai-rank-btn" onClick={() => {
              const driveData = drives.find(d => d._id === selectedDrive);
              const candidatesForDrive = displayedCandidates.filter(c => c.driveId === selectedDrive);
              setSelectedDriveForRanking({ ...driveData, filterCandidates: candidatesForDrive });
              setShowSkillRanking(true);
            }}>
              <Sparkles size={16} />
              AI Rank Candidates
            </button>
          )}
        </div>

        {loading ? (
          <p>Loading applications...</p>
        ) : (
          <div className="recruiter-candidates-grid">
            {displayedCandidates && displayedCandidates.length > 0 ? (
              displayedCandidates.map((candidate, index) => (
                <div key={candidate._id || candidate.studentId || `candidate-${index}`}
                  className="recruiter-candidate-card">
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
                      <span className={`recruiter-status-badge recruiter-status-${candidate.applicationStatus.toLowerCase().replace(' ', '-')}`}>
                        {candidate.applicationStatus}
                      </span>
                    </div>
                    {/* Student Application Links */}
                    <div className="rc-card-links-section">
                      <p className="rc-card-links-label">Application Links:</p>
                      <div className="rc-card-links-row">
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
                            className="rc-card-link-btn"
                          >
                            📄 Resume
                          </button>
                        )}
                        {candidate.studentPortfolio && (
                          <a href={candidate.studentPortfolio} target="_blank" rel="noopener noreferrer" className="rc-card-link-btn rc-card-link-btn--anchor">
                            🌐 Portfolio
                          </a>
                        )}
                        {candidate.studentGithub && (
                          <a href={candidate.studentGithub} target="_blank" rel="noopener noreferrer" className="rc-card-link-btn rc-card-link-btn--anchor">
                            🔗 GitHub
                          </a>
                        )}
                        {candidate.studentLinkedin && (
                          <a href={candidate.studentLinkedin} target="_blank" rel="noopener noreferrer" className="rc-card-link-btn rc-card-link-btn--anchor">
                            💼 LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="recruiter-candidate-actions rc-card-actions">
                    <select
                      onChange={(e) => handleStatusChange(candidate.driveId, candidate.studentId, e.target.value)}
                      defaultValue={candidate.applicationStatus}
                      className="rc-card-status-select"
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
              <div className="rc-empty-state">
                <p>{query
                    ? `No candidates match "${searchQuery}"`
                    : 'No applications yet for this drive.'}
                </p>
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
      {selectedDriveForRanking && (
        <SkillRankingModal
          drive={selectedDriveForRanking}
          isOpen={showSkillRanking}
          onClose={() => setShowSkillRanking(false)}
        />
      )}
    </RecruiterLayout>
  );
};

export default Candidates;