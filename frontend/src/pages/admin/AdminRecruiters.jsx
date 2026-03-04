import React, { useState, useEffect } from 'react';
import { Mail, Phone, Building2, Briefcase, Edit2, Trash2, Lock, CheckCircle, AlertCircle, UnlockIcon, Eye } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/admin-css/adminrecruiters.css';
import axios from 'axios';

const Recruiters = () => {
  const { recruiters, statsLoading, fetchRecruiters, admin, searchQuery } = useAdmin();
  const [filteredRecruiters, setFilteredRecruiters] = useState([]);
  const [filterStatus, setFilterStatus] = useState('active'); // all, active, blocked, deleted
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    recruiter: null,
    action: null, // 'block', 'delete', 'unblock'
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    let filtered = recruiters || [];

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(r => !r?.isBlocked && !r?.isDeleted);
    } else if (filterStatus === 'blocked') {
      filtered = filtered.filter(r => r?.isBlocked && !r?.isDeleted);
    } else if (filterStatus === 'deleted') {
      filtered = filtered.filter(r => r?.isDeleted);
    }
    // else: all (no status filter)

    // Filter by search term
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredRecruiters(filtered);
  }, [searchQuery, recruiters, filterStatus]);

  const getActiveDrives = (recruiter) => {
    return (recruiter.jobDrives || []).filter(drive =>
      !drive?.isDeleted && drive?.status !== 'deleted' && !drive?.isBlocked && drive?.status !== 'blocked'
    ).length;
  };

  const getStatusDisplay = (recruiter) => {
    if (recruiter.isDeleted) return { label: 'Deleted', color: '#ef4444' };
    if (recruiter.isBlocked) return { label: 'Blocked', color: '#f59e0b' };
    return { label: 'Active', color: '#10b981' };
  };

  const handleAction = async () => {
    if (!actionModal.recruiter || !actionModal.action) return;

    setLoading(true);
    try {
      const endpoint = actionModal.action === 'block'
        ? `/api/admin/manage/recruiter/block/${actionModal.recruiter.firebaseUid}`
        : actionModal.action === 'delete'
        ? `/api/admin/manage/recruiter/delete/${actionModal.recruiter.firebaseUid}`
        : `/api/admin/manage/recruiter/unblock/${actionModal.recruiter.firebaseUid}`;

      const response = await axios.post(`${API_BASE}${endpoint}`, {
        adminFirebaseUid: admin.firebaseUid,
        adminName: admin.fullName || admin.email,
        reason: actionModal.reason || 'No reason specified',
      });

      if (response.data.success) {
        const actionText = actionModal.action === 'block' ? 'blocked' 
                          : actionModal.action === 'delete' ? 'deleted'
                          : 'unblocked';
        setSuccessMessage(`Recruiter ${actionText} successfully.`);
        setTimeout(() => setSuccessMessage(''), 4000);
        setActionModal({ isOpen: false, recruiter: null, action: null, reason: '' });
        await fetchRecruiters();
      }
    } catch (err) {
      console.error(`Error ${actionModal.action}ing recruiter:`, err);
      const errMsg = err?.response?.data?.error || `Failed to ${actionModal.action} recruiter`;
      setErrorMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (recruiter, action) => {
    setActionModal({
      isOpen: true,
      recruiter,
      action,
      reason: '',
    });
  };

  return (
    <AdminLayout>
      {/* Banner with Title */}
      <div className="admin-banner">
        <div className="admin-banner-content">
          <div className="admin-banner-text">
            <h1>Recruiter Management</h1>
            <p>Manage recruitment officers and their drives ({filteredRecruiters.length} recruiters)</p>
          </div>
          <div className="admin-banner-icon">
            <Building2 size={80} />
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

      {statsLoading ? (
        <div className="admin-loading-container">Loading recruiters...</div>
      ) : filteredRecruiters.length === 0 ? (
        <div className="admin-empty-state">No recruiters found</div>
      ) : (
        <div className="admin-recruiters-grid">
          {filteredRecruiters.map((recruiter) => {
            const status = getStatusDisplay(recruiter);
            return (
              <div key={recruiter._id} className="admin-recruiter-card">
                <div className="admin-recruiter-header">
                  <div className="admin-recruiter-avatar">
                    {(recruiter.fullName || 'R').split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="admin-recruiter-info">
                    <h3>{recruiter.fullName || 'N/A'}</h3>
                    <p className="admin-recruiter-role">{recruiter.designation || 'Recruiter'}</p>
                    <span className={`admin-status-badge admin-status-badge--${status.label.toLowerCase()}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
                <div className="admin-recruiter-details">
                  <div className="admin-recruiter-row">
                    <Mail size={16} />
                    <span>{recruiter.email || 'N/A'}</span>
                  </div>
                  <div className="admin-recruiter-row">
                    <Phone size={16} />
                    <span>{recruiter.phone || 'N/A'}</span>
                  </div>
                  <div className="admin-recruiter-row">
                    <Building2 size={16} />
                    <span>{recruiter.companyName || 'N/A'}</span>
                  </div>
                  <div className="admin-recruiter-row">
                    <Briefcase size={16} />
                    <span>{getActiveDrives(recruiter)} Active Drives</span>
                  </div>
                </div>
                <div className="admin-recruiter-actions">
                  <button 
                    className="admin-view-btn"
                    onClick={() => {
                      setSelectedRecruiter(recruiter);
                      setShowDetailsModal(true);
                    }}
                  >
                    <Eye size={16} />
                    View
                  </button>
                  {!recruiter.isDeleted && (
                    <>
                      {recruiter.isBlocked ? (
                        <button 
                          className="admin-unblock-btn"
                          onClick={() => openActionModal(recruiter, 'unblock')}
                        >
                          <UnlockIcon size={16} />
                          Unblock
                        </button>
                      ) : (
                        <button 
                          className="admin-block-btn"
                          onClick={() => openActionModal(recruiter, 'block')}
                        >
                          <Lock size={16} />
                          Block
                        </button>
                      )}
                      <button 
                        className="admin-delete-btn"
                        onClick={() => openActionModal(recruiter, 'delete')}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRecruiter && (
        <div className="admin-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Recruiter Details</h2>
            <div className="admin-modal-body">
              <div className="admin-detail-row">
                <label>Name:</label>
                <span>{selectedRecruiter.fullName || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Email:</label>
                <span>{selectedRecruiter.email || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Phone:</label>
                <span>{selectedRecruiter.phone || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Company:</label>
                <span>{selectedRecruiter.companyName || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Designation:</label>
                <span>{selectedRecruiter.designation || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Company Size:</label>
                <span>{selectedRecruiter.companySize || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Website:</label>
                <span>{selectedRecruiter.companyWebsite || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Status:</label>
                <span className={`admin-status-badge admin-status-badge--${getStatusDisplay(selectedRecruiter).label.toLowerCase()}`}>
                  {getStatusDisplay(selectedRecruiter).label}
                </span>
              </div>
              <div className="admin-detail-row">
                <label>Active Drives:</label>
                <span>{getActiveDrives(selectedRecruiter)}</span>
              </div>
              {selectedRecruiter.blockedBy && (
                <>
                  <div className="admin-detail-row">
                    <label>Blocked By:</label>
                    <span>{selectedRecruiter.blockedBy.adminName}</span>
                  </div>
                  <div className="admin-detail-row">
                    <label>Reason:</label>
                    <span>{selectedRecruiter.blockedBy.reason}</span>
                  </div>
                </>
              )}
              {selectedRecruiter.deletedBy && (
                <>
                  <div className="admin-detail-row">
                    <label>Deleted By:</label>
                    <span>{selectedRecruiter.deletedBy.adminName}</span>
                  </div>
                  <div className="admin-detail-row">
                    <label>Reason:</label>
                    <span>{selectedRecruiter.deletedBy.reason}</span>
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
      {actionModal.isOpen && actionModal.recruiter && (
        <div className="admin-modal-overlay" onClick={() => setActionModal({ isOpen: false, recruiter: null, action: null, reason: '' })}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              {actionModal.action === 'block' && 'Block Recruiter Account'}
              {actionModal.action === 'delete' && 'Delete Recruiter Account'}
              {actionModal.action === 'unblock' && 'Unblock Recruiter Account'}
            </h2>
            <div className="admin-modal-body">
              <p>
                {actionModal.action === 'block' && `Are you sure you want to block ${actionModal.recruiter.fullName}? They will not be able to access their account.`}
                {actionModal.action === 'delete' && `Are you sure you want to DELETE ${actionModal.recruiter.fullName}'s account? This action cannot be undone. All their job drives will also be deleted.`}
                {actionModal.action === 'unblock' && `Are you sure you want to unblock ${actionModal.recruiter.fullName}? They will be able to access their account again.`}
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
                onClick={() => setActionModal({ isOpen: false, recruiter: null, action: null, reason: '' })}
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
    </AdminLayout>
  );
};

export default Recruiters;