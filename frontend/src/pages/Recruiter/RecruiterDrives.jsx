import React, { useState } from 'react';
import { Briefcase, Calendar, MapPin, Users, DollarSign, Eye, Edit2, Trash2, Plus, Lock } from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { useRecruiter } from '../../context/RecruiterContext';
import '../../styles/RecruiterCSS/recruiterdrives.css';

const RecruiterDrives = () => {
  const [activeMenu, setActiveMenu] = useState('drives');
  const { drives, drivesLoading, createDrive, deleteDrive } = useRecruiter();
  const [showAddDrive, setShowAddDrive] = useState(false);
  const [formData, setFormData] = useState({
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
      yearsEligible: ['Final Year']
    },
    rounds: ['Online Test', 'Technical Interview', 'HR Round']
  });

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
        applicants: []
      });
      setShowAddDrive(false);
      setFormData({
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
          yearsEligible: ['Final Year']
        },
        rounds: ['Online Test', 'Technical Interview', 'HR Round']
      });
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

  const getStatusLabel = (status) => {
    if (status === 'active') return 'Active';
    if (status === 'scheduled') return 'Scheduled';
    if (status === 'completed') return 'Completed';
    return 'Active';
  };

  if (drivesLoading) {
    return (
      <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
        <div className="recruiter-dashboard-content">
          <p>Loading drives...</p>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
      <div className="recruiter-dashboard-content">
        <div className="recruiter-page-header">
          <div>
            <h1>Placement Drives</h1>
            <p>Manage and track ongoing recruitment drives</p>
          </div>
          <button 
            className="recruiter-add-drive-btn"
            onClick={() => setShowAddDrive(!showAddDrive)}
          >
            <Plus size={20} />
            {showAddDrive ? 'Cancel' : 'Add Drive'}
          </button>
        </div>

        {showAddDrive && (
          <div className="recruiter-add-drive-form-container">
            <h3>Create New Drive</h3>
            <div className="recruiter-form-grid">
              <div className="recruiter-form-field">
                <label>
                  Company Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
              <div className="recruiter-form-field">
                <label>
                  Position <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Software Engineer"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                />
              </div>
              <div className="recruiter-form-field">
                <label>
                  Salary <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 13.5 LPA"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                />
              </div>
              <div className="recruiter-form-field">
                <label>
                  Location <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Bangalore"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className="recruiter-form-field">
                <label>
                  Drive Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="recruiter-form-field">
                <label>
                  Application Deadline <span className="required">*</span>
                </label>
                <input
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
                />
              </div>
              <div className="recruiter-form-field">
                <label>Min CGPA</label>
                <input
                  type="number"
                  placeholder="e.g., 7.5"
                  step="0.1"
                  value={formData.eligibilityCriteria.minCGPA || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    eligibilityCriteria: {
                      ...formData.eligibilityCriteria,
                      minCGPA: e.target.value ? parseFloat(e.target.value) : 0
                    }
                  })}
                />
              </div>
            </div>
            <div className="recruiter-form-field recruiter-form-grid full-width">
              <label>Job Description</label>
              <textarea
                placeholder="Describe the job role, responsibilities, and requirements..."
                value={formData.jobDescription}
                onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
              />
            </div>
            <div className="recruiter-form-actions">
              <button 
                className="recruiter-btn-cancel"
                onClick={() => setShowAddDrive(false)}
              >
                Cancel
              </button>
              <button 
                className="recruiter-submit-btn"
                onClick={handleAddDrive}
              >
                <Plus size={18} />
                Create Drive
              </button>
            </div>
          </div>
        )}

        <div className="recruiter-drives-grid">
          {drives && drives.length > 0 ? (
            drives.map((drive) => (
              <div key={drive._id} className="recruiter-drive-card" style={drive.isBlocked || drive.isDeleted ? { opacity: 0.6, position: 'relative' } : {}}>
                {(drive.isBlocked || drive.isDeleted) && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    backdropFilter: 'blur(2px)'
                  }}>
                    <div style={{
                      backgroundColor: '#fff',
                      padding: '16px',
                      borderRadius: '6px',
                      textAlign: 'center',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}>
                      <Lock size={28} style={{ color: '#f59e0b', marginBottom: '8px' }} />
                      <p style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '2px' }}>Job Drive Blocked</p>
                      <p style={{ fontSize: '12px', color: '#666' }}>By Admin</p>
                    </div>
                  </div>
                )}
                <div className="recruiter-drive-card-header">
                  <div className="recruiter-company-logo-large">
                    {drive.position?.charAt(0) || 'J'}
                  </div>
                  <div className="recruiter-drive-title">
                    <h3>{drive.position}</h3>
                    <span className={`recruiter-drive-status-badge ${drive.status}`}>
                      {getStatusLabel(drive.status)}
                    </span>
                  </div>
                </div>

                <p className="recruiter-job-role">{drive.salary}</p>

                <div className="recruiter-drive-details">
                  <div className="recruiter-drive-detail-item">
                    <Calendar size={16} />
                    {new Date(drive.date).toLocaleDateString()}
                  </div>
                  <div className="recruiter-drive-detail-item">
                    <MapPin size={16} />
                    {drive.location}
                  </div>
                  <div className="recruiter-drive-detail-item">
                    <DollarSign size={16} />
                    {drive.salary}
                  </div>
                  <div className="recruiter-drive-detail-item">
                    <Users size={16} />
                    {drive.applicants ? drive.applicants.length : 0} Applicants
                  </div>
                </div>

                <div className="recruiter-drive-actions">
                  <button className="recruiter-view-btn">
                    <Eye size={16} />
                    View Details
                  </button>
                  <button 
                    className="recruiter-delete-btn"
                    onClick={() => handleDeleteDrive(drive._id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px'}}>
              <p>No drives created yet. Click "Add Drive" to create one!</p>
            </div>
          )}
        </div>
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterDrives;