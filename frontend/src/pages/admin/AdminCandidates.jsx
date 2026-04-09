import React, { useState, useEffect } from 'react';
import { Trash2, AlertCircle, CheckCircle, Users, Search, Eye, Lock, UnlockIcon } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/admin-css/admincandidates.css';
import axios from 'axios';

const AdminCandidates = () => {
  const { admin, students, fetchStudents, statsLoading, searchQuery } = useAdmin();
  const [filterStatus, setFilterStatus] = useState('active'); // all, active, blocked, deleted
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    student: null,
    action: null, // 'block', 'delete', 'unblock'
    reason: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cpms-xtz8.onrender.com";

  useEffect(() => {
    let filtered = students || [];

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(s => !s?.isBlocked && !s?.isDeleted);
    } else if (filterStatus === 'blocked') {
      filtered = filtered.filter(s => s?.isBlocked && !s?.isDeleted);
    } else if (filterStatus === 'deleted') {
      filtered = filtered.filter(s => s?.isDeleted);
    }

    // Filter by search term
    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.branch?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [searchQuery, students, filterStatus]);

  const getStatusDisplay = (student) => {
    if (student.isDeleted) return { label: 'Deleted', color: '#ef4444' };
    if (student.isBlocked) return { label: 'Blocked', color: '#f59e0b' };
    return { label: 'Active', color: '#10b981' };
  };

  const getApplicationCount = (student) => {
    return (student.applications || []).length;
  };

  const handleAction = async () => {
    if (!actionModal.student || !actionModal.action) return;

    setLoading(true);
    try {
      const endpoint = actionModal.action === 'block'
        ? `/api/admin/manage/student/block/${actionModal.student.firebaseUid}`
        : actionModal.action === 'delete'
        ? `/api/admin/manage/student/delete/${actionModal.student.firebaseUid}`
        : `/api/admin/manage/student/unblock/${actionModal.student.firebaseUid}`;

      const response = await axios.post(`${API_BASE}${endpoint}`, {
        adminFirebaseUid: admin.firebaseUid,
        adminName: admin.fullName || admin.email,
        reason: actionModal.reason || 'No reason specified',
      });

      if (response.data.success) {
        const actionText = actionModal.action === 'block' ? 'blocked' 
                          : actionModal.action === 'delete' ? 'deleted'
                          : 'unblocked';
        setSuccessMessage(`Student ${actionText} successfully.`);
        setTimeout(() => setSuccessMessage(''), 4000);
        setActionModal({ isOpen: false, student: null, action: null, reason: '' });
        await fetchStudents();
      }
    } catch (err) {
      console.error(`Error ${actionModal.action}ing student:`, err);
      const errMsg = err?.response?.data?.error || `Failed to ${actionModal.action} student`;
      setErrorMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (student, action) => {
    setActionModal({
      isOpen: true,
      student,
      action,
      reason: '',
    });
  };

  return (
    <AdminLayout>
      <div className="admin-candidates-wrapper">
        {/* Banner with Title */}
        <div className="admin-banner">
          <div className="admin-banner-content">
            <div className="admin-banner-text">
              <h1>Candidate Management</h1>
              <p>Manage all students/candidates ({filteredStudents.length} candidates)</p>
            </div>
            <div className="admin-banner-icon">
              <Users size={80} />
            </div>
          </div>
        </div>

        {/* Header - removed, content moved to banner */}
        <div className="admin-page-header" style={{display: 'none'}}>
          <div>
            <h1>Candidate Management</h1>
            <p>Manage all students/candidates ({filteredStudents.length} candidates)</p>
          </div>
          <div className="admin-filter-buttons-container">
            <div className="admin-filter-section">
              <button 
                className={`admin-filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                onClick={() => setFilterStatus('active')}
              >
                Active
              </button>
              <button 
                className={`admin-filter-btn ${filterStatus === 'blocked' ? 'active' : ''}`}
                onClick={() => setFilterStatus('blocked')}
              >
                Blocked
              </button>
              <button 
                className={`admin-filter-btn ${filterStatus === 'deleted' ? 'active' : ''}`}
                onClick={() => setFilterStatus('deleted')}
              >
                Deleted
              </button>
              <button 
                className={`admin-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="admin-success-banner">
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="admin-error-banner">
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Candidates Table */}}
        {statsLoading || loading ? (
          <div className="admin-loading-container">Loading candidates...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="admin-empty-state">
            <Users size={40} />
            <p>No candidates found</p>
          </div>
        ) : (
          <div className="admin-candidates-table-wrapper">
            <table className="admin-candidates-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Roll No</th>
                  <th>Branch</th>
                  <th>CGPA</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const status = getStatusDisplay(student);
                  return (
                    <tr key={student._id}>
                      <td>
                        <span className="admin-candidate-name">
                          {student.fullName || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="admin-candidate-email">
                          {student.email || 'N/A'}
                        </span>
                      </td>
                      <td>{student.rollNo || 'N/A'}</td>
                      <td>{student.branch || 'N/A'}</td>
                      <td>{student.cgpa || 'N/A'}</td>
                      <td>
                        <span className="admin-app-count">
                          {getApplicationCount(student)}
                        </span>
                      </td>
                      <td>
                        <span 
                          className="admin-status-badge"
                          style={{ backgroundColor: status.color, color: 'white' }}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div className="admin-action-buttons">
                          <button
                            className="admin-view-btn"
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowDetailsModal(true);
                            }}
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          {!student.isDeleted && (
                            <>
                              {student.isBlocked ? (
                                <button 
                                  className="admin-unblock-btn"
                                  onClick={() => openActionModal(student, 'unblock')}
                                  title="Unblock student"
                                >
                                  <UnlockIcon size={16} />
                                </button>
                              ) : (
                                <button 
                                  className="admin-block-btn"
                                  onClick={() => openActionModal(student, 'block')}
                                  title="Block student"
                                >
                                  <Lock size={16} />
                                </button>
                              )}
                              <button
                                className="admin-delete-btn"
                                onClick={() => openActionModal(student, 'delete')}
                                title="Delete account"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedStudent && (
          <div className="admin-modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Student Details</h2>
              <div className="admin-modal-body">
                <div className="admin-detail-row">
                  <label>Full Name:</label>
                  <span>{selectedStudent.fullName || 'N/A'}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Email:</label>
                  <span>{selectedStudent.email || 'N/A'}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Phone:</label>
                  <span>{selectedStudent.phone || 'N/A'}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Roll Number:</label>
                  <span>{selectedStudent.rollNo || 'N/A'}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Branch:</label>
                  <span>{selectedStudent.branch || 'N/A'}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Year:</label>
                  <span>{selectedStudent.year || 'N/A'}</span>
                </div>
                <div className="admin-detail-row">
                  <label>CGPA:</label>
                  <span>{selectedStudent.cgpa || 'N/A'}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Date of Birth:</label>
                  <span>{selectedStudent.dob || 'N/A'}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Address:</label>
                  <span>{selectedStudent.address || 'N/A'}</span>
                </div>
                <div className="admin-detail-row">
                  <label>LinkedIn:</label>
                  <span>{selectedStudent.linkedin ? <a href={selectedStudent.linkedin} target="_blank" rel="noreferrer">{selectedStudent.linkedin}</a> : 'N/A'}</span>
                </div>
                <div className="admin-detail-row">
                  <label>GitHub:</label>
                  <span>{selectedStudent.github ? <a href={selectedStudent.github} target="_blank" rel="noreferrer">{selectedStudent.github}</a> : 'N/A'}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Portfolio:</label>
                  <span>{selectedStudent.portfolio ? <a href={selectedStudent.portfolio} target="_blank" rel="noreferrer">{selectedStudent.portfolio}</a> : 'N/A'}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Applications:</label>
                  <span>{getApplicationCount(selectedStudent)}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Status:</label>
                  <span style={{ color: getStatusDisplay(selectedStudent).color }}>
                    {getStatusDisplay(selectedStudent).label}
                  </span>
                </div>
                {selectedStudent.blockedBy && (
                  <>
                    <div className="admin-detail-row">
                      <label>Blocked By:</label>
                      <span>{selectedStudent.blockedBy.adminName}</span>
                    </div>
                    <div className="admin-detail-row">
                      <label>Reason:</label>
                      <span>{selectedStudent.blockedBy.reason}</span>
                    </div>
                  </>
                )}
                {selectedStudent.deletedBy && (
                  <>
                    <div className="admin-detail-row">
                      <label>Deleted By:</label>
                      <span>{selectedStudent.deletedBy.adminName}</span>
                    </div>
                    <div className="admin-detail-row">
                      <label>Reason:</label>
                      <span>{selectedStudent.deletedBy.reason}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="admin-modal-actions">
                <button className="admin-cancel-btn" onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Modal */}
        {actionModal.isOpen && actionModal.student && (
          <div className="admin-modal-overlay" onClick={() => setActionModal({ isOpen: false, student: null, action: null, reason: '' })}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>
                {actionModal.action === 'block' && 'Block Student Account'}
                {actionModal.action === 'delete' && 'Delete Student Account'}
                {actionModal.action === 'unblock' && 'Unblock Student Account'}
              </h2>
              <div className="admin-modal-body">
                <p>
                  {actionModal.action === 'block' && `Are you sure you want to block ${actionModal.student.fullName}? They will not be able to access their account or apply for any positions.`}
                  {actionModal.action === 'delete' && `Are you sure you want to DELETE ${actionModal.student.fullName}'s account? This action cannot be undone. They will also be removed from all interview schedules.`}
                  {actionModal.action === 'unblock' && `Are you sure you want to unblock ${actionModal.student.fullName}? They will be able to access their account again.`}
                </p>
                {(actionModal.action === 'block' || actionModal.action === 'delete') && (
                  <textarea
                    placeholder="Reason for this action (optional)"
                    value={actionModal.reason}
                    onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
                    className="admin-modal-reason-textarea"
                  />
                )}
              </div>
              <div className="admin-modal-actions">
                <button 
                  className="admin-cancel-btn" 
                  onClick={() => setActionModal({ isOpen: false, student: null, action: null, reason: '' })}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className={`admin-${actionModal.action}-btn`}
                  onClick={handleAction}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (
                    actionModal.action === 'block' ? 'Block Account' :
                    actionModal.action === 'delete' ? 'Delete Account' :
                    'Unblock Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCandidates;
