import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Users, CheckCircle, UserCheck, Eye, Settings, Trash2, Lock, AlertCircle, Briefcase } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/admin-css/adminplacementdrives.css';
import axios from 'axios';

const PlacementDrives = () => {
  const { admin, fetchJobDrives, jobDrives, statsLoading, searchQuery } = useAdmin();
  const [filteredDrives, setFilteredDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    drive: null,
    action: null, // 'block' or 'delete'
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cpms-xtz8.onrender.com";

  useEffect(() => {
    // Show all non-deleted drives
    let filtered = jobDrives.filter(drive => !drive?.isDeleted && drive?.status !== 'deleted');
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(drive =>
        drive.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drive.recruiterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drive.position?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredDrives(filtered);
  }, [jobDrives, searchQuery]);

  const handleAction = async () => {
    if (!actionModal.drive || !actionModal.action) return;

    setLoading(true);
    try {
      const endpoint = actionModal.action === 'block'
        ? `/api/admin/manage/job-drive/block/${actionModal.drive._id}`
        : `/api/admin/manage/job-drive/delete/${actionModal.drive._id}`;

      const response = await axios.post(`${API_BASE}${endpoint}`, {
        adminFirebaseUid: admin.firebaseUid,
        adminName: admin.fullName || admin.email,
        reason: actionModal.reason || 'No reason specified',
      });

      // Diagnostic: show which endpoint and response came back
      console.log('Admin action response:', response?.data);
      console.log('   request url:', response?.config?.url);
      console.log('   responseURL:', response?.request?.responseURL);
      console.log(`   success flag: ${response?.data?.success}`);
      console.log(`   modifiedCount: ${response?.data?.modifiedCount}`);
      console.log(`   matchedCount: ${response?.data?.matchedCount}`);

      // ✅ SANITY CHECK: Only trust if BOTH success AND modifiedCount === 1
      if (response.data.success && response.data.modifiedCount === 1) {
        const actionText = actionModal.action === 'block' ? 'blocked' : 'deleted';
        setSuccessMessage(`Job drive ${actionText} successfully. All applicants have been notified.`);
        setTimeout(() => setSuccessMessage(''), 4000);
        
        // Refresh job drives list from backend
        await fetchJobDrives();
        
        setActionModal({ isOpen: false, drive: null, action: null, reason: '' });
      } else if (response.data.success && response.data.modifiedCount === 0) {
        setErrorMessage(`Failed: modifiedCount is 0. Database may not have matched the drive.`);
      }
    } catch (err) {
      console.error(`❌ Error ${actionModal.action}ing drive:`, err);
      const errData = err?.response?.data;
      const errMsg = errData?.error || err?.message || `Failed to ${actionModal.action} job drive`;
      
      // Show more diagnostic info if available
      let fullMsg = errMsg;
      if (errData?.modifiedCount !== undefined) {
        fullMsg += ` [modifiedCount: ${errData.modifiedCount}]`;
      }
      if (errData?.driveId) {
        fullMsg += ` [driveId: ${errData.driveId}]`;
      }
      
      setErrorMessage(fullMsg);
      // expose more details for debugging
      console.debug('Admin action error response:', {
        success: errData?.success,
        error: errMsg,
        modifiedCount: errData?.modifiedCount,
        matchedCount: errData?.matchedCount,
        driveId: errData?.driveId,
        fullErr: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* Banner with Title */}
      <div className="admin-banner">
        <div className="admin-banner-content">
          <div className="admin-banner-text">
            <h1>Placement Drives</h1>
            <p>Monitor and manage all recruitment drives ({filteredDrives.length} drives)</p>
          </div>
          <div className="admin-banner-icon">
            <Briefcase size={80} />
          </div>
        </div>
      </div>

      {/* Header - removed, content moved to banner */}
      {/* <div className="admin-page-header admin-page-header--hidden">
        <div>
          <h1>Placement Drives</h1>
          <p>Monitor and manage all recruitment drives ({filteredDrives.length} drives)</p>
        </div>
      </div> */}

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

      {statsLoading || loading ? (
        <div className="admin-loading-container">Loading drives...</div>
      ) : filteredDrives.length === 0 ? (
        <div className="admin-empty-state">No drives found</div>
      ) : (
        <div className="admin-drives-grid">
          {filteredDrives.map((drive) => (
            <div
              key={drive._id}
              className={`admin-drive-card ${drive.isBlocked ? 'blocked' : ''} ${drive.isDeleted ? 'deleted' : ''}`}
            >
              {(drive.isBlocked || drive.isDeleted) && (
                <div className="admin-drive-status-overlay">
                  <Lock size={32} />
                  <p>{drive.isBlocked ? 'BLOCKED' : 'DELETED'}</p>
                </div>
              )}

              <div className="admin-drive-header">
                <div className="admin-company-logo-large">
                  {(drive.company || drive.recruiterName || 'J').charAt(0)}
                </div>
                <div className="admin-drive-title">
                  <h3>{drive.company || drive.recruiterName}</h3>
                  <span
                    className={`admin-drive-status-badge ${
                      drive.isBlocked ? 'blocked' : drive.isDeleted ? 'deleted' : (drive.status || 'active').toLowerCase()
                    }`}
                  >
                    {drive.isBlocked ? 'Blocked' : drive.isDeleted ? 'Deleted' : drive.status === 'active' ? 'Active' : drive.status === 'scheduled' ? 'Scheduled' : 'Completed'}
                  </span>
                </div>
              </div>
              <h4 className="admin-job-role">{drive.position}</h4>
              <div className="admin-drive-details">
                <div className="admin-drive-detail-item">
                  <DollarSign size={16} />
                  <span>{drive.salary || 'N/A'}</span>
                </div>
                <div className="admin-drive-detail-item">
                  <Calendar size={16} />
                  <span>{new Date(drive.date).toLocaleDateString()}</span>
                </div>
                <div className="admin-drive-detail-item">
                  <Users size={16} />
                  <span>{drive.applications?.length || 0} Applicants</span>
                </div>
                <div className="admin-drive-detail-item">
                  <CheckCircle size={16} />
                  <span>{drive.applications?.filter(a => a.applicationStatus === 'selected').length || 0} Selected</span>
                </div>
              </div>

              {drive.blockedBy && (
                <div className="admin-drive-warning">
                  <AlertCircle size={14} />
                  <span>Blocked by {drive.blockedBy.adminName}</span>
                </div>
              )}

              {drive.deletedBy && (
                <div className="admin-drive-warning">
                  <AlertCircle size={14} />
                  <span>Deleted by {drive.deletedBy.adminName}</span>
                </div>
              )}

              {!drive.isBlocked && !drive.isDeleted && (
                <div className="admin-drive-actions">
                  <button 
                    className="admin-view-btn"
                    onClick={() => {
                      setSelectedDrive(drive);
                      setShowDetailsModal(true);
                    }}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  <button
                    className="admin-action-btn admin-action-btn-warning"
                    onClick={() =>
                      setActionModal({
                        isOpen: true,
                        drive,
                        action: 'block',
                        reason: '',
                      })
                    }
                  >
                    <Lock size={16} />
                    Block
                  </button>
                  <button
                    className="admin-action-btn admin-action-btn-danger"
                    onClick={() =>
                      setActionModal({
                        isOpen: true,
                        drive,
                        action: 'delete',
                        reason: '',
                      })
                    }
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDrive && (
        <div className="admin-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div
            className="admin-modal-content admin-modal-content--lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2>Placement Drive Details</h2>
              <button
                className="admin-modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-detail-row">
                <strong>Company:</strong>
                <span>{selectedDrive.company || selectedDrive.recruiterName}</span>
              </div>
              <div className="admin-detail-row">
                <strong>Position:</strong>
                <span>{selectedDrive.position}</span>
              </div>
              <div className="admin-detail-row">
                <strong>Salary:</strong>
                <span>{selectedDrive.salary || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <strong>Date:</strong>
                <span>{new Date(selectedDrive.date).toLocaleDateString()}</span>
              </div>
              <div className="admin-detail-row">
                <strong>Status:</strong>
                <span className={`admin-status-badge admin-status-badge--${selectedDrive.status || 'active'}`}>
                  {selectedDrive.status === 'active' ? 'Active' : selectedDrive.status === 'scheduled' ? 'Scheduled' : 'Completed'}
                </span>
              </div>
              <div className="admin-detail-row">
                <strong>Qualifications Required:</strong>
                <span>{selectedDrive.qualificationsRequired || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <strong>Total Applicants:</strong>
                <span>{selectedDrive.applications?.length || 0}</span>
              </div>
              <div className="admin-detail-row">
                <strong>Selected:</strong>
                <span>{selectedDrive.applications?.filter(a => a.applicationStatus === 'selected').length || 0}</span>
              </div>
              <div className="admin-detail-row">
                <strong>Rejected:</strong>
                <span>{selectedDrive.applications?.filter(a => a.applicationStatus === 'rejected').length || 0}</span>
              </div>
              <div className="admin-detail-row">
                <strong>Description:</strong>
                <span>{selectedDrive.description || 'N/A'}</span>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn-secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div className="admin-modal-overlay" onClick={() => setActionModal({ ...actionModal, isOpen: false })}>
          <div
            className="admin-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              {actionModal.action === 'block' ? (
                <Lock size={24} className="admin-modal-icon admin-modal-icon--warning" />
              ) : (
                <Trash2 size={24} className="admin-modal-icon admin-modal-icon--danger" />
              )}
              <h3>
                {actionModal.action === 'block' ? 'Block Job Drive' : 'Delete Job Drive'}
              </h3>
            </div>

            <div className="admin-modal-body">
              <p className="admin-modal-text">
                Are you sure you want to{' '}
                <strong>
                  {actionModal.action === 'block' ? 'block' : 'delete'}
                </strong>{' '}
                the job drive for <strong>{actionModal.drive?.company}</strong> -{' '}
                <strong>{actionModal.drive?.position}</strong>?
              </p>
              <p className="admin-modal-subtext">
                All {actionModal.drive?.applications?.length || 0} applicants will be{' '}
                <strong>notified immediately</strong> about this action.
              </p>

              <div className="admin-modal-form-group">
                <label>Reason ({actionModal.action === 'block' ? 'required' : 'optional'})</label>
                <textarea
                  value={actionModal.reason}
                  onChange={(e) =>
                    setActionModal({
                      ...actionModal,
                      reason: e.target.value,
                    })
                  }
                  placeholder={`Explain why you're ${actionModal.action}ing this drive...`}
                  className="admin-modal-textarea"
                />
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn-secondary"
                onClick={() =>
                  setActionModal({
                    isOpen: false,
                    drive: null,
                    action: null,
                    reason: '',
                  })
                }
              >
                Cancel
              </button>
              <button
                className={`admin-btn-${actionModal.action === 'block' ? 'warning' : 'danger'}`}
                onClick={handleAction}
                disabled={loading}
              >
                {loading
                  ? `${actionModal.action === 'block' ? 'Blocking' : 'Deleting'}...`
                  : `${actionModal.action === 'block' ? 'Block Drive' : 'Delete Drive'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PlacementDrives;