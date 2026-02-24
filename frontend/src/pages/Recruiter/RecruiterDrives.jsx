import React, { useState } from 'react';
import {
  Calendar, MapPin, Users, DollarSign,
  Eye, Trash2, Plus, Lock, ChevronDown
} from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { useRecruiter } from '../../context/RecruiterContext';
import '../../styles/RecruiterCSS/recruiterdrives.css';

const RecruiterDrives = () => {
  const [activeMenu, setActiveMenu] = useState('drives');
  const { drives, drivesLoading, createDrive, deleteDrive, updateApplicationStatus, fetchDrives, recruiter } = useRecruiter();

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

      // 🔥 Refresh drives context after status change
      console.log('🔄 Refreshing drives after status change...');
      if (recruiter?.firebaseUid) {
        await fetchDrives(recruiter.firebaseUid);
      }

      // Sync selectedDrive with fresh data
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

  // ─── Shared styles ────────────────────────────────────────────
  const blockedOverlayStyle = {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 10, backdropFilter: 'blur(2px)',
  };
  const applicantStatusColors = {
    rejected:             { bg: '#fee2e2', color: '#991b1b' },
    selected:             { bg: '#dcfce7', color: '#166534' },
    shortlisted:          { bg: '#fef3c7', color: '#92400e' },
    'interview-scheduled':{ bg: '#dbeafe', color: '#0c4a6e' },
    applied:              { bg: '#e0e7ff', color: '#312e81' },
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
      <div className="recruiter-dashboard-content">

        {/* Page Header */}
        <div className="recruiter-page-header">
          <div>
            <h1>Placement Drives</h1>
            <p>Manage and track ongoing recruitment drives</p>
          </div>
          <button className="recruiter-add-drive-btn" onClick={() => setShowAddDrive(!showAddDrive)}>
            <Plus size={20} />
            {showAddDrive ? 'Cancel' : 'Add Drive'}
          </button>
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
          {drives && drives.length > 0 ? (
            drives.map((drive) => (
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

                <div className="recruiter-drive-card-header">
                  <div className="recruiter-company-logo-large">{drive.position?.charAt(0) || 'J'}</div>
                  <div className="recruiter-drive-title">
                    <h3>{drive.position}</h3>
                    <span className={`recruiter-drive-status-badge ${drive.status}`}>{getStatusLabel(drive.status)}</span>
                  </div>
                </div>

                <p className="recruiter-job-role">{drive.salary}</p>

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
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <p>No drives created yet. Click "Add Drive" to create one!</p>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* Drive Details Modal                                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        {selectedDrive && (
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
            onClick={() => setSelectedDrive(null)}
          >
            <div
              style={{ background: 'white', borderRadius: '12px', maxWidth: '600px', width: '95%', padding: '2rem', cursor: 'default', maxHeight: '85vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: '#1f2937' }}>Drive Details</h3>
                <button onClick={() => setSelectedDrive(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
              </div>

              {/* Drive Hero */}
              <div style={{ background: '#f9f5fb', borderRadius: '10px', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '10px', background: '#4F1C51', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700', flexShrink: 0 }}>
                    {selectedDrive.position?.charAt(0) || 'J'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', fontWeight: '700', color: '#1f2937' }}>{selectedDrive.position}</h2>
                    <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#64748b' }}>{selectedDrive.company}</p>
                    <span style={{
                      display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600',
                      backgroundColor: selectedDrive.status === 'active' ? '#d1fae5' : '#fef3c7',
                      color: selectedDrive.status === 'active' ? '#047857' : '#92400e',
                    }}>
                      {getStatusLabel(selectedDrive.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Drive Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                  { label: 'Salary',               value: selectedDrive.salary },
                  { label: 'Location',             value: selectedDrive.location },
                  { label: 'Drive Date',           value: new Date(selectedDrive.date).toLocaleDateString() },
                  { label: 'Application Deadline', value: new Date(selectedDrive.applicationDeadline).toLocaleDateString() },
                  { label: 'Total Applicants',     value: selectedDrive.applicants?.length || 0 },
                  { label: 'Min CGPA',             value: selectedDrive.eligibilityCriteria?.minCGPA || 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#f1f5f9', padding: '1.2rem', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{label}</p>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Job Description */}
              {selectedDrive.jobDescription && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '700', color: '#1f2937' }}>Job Description</h4>
                  <p style={{ margin: 0, padding: '1rem', background: '#f9f5fb', borderRadius: '8px', color: '#1f2937', lineHeight: '1.6', fontSize: '0.95rem' }}>
                    {selectedDrive.jobDescription}
                  </p>
                </div>
              )}

              {/* Interview Rounds */}
              {selectedDrive.rounds?.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '700', color: '#1f2937' }}>Interview Rounds</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                    {selectedDrive.rounds.map((round, idx) => (
                      <span key={idx} style={{ padding: '0.5rem 1rem', background: '#e9d5f0', color: '#4F1C51', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                        {round}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligible Branches */}
              {selectedDrive.eligibilityCriteria?.allowedBranches?.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '700', color: '#1f2937' }}>Eligible Branches</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                    {selectedDrive.eligibilityCriteria.allowedBranches.map((branch, idx) => (
                      <span key={idx} style={{ padding: '0.5rem 1rem', background: '#d1fae5', color: '#047857', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                        {branch}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligible Years */}
              {selectedDrive.eligibilityCriteria?.yearsEligible?.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '700', color: '#1f2937' }}>Eligible Years</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                    {selectedDrive.eligibilityCriteria.yearsEligible.map((year, idx) => (
                      <span key={idx} style={{ padding: '0.5rem 1rem', background: '#fef3c7', color: '#92400e', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                        {year}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Applicants Section */}
              <div style={{ marginTop: '2rem', borderTop: '1px solid #e9d5f0', paddingTop: '2rem' }}>
                <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: '700', color: '#1f2937' }}>
                  Applicants ({selectedDrive.applicants?.length || 0})
                </h4>

                {selectedDrive.applicants?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedDrive.applicants.map((applicant) => {
                      const statusStyle = applicantStatusColors[applicant.applicationStatus] || applicantStatusColors.applied;
                      return (
                        <div
                          key={applicant._id || applicant.studentId}
                          style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #e9d5f0', background: '#f9f5fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: '#1f2937' }}>{applicant.studentName || 'N/A'}</p>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: '#64748b' }}>{applicant.studentEmail}</p>
                            <p style={{
                              margin: '0.5rem 0 0 0', fontSize: '0.85rem', padding: '0.4rem 0.8rem',
                              borderRadius: '4px', display: 'inline-block', fontWeight: '500',
                              backgroundColor: statusStyle.bg, color: statusStyle.color,
                            }}>
                              {applicant.applicationStatus || 'applied'}
                            </p>
                          </div>

                          {/* Status Dropdown */}
                          <div style={{ position: 'relative', marginLeft: '1rem' }}>
                            <button
                              onClick={() => setApplicantStatusDropdown(applicantStatusDropdown === applicant._id ? null : applicant._id)}
                              disabled={updatingApplicantId === applicant._id}
                              style={{
                                padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #e9d5f0',
                                background: '#f1f5f9', cursor: updatingApplicantId === applicant._id ? 'not-allowed' : 'pointer',
                                fontWeight: '600', color: '#1f2937', display: 'flex', alignItems: 'center',
                                gap: '0.5rem', opacity: updatingApplicantId === applicant._id ? 0.6 : 1,
                              }}
                            >
                              Update Status <ChevronDown size={16} />
                            </button>

                            {applicantStatusDropdown === applicant._id && (
                              <div style={{
                                position: 'absolute', top: '100%', right: 0, background: 'white',
                                border: '1px solid #e9d5f0', borderRadius: '6px', marginTop: '0.5rem',
                                zIndex: 10000, minWidth: '180px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                              }}>
                                {[
                                  { value: 'applied',              label: '📝 Applied' },
                                  { value: 'shortlisted',          label: '✨ Shortlisted' },
                                  { value: 'interview-scheduled',  label: '📅 Interview Scheduled' },
                                  { value: 'selected',             label: '🎉 Selected' },
                                  { value: 'rejected',             label: '❌ Rejected' },
                                ].map(({ value, label }, i, arr) => (
                                  <button
                                    key={value}
                                    onClick={() => handleApplicantStatusChange(applicant._id || applicant.studentId, value)}
                                    style={{
                                      width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'none',
                                      cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem', color: '#1f2937',
                                      borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
                                      transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={e => e.target.style.backgroundColor = '#f1f5f9'}
                                    onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>No applicants yet</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button onClick={() => setSelectedDrive(null)} style={{ padding: '0.7rem 1.5rem', borderRadius: '8px', border: '1px solid #e9d5f0', background: '#f1f5f9', cursor: 'pointer', fontWeight: '600', color: '#1f2937' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterDrives;