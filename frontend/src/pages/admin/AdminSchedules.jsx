import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, Users, Eye, MoreVertical, Clock, CheckCircle, XCircle, AlertCircle, Trash2, Lock } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/admin-css/adminschedules.css';
import axios from 'axios';

const AdminSchedules = () => {
  const { admin, fetchSchedules } = useAdmin();
  const { schedules, schedulesLoading } = useAdmin();
  const [filterStatus, setFilterStatus] = useState('all');
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

  const filteredSchedules = useMemo(() => {
    if (!schedules || !Array.isArray(schedules)) return [];

    let filtered = [...schedules];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(s =>
        (s.recruiterName && s.recruiterName.toLowerCase().includes(search)) ||
        (s.company && s.company.toLowerCase().includes(search)) ||
        (s.position && s.position.toLowerCase().includes(search))
      );
    }

    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    return filtered;
  }, [schedules, filterStatus, searchText]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'scheduled': return <Clock size={16} className="admin-status-icon admin-status-icon--scheduled" />;
      case 'ongoing':   return <AlertCircle size={16} className="admin-status-icon admin-status-icon--ongoing" />;
      case 'completed': return <CheckCircle size={16} className="admin-status-icon admin-status-icon--completed" />;
      case 'cancelled': return <XCircle size={16} className="admin-status-icon admin-status-icon--cancelled" />;
      case 'blocked':   return <Lock size={16} className="admin-status-icon admin-status-icon--blocked" />;
      default:          return <Clock size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return '#0ea5e9';
      case 'ongoing':   return '#f59e0b';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'blocked':   return '#ef4444';
      default:          return '#6b7280';
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
        await fetchSchedules();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to block schedule');
      console.error('❌ Error blocking schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!actionModal.scheduleId) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/admin/manage/schedule/delete/${actionModal.scheduleId}`,
        {
          adminFirebaseUid: admin.firebaseUid,
          adminName: admin.fullName || admin.email,
          reason: actionModal.reason || 'No reason specified',
        }
      );
      if (response.data.success) {
        setSuccessMessage('Interview schedule deleted successfully. All candidates and recruiter have been notified.');
        setTimeout(() => setSuccessMessage(''), 4000);
        setActionModal({});
        await fetchSchedules();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to delete schedule');
      console.error('❌ Error deleting schedule:', err);
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
        <div className="admin-schedules-page-header">
          <h1>Interview Schedules</h1>
          <p>View and manage all interview schedules across the organization</p>
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
        <div className="admin-schedules-filter-bar">
          <input
            type="text"
            placeholder="Search by recruiter, company, or position..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="admin-schedules-search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="admin-schedules-status-select"
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
        <div className="admin-schedules-stats-grid">
          <div className="admin-schedules-stat-card">
            <div className="admin-schedules-stat-number admin-schedules-stat-number--blue">
              {schedules?.length || 0}
            </div>
            <div className="admin-schedules-stat-label">Total Schedules</div>
          </div>
          <div className="admin-schedules-stat-card">
            <div className="admin-schedules-stat-number admin-schedules-stat-number--green">
              {schedules?.filter(s => new Date(s.date) > new Date()).length || 0}
            </div>
            <div className="admin-schedules-stat-label">Upcoming</div>
          </div>
          <div className="admin-schedules-stat-card">
            <div className="admin-schedules-stat-number admin-schedules-stat-number--purple">
              {schedules?.filter(s => s.status === 'completed').length || 0}
            </div>
            <div className="admin-schedules-stat-label">Completed</div>
          </div>
          <div className="admin-schedules-stat-card">
            <div className="admin-schedules-stat-number admin-schedules-stat-number--pink">
              {schedules?.reduce((sum, s) => sum + (s.candidates?.length || 0), 0) || 0}
            </div>
            <div className="admin-schedules-stat-label">Total Candidates</div>
          </div>
          <div className="admin-schedules-stat-card">
            <div className="admin-schedules-stat-number admin-schedules-stat-number--amber">
              {schedules?.filter(s => s.isBlocked).length || 0}
            </div>
            <div className="admin-schedules-stat-label">Blocked</div>
          </div>
        </div>

        {/* Schedules Table */}
        {schedulesLoading ? (
          <div className="admin-schedules-loading">
            <p>Loading schedules...</p>
          </div>
        ) : filteredSchedules.length > 0 ? (
          <div className="admin-schedules-table-wrapper">
            <div className="admin-schedules-table-scroll">
              <table className="admin-schedules-table">
                <thead>
                  <tr className="admin-schedules-thead-row">
                    <th className="admin-schedules-th">Recruiter / Company</th>
                    <th className="admin-schedules-th">Position</th>
                    <th className="admin-schedules-th">Date &amp; Time</th>
                    <th className="admin-schedules-th">Platform</th>
                    <th className="admin-schedules-th">Candidates</th>
                    <th className="admin-schedules-th">Status</th>
                    <th className="admin-schedules-th admin-schedules-th--center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((schedule, index) => (
                    <tr
                      key={schedule._id || index}
                      className="admin-schedules-tbody-row"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="admin-schedules-td">
                        <div className="admin-schedules-td-primary">{schedule.recruiterName || 'N/A'}</div>
                        <div className="admin-schedules-td-secondary">{schedule.company || 'N/A'}</div>
                      </td>
                      <td className="admin-schedules-td admin-schedules-td-text">{schedule.position || 'N/A'}</td>
                      <td className="admin-schedules-td admin-schedules-td-text">
                        <div>{new Date(schedule.date).toLocaleDateString()}</div>
                        <div className="admin-schedules-td-secondary">{schedule.time || 'N/A'}</div>
                      </td>
                      <td className="admin-schedules-td admin-schedules-td-text">{schedule.platform || 'N/A'}</td>
                      <td className="admin-schedules-td admin-schedules-td-text">
                        <div className="admin-schedules-candidate-count">
                          <Users size={14} />
                          <span>{schedule.candidates?.length || 0}</span>
                        </div>
                      </td>
                      <td className="admin-schedules-td">
                        <div
                          className="admin-schedules-status-badge"
                          style={{
                            backgroundColor: getStatusColor(schedule.status) + '20',
                            color: getStatusColor(schedule.status),
                          }}
                        >
                          {getStatusIcon(schedule.status)}
                          <span className="admin-schedules-status-text">{schedule.status}</span>
                        </div>
                      </td>
                      <td className="admin-schedules-td admin-schedules-td--center">
                        <div className="admin-schedules-action-group">
                          <button
                            onClick={() => { setSelectedSchedule(schedule); setShowModal(true); }}
                            className="admin-schedules-icon-btn admin-schedules-icon-btn--view"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {!schedule.isBlocked && (
                            <>
                              <button
                                onClick={() => setActionModal({
                                  type: 'block',
                                  scheduleId: schedule._id,
                                  scheduleInfo: {
                                    recruiterName: schedule.recruiterName,
                                    position: schedule.position,
                                    date: schedule.date,
                                    candidates: schedule.candidates?.length || 0
                                  }
                                })}
                                className="admin-schedules-icon-btn admin-schedules-icon-btn--block"
                                title="Block Schedule"
                              >
                                <Lock size={18} />
                              </button>
                              <button
                                onClick={() => setActionModal({
                                  type: 'delete',
                                  scheduleId: schedule._id,
                                  scheduleInfo: {
                                    recruiterName: schedule.recruiterName,
                                    position: schedule.position,
                                    date: schedule.date,
                                    candidates: schedule.candidates?.length || 0
                                  }
                                })}
                                className="admin-schedules-icon-btn admin-schedules-icon-btn--delete"
                                title="Delete Schedule"
                              >
                                <Trash2 size={18} />
                              </button>
                              <button
                                onClick={() => setActionModal({
                                  type: 'removeCandidates',
                                  scheduleId: schedule._id,
                                  candidates: schedule.candidates || []
                                })}
                                className="admin-schedules-icon-btn admin-schedules-icon-btn--remove"
                                title="Remove Candidate"
                              >
                                <Users size={18} />
                              </button>
                            </>
                          )}
                          {schedule.isBlocked && (
                            <span className="admin-schedules-blocked-tag">BLOCKED</span>
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
          <div className="admin-schedules-empty-state">
            <Calendar size={48} className="admin-schedules-empty-icon" />
            <p className="admin-schedules-empty-text">
              No schedules found. {searchText || filterStatus !== 'all' ? 'Try adjusting your filters.' : ''}
            </p>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {showModal && selectedSchedule && (
        <div className="admin-details-modal-overlay">
          <div className="admin-details-modal-content">
            <div className="admin-details-modal-header">
              <h2 className="admin-details-modal-title">Interview Schedule Details</h2>
              <button
                onClick={() => { setShowModal(false); setSelectedSchedule(null); }}
                className="admin-details-modal-close-btn"
              >
                ×
              </button>
            </div>

            <div className="admin-details-modal-body">
              {/* Recruiter Info */}
              <div className="admin-schedule-section">
                <h3 className="admin-schedule-section-title admin-schedule-section-title--blue">Recruiter Information</h3>
                <div className="admin-schedule-info-row">
                  <span>Recruiter Name:</span>
                  <span className="admin-schedule-info-value">{selectedSchedule.recruiterName || 'N/A'}</span>
                </div>
                <div className="admin-schedule-info-row">
                  <span>Company:</span>
                  <span className="admin-schedule-info-value">{selectedSchedule.company || 'N/A'}</span>
                </div>
              </div>

              {/* Schedule Details */}
              <div className="admin-schedule-section">
                <h3 className="admin-schedule-section-title admin-schedule-section-title--green">Schedule Details</h3>
                <div className="admin-schedule-info-row">
                  <span>Position:</span>
                  <span className="admin-schedule-info-value">{selectedSchedule.position || 'N/A'}</span>
                </div>
                <div className="admin-schedule-info-row">
                  <span>Date:</span>
                  <span className="admin-schedule-info-value">{new Date(selectedSchedule.date).toLocaleDateString()}</span>
                </div>
                <div className="admin-schedule-info-row">
                  <span>Time:</span>
                  <span className="admin-schedule-info-value">{selectedSchedule.time || 'N/A'}</span>
                </div>
                <div className="admin-schedule-info-row">
                  <span>Platform:</span>
                  <span className="admin-schedule-info-value">{selectedSchedule.platform || 'N/A'}</span>
                </div>
                {selectedSchedule.venue && (
                  <div className="admin-schedule-info-row">
                    <span>Venue:</span>
                    <span className="admin-schedule-info-value">{selectedSchedule.venue}</span>
                  </div>
                )}
              </div>

              {/* Candidates Info */}
              <div className="admin-schedule-section">
                <h3 className="admin-schedule-section-title admin-schedule-section-title--pink">
                  Candidates ({selectedSchedule.candidates?.length || 0})
                </h3>
                {selectedSchedule.candidates && selectedSchedule.candidates.length > 0 ? (
                  <div className="admin-details-candidates-list">
                    {selectedSchedule.candidates.map((candidate, index) => (
                      <div key={index} className="admin-details-candidate-item">
                        <div className="admin-details-candidate-name">
                          {candidate.studentName || `Student ${index + 1}`}
                        </div>
                        <div className="admin-details-candidate-meta">
                          <div>Email: {candidate.studentEmail || 'N/A'}</div>
                          <div>Status: <span
                            className={`admin-details-candidate-status admin-details-candidate-status--${candidate.status || 'scheduled'}`}
                          >{candidate.status || 'scheduled'}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="admin-details-no-candidates">No candidates assigned yet</p>
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
                  <AlertCircle size={24} className="admin-action-modal-icon admin-action-modal-icon--warning" />
                  <h2>Cancel Interview Schedule</h2>
                </>
              ) : actionModal.type === 'delete' ? (
                <>
                  <Trash2 size={24} className="admin-action-modal-icon admin-action-modal-icon--danger" />
                  <h2>Delete Interview Schedule</h2>
                </>
              ) : (
                <>
                  <Trash2 size={24} className="admin-action-modal-icon admin-action-modal-icon--danger" />
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
                  <p className="admin-action-modal-note">All {actionModal.scheduleInfo?.candidates || 0} candidates and the recruiter will be notified.</p>
                </>
              ) : actionModal.type === 'delete' ? (
                <>
                  <p className="admin-action-modal-warning">⚠️ This action cannot be undone. The interview schedule will be permanently deleted.</p>
                  <div className="schedule-info">
                    <div><strong>{actionModal.scheduleInfo?.recruiterName}</strong></div>
                    <div>Position: {actionModal.scheduleInfo?.position}</div>
                    <div>Date: {actionModal.scheduleInfo?.date ? new Date(actionModal.scheduleInfo.date).toLocaleDateString() : 'N/A'}</div>
                    <div>Candidates: {actionModal.scheduleInfo?.candidates || 0}</div>
                  </div>
                  <p className="admin-action-modal-note">All {actionModal.scheduleInfo?.candidates || 0} candidates and the recruiter will be notified about this deletion.</p>
                </>
              ) : (
                <>
                  <p>Are you sure you want to remove this candidate from the interview?</p>
                  {actionModal.candidates && actionModal.candidates.length > 0 && (
                    <div className="schedule-info">
                      <strong>Select candidate to remove:</strong>
                      <div className="admin-action-candidate-list">
                        {actionModal.candidates.map(candidate => (
                          <label key={candidate.studentId} className="admin-action-candidate-label">
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
              <button className="btn-cancel" onClick={() => setActionModal({})}>
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={() => {
                  if (actionModal.type === 'block') handleBlockSchedule();
                  else if (actionModal.type === 'delete') handleDeleteSchedule();
                  else actionModal.selectedCandidateId && handleRemoveCandidate();
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