import React, { useState, useEffect } from 'react';
import {
  Edit2, Save, Upload,
  Mail, Phone, Shield, CheckCircle,
  User, Briefcase, X
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/admin-css/adminprofile.css';

const Profile = () => {
  const { admin, updateAdmin, loading, error } = useAdmin();
  const [editMode, setEditMode] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    collegeName: '',
    employeeId: '',
    adminRole: '',
    department: '',
    profilePhoto: '',
  });

  useEffect(() => {
    if (admin) {
      setProfileData({
        fullName: admin.fullName || '',
        email: admin.email || '',
        phone: admin.phone || '',
        collegeName: admin.collegeName || '',
        employeeId: admin.employeeId || '',
        adminRole: admin.adminRole || '',
        department: admin.department || '',
        profilePhoto: admin.profilePhoto || '',
      });
    }
  }, [admin]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!admin) return <p>No profile data found.</p>;

  const handleSave = async () => {
    try {
      await updateAdmin(profileData);
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile: ' + (err.message || 'Unknown error'));
    }
  };

  const removePhoto = async () => {
    if (!confirm('Remove profile photo?')) return;
    try {
      const updated = await updateAdmin({ profilePhoto: '' });
      setProfileData(prev => ({ ...prev, profilePhoto: '', ...(updated || {}) }));
      alert('Profile photo removed');
    } catch (err) {
      alert('Failed to remove photo: ' + (err.message || 'Unknown error'));
    }
  };

  const profileTabs = [
    { id: 'personal',     label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional',  icon: Briefcase },
    { id: 'permissions',  label: 'Permissions',   icon: Shield },
  ];

  // =================== RENDER FUNCTIONS ===================

  const renderPersonalInfo = () => (
    <div className="admin-profile-card">
      <div className="admin-profile-header">
        <div>
          <div className="admin-profile-avatar">
            {profileData.profilePhoto ? (
              <img
                src={profileData.profilePhoto.startsWith('http') || profileData.profilePhoto.startsWith('data:')
                  ? profileData.profilePhoto
                  : `http://localhost:5000${profileData.profilePhoto}`}
                alt="Profile"
              />
            ) : (
              <div className="initial-avatar profile-initial">{(profileData.fullName || 'A')[0].toUpperCase()}</div>
            )}

            {editMode && (
              <div className="admin-avatar-actions">
                {!profileData.profilePhoto && (
                  <button
                    className="admin-avatar-upload"
                    onClick={() => document.getElementById('admin-photo-upload').click()}
                  >
                    <Upload size={16} />
                  </button>
                )}
                {profileData.profilePhoto && (
                  <button className="admin-avatar-remove" onClick={removePhoto}>
                    Remove
                  </button>
                )}
              </div>
            )}

            <input
              id="admin-photo-upload"
              type="file"
              accept="image/*"
              className="hidden-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    setProfileData({ ...profileData, profilePhoto: evt.target?.result });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <div className="admin-profile-basic">
            <h2>{profileData.fullName}</h2>
            <p>{profileData.adminRole}</p>
            <p className="admin-profile-dept">{profileData.department}</p>
          </div>
        </div>
      </div>

      <div className="admin-profile-section">
        <h3>Contact Information</h3>
        <div className="admin-profile-grid">

          <div className="admin-profile-field">
            <label>Full Name</label>
            <div className="admin-profile-value">
              {editMode ? (
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                />
              ) : (
                <span>{profileData.fullName}</span>
              )}
            </div>
          </div>

          <div className="admin-profile-field">
            <label>Email</label>
            <div className="admin-profile-email-value">
              <Mail size={16} />
              {editMode ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              ) : (
                <span>{profileData.email}</span>
              )}
            </div>
          </div>

          <div className="admin-profile-field">
            <label>Phone</label>
            <div className="admin-profile-value">
              <Phone size={16} />
              {editMode ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              ) : (
                <span>{profileData.phone}</span>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="admin-profile-section">
        <h3>Institution Details</h3>
        <div className="admin-profile-grid">

          <div className="admin-profile-field">
            <label>College Name</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.collegeName}
                onChange={(e) => setProfileData({ ...profileData, collegeName: e.target.value })}
              />
            ) : (
              <span className="admin-profile-college-name">{profileData.collegeName}</span>
            )}
          </div>

          <div className="admin-profile-field">
            <label>Employee ID</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.employeeId}
                onChange={(e) => setProfileData({ ...profileData, employeeId: e.target.value })}
              />
            ) : (
              <span className="admin-profile-college-name">{profileData.employeeId}</span>
            )}
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
            <label>Role</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.adminRole}
                onChange={(e) => setProfileData({ ...profileData, adminRole: e.target.value })}
              />
            ) : (
              <span>{profileData.adminRole}</span>
            )}
          </div>

          <div className="admin-profile-field">
            <label>Department</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
              />
            ) : (
              <span>{profileData.department}</span>
            )}
          </div>

          <div className="admin-profile-field">
            <label>College Name</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.collegeName}
                onChange={(e) => setProfileData({ ...profileData, collegeName: e.target.value })}
              />
            ) : (
              <span>{profileData.collegeName}</span>
            )}
          </div>

          <div className="admin-profile-field">
            <label>Employee ID</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.employeeId}
                onChange={(e) => setProfileData({ ...profileData, employeeId: e.target.value })}
              />
            ) : (
              <span>{profileData.employeeId}</span>
            )}
          </div>

        </div>
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="admin-profile-card">
      <div className="admin-profile-section">
        <h3 className="perm-title">System Access &amp; Permissions</h3>
        <p className="perm-subtitle">
          Administrator has full system access to all modules including:
        </p>
        <div className="perm-grid">
          {[
            { module: 'Student Management',   access: ['View', 'Edit', 'Delete'] },
            { module: 'Recruiter Management', access: ['View', 'Edit', 'Delete'] },
            { module: 'Company Management',   access: ['View', 'Edit', 'Delete'] },
            { module: 'Placement Drives',     access: ['View', 'Edit', 'Delete'] },
            { module: 'System Settings',      access: ['View', 'Edit'] },
            { module: 'Reports & Analytics',  access: ['View', 'Export'] },
          ].map((perm, idx) => (
            <div key={idx} className="perm-card">
              <div className="perm-card-header">
                <Shield size={15} />
                <span className="perm-card-title">{perm.module}</span>
              </div>
              <div className="perm-badges-row">
                {perm.access.map((access, i) => (
                  <span key={i} className={`perm-badge perm-badge--${access.toLowerCase()}`}>
                    <CheckCircle size={11} />
                    {access}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // =================== RENDER ===================

  return (
    <AdminLayout>
      {/* Banner with Edit button in top-right like student profile page header */}
      <div className="admin-banner">
        <div className="admin-banner-content">
          <div className="admin-banner-text">
            <h1>Profile Settings</h1>
            <p>Manage your administrator account</p>
          </div>
          <button
            className="admin-edit-profile-btn"
            onClick={() => (editMode ? handleSave() : setEditMode(true))}
          >
            {editMode ? (
              <><Save size={20} /> Save Changes</>
            ) : (
              <><Edit2 size={20} /> Edit Profile</>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-profile-tabs-container">
        {profileTabs.map((tab) => (
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

      {/* Tab Content */}
      <div className="admin-profile-container">
        {activeProfileTab === 'personal'     && renderPersonalInfo()}
        {activeProfileTab === 'professional' && renderProfessional()}
        {activeProfileTab === 'permissions'  && renderPermissions()}
      </div>
    </AdminLayout>
  );
};

export default Profile;