import React, { useState, useEffect } from "react";
import {
  User,
  GraduationCap,
  Code,
  Briefcase,
  Award,
  Edit2,
  Save,
  Upload,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Star,
  Plus,
  X,
  Shield
} from "lucide-react";
import StudentLayout from "../../components/StudentLayout";
import InterviewFeature from "../InterviewFeature";
import ProjectEvaluator from "../ProjectEvaluator";
import "../../styles/student-css/studentdashboard.css";
import "../../styles/student-css/studentprofile.css";
import { useStudent } from "../../context/StudentContext";

const StudentProfile = () => {
  const { student, updateStudent, loading, error } = useStudent();
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState("personal");
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);

  useEffect(() => {
    if (student) {
      setProfileData({
        fullName: student.fullName || "N/A",
        branch: student.branch || "N/A",
        rollNo: student.rollNo || "N/A",
        email: student.email || "N/A",
        phone: student.phone || "N/A",
        dob: student.dob || "N/A",
        address: student.address || "N/A",
        linkedin: student.linkedin || "N/A",
        github: student.github || "N/A",
        portfolio: student.portfolio || "N/A",
        resume: student.resume || "N/A",
        year: student.year || "N/A",
        cgpa: student.cgpa || "N/A"
      });

      setSkills(student.skills || []);
      setProjects(student.projects || []);
      setCertifications(student.certifications || []);
    }
  }, [student]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!profileData) return <p>No profile data found.</p>;

  const handleSave = async () => {
    try {
      await updateStudent(profileData);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile: " + (err.message || "Unknown error"));
    }
  };

  const profileTabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "academic", label: "Academic", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Code },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "certifications", label: "Certifications", icon: Award }
  ];

  // =================== RENDER FUNCTIONS ===================

  const renderPersonalInfo = () => (
    <div className="student-profile-card">
      <div className="student-profile-header">
        <div className="student-profile-avatar">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
            alt="Profile"
          />
          {editMode && (
            <button className="student-avatar-upload">
              <Upload size={16} />
            </button>
          )}
        </div>
        <div className="student-profile-basic">
          <h2>{profileData.fullName}</h2>
          <p>{profileData.branch}</p>
          <p className="student-profile-roll">{profileData.rollNo}</p>
        </div>
      </div>

      <div className="student-profile-section">
        <h3>Contact Information</h3>
        <div className="student-profile-grid">
          <div className="student-profile-field">
            <label>Email</label>
            <div className="student-profile-value">
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

          <div className="student-profile-field">
            <label>Phone</label>
            <div className="student-profile-value">
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

          <div className="student-profile-field">
            <label>Date of Birth</label>
            <div className="student-profile-value">
              <Calendar size={16} />
              {editMode ? (
                <input
                  type="text"
                  value={profileData.dob}
                  onChange={(e) =>
                    setProfileData({ ...profileData, dob: e.target.value })
                  }
                />
              ) : (
                <span>{profileData.dob}</span>
              )}
            </div>
          </div>

          <div className="student-profile-field">
            <label>Address</label>
            <div className="student-profile-value">
              <MapPin size={16} />
              {editMode ? (
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                />
              ) : (
                <span>{profileData.address}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="student-profile-section">
        <h3>Professional Links</h3>
        <div className="student-profile-grid">
          <div className="student-profile-field">
            <label>LinkedIn</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.linkedin}
                onChange={(e) =>
                  setProfileData({ ...profileData, linkedin: e.target.value })
                }
              />
            ) : (
              <span>{profileData.linkedin}</span>
            )}
          </div>

          <div className="student-profile-field">
            <label>GitHub</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.github}
                onChange={(e) =>
                  setProfileData({ ...profileData, github: e.target.value })
                }
              />
            ) : (
              <span>{profileData.github}</span>
            )}
          </div>

          <div className="student-profile-field">
            <label>Portfolio</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.portfolio}
                onChange={(e) =>
                  setProfileData({ ...profileData, portfolio: e.target.value })
                }
              />
            ) : (
              <span>{profileData.portfolio}</span>
            )}
          </div>

          <div className="student-profile-field">
            <label>Resume</label>
            <div className="student-resume-upload">
              <FileText size={16} />
              <span>{profileData.resume}</span>
              {editMode && <button className="student-upload-btn">Upload New</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAcademic = () => (
    <div className="student-profile-card">
      <div className="student-profile-section">
        <h3>Current Academic Details</h3>
        <div className="student-profile-grid">
          <div className="student-profile-field">
            <label>Branch</label>
            <span>{profileData.branch}</span>
          </div>
          <div className="student-profile-field">
            <label>Year</label>
            <span>{profileData.year}</span>
          </div>
          <div className="student-profile-field">
            <label>Roll Number</label>
            <span>{profileData.rollNo}</span>
          </div>
          <div className="student-profile-field">
            <label>Current CGPA</label>
            <div className="student-profile-value">
              <Star size={16} />
              <span>{profileData.cgpa}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="student-profile-card">
      <div className="student-profile-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Skills</h3>
          {editMode && (
            <button 
              className="student-add-btn"
              onClick={() => {
                const newSkill = prompt("Enter skill name:");
                if (newSkill) {
                  setSkills([...skills, newSkill]);
                }
              }}
              style={{ padding: "5px 10px", fontSize: "12px" }}
            >
              <Plus size={16} /> Add Skill
            </button>
          )}
        </div>
        {skills.length === 0 ? (
          <p>No skills added yet.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px" }}>
            {skills.map((skill, idx) => (
              <div 
                key={idx} 
                className="student-skill-tag"
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#e0e7ff",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                {skill}
                {editMode && (
                  <button
                    onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="student-profile-card">
      <div className="student-profile-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Projects</h3>
          {editMode && (
            <button 
              className="student-add-btn"
              onClick={() => {
                const projectName = prompt("Enter project name:");
                if (projectName) {
                  const newProject = {
                    name: projectName,
                    description: prompt("Project description:") || "",
                    tech: prompt("Technologies used:") || "",
                    link: prompt("Project link (without https://):") || ""
                  };
                  setProjects([...projects, newProject]);
                }
              }}
              style={{ padding: "5px 10px", fontSize: "12px" }}
            >
              <Plus size={16} /> Add Project
            </button>
          )}
        </div>
        {projects.length === 0 ? (
          <p>No projects added yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
            {projects.map((project, idx) => (
              <div 
                key={idx} 
                className="student-project-card"
                style={{
                  padding: "15px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  backgroundColor: "#f9fafb"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 8px 0" }}>{project.name}</h4>
                    <p style={{ margin: "5px 0", color: "#6b7280", fontSize: "14px" }}>{project.description}</p>
                    <p style={{ margin: "5px 0", color: "#6b7280", fontSize: "13px" }}>
                      <strong>Tech:</strong> {project.tech}
                    </p>
                    {project.link && (
                      <a 
                        href={`https://${project.link}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: "#3b82f6", textDecoration: "none", fontSize: "13px" }}
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                  {editMode && (
                    <button
                      onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCertifications = () => (
    <div className="student-profile-card">
      <div className="student-profile-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Certifications</h3>
          {editMode && (
            <button 
              className="student-add-btn"
              onClick={() => {
                const certName = prompt("Enter certification name:");
                if (certName) {
                  const newCert = {
                    name: certName,
                    organization: prompt("Issuing organization:") || "",
                    date: prompt("Date (MM/YYYY):") || "",
                    id: prompt("Credential ID (optional):") || ""
                  };
                  setCertifications([...certifications, newCert]);
                }
              }}
              style={{ padding: "5px 10px", fontSize: "12px" }}
            >
              <Plus size={16} /> Add Certification
            </button>
          )}
        </div>
        {certifications.length === 0 ? (
          <p>No certifications added yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
            {certifications.map((cert, idx) => (
              <div 
                key={idx} 
                className="student-certification-card"
                style={{
                  padding: "15px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  backgroundColor: "#f9fafb"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Award size={18} /> {cert.name}
                    </h4>
                    <p style={{ margin: "5px 0", color: "#6b7280", fontSize: "14px" }}>
                      <strong>{cert.organization}</strong>
                    </p>
                    <p style={{ margin: "5px 0", color: "#6b7280", fontSize: "13px" }}>{cert.date}</p>
                    {cert.id && (
                      <p style={{ margin: "5px 0", color: "#6b7280", fontSize: "13px" }}>
                        ID: {cert.id}
                      </p>
                    )}
                  </div>
                  {editMode && (
                    <button
                      onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // =================== RENDER ===================

  return (
    <StudentLayout>
      <div className="student-page-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your personal information and achievements</p>
        </div>
        <button
          className="student-edit-profile-btn"
          onClick={() => (editMode ? handleSave() : setEditMode(true))}
        >
          {editMode ? (
            <>
              <Save size={20} /> Save Changes
            </>
          ) : (
            <>
              <Edit2 size={20} /> Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="student-profile-tabs-container">
        {profileTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveProfileTab(tab.id)}
            className={`student-profile-tab-btn ${
              activeProfileTab === tab.id ? "student-profile-tab-active" : ""
            }`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="student-profile-container">
        {activeProfileTab === "personal" && renderPersonalInfo()}
        {activeProfileTab === "academic" && renderAcademic()}
        {activeProfileTab === "skills" && renderSkills()}
        {activeProfileTab === "projects" && renderProjects()}
        {activeProfileTab === "certifications" && renderCertifications()}
      </div>

      <InterviewFeature />
      <ProjectEvaluator />
    </StudentLayout>
  );
};

export default StudentProfile;
