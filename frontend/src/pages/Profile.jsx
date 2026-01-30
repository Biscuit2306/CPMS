import React, { useState, useEffect } from 'react';
import {
  Bell, Calendar, Briefcase, User, LogOut, Menu, X,
  Award, TrendingUp, Settings, FileText, Building2,
  Edit, Save, Trash2, Plus, Upload, Mail, Phone,
  MapPin, GraduationCap, Code, Linkedin, Github, Globe
} from 'lucide-react';
import { Link } from "react-router-dom";
import '../styles/profile.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";




export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    college: '',
    branch: '',
    year: '',
    cgpa: '',
    passingYear: '',
    bio: '',
    linkedin: '',
    github: '',
    portfolio: ''
  });

  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const [newSkill, setNewSkill] = useState({ name: '', level: 'Beginner' });
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: '',
    link: ''
  });
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    date: '',
    credentialId: ''
  });



   


  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/user/${profileData.email}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profileData,
          skills,
          projects,
          certifications
        })
      }
    );

    if (!res.ok) throw new Error("Save failed");

    setIsEditing(false);
    alert("Profile updated successfully");
  } catch (err) {
    console.error(err);
    alert("Error saving profile");
  }
};


  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setSkills([...skills, { id: Date.now(), ...newSkill }]);
      setNewSkill({ name: '', level: 'Beginner' });
    }
  };

  const handleDeleteSkill = (id) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const handleAddProject = () => {
    if (newProject.title.trim() && newProject.description.trim()) {
      setProjects([
        ...projects,
        {
          id: Date.now(),
          ...newProject,
          technologies: newProject.technologies
            .split(',')
            .map(t => t.trim())
        }
      ]);
      setNewProject({ title: '', description: '', technologies: '', link: '' });
    }
  };

  const handleDeleteProject = (id) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const handleAddCertification = () => {
    if (newCertification.name.trim() && newCertification.issuer.trim()) {
      setCertifications([
        ...certifications,
        { id: Date.now(), ...newCertification }
      ]);
      setNewCertification({
        name: '',
        issuer: '',
        date: '',
        credentialId: ''
      });
    }
  };

  const handleDeleteCertification = (id) => {
    setCertifications(
      certifications.filter(cert => cert.id !== id)
    );
  };


  return (
    <div className="profile">
      <Navbar />

      <div className="profile__layout">
        {/* Enhanced Sidebar */}
        <aside className={`profile__sidebar ${sidebarOpen ? 'profile__sidebar--open' : ''}`}>
          <div className="profile__sidebar-header">
            <div className="profile__user-profile">
              <div className="profile__avatar">JD</div>
              <div className="profile__user-details">
                <h4>John Doe</h4>
                <p>B.Tech CSE</p>
              </div>
            </div>
          </div>

          <div className="profile__sidebar-content">
            <nav className="profile__nav">
              <Link to="/student" className="profile__nav-item">
                <TrendingUp size={20} />
                <span>Dashboard</span>
              </Link>

              <Link to="/pages/jobdrives" className="profile__nav-item">
                <Building2 size={20} />
                <span>Job Drives</span>
              </Link>

              <Link to="/applications" className="profile__nav-item">
                <FileText size={20} />
                <span>Applications</span>
              </Link>

              <Link to="/schedulepage" className="profile__nav-item">
                <Calendar size={20} />
                <span>Schedule</span>
              </Link>

              <Link to="/achievements" className="profile__nav-item">
                <Award size={20} />
                <span>Achievements</span>
              </Link>

              <Link
                to="/profile"
                className="profile__nav-item profile__nav-item--active"
              >
                <User size={20} />
                <span>Profile</span>
                <div className="profile__nav-indicator"></div>
              </Link>

              <Link to="/settings" className="profile__nav-item">
                <Settings size={20} />
                <span>Settings</span>
              </Link>
            </nav>
          </div>

          <div className="profile__sidebar-footer">
            <button className="profile__logout-btn">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="profile__main">
          <div className="profile__content">
            {/* Header */}
            <div className="profile__header">
              <div className="profile__header-text">
                <h2 className="profile__title">
                  My <span className="highlight-text">Profile</span>
                </h2>
                <p className="profile__subtitle">
                  Manage your personal information and preferences
                </p>
              </div>
              <div className="profile__actions">
                {isEditing ? (
                  <>
                    <button className="profile__save-btn" onClick={handleSave}>
                      <Save size={18} />
                      Save Changes
                    </button>
                    <button className="profile__cancel-btn" onClick={() => setIsEditing(false)}>
                      <X size={18} />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="profile__edit-btn" onClick={() => setIsEditing(true)}>
                    <Edit size={18} />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Profile Card */}
            <div className="profile__card-main">
              <div className="profile__banner"></div>
              <div className="profile__info-section">
                <div className="profile__avatar-large">
                  <span>JD</span>
                  <button className="profile__avatar-upload">
                    <Upload size={16} />
                  </button>
                </div>
                <div className="profile__basic-info">
                  <h3>{profileData.name}</h3>
                  <p>{profileData.branch} • {profileData.year}</p>
                  <p className="profile__college">{profileData.college}</p>
                </div>
                <div className="profile__stats">
                  <div className="profile__stat">
                    <span className="profile__stat-value">12</span>
                    <span className="profile__stat-label">Applications</span>
                  </div>
                  <div className="profile__stat">
                    <span className="profile__stat-value">5</span>
                    <span className="profile__stat-label">Shortlisted</span>
                  </div>
                  <div className="profile__stat">
                    <span className="profile__stat-value">1</span>
                    <span className="profile__stat-label">Offers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="profile__tabs">
              <button
                className={`profile__tab ${activeTab === 'personal' ? 'profile__tab--active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                Personal Info
              </button>
              <button
                className={`profile__tab ${activeTab === 'academic' ? 'profile__tab--active' : ''}`}
                onClick={() => setActiveTab('academic')}
              >
                Academic
              </button>
              <button
                className={`profile__tab ${activeTab === 'skills' ? 'profile__tab--active' : ''}`}
                onClick={() => setActiveTab('skills')}
              >
                Skills
              </button>
              <button
                className={`profile__tab ${activeTab === 'projects' ? 'profile__tab--active' : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                Projects
              </button>
              <button
                className={`profile__tab ${activeTab === 'certifications' ? 'profile__tab--active' : ''}`}
                onClick={() => setActiveTab('certifications')}
              >
                Certifications
              </button>
            </div>

            {/* Tab Content */}
            <div className="profile__tab-content">
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="profile__section">
                  <h3 className="profile__section-title">Personal Information</h3>
                  <div className="profile__form-grid">
                    <div className="profile__form-group">
                      <label className="profile__label">
                        <User size={16} />
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="profile__input"
                          value={profileData.name}
                          onChange={(e) => handleProfileChange('name', e.target.value)}
                        />
                      ) : (
                        <p className="profile__value">{profileData.name}</p>
                      )}
                    </div>

                    <div className="profile__form-group">
                      <label className="profile__label">
                        <Mail size={16} />
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          className="profile__input"
                          value={profileData.email}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                        />
                      ) : (
                        <p className="profile__value">{profileData.email}</p>
                      )}
                    </div>

                    <div className="profile__form-group">
                      <label className="profile__label">
                        <Phone size={16} />
                        Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          className="profile__input"
                          value={profileData.phone}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                        />
                      ) : (
                        <p className="profile__value">{profileData.phone}</p>
                      )}
                    </div>

                    <div className="profile__form-group">
                      <label className="profile__label">
                        <MapPin size={16} />
                        Location
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="profile__input"
                          value={profileData.location}
                          onChange={(e) => handleProfileChange('location', e.target.value)}
                        />
                      ) : (
                        <p className="profile__value">{profileData.location}</p>
                      )}
                    </div>

                    <div className="profile__form-group profile__form-group--full">
                      <label className="profile__label">Bio</label>
                      {isEditing ? (
                        <textarea
                          className="profile__textarea"
                          rows="4"
                          value={profileData.bio}
                          onChange={(e) => handleProfileChange('bio', e.target.value)}
                        />
                      ) : (
                        <p className="profile__value">{profileData.bio}</p>
                      )}
                    </div>

                    <div className="profile__form-group">
                      <label className="profile__label">
                        <Linkedin size={16} />
                        LinkedIn
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="profile__input"
                          value={profileData.linkedin}
                          onChange={(e) => handleProfileChange('linkedin', e.target.value)}
                        />
                      ) : (
                        <p className="profile__value">{profileData.linkedin}</p>
                      )}
                    </div>

                    <div className="profile__form-group">
                      <label className="profile__label">
                        <Github size={16} />
                        GitHub
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="profile__input"
                          value={profileData.github}
                          onChange={(e) => handleProfileChange('github', e.target.value)}
                        />
                      ) : (
                        <p className="profile__value">{profileData.github}</p>
                      )}
                    </div>

                    <div className="profile__form-group">
                      <label className="profile__label">
                        <Globe size={16} />
                        Portfolio
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="profile__input"
                          value={profileData.portfolio}
                          onChange={(e) => handleProfileChange('portfolio', e.target.value)}
                        />
                      ) : (
                        <p className="profile__value">{profileData.portfolio}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Tab */}
              {activeTab === 'academic' && (
                <div className="profile__section">
                  <h3 className="profile__section-title">Academic Information</h3>
                  <div className="profile__form-grid">
                    <div className="profile__form-group">
                      <label className="profile__label">
                        <GraduationCap size={16} />
                        College/University
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="profile__input"
                          value={profileData.college}
                          onChange={(e) => handleProfileChange('college', e.target.value)}
                        />
                      ) : (
                        <p className="profile__value">{profileData.college}</p>
                      )}
                    </div>

                    <div className="profile__form-group">
                      <label className="profile__label">Branch/Specialization</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="profile__input"
                          value={profileData.branch}
                          onChange={(e) => handleProfileChange('branch', e.target.value)}
                        />
                      ) : (
                        <p className="profile__value">{profileData.branch}</p>
                      )}
                    </div>

                    <div className="profile__form-group">
                      <label className="profile__label">Current Year</label>
                      {isEditing ? (
                        <select
                          className="profile__select"
                          value={profileData.year}
                          onChange={(e) => handleProfileChange('year', e.target.value)}
                        >
                          <option>1st Year</option>
                          <option>2nd Year</option>
                          <option>3rd Year</option>
                          <option>4th Year</option>
                        </select>
                      ) : (
                        <p className="profile__value">{profileData.year}</p>
                      )}
                    </div>

                    <div className="profile__form-group">
                      <label className="profile__label">CGPA/Percentage</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="profile__input"
                          value={profileData.cgpa}
                          onChange={(e) => handleProfileChange('cgpa', e.target.value)}
                        />
                      ) : (
                        <p className="profile__value">{profileData.cgpa}</p>
                      )}
                    </div>

                    <div className="profile__form-group">
                      <label className="profile__label">Passing Year</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="profile__input"
                          value={profileData.passingYear}
                          onChange={(e) => handleProfileChange('passingYear', e.target.value)}
                        />
                      ) : (
                        <p className="profile__value">{profileData.passingYear}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === 'skills' && (
                <div className="profile__section">
                  <div className="profile__section-header">
                    <h3 className="profile__section-title">Skills</h3>
                  </div>

                  {/* Add New Skill */}
                  <div className="profile__add-section">
                    <input
                      type="text"
                      className="profile__input"
                      placeholder="Skill name (e.g., React)"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    />
                    <select
                      className="profile__select"
                      value={newSkill.level}
                      onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                    <button className="profile__add-btn" onClick={handleAddSkill}>
                      <Plus size={18} />
                      Add Skill
                    </button>
                  </div>

                  {/* Skills List */}
                  <div className="profile__items-grid">
                    {skills.map(skill => (
                      <div key={skill.id} className="profile__skill-item">
                        <div className="profile__skill-info">
                          <Code size={20} className="profile__skill-icon" />
                          <div>
                            <h4>{skill.name}</h4>
                            <p className={`profile__skill-level profile__skill-level--${skill.level.toLowerCase()}`}>
                              {skill.level}
                            </p>
                          </div>
                        </div>
                        <button
                          className="profile__delete-btn"
                          onClick={() => handleDeleteSkill(skill.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <div className="profile__section">
                  <div className="profile__section-header">
                    <h3 className="profile__section-title">Projects</h3>
                  </div>

                  {/* Add New Project */}
                  <div className="profile__add-section profile__add-section--column">
                    <input
                      type="text"
                      className="profile__input"
                      placeholder="Project Title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    />
                    <textarea
                      className="profile__textarea"
                      rows="3"
                      placeholder="Description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    />
                    <input
                      type="text"
                      className="profile__input"
                      placeholder="Technologies (comma separated)"
                      value={newProject.technologies}
                      onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                    />
                    <input
                      type="text"
                      className="profile__input"
                      placeholder="Project Link (optional)"
                      value={newProject.link}
                      onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                    />
                    <button className="profile__add-btn" onClick={handleAddProject}>
                      <Plus size={18} />
                      Add Project
                    </button>
                  </div>

                  {/* Projects List */}
                  <div className="profile__projects-list">
                    {projects.map(project => (
                      <div key={project.id} className="profile__project-card">
                        <div className="profile__project-header">
                          <h4>{project.title}</h4>
                          <button
                            className="profile__delete-btn"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="profile__project-description">{project.description}</p>
                        <div className="profile__project-tech">
                          {project.technologies.map((tech, idx) => (
                            <span key={idx} className="profile__tech-tag">{tech}</span>
                          ))}
                        </div>
                        {project.link && (
                          <a href={`https://${project.link}`} target="_blank" rel="noopener noreferrer" className="profile__project-link">
                            View Project →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications Tab */}
              {activeTab === 'certifications' && (
                <div className="profile__section">
                  <div className="profile__section-header">
                    <h3 className="profile__section-title">Certifications</h3>
                  </div>

                  {/* Add New Certification */}
                  <div className="profile__add-section profile__add-section--column">
                    <input
                      type="text"
                      className="profile__input"
                      placeholder="Certification Name"
                      value={newCertification.name}
                      onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                    />
                    <input
                      type="text"
                      className="profile__input"
                      placeholder="Issuing Organization"
                      value={newCertification.issuer}
                      onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                    />
                    <input
                      type="text"
                      className="profile__input"
                      placeholder="Issue Date (e.g., Dec 2025)"
                      value={newCertification.date}
                      onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })}
                    />
                    <input
                      type="text"
                      className="profile__input"
                      placeholder="Credential ID (optional)"
                      value={newCertification.credentialId}
                      onChange={(e) => setNewCertification({ ...newCertification, credentialId: e.target.value })}
                    />
                    <button className="profile__add-btn" onClick={handleAddCertification}>
                      <Plus size={18} />
                      Add Certification
                    </button>
                  </div>

                  {/* Certifications List */}
                  <div className="profile__certs-list">
                    {certifications.map(cert => (
                      <div key={cert.id} className="profile__cert-card">
                        <div className="profile__cert-icon">🎓</div>
                        <div className="profile__cert-info">
                          <h4>{cert.name}</h4>
                          <p className="profile__cert-issuer">{cert.issuer}</p>
                          <p className="profile__cert-date">Issued: {cert.date}</p>
                          {cert.credentialId && (
                            <p className="profile__cert-id">ID: {cert.credentialId}</p>
                          )}
                        </div>
                        <button
                          className="profile__delete-btn"
                          onClick={() => handleDeleteCertification(cert.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}