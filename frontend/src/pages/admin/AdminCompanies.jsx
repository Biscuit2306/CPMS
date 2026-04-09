import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, Calendar, Eye, Trash2, Lock, CheckCircle, AlertCircle, UnlockIcon } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/admin-css/admincompanies.css';
import axios from 'axios';

const Companies = () => {
  const { recruiters, statsLoading, fetchRecruiters, admin, searchQuery } = useAdmin();
  const [filteredRecruiters, setFilteredRecruiters] = useState([]);
  const [filterStatus, setFilterStatus] = useState('active'); // all, active, blocked, deleted
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    company: null,
    action: null, // 'block', 'delete', 'unblock'
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cpms-xtz8.onrender.com";

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

    // Filter by search term
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredRecruiters(filtered);
  }, [searchQuery, recruiters, filterStatus]);

  const getTotalHires = (recruiter) => {
    const drives = (recruiter.jobDrives || []).filter(drive =>
      !drive?.isDeleted && drive?.status !== 'deleted' && !drive?.isBlocked && drive?.status !== 'blocked'
    );

    return drives.reduce((sum, drive) => 
      sum + ((drive.applications || drive.applicants || []).filter(a => a.applicationStatus === 'selected').length || 0), 0
    ) || 0;
  };

  const getActiveDrives = (recruiter) => {
    return (recruiter.jobDrives || []).filter(drive =>
      !drive?.isDeleted && drive?.status !== 'deleted' && !drive?.isBlocked && drive?.status !== 'blocked'
    ).length;
  };

  const getAvgPackage = (recruiter) => {
    return recruiter.salary || 'N/A';
  };

  const getStatusDisplay = (recruiter) => {
    if (recruiter.isDeleted) return { label: 'Deleted', color: '#ef4444' };
    if (recruiter.isBlocked) return { label: 'Blocked', color: '#f59e0b' };
    return { label: 'Active', color: '#10b981' };
  };

  const handleAction = async () => {
    if (!actionModal.company || !actionModal.action) return;

    setLoading(true);
    try {
      const endpoint = actionModal.action === 'block'
        ? `/api/admin/manage/recruiter/block/${actionModal.company.firebaseUid}`
        : actionModal.action === 'delete'
        ? `/api/admin/manage/recruiter/delete/${actionModal.company.firebaseUid}`
        : `/api/admin/manage/recruiter/unblock/${actionModal.company.firebaseUid}`;

      const response = await axios.post(`${API_BASE}${endpoint}`, {
        adminFirebaseUid: admin.firebaseUid,
        adminName: admin.fullName || admin.email,
        reason: actionModal.reason || 'No reason specified',
      });

      if (response.data.success) {
        const actionText = actionModal.action === 'block' ? 'blocked' 
                          : actionModal.action === 'delete' ? 'deleted'
                          : 'unblocked';
        setSuccessMessage(`Company ${actionText} successfully.`);
        setTimeout(() => setSuccessMessage(''), 4000);
        setActionModal({ isOpen: false, company: null, action: null, reason: '' });
        await fetchRecruiters();
      }
    } catch (err) {
      console.error(`Error ${actionModal.action}ing company:`, err);
      const errMsg = err?.response?.data?.error || `Failed to ${actionModal.action} company`;
      setErrorMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (company, action) => {
    setActionModal({
      isOpen: true,
      company,
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
            <h1>Company Management</h1>
            <p>Manage partner companies and recruiters ({filteredRecruiters.length} companies)</p>
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
        <div className="admin-loading-container">Loading companies...</div>
      ) : filteredRecruiters.length === 0 ? (
        <div className="admin-empty-state">No companies found</div>
      ) : (
        <div className="admin-companies-grid">
          {filteredRecruiters.map((recruiter) => {
            const status = getStatusDisplay(recruiter);
            return (
              <div key={recruiter._id} className="admin-company-card">
                <div className="admin-company-header">
                  <div className="admin-company-logo">
                    {(recruiter.companyName || recruiter.fullName || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="admin-company-info">
                    <h3>{recruiter.companyName || recruiter.fullName}</h3>
                    <p>{recruiter.designation || 'Recruiter'}</p>
                    <span className={`admin-status-badge admin-status-badge--${status.label.toLowerCase()}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
                <div className="admin-company-details">
                  <div className="admin-company-row">
                    <Mail size={16} />
                    <span>{recruiter.email || 'N/A'}</span>
                  </div>
                  <div className="admin-company-row">
                    <Phone size={16} />
                    <span>{recruiter.phone || 'N/A'}</span>
                  </div>
                  <div className="admin-company-row">
                    <Calendar size={16} />
                    <span>Active Drives: {getActiveDrives(recruiter)}</span>
                  </div>
                  <div className="admin-company-row">
                    <Calendar size={16} />
                    <span>Total Hires: {getTotalHires(recruiter)}</span>
                  </div>
                </div>
                <div className="admin-company-actions">
                  <button 
                    className="admin-view-btn"
                    onClick={() => {
                      setSelectedCompany(recruiter);
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
      {showDetailsModal && selectedCompany && (
        <div className="admin-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Company Details</h2>
            <div className="admin-modal-body">
              <div className="admin-detail-row">
                <label>Company Name:</label>
                <span>{selectedCompany.companyName || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Contact Person:</label>
                <span>{selectedCompany.fullName || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Email:</label>
                <span>{selectedCompany.email || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Phone:</label>
                <span>{selectedCompany.phone || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Designation:</label>
                <span>{selectedCompany.designation || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Company Size:</label>
                <span>{selectedCompany.companySize || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Website:</label>
                <span>{selectedCompany.companyWebsite || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Status:</label>
                <span className={`admin-status-badge admin-status-badge--${getStatusDisplay(selectedCompany).label.toLowerCase()}`}>
                  {getStatusDisplay(selectedCompany).label}
                </span>
              </div>
              <div className="admin-detail-row">
                <label>Active Drives:</label>
                <span>{getActiveDrives(selectedCompany)}</span>
              </div>
              <div className="admin-detail-row">
                <label>Total Hires:</label>
                <span>{getTotalHires(selectedCompany)}</span>
              </div>
              {selectedCompany.blockedBy && (
                <>
                  <div className="admin-detail-row">
                    <label>Blocked By:</label>
                    <span>{selectedCompany.blockedBy.adminName}</span>
                  </div>
                  <div className="admin-detail-row">
                    <label>Reason:</label>
                    <span>{selectedCompany.blockedBy.reason}</span>
                  </div>
                </>
              )}
              {selectedCompany.deletedBy && (
                <>
                  <div className="admin-detail-row">
                    <label>Deleted By:</label>
                    <span>{selectedCompany.deletedBy.adminName}</span>
                  </div>
                  <div className="admin-detail-row">
                    <label>Reason:</label>
                    <span>{selectedCompany.deletedBy.reason}</span>
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
      {actionModal.isOpen && actionModal.company && (
        <div className="admin-modal-overlay" onClick={() => setActionModal({ isOpen: false, company: null, action: null, reason: '' })}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              {actionModal.action === 'block' && 'Block Company'}
              {actionModal.action === 'delete' && 'Delete Company'}
              {actionModal.action === 'unblock' && 'Unblock Company'}
            </h2>
            <div className="admin-modal-body">
              <p>
                {actionModal.action === 'block' && `Are you sure you want to block ${actionModal.company.companyName || actionModal.company.fullName}? They will not be able to access their account.`}
                {actionModal.action === 'delete' && `Are you sure you want to DELETE ${actionModal.company.companyName || actionModal.company.fullName}'s account? This action cannot be undone. All their job drives will also be deleted.`}
                {actionModal.action === 'unblock' && `Are you sure you want to unblock ${actionModal.company.companyName || actionModal.company.fullName}? They will be able to access their account again.`}
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
                onClick={() => setActionModal({ isOpen: false, company: null, action: null, reason: '' })}
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
                  actionModal.action === 'block' ? 'Block Company' :
                  actionModal.action === 'delete' ? 'Delete Company' :
                  'Unblock Company'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}; 

export default Companies;