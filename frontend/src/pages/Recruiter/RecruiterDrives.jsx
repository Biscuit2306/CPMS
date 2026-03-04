import React, { useState } from 'react';
import {
  Calendar, MapPin, Users, DollarSign,
  Eye, Trash2, Plus, Lock, ChevronDown, Building2,
  X, Briefcase, Clock, GraduationCap, CheckCircle2
} from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { useRecruiter } from '../../context/RecruiterContext';
import '../../styles/RecruiterCSS/recruiterdrives.css';

const RecruiterDrives = () => {
  const [activeMenu, setActiveMenu] = useState('drives');
  const { drives, drivesLoading, createDrive, deleteDrive, updateApplicationStatus, fetchDrives, recruiter, searchQuery } = useRecruiter();

  // ─── UI State ─────────────────────────────────────────────────
  const [showAddDrive, setShowAddDrive] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [updatingApplicantId, setUpdatingApplicantId] = useState(null);
  const [applicantStatusDropdown, setApplicantStatusDropdown] = useState(null);

  // ─── Form State ───────────────────────────────────────────────
  const emptyForm = {
    company: '',
    position: '',
    salary: '',
    location: '',
    date: '',
    applicationDeadline: '',
    jobDescription: '',
    status: 'active',
    eligibilityCriteria: {
      minCGPA: 0,
      allowedBranches: ['CSE', 'IT', 'ECE'],
      yearsEligible: ['Final Year'],
    },
    rounds: ['Online Test', 'Technical Interview', 'HR Round'],
  };
  const [formData, setFormData] = useState(emptyForm);

  // ─── Handlers ─────────────────────────────────────────────────
  const handleAddDrive = async () => {
    if (!formData.company || !formData.position || !formData.salary || !formData.location || !formData.date || !formData.applicationDeadline) {
      alert('Please fill all required fields (Company, Position, Salary, Location, Drive Date, Application Deadline)');
      return;
    }
    try {
      await createDrive({
        ...formData,
        date: new Date(formData.date),
        applicationDeadline: new Date(formData.applicationDeadline),
        status: 'active',
        applicants: [],
      });
      setShowAddDrive(false);
      setFormData(emptyForm);
      alert('Drive created successfully!');
    } catch (err) {
      console.error('Error creating drive:', err);
      alert('Failed to create drive: ' + err.message);
    }
  };

  const handleDeleteDrive = async (driveId) => {
    if (window.confirm('Are you sure you want to delete this drive?')) {
      try {
        await deleteDrive(driveId);
        alert('Drive deleted successfully');
      } catch (err) {
        console.error('Error deleting drive:', err);
        alert('Failed to delete drive');
      }
    }
  };

  const handleApplicantStatusChange = async (applicantId, newStatus) => {
    try {
      setUpdatingApplicantId(applicantId);
      console.log('🔄 Updating applicant status:');
      console.log('  Applicant ID:', applicantId);
      console.log('  New Status:', newStatus);

      await updateApplicationStatus(selectedDrive._id, applicantId, newStatus);

      console.log('🔄 Refreshing drives after status change...');
      if (recruiter?.firebaseUid) {
        await fetchDrives(recruiter.firebaseUid);
      }

      const updatedDrive = drives.find(d => d._id === selectedDrive._id);
      if (updatedDrive) setSelectedDrive(updatedDrive);

      setApplicantStatusDropdown(null);
      console.log('✅ Status updated and applicants refreshed');
      alert(`✅ Application status updated to: ${newStatus}`);
    } catch (err) {
      console.error('❌ Error updating status:', err);
      alert(`❌ Failed to update status: ${err.response?.data?.error || err.message}`);
    } finally {
      setUpdatingApplicantId(null);
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'active') return 'Active';
    if (status === 'scheduled') return 'Scheduled';
    if (status === 'completed') return 'Completed';
    return 'Active';
  };

  // derive filtered drives based on the global search query
  const queryString = (searchQuery || '').trim().toLowerCase();
  const filteredDrives = queryString
    ? drives.filter(d =>
        (d.company || '').toLowerCase().includes(queryString) ||
        (d.position || '').toLowerCase().includes(queryString) ||
        (d.location || '').toLowerCase().includes(queryString)
      )
    : drives;

  // ─── Shared styles ────────────────────────────────────────────
  const blockedOverlayStyle = {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 10, backdropFilter: 'blur(2px)',
  };

  // ─── Loading State ────────────────────────────────────────────
  if (drivesLoading) {
    return (
      <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
        <div className="recruiter-dashboard-content">
          <p>Loading drives...</p>
        </div>
      </RecruiterLayout>
    );
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>

        {/* Page Header */}
        <div className="recruiter-page-header">
          <div className='student-driver-banner-header'>
            <h1>Placement Drives</h1>
            <p>Manage and track ongoing recruitment drives</p>
          </div>
          <div className='recruiter-filter-section'>
            <button className="recruiter-add-drive-btn" onClick={() => setShowAddDrive(!showAddDrive)}>
              <Plus size={20} />
              {showAddDrive ? 'Cancel' : 'Add Drive'}
            </button>
          </div>
        </div>

        {/* Add Drive Form */}
        {showAddDrive && (
          <div className="recruiter-add-drive-form-container">
            <h3>Create New Drive</h3>
            <div className="recruiter-form-grid">
              {[
                { label: 'Company Name', key: 'company', placeholder: 'Enter company name', required: true },
                { label: 'Position', key: 'position', placeholder: 'e.g., Software Engineer', required: true },
                { label: 'Salary', key: 'salary', placeholder: 'e.g., 13.5 LPA', required: true },
                { label: 'Location', key: 'location', placeholder: 'e.g., Bangalore', required: true },
              ].map(({ label, key, placeholder, required }) => (
                <div key={key} className="recruiter-form-field">
                  <label>{label} {required && <span className="required">*</span>}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={formData[key]}
                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="recruiter-form-field">
                <label>Drive Date <span className="required">*</span></label>
                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="recruiter-form-field">
                <label>Application Deadline <span className="required">*</span></label>
                <input type="date" value={formData.applicationDeadline} onChange={e => setFormData({ ...formData, applicationDeadline: e.target.value })} />
              </div>
              <div className="recruiter-form-field">
                <label>Min CGPA</label>
                <input
                  type="number" placeholder="e.g., 7.5" step="0.1"
                  value={formData.eligibilityCriteria.minCGPA || ''}
                  onChange={e => setFormData({
                    ...formData,
                    eligibilityCriteria: {
                      ...formData.eligibilityCriteria,
                      minCGPA: e.target.value ? parseFloat(e.target.value) : 0,
                    },
                  })}
                />
              </div>
            </div>
            <div className="recruiter-form-field recruiter-form-grid full-width">
              <label>Job Description</label>
              <textarea
                placeholder="Describe the job role, responsibilities, and requirements..."
                value={formData.jobDescription}
                onChange={e => setFormData({ ...formData, jobDescription: e.target.value })}
              />
            </div>
            <div className="recruiter-form-actions">
              <button className="recruiter-btn-cancel" onClick={() => setShowAddDrive(false)}>Cancel</button>
              <button className="recruiter-submit-btn" onClick={handleAddDrive}>
                <Plus size={18} /> Create Drive
              </button>
            </div>
          </div>
        )}

        {/* Drives Grid */}
        <div className="recruiter-drives-grid">
          {filteredDrives.length > 0 ? (
            filteredDrives.map((drive) => (
              <div
                key={drive._id}
                className="recruiter-drive-card"
                style={drive.isBlocked || drive.isDeleted ? { opacity: 0.6, position: 'relative' } : {}}
              >
                {/* Blocked/Deleted Overlay */}
                {(drive.isBlocked || drive.isDeleted) && (
                  <div style={blockedOverlayStyle}>
                    <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '6px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                      <Lock size={28} style={{ color: '#f59e0b', marginBottom: '8px' }} />
                      <p style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '2px' }}>Job Drive Blocked</p>
                      <p style={{ fontSize: '12px', color: '#666' }}>By Admin</p>
                    </div>
                  </div>
                )}

                {/* Status pill — direct child of card, positioned top-right */}
                <span className={`rd-status-pill rd-status-pill--${drive.status || 'active'}`}>
                  <span className="rd-status-dot" />
                  {getStatusLabel(drive.status)}
                </span>

                {/* Card Header */}
                <div className="rd-card-header">
                  <div className="rd-identity">
                    <div className="rd-avatar">
                      {drive.position?.charAt(0)?.toUpperCase() || 'J'}
                    </div>
                    <div className="rd-title-block">
                      <h3 className="rd-position">{drive.position}</h3>
                      {drive.company && (
                        <p className="rd-company">
                          <Building2 size={12} />
                          {drive.company}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="recruiter-drive-details">
                  <div className="recruiter-drive-detail-item"><Calendar size={16} />{new Date(drive.date).toLocaleDateString()}</div>
                  <div className="recruiter-drive-detail-item"><MapPin size={16} />{drive.location}</div>
                  <div className="recruiter-drive-detail-item"><DollarSign size={16} />{drive.salary}</div>
                  <div className="recruiter-drive-detail-item"><Users size={16} />{drive.applicants?.length || 0} Applicants</div>
                </div>

                <div className="recruiter-drive-actions">
                  <button className="recruiter-view-btn" onClick={() => setSelectedDrive(drive)}>
                    <Eye size={16} /> View Details
                  </button>
                  <button className="recruiter-delete-btn" onClick={() => handleDeleteDrive(drive._id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="rd-empty-state">
              <p>
                {queryString
                  ? `No drives match "${searchQuery}"`
                  : 'No drives created yet. Click "Add Drive" to create one!'}
              </p>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════
            Drive Details Modal — NO INLINE STYLES
            ══════════════════════════════════════════════════════ */}
        {selectedDrive && (
          <div className="rdm-backdrop" onClick={() => setSelectedDrive(null)}>
            <div className="rdm-container" onClick={e => e.stopPropagation()}>

              {/* ── Modal Header ── */}
              <div className="rdm-header">
                <h3 className="rdm-header-title">Drive Details</h3>
                <button className="rdm-close-btn" onClick={() => setSelectedDrive(null)}>
                  <X size={20} />
                </button>
              </div>

              {/* ── Drive Hero ── */}
              <div className="rdm-hero">
                <div className="rdm-hero-avatar">
                  {selectedDrive.position?.charAt(0)?.toUpperCase() || 'J'}
                </div>
                <div className="rdm-hero-info">
                  <h2 className="rdm-hero-position">{selectedDrive.position}</h2>
                  <p className="rdm-hero-company">
                    <Building2 size={14} />
                    {selectedDrive.company}
                  </p>
                </div>
                <span className={`rdm-hero-status rdm-hero-status--${selectedDrive.status || 'active'}`}>
                  <span className="rdm-hero-status-dot" />
                  {getStatusLabel(selectedDrive.status)}
                </span>
              </div>

              {/* ── Stats Grid ── */}
              <div className="rdm-stats-grid">
                <div className="rdm-stat-card">
                  <div className="rdm-stat-icon rdm-stat-icon--salary">
                    <DollarSign size={16} />
                  </div>
                  <div className="rdm-stat-body">
                    <span className="rdm-stat-label">Salary</span>
                    <span className="rdm-stat-value">{selectedDrive.salary}</span>
                  </div>
                </div>
                <div className="rdm-stat-card">
                  <div className="rdm-stat-icon rdm-stat-icon--location">
                    <MapPin size={16} />
                  </div>
                  <div className="rdm-stat-body">
                    <span className="rdm-stat-label">Location</span>
                    <span className="rdm-stat-value">{selectedDrive.location}</span>
                  </div>
                </div>
                <div className="rdm-stat-card">
                  <div className="rdm-stat-icon rdm-stat-icon--date">
                    <Calendar size={16} />
                  </div>
                  <div className="rdm-stat-body">
                    <span className="rdm-stat-label">Drive Date</span>
                    <span className="rdm-stat-value">{new Date(selectedDrive.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="rdm-stat-card">
                  <div className="rdm-stat-icon rdm-stat-icon--deadline">
                    <Clock size={16} />
                  </div>
                  <div className="rdm-stat-body">
                    <span className="rdm-stat-label">Application Deadline</span>
                    <span className="rdm-stat-value">{new Date(selectedDrive.applicationDeadline).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="rdm-stat-card">
                  <div className="rdm-stat-icon rdm-stat-icon--applicants">
                    <Users size={16} />
                  </div>
                  <div className="rdm-stat-body">
                    <span className="rdm-stat-label">Total Applicants</span>
                    <span className="rdm-stat-value">{selectedDrive.applicants?.length || 0}</span>
                  </div>
                </div>
                <div className="rdm-stat-card">
                  <div className="rdm-stat-icon rdm-stat-icon--cgpa">
                    <GraduationCap size={16} />
                  </div>
                  <div className="rdm-stat-body">
                    <span className="rdm-stat-label">Min CGPA</span>
                    <span className="rdm-stat-value">{selectedDrive.eligibilityCriteria?.minCGPA || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* ── Job Description ── */}
              {selectedDrive.jobDescription && (
                <div className="rdm-section">
                  <h4 className="rdm-section-title">
                    <Briefcase size={16} />
                    Job Description
                  </h4>
                  <p className="rdm-jd-text">{selectedDrive.jobDescription}</p>
                </div>
              )}

              {/* ── Interview Rounds ── */}
              {selectedDrive.rounds?.length > 0 && (
                <div className="rdm-section">
                  <h4 className="rdm-section-title">
                    <CheckCircle2 size={16} />
                    Interview Rounds
                  </h4>
                  <div className="rdm-tags-row">
                    {selectedDrive.rounds.map((round, idx) => (
                      <span key={idx} className="rdm-tag rdm-tag--round">
                        <span className="rdm-tag-num">{idx + 1}</span>
                        {round}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Eligible Branches ── */}
              {selectedDrive.eligibilityCriteria?.allowedBranches?.length > 0 && (
                <div className="rdm-section">
                  <h4 className="rdm-section-title">
                    <GraduationCap size={16} />
                    Eligible Branches
                  </h4>
                  <div className="rdm-tags-row">
                    {selectedDrive.eligibilityCriteria.allowedBranches.map((branch, idx) => (
                      <span key={idx} className="rdm-tag rdm-tag--branch">{branch}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Eligible Years ── */}
              {selectedDrive.eligibilityCriteria?.yearsEligible?.length > 0 && (
                <div className="rdm-section">
                  <h4 className="rdm-section-title">
                    <Calendar size={16} />
                    Eligible Years
                  </h4>
                  <div className="rdm-tags-row">
                    {selectedDrive.eligibilityCriteria.yearsEligible.map((year, idx) => (
                      <span key={idx} className="rdm-tag rdm-tag--year">{year}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Applicants ── */}
              <div className="rdm-applicants-section">
                <div className="rdm-applicants-header">
                  <h4 className="rdm-section-title">
                    <Users size={16} />
                    Applicants
                  </h4>
                  <span className="rdm-applicants-count">{selectedDrive.applicants?.length || 0}</span>
                </div>

                {selectedDrive.applicants?.length > 0 ? (
                  <div className="rdm-applicants-list">
                    {selectedDrive.applicants.map((applicant) => (
                      <div key={applicant._id || applicant.studentId} className="rdm-applicant-card">
                        <div className="rdm-applicant-avatar">
                          {(applicant.studentName || 'N')?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="rdm-applicant-info">
                          <p className="rdm-applicant-name">{applicant.studentName || 'N/A'}</p>
                          <p className="rdm-applicant-email">{applicant.studentEmail}</p>
                          <span className={`rdm-applicant-status rdm-applicant-status--${applicant.applicationStatus || 'applied'}`}>
                            {applicant.applicationStatus || 'applied'}
                          </span>
                        </div>

                        {/* Status Dropdown */}
                        <div className="rdm-status-dropdown-wrapper">
                          <button
                            className={`rdm-status-update-btn${updatingApplicantId === applicant._id ? ' rdm-status-update-btn--loading' : ''}`}
                            onClick={() => setApplicantStatusDropdown(applicantStatusDropdown === applicant._id ? null : applicant._id)}
                            disabled={updatingApplicantId === applicant._id}
                          >
                            {updatingApplicantId === applicant._id ? 'Updating…' : 'Update Status'}
                            <ChevronDown size={15} />
                          </button>

                          {applicantStatusDropdown === applicant._id && (
                            <div className="rdm-dropdown-menu">
                              {[
                                { value: 'applied',              label: '📝 Applied' },
                                { value: 'shortlisted',          label: '✨ Shortlisted' },
                                { value: 'interview-scheduled',  label: '📅 Interview Scheduled' },
                                { value: 'selected',             label: '🎉 Selected' },
                                { value: 'rejected',             label: '❌ Rejected' },
                              ].map(({ value, label }) => (
                                <button
                                  key={value}
                                  className="rdm-dropdown-item"
                                  onClick={() => handleApplicantStatusChange(applicant._id || applicant.studentId, value)}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rdm-no-applicants">No applicants yet</p>
                )}
              </div>

              {/* ── Footer ── */}
              <div className="rdm-footer">
                <button className="rdm-footer-close-btn" onClick={() => setSelectedDrive(null)}>
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

    </RecruiterLayout>
  );
};

export default RecruiterDrives;