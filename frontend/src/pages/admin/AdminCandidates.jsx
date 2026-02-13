import React, { useState, useEffect } from 'react';
import { Trash2, Shield, AlertCircle, CheckCircle, Users, Search } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/admin-css/admincandidates.css';
import axios from 'axios';

const AdminCandidates = () => {
  const { admin, jobDrives, statsLoading } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  // Removed unused state - selectedDrive not used in this component
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    candidate: null,
    driveId: null,
    reason: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Get all candidates from all visible (non-deleted/blocked) drives
  useEffect(() => {
    const allCandidates = [];
    const visibleDrives = jobDrives.filter(drive =>
      !drive?.isDeleted && drive?.status !== 'deleted' && !drive?.isBlocked && drive?.status !== 'blocked'
    );

    visibleDrives.forEach(drive => {
      if (drive.applications && drive.applications.length > 0) {
        drive.applications.forEach(app => {
          allCandidates.push({
            ...app,
            driveId: drive._id,
            company: drive.company,
            position: drive.position,
          });
        });
      }
    });

    // Filter by search term
    let filtered = allCandidates;
    if (searchTerm) {
      filtered = allCandidates.filter(c =>
        c.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setCandidates(filtered);
  }, [jobDrives, searchTerm]);

  const handleRemoveCandidate = async () => {
    if (!deleteModal.candidate || !deleteModal.driveId) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/admin/manage/job-drive/${deleteModal.driveId}/remove-candidate/${deleteModal.candidate.studentId}`,
        {
          adminFirebaseUid: admin.firebaseUid,
          adminName: admin.fullName || admin.email,
          reason: deleteModal.reason || 'No reason specified',
        }
      );

      if (response.data.success) {
        setSuccessMessage(`Candidate ${deleteModal.candidate.studentName} removed from ${deleteModal.candidate.company}`);
        setTimeout(() => setSuccessMessage(''), 3000);

        // Refresh
        setDeleteModal({ isOpen: false, candidate: null, driveId: null, reason: '' });
        // In production, refresh from parent or call context update
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to remove candidate');
      console.error('❌ Error removing candidate:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'applied': return '#0ea5e9';
      case 'shortlisted': return '#f59e0b';
      case 'interview-scheduled': return '#8b5cf6';
      case 'selected': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <AdminLayout>
      <div className="admin-candidates-wrapper">
        {/* Header */}
        <div className="admin-page-header">
          <div>
            <h1>Manage Candidates</h1>
            <p>View and manage all candidates across job drives</p>
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

        {/* Search */}
        <div className="admin-candidates-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Candidates Table */}
        {statsLoading || loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading candidates...</div>
        ) : candidates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <Users size={40} style={{ opacity: 0.5, margin: '0 auto 10px' }} />
            <p>No candidates found</p>
          </div>
        ) : (
          <div className="admin-candidates-table-wrapper">
            <table className="admin-candidates-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, index) => (
                  <tr key={index}>
                    <td>
                      <span className="admin-candidate-name">
                        {candidate.studentName}
                      </span>
                    </td>
                    <td>
                      <span className="admin-candidate-email">
                        {candidate.studentEmail}
                      </span>
                    </td>
                    <td>{candidate.studentPhone || 'N/A'}</td>
                    <td>{candidate.company}</td>
                    <td>{candidate.position}</td>
                    <td>
                      <span
                        className="admin-status-badge"
                        style={{
                          backgroundColor: `${getStatusBadgeColor(candidate.applicationStatus)}20`,
                          color: getStatusBadgeColor(candidate.applicationStatus),
                        }}
                      >
                        {(candidate.applicationStatus || '').replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {candidate.applicationDate
                        ? new Date(candidate.applicationDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>
                      <button
                        className="admin-action-btn admin-action-btn-danger"
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            candidate,
                            driveId: candidate.driveId,
                            reason: '',
                          })
                        }
                        title="Remove from application"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModal.isOpen && (
          <div className="admin-modal-overlay" onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}>
            <div
              className="admin-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <AlertCircle size={24} style={{ color: '#ef4444' }} />
                <h3>Remove Candidate</h3>
              </div>

              <div className="admin-modal-body">
                <p className="admin-modal-text">
                  Are you sure you want to remove <strong>{deleteModal.candidate?.studentName}</strong> from the {' '}
                  <strong>{deleteModal.candidate?.company}</strong> - <strong>{deleteModal.candidate?.position}</strong> application?
                </p>
                <p className="admin-modal-subtext">
                  The student will be notified about this removal.
                </p>

                <div className="admin-modal-form-group">
                  <label>Reason for removal (optional)</label>
                  <textarea
                    value={deleteModal.reason}
                    onChange={(e) =>
                      setDeleteModal({
                        ...deleteModal,
                        reason: e.target.value,
                      })
                    }
                    placeholder="Explain why this candidate is being removed..."
                    style={{ height: '80px' }}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  className="admin-btn-secondary"
                  onClick={() =>
                    setDeleteModal({
                      isOpen: false,
                      candidate: null,
                      driveId: null,
                      reason: '',
                    })
                  }
                >
                  Cancel
                </button>
                <button
                  className="admin-btn-danger"
                  onClick={handleRemoveCandidate}
                  disabled={loading}
                >
                  {loading ? 'Removing...' : 'Remove Candidate'}
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
