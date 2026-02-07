import React, { useState } from 'react';
import { Edit2, Save, Upload, Mail, Phone, Calendar, MapPin, Shield, CheckCircle, Settings, UserCheck, FileText, Award, User, Briefcase } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin-css/adminprofile.css';

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('personal');

  const profileData = {
    name: 'Dr. Suresh Patel',
    email: 'suresh.patel@college.edu',
    phone: '+91 9876543100',
    designation: 'System Administrator',
    department: 'IT & Administration',
    experience: '15 Years',
    education: 'Ph.D. in Computer Science',
    specialization: 'System Management & Administration',
    dob: '15/08/1978',
    address: 'Pune, Maharashtra, India',
    linkedin: 'linkedin.com/in/sureshpatel',
    employeeId: 'EMP2010001'
  };

  const profileTabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'permissions', label: 'Permissions', icon: Shield }
  ];

  const permissions = [
    { module: 'Student Management', access: ['View', 'Edit', 'Delete'] },
    { module: 'Recruiter Management', access: ['View', 'Edit', 'Delete'] },
    { module: 'Company Management', access: ['View', 'Edit', 'Delete'] },
    { module: 'Placement Drives', access: ['View', 'Edit', 'Delete'] },
    { module: 'System Settings', access: ['View', 'Edit'] },
    { module: 'Reports & Analytics', access: ['View', 'Export'] }
  ];

  const renderPersonalInfo = () => (
    <div className="admin-profile-card">
      <div className="admin-profile-header">
        <div className="admin-profile-avatar">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh" alt="Profile" />
          {editMode && (
            <button className="admin-avatar-upload">
              <Upload size={16} />
            </button>
          )}
        </div>
        <div className="admin-profile-basic">
          <h2>{profileData.name}</h2>
          <p>{profileData.designation}</p>
          <p className="admin-profile-dept">{profileData.department}</p>
        </div>
      </div>

      <div className="admin-profile-section">
        <h3>Contact Information</h3>
        <div className="admin-profile-grid">
          <div className="admin-profile-field">
            <label>Email</label>
            <div className="admin-profile-value">
              <Mail size={16} />
              {editMode ? <input type="email" defaultValue={profileData.email} /> : <span>{profileData.email}</span>}
            </div>
          </div>
          <div className="admin-profile-field">
            <label>Phone</label>
            <div className="admin-profile-value">
              <Phone size={16} />
              {editMode ? <input type="tel" defaultValue={profileData.phone} /> : <span>{profileData.phone}</span>}
            </div>
          </div>
          <div className="admin-profile-field">
            <label>Date of Birth</label>
            <div className="admin-profile-value">
              <Calendar size={16} />
              {editMode ? <input type="text" defaultValue={profileData.dob} /> : <span>{profileData.dob}</span>}
            </div>
          </div>
          <div className="admin-profile-field">
            <label>Address</label>
            <div className="admin-profile-value">
              <MapPin size={16} />
              {editMode ? <input type="text" defaultValue={profileData.address} /> : <span>{profileData.address}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-profile-section">
        <h3>Professional Links</h3>
        <div className="admin-profile-grid">
          <div className="admin-profile-field">
            <label>LinkedIn</label>
            {editMode ? <input type="text" defaultValue={profileData.linkedin} /> : <span>{profileData.linkedin}</span>}
          </div>
          <div className="admin-profile-field">
            <label>Employee ID</label>
            <span>{profileData.employeeId}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfessional = () => (
    <div className="admin-profile-card">
      <div className="admin-profile-section">
        <h3>Professional Details</h3>
        <div className="admin-profile-grid">
          <div className="admin-profile-field">
            <label>Designation</label>
            <span>{profileData.designation}</span>
          </div>
          <div className="admin-profile-field">
            <label>Department</label>
            <span>{profileData.department}</span>
          </div>
          <div className="admin-profile-field">
            <label>Experience</label>
            <span>{profileData.experience}</span>
          </div>
          <div className="admin-profile-field">
            <label>Education</label>
            <span>{profileData.education}</span>
          </div>
          <div className="admin-profile-field">
            <label>Specialization</label>
            <span>{profileData.specialization}</span>
          </div>
          <div className="admin-profile-field">
            <label>Employee ID</label>
            <span>{profileData.employeeId}</span>
          </div>
        </div>
      </div>

      <div className="admin-profile-section">
        <h3>Work History</h3>
        <div className="admin-work-history-grid">
          {[
            { position: 'System Administrator', organization: 'Current College', duration: '2018 - Present', description: 'Managing campus placement system and IT infrastructure' },
            { position: 'IT Manager', organization: 'Tech Institute', duration: '2015 - 2018', description: 'Led IT operations and digital transformation initiatives' },
            { position: 'Network Administrator', organization: 'Education Hub', duration: '2010 - 2015', description: 'Managed network infrastructure and security systems' }
          ].map((item, idx) => (
            <div key={idx} className="admin-work-history-item">
              <h4>{item.position}</h4>
              <p className="admin-work-org">{item.organization}</p>
              <p className="admin-work-duration">{item.duration}</p>
              <p className="admin-work-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-profile-section">
        <h3>Certifications & Training</h3>
        <div className="admin-certifications-grid">
          {[
            { name: 'Certified Information Systems Security Professional (CISSP)', org: 'ISC²', year: '2020' },
            { name: 'AWS Certified Solutions Architect', org: 'Amazon Web Services', year: '2019' },
            { name: 'Project Management Professional (PMP)', org: 'PMI', year: '2017' }
          ].map((cert, idx) => (
            <div key={idx} className="admin-certification-item">
              <div className="admin-certification-icon">
                <Award size={24} />
              </div>
              <div className="admin-certification-content">
                <h4>{cert.name}</h4>
                <p>{cert.org} • {cert.year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="admin-profile-card">
      <div className="admin-profile-section">
        <div className="admin-permissions-header">
          <h3>System Access & Permissions</h3>
          {editMode && (
            <button className="admin-add-btn admin-modify-access-btn">
              <Shield size={18} />
              Modify Access
            </button>
          )}
        </div>

        <div className="admin-permissions-grid">
          {permissions.map((perm, idx) => (
            <div key={idx} className="admin-permission-item">
              <div className="admin-permission-header">
                <h4>
                  <Shield size={20} />
                  {perm.module}
                </h4>
              </div>
              <div className="admin-permission-badges">
                {perm.access.map((access, i) => (
                  <div key={i} className="admin-permission-badge">
                    <CheckCircle size={14} />
                    {access}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-profile-section">
        <h3>Recent Activity</h3>
        <div className="admin-recent-activity-grid">
          {[
            { action: 'Updated system settings', timestamp: '2 hours ago', type: 'settings' },
            { action: 'Added new recruiter account', timestamp: '1 day ago', type: 'user' },
            { action: 'Generated placement report', timestamp: '2 days ago', type: 'report' },
            { action: 'Modified company details', timestamp: '3 days ago', type: 'edit' }
          ].map((activity, idx) => (
            <div key={idx} className="admin-recent-activity-item">
              <div className={`admin-activity-type-icon admin-activity-type-${activity.type}`}>
                {activity.type === 'settings' && <Settings size={20} />}
                {activity.type === 'user' && <UserCheck size={20} />}
                {activity.type === 'report' && <FileText size={20} />}
                {activity.type === 'edit' && <Edit2 size={20} />}
              </div>
              <span className="admin-activity-action">{activity.action}</span>
              <span className="admin-activity-timestamp">{activity.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>Profile Settings</h1>
          <p>Manage your administrator account</p>
        </div>
        <button className="admin-edit-profile-btn" onClick={() => setEditMode(!editMode)}>
          {editMode ? (
            <>
              <Save size={20} />
              Save Changes
            </>
          ) : (
            <>
              <Edit2 size={20} />
              Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="admin-profile-tabs-container">
        {profileTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveProfileTab(tab.id)}
            className={`admin-profile-tab ${activeProfileTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-profile-container">
        {activeProfileTab === 'personal' && renderPersonalInfo()}
        {activeProfileTab === 'professional' && renderProfessional()}
        {activeProfileTab === 'permissions' && renderPermissions()}
      </div>
    </AdminLayout>
  );
};

export default Profile;