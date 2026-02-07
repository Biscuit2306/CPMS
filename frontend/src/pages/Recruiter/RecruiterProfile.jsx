import React, { useState, useEffect } from 'react';
import { Edit2, Save, Mail, Phone, Calendar, MapPin, Award, Briefcase, Users, Building2, TrendingUp, Activity, User, Upload } from 'lucide-react';
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
      });
    }
  }, [recruiter]);

  const profileTabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!profileData) return <p>No profile data found.</p>;

  const handleSave = async () => {
    try {
      await updateRecruiter(profileData);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile: " + (err.message || "Unknown error"));
    }
  };

  const renderPersonalInfo = () => (
    <div className="recruiter-profile-card">
      <div className="recruiter-profile-header">
        <div className="recruiter-profile-avatar">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.fullName}`} alt="Profile" />
          {editMode && (
            <button className="recruiter-avatar-upload-btn">
              <Upload size={16} />
            </button>
          )}
        </div>
        <div className="recruiter-profile-basic">
          <h2>{profileData.fullName}</h2>
          <p>{profileData.designation}</p>
          <p className="recruiter-profile-dept">{profileData.companyName}</p>
        </div>
      </div>

      <div className="recruiter-profile-section">
        <h3>Contact Information</h3>
        <div className="recruiter-profile-grid">
          <div className="recruiter-profile-field">
            <label>Full Name</label>
            <div className="recruiter-profile-value">
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
          <div className="recruiter-profile-field">
            <label>Email</label>
            <div className="recruiter-profile-value">
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
          <div className="recruiter-profile-field">
            <label>Phone</label>
            <div className="recruiter-profile-value">
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

      <div className="recruiter-profile-section">
        <h3>Company Information</h3>
        <div className="recruiter-profile-grid">
          <div className="recruiter-profile-field">
            <label>Company Name</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.companyName}
                onChange={(e) =>
                  setProfileData({ ...profileData, companyName: e.target.value })
                }
              />
            ) : (
              <span>{profileData.companyName}</span>
            )}
          </div>
          <div className="recruiter-profile-field">
            <label>Company Website</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.companyWebsite}
                onChange={(e) =>
                  setProfileData({ ...profileData, companyWebsite: e.target.value })
                }
              />
            ) : (
              <span>{profileData.companyWebsite}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfessional = () => (
    <div className="recruiter-profile-card">
      <div className="recruiter-profile-section">
        <h3>Professional Details</h3>
        <div className="recruiter-profile-grid">
          <div className="recruiter-profile-field">
            <label>Designation</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.designation}
                onChange={(e) =>
                  setProfileData({ ...profileData, designation: e.target.value })
                }
              />
            ) : (
              <span>{profileData.designation}</span>
            )}
          </div>
          <div className="recruiter-profile-field">
            <label>Company Name</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.companyName}
                onChange={(e) =>
                  setProfileData({ ...profileData, companyName: e.target.value })
                }
              />
            ) : (
              <span>{profileData.companyName}</span>
            )}
          </div>
          <div className="recruiter-profile-field">
            <label>Company Size</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.companySize}
                onChange={(e) =>
                  setProfileData({ ...profileData, companySize: e.target.value })
                }
              />
            ) : (
              <span>{profileData.companySize}</span>
            )}
          </div>
          <div className="recruiter-profile-field">
            <label>Company Website</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.companyWebsite}
                onChange={(e) =>
                  setProfileData({ ...profileData, companyWebsite: e.target.value })
                }
              />
            ) : (
              <span>{profileData.companyWebsite}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="recruiter-profile-card">
      <div className="recruiter-profile-section">
        <h3>Profile Information</h3>
        <p>Basic recruiter profile information</p>
        <div className="recruiter-profile-grid" style={{ marginTop: "15px" }}>
          <div className="recruiter-profile-field">
            <label>Company</label>
            <span>{profileData.companyName}</span>
          </div>
          <div className="recruiter-profile-field">
            <label>Designation</label>
            <span>{profileData.designation}</span>
          </div>
          <div className="recruiter-profile-field">
            <label>Email</label>
            <span>{profileData.email}</span>
          </div>
          <div className="recruiter-profile-field">
            <label>Phone</label>
            <span>{profileData.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
        <div className="recruiter-dashboard-content">
          <div className="recruiter-page-header">
            <div>
              <h1>Profile Settings</h1>
              <p>Manage your account information</p>
            </div>
            <button className="recruiter-edit-profile-btn" onClick={() => {
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

          <div className="recruiter-profile-tabs">
            {profileTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveProfileTab(tab.id)}
                className={`recruiter-profile-tab ${activeProfileTab === tab.id ? 'active' : ''}`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="recruiter-profile-container">
            {activeProfileTab === 'personal' && renderPersonalInfo()}
            {activeProfileTab === 'professional' && renderProfessional()}
            {activeProfileTab === 'activity' && renderActivity()}
          </div>
        </div>
    </RecruiterLayout>
  );
};

export default Profile;