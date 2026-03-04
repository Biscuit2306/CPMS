import React, { useState, useEffect } from 'react';
import {
  X, Loader, TrendingUp, Award, AlertCircle, Download
} from 'lucide-react';
import axios from 'axios';

const SkillRankingModal = ({ drive, isOpen, onClose }) => {
  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    if (isOpen && drive) {
      // Check if filterCandidates exists (passed from RecruiterCandidates)
      const candidates = drive.filterCandidates || drive.applicants || [];
      if (candidates.length > 0) {
        rankCandidates();
      }
    }
  }, [isOpen, drive]);

  const rankCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get candidates from either filterCandidates (passed from page) or applicants (from modal entry)
      const candidates = drive.filterCandidates || drive.applicants || [];
      console.log("📊 DEBUG - Drive data:", drive);
      console.log("📊 DEBUG - Candidates:", candidates);
      console.log("📊 DEBUG - Using filterCandidates?", !!drive.filterCandidates);

      // Extract student IDs from candidates
      const candidateIds = candidates
        .map((candidate) => {
          // Student objects have studentId or firebaseUid or maybe _id
          const id = candidate.studentId || candidate.firebaseUid || candidate._id;
          console.log("📊 DEBUG - Candidate:", { candidate, extractedId: id });
          return id;
        })
        .filter(id => id); // Remove undefined values

      console.log("🚀 Ranking candidates with IDs:", candidateIds);

      // Validate we have candidate IDs
      if (candidateIds.length === 0) {
        setError("No valid candidate IDs found. Please ensure candidates have been properly registered.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `/api/recruiter/rank-candidates/${drive._id}`,
        {
          candidateIds,
          jobDescription: drive.jobDescription || '',
        }
      );

      if (response.data.success) {
        setRankedCandidates(response.data.data);
        console.log("✅ Ranking completed:", response.data.data);
      }
    } catch (err) {
      console.error("❌ Ranking error:", err);
      console.error("❌ Error response:", err.response?.data);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Failed to rank candidates"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          maxWidth: '900px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          cursor: 'default',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            borderBottom: '2px solid #f3e8ff',
            paddingBottom: '1rem',
          }}
        >
          <div>
            <h2
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <TrendingUp size={28} style={{ color: '#4F1C51' }} />
              AI Skill Ranking
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
              {drive.position} - {drive.company}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X size={28} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                border: '3px solid #f3e8ff',
                borderTop: '3px solid #4F1C51',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>
              Analyzing candidate resumes and skills...
            </p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={24} style={{ color: '#dc2626', flexShrink: 0 }} />
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#991b1b' }}>
                Ranking Failed
              </p>
              <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.95rem' }}>
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Ranked Candidates */}
        {!loading && rankedCandidates.length > 0 && (
          <div>
            {/* Summary Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '1rem',
                }}
              >
                <p style={{ margin: '0 0 0.5rem 0', color: '#65a30d', fontSize: '0.85rem', fontWeight: '600' }}>
                  Total Candidates
                </p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#166534' }}>
                  {rankedCandidates.length}
                </p>
              </div>
              <div
                style={{
                  background: '#fef3c7',
                  border: '1px solid #fde047',
                  borderRadius: '8px',
                  padding: '1rem',
                }}
              >
                <p style={{ margin: '0 0 0.5rem 0', color: '#9a3412', fontSize: '0.85rem', fontWeight: '600' }}>
                  Top Score
                </p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#92400e' }}>
                  {Math.max(...rankedCandidates.map((c) => c.skillScore || 0))}
                </p>
              </div>
              <div
                style={{
                  background: '#dbeafe',
                  border: '1px solid #7dd3fc',
                  borderRadius: '8px',
                  padding: '1rem',
                }}
              >
                <p style={{ margin: '0 0 0.5rem 0', color: '#0c4a6e', fontSize: '0.85rem', fontWeight: '600' }}>
                  Avg Score
                </p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0c4a6e' }}>
                  {(
                    rankedCandidates.reduce((sum, c) => sum + (c.skillScore || 0), 0) /
                    rankedCandidates.length
                  ).toFixed(1)}
                </p>
              </div>
            </div>

            {/* Ranked List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {rankedCandidates.map((candidate, index) => (
                <div
                  key={candidate._id || candidate.studentId || `candidate-${index}`}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e9d5f0',
                    background: '#f9f5fb',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: selectedCandidate?._id === candidate._id ? 'translateY(-2px)' : 'none',
                    boxShadow:
                      selectedCandidate?._id === candidate._id
                        ? '0 10px 15px rgba(0, 0, 0, 0.1)'
                        : 'none',
                  }}
                  onClick={() =>
                    setSelectedCandidate(
                      selectedCandidate?._id === candidate._id ? null : candidate
                    )
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3e8ff';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCandidate?._id !== candidate._id) {
                      e.currentTarget.style.background = '#f9f5fb';
                    }
                  }}
                >
                  {/* Rank Badge and Name */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background:
                          index === 0
                            ? '#fbbf24'
                            : index === 1
                            ? '#d1d5db'
                            : index === 2
                            ? '#f97316'
                            : '#4F1C51',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '1.2rem',
                        flexShrink: 0,
                      }}
                    >
                      {index === 0
                        ? '🥇'
                        : index === 1
                        ? '🥈'
                        : index === 2
                        ? '🥉'
                        : index + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: '#1f2937',
                        }}
                      >
                        {candidate.name}
                      </h4>
                      <p
                        style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '0.85rem',
                          color: '#64748b',
                        }}
                      >
                        {candidate.email}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          flexWrap: 'wrap',
                          marginTop: '0.25rem',
                        }}
                      >
                        {candidate.branch && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              background: '#dbeafe',
                              color: '#0c4a6e',
                              borderRadius: '4px',
                              fontWeight: '500',
                            }}
                          >
                            {candidate.branch}
                          </span>
                        )}
                        {candidate.cgpa && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              background: '#dcfce7',
                              color: '#166534',
                              borderRadius: '4px',
                              fontWeight: '500',
                            }}
                          >
                            CGPA: {candidate.cgpa}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skill Score */}
                  <div
                    style={{
                      background: 'white',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      marginBottom: '0.75rem',
                      border: '1px solid #e9d5f0',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#64748b',
                        }}
                      >
                        Skill Score
                      </p>
                      <span
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: '#4F1C51',
                        }}
                      >
                        {candidate.skillScore || 0}/100
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        background: '#e9d5f0',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          background: `linear-gradient(90deg, #4F1C51 0%, #9f1239 100%)`,
                          width: `${candidate.skillScore || 0}%`,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Fit Rating */}
                  {candidate.fitRating && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem',
                        fontSize: '0.9rem',
                      }}
                    >
                      <span style={{ color: '#64748b', fontWeight: '500' }}>
                        Job Fit:
                      </span>
                      <span
                        style={{
                          fontWeight: '600',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '4px',
                          background:
                            candidate.fitRating === 'Excellent'
                              ? '#dcfce7'
                              : candidate.fitRating === 'Good'
                              ? '#dbeafe'
                              : candidate.fitRating === 'Average'
                              ? '#fef3c7'
                              : '#fee2e2',
                          color:
                            candidate.fitRating === 'Excellent'
                              ? '#166534'
                              : candidate.fitRating === 'Good'
                              ? '#0c4a6e'
                              : candidate.fitRating === 'Average'
                              ? '#92400e'
                              : '#991b1b',
                        }}
                      >
                        {candidate.fitRating}
                      </span>
                    </div>
                  )}

                  {/* Top Skills */}
                  {candidate.skills?.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <p
                        style={{
                          margin: '0 0 0.5rem 0',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#64748b',
                        }}
                      >
                        Top Skills:
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        {candidate.skills.slice(0, 5).map((skill, i) => (
                          <span
                              key={`${candidate._id || candidate.studentId}-skill-${i}`}
                            style={{
                              fontSize: '0.8rem',
                              padding: '0.3rem 0.7rem',
                              background: '#4F1C51',
                              color: 'white',
                              borderRadius: '4px',
                              fontWeight: '500',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expanded View */}
                  {selectedCandidate?._id === candidate._id && (
                    <div
                      style={{
                        borderTop: '1px solid #e9d5f0',
                        paddingTop: '1rem',
                        marginTop: '1rem',
                      }}
                    >
                      {/* Strengths */}
                      {candidate.topStrengths?.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <p
                            style={{
                              margin: '0 0 0.5rem 0',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              color: '#1f2937',
                            }}
                          >
                            <Award
                              size={16}
                              style={{ marginRight: '0.5rem' }}
                              className="inline"
                            />{' '}
                            Key Strengths
                          </p>
                          <ul
                            style={{
                              margin: 0,
                              paddingLeft: '1.5rem',
                              color: '#1f2937',
                            }}
                          >
                            {candidate.topStrengths.map((strength, i) => (
                              <li key={`${candidate._id || candidate.studentId}-strength-${i}`} style={{ marginBottom: '0.25rem' }}>
                                <span style={{ fontSize: '0.9rem' }}>
                                  {strength}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {candidate.recommendations?.length > 0 && (
                        <div>
                          <p
                            style={{
                              margin: '0 0 0.5rem 0',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              color: '#1f2937',
                            }}
                          >
                            💡 Recommendations
                          </p>
                          <ul
                            style={{
                              margin: 0,
                              paddingLeft: '1.5rem',
                              color: '#1f2937',
                            }}
                          >
                            {candidate.recommendations.map((rec, i) => (
                              <li key={`${candidate._id || candidate.studentId}-recommendation-${i}`} style={{ marginBottom: '0.25rem' }}>
                                <span style={{ fontSize: '0.9rem' }}>
                                  {rec}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Summary */}
                      {candidate.summary && (
                        <div style={{ marginTop: '1rem' }}>
                          <p
                            style={{
                              margin: '0 0 0.5rem 0',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              color: '#1f2937',
                            }}
                          >
                            📝 Summary
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '0.9rem',
                              color: '#64748b',
                              lineHeight: '1.5',
                            }}
                          >
                            {candidate.summary}
                          </p>
                        </div>
                      )}

                      {/* Error Message */}
                      {candidate.error && (
                        <div style={{ marginTop: '1rem' }}>
                          <div
                            style={{
                              background: '#fee2e2',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              padding: '0.75rem',
                              display: 'flex',
                              gap: '0.75rem',
                              alignItems: 'flex-start',
                            }}
                          >
                            <AlertCircle size={18} style={{ color: '#991b1b', flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <p
                                style={{
                                  margin: '0 0 0.25rem 0',
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  color: '#991b1b',
                                }}
                              >
                                Evaluation Error
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: '0.8rem',
                                  color: '#7f1d1d',
                                  lineHeight: '1.4',
                                }}
                              >
                                {candidate.error}
                              </p>
                              {candidate.resumePath && (
                                <p
                                  style={{
                                    margin: '0.25rem 0 0 0',
                                    fontSize: '0.75rem',
                                    color: '#7f1d1d',
                                    fontStyle: 'italic',
                                  }}
                                >
                                  Resume path: {candidate.resumePath}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Links */}
                      <div
                        style={{
                          marginTop: '1rem',
                          paddingTop: '1rem',
                          borderTop: '1px solid #e9d5f0',
                          display: 'flex',
                          gap: '0.75rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        {candidate.github && (
                          <a
                            href={candidate.github}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '0.85rem',
                              padding: '0.5rem 0.75rem',
                              background: '#1f2937',
                              color: 'white',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              fontWeight: '500',
                            }}
                          >
                            GitHub
                          </a>
                        )}
                        {candidate.linkedin && (
                          <a
                            href={candidate.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '0.85rem',
                              padding: '0.5rem 0.75rem',
                              background: '#0a66c2',
                              color: 'white',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              fontWeight: '500',
                            }}
                          >
                            LinkedIn
                          </a>
                        )}
                        {candidate.portfolio && (
                          <a
                            href={candidate.portfolio}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '0.85rem',
                              padding: '0.5rem 0.75rem',
                              background: '#4F1C51',
                              color: 'white',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              fontWeight: '500',
                            }}
                          >
                            Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Candidates */}
        {!loading && rankedCandidates.length === 0 && !error && (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#64748b',
            }}
          >
            <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1.1rem' }}>No candidates to rank</p>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e9d5f0',
          }}
        >
          <button
            onClick={rankCandidates}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              border: '1px solid #4F1C51',
              background: 'white',
              color: '#4F1C51',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Ranking...' : 'Re-Rank'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              border: 'none',
              background: '#4F1C51',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillRankingModal;
