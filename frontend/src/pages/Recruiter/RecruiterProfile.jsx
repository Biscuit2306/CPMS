import React, { useState, useEffect } from 'react';
import {
  Edit2, Save, Mail, Phone, Upload,
  Activity, User, Briefcase
} from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { useRecruiter } from '../../context/RecruiterContext';
import '../../styles/RecruiterCSS/recruiterprofile.css';

const Profile = () => {
  const { recruiter, updateRecruiter, loading, error } = useRecruiter();
  const [activeMenu, setActiveMenu] = useState('profile');
  const [activeProfileTab, setActiveProfileTab] = useState('personal');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (recruiter) {
      setProfileData({
        fullName: recruiter.fullName || "",
        email: recruiter.email || "",
        phone: recruiter.phone || "",
        companyName: recruiter.companyName || "",
        designation: recruiter.designation || "",
        companyWebsite: recruiter.companyWebsite || "",
        companySize: recruiter.companySize || "",
        profilePhoto: recruiter.profilePhoto || "",
      });
    }
  }, [recruiter]);

  const profileTabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!profileData) return <p>No profile data found.</p>;

  const handleSave = async () => {
    try {
      console.log('recruiter profileData before update', profileData.profilePhoto ? profileData.profilePhoto.slice(0,50)+'...' : '(no photo)');
      const updated = await updateRecruiter(profileData);
      if (updated) {
        setProfileData(prev => ({ ...prev, ...updated }));
      }
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile: " + (err.message || "Unknown error"));
    }
  };
  
  const removePhoto = async () => {
    if (!confirm('Remove profile photo?')) return;
    try {
      const updated = await updateRecruiter({ profilePhoto: "" });
      setProfileData(prev => ({ ...prev, profilePhoto: "", ...(updated || {}) }));
      alert('Profile photo removed');
    } catch (err) {
      alert('Failed to remove profile photo: ' + (err.message || err));
    }
  };

  // ── Personal Info Tab ───────────────────────────────────────────────────────
  const renderPersonalInfo = () => (
    <div className="rp-card">
      {/* Avatar + Name */}
      <div className="rp-card-header">
        <div className="rp-avatar-wrap">
            {profileData.profilePhoto ? (
              <img
                src={profileData.profilePhoto.startsWith('http') || profileData.profilePhoto.startsWith('data:')
                  ? profileData.profilePhoto
                  : `https://cpms-xtz8.onrender.com${profileData.profilePhoto}`}
                alt="Profile"
                className="rp-avatar-img"
              />
            ) : (
              <div className="initial-avatar profile-initial">{(profileData.fullName || profileData.email || 'R')[0].toUpperCase()}</div>
            )}
          {editMode && (
            <div className="rp-avatar-actions">
              {!profileData.profilePhoto && (
                <button
                  className="rp-avatar-upload-btn"
                  onClick={() => document.getElementById('recruiter-photo-upload').click()}
                >
                  <Upload size={14} />
                </button>
              )}
              {profileData.profilePhoto && (
                <button className="rp-avatar-remove-btn" onClick={removePhoto}>Remove</button>
              )}
              <input
                id="recruiter-photo-upload"
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
          )}
        </div>
        <div className="rp-name-block">
          <h2 className="rp-name">{profileData.fullName}</h2>
          <p className="rp-designation">{profileData.designation}</p>
          <p className="rp-company">{profileData.companyName}</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="rp-section">
        <h3 className="rp-section-title">Contact Information</h3>
        <div className="rp-field-grid">

          <div className="rp-field">
            <label className="rp-label">Full Name</label>
            {editMode ? (
              <input
                type="text"
                className="rp-input"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              />
            ) : (
              <div className="rp-display-box">
                <span className="rp-value-text">{profileData.fullName}</span>
              </div>
            )}
          </div>

          <div className="rp-field">
            <label className="rp-label">Email</label>
            {editMode ? (
              <div className="rp-input rp-input--icon-wrap">
                <Mail size={15} className="rp-field-icon" />
                <input
                  type="email"
                  className="rp-input-icon-field"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>
            ) : (
              <div className="rp-display-box rp-display-box--icon">
                <Mail size={15} className="rp-field-icon" />
                <span className="rp-value-text">{profileData.email}</span>
              </div>
            )}
          </div>

          <div className="rp-field">
            <label className="rp-label">Phone</label>
            {editMode ? (
              <div className="rp-input rp-input--icon-wrap">
                <Phone size={15} className="rp-field-icon" />
                <input
                  type="tel"
                  className="rp-input-icon-field"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
            ) : (
              <div className="rp-display-box rp-display-box--icon">
                <Phone size={15} className="rp-field-icon" />
                <span className="rp-value-text">{profileData.phone}</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Company Information */}
      <div className="rp-section">
        <h3 className="rp-section-title">Company Information</h3>
        <div className="rp-field-grid">

          <div className="rp-field">
            <label className="rp-label">Company Name</label>
            {editMode ? (
              <input
                type="text"
                className="rp-input"
                value={profileData.companyName}
                onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
              />
            ) : (
              <div className="rp-display-box">
                <span className="rp-value-text">{profileData.companyName}</span>
              </div>
            )}
          </div>

          <div className="rp-field">
            <label className="rp-label">Company Website</label>
            {editMode ? (
              <input
                type="text"
                className="rp-input"
                value={profileData.companyWebsite}
                onChange={(e) => setProfileData({ ...profileData, companyWebsite: e.target.value })}
              />
            ) : (
              <div className="rp-display-box">
                <span className="rp-value-text">{profileData.companyWebsite}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );

  // ── Professional Tab ────────────────────────────────────────────────────────
  const renderProfessional = () => (
    <div className="rp-card">
      <div className="rp-section">
        <h3 className="rp-section-title">Professional Details</h3>
        <div className="rp-field-grid">

          <div className="rp-field">
            <label className="rp-label">Designation</label>
            {editMode ? (
              <input
                type="text"
                className="rp-input"
                value={profileData.designation}
                onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
              />
            ) : (
              <div className="rp-display-box">
                <span className="rp-value-text">{profileData.designation}</span>
              </div>
            )}
          </div>

          <div className="rp-field">
            <label className="rp-label">Company Name</label>
            {editMode ? (
              <input
                type="text"
                className="rp-input"
                value={profileData.companyName}
                onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
              />
            ) : (
              <div className="rp-display-box">
                <span className="rp-value-text">{profileData.companyName}</span>
              </div>
            )}
          </div>

          <div className="rp-field">
            <label className="rp-label">Company Size</label>
            {editMode ? (
              <input
                type="text"
                className="rp-input"
                value={profileData.companySize}
                onChange={(e) => setProfileData({ ...profileData, companySize: e.target.value })}
              />
            ) : (
              <div className="rp-display-box">
                <span className="rp-value-text">{profileData.companySize}</span>
              </div>
            )}
          </div>

          <div className="rp-field">
            <label className="rp-label">Company Website</label>
            {editMode ? (
              <input
                type="text"
                className="rp-input"
                value={profileData.companyWebsite}
                onChange={(e) => setProfileData({ ...profileData, companyWebsite: e.target.value })}
              />
            ) : (
              <div className="rp-display-box">
                <span className="rp-value-text">{profileData.companyWebsite}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );

  // ── Activity Tab ────────────────────────────────────────────────────────────
  const renderActivity = () => (
    <div className="rp-card">
      <div className="rp-section">
        <h3 className="rp-section-title">Profile Information</h3>
        <p className="rp-section-subtitle">Basic recruiter profile information</p>
        <div className="rp-field-grid rp-field-grid--mt">

          <div className="rp-field">
            <label className="rp-label">Company</label>
            {editMode ? (
              <input
                type="text"
                className="rp-input"
                value={profileData.companyName}
                onChange={e => setProfileData({ ...profileData, companyName: e.target.value })}
              />
            ) : (
              <div className="rp-display-box">
                <span className="rp-value-text">{profileData.companyName}</span>
              </div>
            )}
          </div>

          <div className="rp-field">
            <label className="rp-label">Designation</label>
            {editMode ? (
              <input
                type="text"
                className="rp-input"
                value={profileData.designation}
                onChange={e => setProfileData({ ...profileData, designation: e.target.value })}
              />
            ) : (
              <div className="rp-display-box">
                <span className="rp-value-text">{profileData.designation}</span>
              </div>
            )}
          </div>

          <div className="rp-field">
            <label className="rp-label">Email</label>
            {editMode ? (
              <div className="rp-input rp-input--icon-wrap">
                <Mail size={15} className="rp-field-icon" />
                <input
                  type="email"
                  className="rp-input-icon-field"
                  value={profileData.email}
                  onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>
            ) : (
              <div className="rp-display-box rp-display-box--icon">
                <Mail size={15} className="rp-field-icon" />
                <span className="rp-value-text">{profileData.email}</span>
              </div>
            )}
          </div>

          <div className="rp-field">
            <label className="rp-label">Phone</label>
            {editMode ? (
              <div className="rp-input rp-input--icon-wrap">
                <Phone size={15} className="rp-field-icon" />
                <input
                  type="tel"
                  className="rp-input-icon-field"
                  value={profileData.phone}
                  onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
            ) : (
              <div className="rp-display-box rp-display-box--icon">
                <Phone size={15} className="rp-field-icon" />
                <span className="rp-value-text">{profileData.phone}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );

  // ── Main Render ─────────────────────────────────────────────────────────────
  return (
    <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
      {/* <div className="recruiter-dashboard-content"> */}

        {/* Page Header */}
        <div className="recruiter-page-header">
          <div>
            <h1>Profile Settings</h1>
            <p>Manage your account information</p>
          </div>
          <button
            className="rp-edit-btn"
            onClick={() => (editMode ? handleSave() : setEditMode(true))}
          >
            {editMode ? (
              <><Save size={18} /> Save Changes</>
            ) : (
              <><Edit2 size={18} /> Edit Profile</>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="rp-tabs">
          {profileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveProfileTab(tab.id)}
              className={`rp-tab-btn${activeProfileTab === tab.id ? ' rp-tab-btn--active' : ''}`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="rp-content">
          {activeProfileTab === 'personal' && renderPersonalInfo()}
          {activeProfileTab === 'professional' && renderProfessional()}
          {activeProfileTab === 'activity' && renderActivity()}
        </div>

      {/* </div> */}
    </RecruiterLayout>
  );
};

export default Profile;     