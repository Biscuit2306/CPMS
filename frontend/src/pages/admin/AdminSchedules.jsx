import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, Users, Eye, MoreVertical, Clock, CheckCircle, XCircle, AlertCircle, Trash2, Lock } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/admin-css/adminschedules.css';
import axios from 'axios';

const AdminSchedules = () => {
  const { admin, fetchSchedules } = useAdmin();
  const { schedules, schedulesLoading } = useAdmin();
  const [filterStatus, setFilterStatus] = useState('all'); // all, upcoming, ongoing, completed, cancelled, blocked
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [actionModal, setActionModal] = useState({
    type: null,
    scheduleId: null,
    scheduleInfo: null,
    candidates: [],
    selectedCandidateId: null,
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Compute filtered schedules using useMemo instead of useState + useEffect
  const filteredSchedules = useMemo(() => {
    if (!schedules || !Array.isArray(schedules)) {
      return [];
    }

    let filtered = [...schedules];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus || s.status === filterStatus.replace('blocked', 'blocked'));
    }

    // Filter by search text (recruiter name, company, position)
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(s => 
        (s.recruiterName && s.recruiterName.toLowerCase().includes(search)) ||
        (s.company && s.company.toLowerCase().includes(search)) ||
        (s.position && s.position.toLowerCase().includes(search))
      );
    }

    // Sort by date (upcoming first)
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return filtered;
  }, [schedules, filterStatus, searchText]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'scheduled': return <Clock size={16} style={{ color: '#0ea5e9' }} />;
      case 'ongoing': return <AlertCircle size={16} style={{ color: '#f59e0b' }} />;
      case 'completed': return <CheckCircle size={16} style={{ color: '#10b981' }} />;
      case 'cancelled': return <XCircle size={16} style={{ color: '#ef4444' }} />;
      case 'blocked': return <Lock size={16} style={{ color: '#ef4444' }} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return '#0ea5e9';
      case 'ongoing': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'blocked': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleBlockSchedule = async () => {
    if (!actionModal.scheduleId) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/admin/manage/schedule/block/${actionModal.scheduleId}`,
        {
          adminFirebaseUid: admin.firebaseUid,
          adminName: admin.fullName || admin.email,
          reason: actionModal.reason || 'No reason specified',
        }
      );

      if (response.data.success) {
        setSuccessMessage('Interview schedule cancelled successfully. All candidates and recruiter have been notified.');
        setTimeout(() => setSuccessMessage(''), 4000);
        setActionModal({});
        // Refresh schedules list from backend
        await fetchSchedules();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to block schedule');
      console.error('❌ Error blocking schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCandidate = async () => {
    if (!actionModal.scheduleId || !actionModal.selectedCandidateId) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/admin/manage/schedule/${actionModal.scheduleId}/remove-candidate/${actionModal.selectedCandidateId}`,
        {
          adminFirebaseUid: admin.firebaseUid,
          adminName: admin.fullName || admin.email,
          reason: actionModal.reason || 'No reason specified',
        }
      );

      if (response.data.success) {
        setSuccessMessage('Candidate removed from interview. Student has been notified.');
        setTimeout(() => setSuccessMessage(''), 4000);
        setActionModal({});
        // Refresh schedules list from backend
        await fetchSchedules();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to remove candidate');
      console.error('❌ Error removing candidate:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-schedules-wrapper">
        {/* Page Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1>Interview Schedules</h1>
          <p style={{ color: '#6b7280', marginTop: '5px' }}>
            View and manage all interview schedules across the organization
          </p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="admin-message-banner success">
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="admin-message-banner error">
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Filters and Search */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          {/* Search Box */}
          <input
            type="text"
            placeholder="Search by recruiter, company, or position..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              width: '100%'
            }}
          />

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            padding: '15px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9' }}>
              {schedules?.length || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Schedules</div>
          </div>
          <div style={{
            padding: '15px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {schedules?.filter(s => new Date(s.date) > new Date()).length || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Upcoming</div>
          </div>
          <div style={{
            padding: '15px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
              {schedules?.filter(s => s.status === 'completed').length || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Completed</div>
          </div>
          <div style={{
            padding: '15px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ec4899' }}>
              {schedules?.reduce((sum, s) => sum + (s.candidates?.length || 0), 0) || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Candidates</div>
          </div>
          <div style={{
            padding: '15px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              {schedules?.filter(s => s.isBlocked).length || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Blocked</div>
          </div>
        </div>

        {/* Schedules Table/List */}
        {schedulesLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading schedules...</p>
          </div>
        ) : filteredSchedules.length > 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{
              overflowX: 'auto'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>Recruiter / Company</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>Position</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>Date & Time</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>Platform</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>Candidates</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>Status</th>
                    <th style={{ padding: '12px 15px', textAlign: 'center', fontWeight: '600', fontSize: '13px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((schedule, index) => (
                    <tr key={schedule._id || index} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '12px 15px' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{schedule.recruiterName || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{schedule.company || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '12px 15px', fontSize: '14px' }}>{schedule.position || 'N/A'}</td>
                      <td style={{ padding: '12px 15px', fontSize: '14px' }}>
                        <div>{new Date(schedule.date).toLocaleDateString()}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{schedule.time || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '12px 15px', fontSize: '14px' }}>{schedule.platform || 'N/A'}</td>
                      <td style={{ padding: '12px 15px', fontSize: '14px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 8px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '4px'
                        }}>
                          <Users size={14} />
                          <span>{schedule.candidates?.length || 0}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 15px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          backgroundColor: getStatusColor(schedule.status) + '20',
                          color: getStatusColor(schedule.status),
                          borderRadius: '4px',
                          width: 'fit-content',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {getStatusIcon(schedule.status)}
                          <span style={{ textTransform: 'capitalize' }}>{schedule.status}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                          <button
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setShowModal(true);
                            }}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#0ea5e9',
                              padding: '6px'
                            }}
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {!schedule.isBlocked && (
                            <>
                              <button
                                onClick={() => {
                                  setActionModal({
                                    type: 'block',
                                    scheduleId: schedule._id,
                                    scheduleInfo: {
                                      recruiterName: schedule.recruiterName,
                                      position: schedule.position,
                                      date: schedule.date,
                                      candidates: schedule.candidates?.length || 0
                                    }
                                  });
                                }}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#f59e0b',
                                  padding: '6px'
                                }}
                                title="Block Schedule"
                              >
                                <Lock size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setActionModal({
                                    type: 'removeCandidates',
                                    scheduleId: schedule._id,
                                    candidates: schedule.candidates || []
                                  });
                                }}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#ef4444',
                                  padding: '6px'
                                }}
                                title="Remove Candidate"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                          {schedule.isBlocked && (
                            <span style={{
                              fontSize: '12px',
                              color: '#f59e0b',
                              fontWeight: '600',
                              padding: '4px 8px',
                              backgroundColor: '#fef3c7',
                              borderRadius: '4px'
                            }}>
                              BLOCKED
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <Calendar size={48} style={{ color: '#d1d5db', marginBottom: '10px' }} />
            <p style={{ color: '#6b7280', marginBottom: '0' }}>
              No schedules found. {searchText || filterStatus !== 'all' ? 'Try adjusting your filters.' : ''}
            </p>
          </div>
        )}
      </div>

      {showModal && selectedSchedule && (
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
            maxWidth: '600px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Interview Schedule Details</h2>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setSelectedSchedule(null);
                }}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              {/* Recruiter Info */}
              <div className="admin-schedule-section">
                <h3 style={{ marginTop: 0, color: '#0ea5e9' }}>Recruiter Information</h3>
                <div className="admin-schedule-info-row">
                  <span>Recruiter Name:</span>
                  <span style={{ fontWeight: 'bold' }}>{selectedSchedule.recruiterName || 'N/A'}</span>
                </div>
                <div className="admin-schedule-info-row">
                  <span>Company:</span>
                  <span style={{ fontWeight: 'bold' }}>{selectedSchedule.company || 'N/A'}</span>
                </div>
              </div>

              {/* Schedule Details */}
              <div className="admin-schedule-section">
                <h3 style={{ marginTop: 0, color: '#10b981' }}>Schedule Details</h3>
                <div className="admin-schedule-info-row">
                  <span>Position:</span>
                  <span style={{ fontWeight: 'bold' }}>{selectedSchedule.position || 'N/A'}</span>
                </div>
                <div className="admin-schedule-info-row">
                  <span>Date:</span>
                  <span style={{ fontWeight: 'bold' }}>{new Date(selectedSchedule.date).toLocaleDateString()}</span>
                </div>
                <div className="admin-schedule-info-row">
                  <span>Time:</span>
                  <span style={{ fontWeight: 'bold' }}>{selectedSchedule.time || 'N/A'}</span>
                </div>
                <div className="admin-schedule-info-row">
                  <span>Platform:</span>
                  <span style={{ fontWeight: 'bold' }}>{selectedSchedule.platform || 'N/A'}</span>
                </div>
                {selectedSchedule.venue && (
                  <div className="admin-schedule-info-row">
                    <span>Venue:</span>
                    <span style={{ fontWeight: 'bold' }}>{selectedSchedule.venue}</span>
                  </div>
                )}
              </div>

              {/* Candidates Info */}
              <div className="admin-schedule-section">
                <h3 style={{ marginTop: 0, color: '#ec4899' }}>Candidates ({selectedSchedule.candidates?.length || 0})</h3>
                {selectedSchedule.candidates && selectedSchedule.candidates.length > 0 ? (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedSchedule.candidates.map((candidate, index) => (
                      <div key={index} style={{
                        padding: '10px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '4px',
                        marginBottom: '10px'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                          {candidate.studentName || `Student ${index + 1}`}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          <div>Email: {candidate.studentEmail || 'N/A'}</div>
                          <div>Status: <span style={{
                            color: candidate.status === 'attended' ? '#10b981' : 
                                   candidate.status === 'passed' ? '#06b6d4' :
                                   candidate.status === 'failed' ? '#ef4444' : '#0ea5e9',
                            fontWeight: 'bold'
                          }}>{candidate.status || 'scheduled'}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No candidates assigned yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && actionModal.scheduleId && (
        <div className="admin-action-modal-overlay" onClick={() => setActionModal({})}>
          <div className="admin-action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-action-modal-header">
              {actionModal.type === 'block' ? (
                <>
                  <AlertCircle size={24} style={{ color: '#f59e0b' }} />
                  <h2>Cancel Interview Schedule</h2>
                </>
              ) : (
                <>
                  <Trash2 size={24} style={{ color: '#ef4444' }} />
                  <h2>Remove Candidate from Interview</h2>
                </>
              )}
            </div>

            <div className="admin-action-modal-body">
              {actionModal.type === 'block' ? (
                <>
                  <p>Are you sure you want to cancel this interview schedule?</p>
                  <div className="schedule-info">
                    <div><strong>{actionModal.scheduleInfo?.recruiterName}</strong></div>
                    <div>Position: {actionModal.scheduleInfo?.position}</div>
                    <div>Date: {actionModal.scheduleInfo?.date ? new Date(actionModal.scheduleInfo.date).toLocaleDateString() : 'N/A'}</div>
                    <div>Candidates: {actionModal.scheduleInfo?.candidates || 0}</div>
                  </div>
                  <p style={{ color: '#666', fontSize: '13px' }}>All {actionModal.scheduleInfo?.candidates || 0} candidates and the recruiter will be notified.</p>
                </>
              ) : (
                <>
                  <p>Are you sure you want to remove this candidate from the interview?</p>
                  {actionModal.candidates && actionModal.candidates.length > 0 && (
                    <div className="schedule-info">
                      <strong>Select candidate to remove:</strong>
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {actionModal.candidates.map(candidate => (
                          <label key={candidate.studentId} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input 
                              type="radio" 
                              name="candidate" 
                              value={candidate.studentId}
                              checked={actionModal.selectedCandidateId === candidate.studentId}
                              onChange={(e) => setActionModal({ ...actionModal, selectedCandidateId: e.target.value })}
                            />
                            <span>{candidate.studentName || 'Unknown'} ({candidate.studentEmail || 'N/A'})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <label>Reason (required)</label>
              <textarea
                value={actionModal.reason || ''}
                onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
                placeholder="Explain the reason for this action..."
              />
            </div>

            <div className="admin-action-modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setActionModal({})}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={() => {
                  if (actionModal.type === 'block') {
                    handleBlockSchedule();
                  } else {
                    actionModal.selectedCandidateId && handleRemoveCandidate();
                  }
                }}
                disabled={loading || !actionModal.reason}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSchedules;
