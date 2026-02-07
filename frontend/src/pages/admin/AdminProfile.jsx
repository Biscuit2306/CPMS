import React, { useState, useEffect } from 'react';
import { Edit2, Save, Upload, Mail, Phone, Calendar, MapPin, Shield, CheckCircle, Settings, UserCheck, FileText, Award, User, Briefcase } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/admin-css/adminprofile.css';

const Profile = () => {
  const { admin, updateAdmin, loading, error } = useAdmin();
  const [editMode, setEditMode] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('personal');
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (admin) {
      setProfileData({
        fullName: admin.fullName || "",
        email: admin.email || "",
        phone: admin.phone || "",
        collegeName: admin.collegeName || "",
        employeeId: admin.employeeId || "",
        adminRole: admin.adminRole || "",
        department: admin.department || "",
      });
    }
  }, [admin]);

  const profileTabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'permissions', label: 'Permissions', icon: Shield }
  ];

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!profileData) return <p>No profile data found.</p>;

  const handleSave = async () => {
    try {
      await updateAdmin(profileData);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile: " + (err.message || "Unknown error"));
    }
  };

  const renderPersonalInfo = () => (
    <div className="admin-profile-card">
      <div className="admin-profile-header">
        <div className="admin-profile-avatar">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.fullName}`} alt="Profile" />
          {editMode && (
            <button className="admin-avatar-upload">
              <Upload size={16} />
            </button>
          )}
        </div>
        <div className="admin-profile-basic">
          <h2>{profileData.fullName}</h2>
          <p>{profileData.adminRole}</p>
          <p className="admin-profile-dept">{profileData.department}</p>
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
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                />
              ) : (
                <span>{profileData.fullName}</span>
              )}
            </div>
          </div>
          <div className="admin-profile-field">
            <label>Email</label>
            <div className="admin-profile-value">
              <Mail size={16} />
              {editMode ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
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
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
              ) : (
                <span>{profileData.phone}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-profile-section">
        <h3>Professional Links</h3>
        <div className="admin-profile-grid">
          <div className="admin-profile-field">
            <label>College Name</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.collegeName}
                onChange={(e) =>
                  setProfileData({ ...profileData, collegeName: e.target.value })
                }
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
                onChange={(e) =>
                  setProfileData({ ...profileData, employeeId: e.target.value })
                }
              />
            ) : (
              <span>{profileData.employeeId}</span>
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
                onChange={(e) =>
                  setProfileData({ ...profileData, adminRole: e.target.value })
                }
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
                onChange={(e) =>
                  setProfileData({ ...profileData, department: e.target.value })
                }
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
                onChange={(e) =>
                  setProfileData({ ...profileData, collegeName: e.target.value })
                }
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
                onChange={(e) =>
                  setProfileData({ ...profileData, employeeId: e.target.value })
                }
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
        <div className="admin-permissions-header">
          <h3>System Access & Permissions</h3>
        </div>
        <p>Administrator has full system access to all modules including:</p>
        <div className="admin-permissions-grid">
          {[
            { module: 'Student Management', access: ['View', 'Edit', 'Delete'] },
            { module: 'Recruiter Management', access: ['View', 'Edit', 'Delete'] },
            { module: 'Company Management', access: ['View', 'Edit', 'Delete'] },
            { module: 'Placement Drives', access: ['View', 'Edit', 'Delete'] },
            { module: 'System Settings', access: ['View', 'Edit'] },
            { module: 'Reports & Analytics', access: ['View', 'Export'] }
          ].map((perm, idx) => (
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
    </div>
  );

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>Profile Settings</h1>
          <p>Manage your administrator account</p>
        </div>
        <button className="admin-edit-profile-btn" onClick={() => {
          if (editMode) {
            handleSave();
          } else {
            setEditMode(true);
          }
        }}>
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