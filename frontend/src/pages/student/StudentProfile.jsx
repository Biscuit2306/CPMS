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
import ResumeAnalyzerModal from "../../components/ResumeAnalyzerModal";

const StudentProfile = () => {
  const { student, updateStudent, loading, error } = useStudent();

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState("personal");
  
  // New skill/project/cert form states
  const [newSkill, setNewSkill] = useState("");
  const [newProject, setNewProject] = useState({ name: "", description: "", tech: "", link: "" });
  const [newCert, setNewCert] = useState({ name: "", organization: "", date: "", id: "" });
  
  // Edit states
  const [editingSkillIdx, setEditingSkillIdx] = useState(null);
  const [editingProjectIdx, setEditingProjectIdx] = useState(null);
  const [editingCertIdx, setEditingCertIdx] = useState(null);

  const [showResumeModal, setShowResumeModal] = useState(false);

  useEffect(() => {
    if (student) {
      setProfileData({
        fullName: student.fullName || "",
        branch: student.branch || "",
        rollNo: student.rollNo || "",
        email: student.email || "",
        phone: student.phone || "",
        dob: student.dob || "",
        address: student.address || "",
        linkedin: student.linkedin || "",
        github: student.github || "",
        portfolio: student.portfolio || "",
        resume: student.resume || "",
        year: student.year || "",
        cgpa: student.cgpa || "",
        skills: student.skills || [],
        projects: student.projects || [],
        certifications: student.certifications || []
      });
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
            <label>Full Name</label>
            <div className="student-profile-value">
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

              {profileData.resume && profileData.resume !== "N/A" && profileData.resume !== "" ? (
                <a
                  href={`${BACKEND_URL}${profileData.resume}`}
                  target="_blank"
                  rel="noreferrer"
                  className="student-resume-link"
                >
                  View Resume
                </a>
              ) : (
                <span>{profileData.resume || "No resume uploaded"}</span>
              )}

              {editMode && (
                <button
                  type="button"
                  className="student-upload-btn"
                  onClick={() => setShowResumeModal(true)}
                >
                  Upload New
                </button>
              )}

              <button
                type="button"
                className="student-analyze-btn"
                onClick={() => setShowResumeModal(true)}
                disabled={!profileData.resume || profileData.resume === "N/A" || profileData.resume === ""}
              >
                Analyze
              </button>
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
        </div>
        
        {profileData.skills.length === 0 ? (
          <p>No skills added yet.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px" }}>
            {profileData.skills.map((skill, idx) => (
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
                {editingSkillIdx === idx && editMode ? (
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => {
                      const updatedSkills = [...profileData.skills];
                      updatedSkills[idx] = e.target.value;
                      setProfileData({ ...profileData, skills: updatedSkills });
                    }}
                    style={{ padding: "4px", borderRadius: "4px", border: "1px solid #cbd5e1", width: "120px" }}
                  />
                ) : (
                  <span>{skill}</span>
                )}
                {editMode && (
                  <div style={{ display: "flex", gap: "4px" }}>
                    {editingSkillIdx === idx ? (
                      <button
                        onClick={() => setEditingSkillIdx(null)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#10b981", fontSize: "14px", fontWeight: "bold" }}
                      >
                        ✓
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingSkillIdx(idx)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", fontSize: "12px" }}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const updatedSkills = profileData.skills.filter((_, i) => i !== idx);
                        setProfileData({ ...profileData, skills: updatedSkills });
                      }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {editMode && (
          <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f3f4f6", borderRadius: "8px" }}>
            <h4 style={{ marginTop: 0 }}>Add New Skill</h4>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter skill name"
                style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
              />
              <button
                onClick={() => {
                  if (newSkill.trim()) {
                    setProfileData({ ...profileData, skills: [...profileData.skills, newSkill.trim()] });
                    setNewSkill("");
                  }
                }}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                <Plus size={16} /> Add
              </button>
            </div>
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
        </div>
        
        {profileData.projects.length === 0 ? (
          <p>No projects added yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
            {profileData.projects.map((project, idx) => (
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
                {editingProjectIdx === idx && editMode ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => {
                        const updatedProjects = [...profileData.projects];
                        updatedProjects[idx].name = e.target.value;
                        setProfileData({ ...profileData, projects: updatedProjects });
                      }}
                      placeholder="Project Name"
                      style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                    <textarea
                      value={project.description}
                      onChange={(e) => {
                        const updatedProjects = [...profileData.projects];
                        updatedProjects[idx].description = e.target.value;
                        setProfileData({ ...profileData, projects: updatedProjects });
                      }}
                      placeholder="Project Description"
                      style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1", minHeight: "60px" }}
                    />
                    <input
                      type="text"
                      value={project.tech}
                      onChange={(e) => {
                        const updatedProjects = [...profileData.projects];
                        updatedProjects[idx].tech = e.target.value;
                        setProfileData({ ...profileData, projects: updatedProjects });
                      }}
                      placeholder="Technologies (comma separated)"
                      style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      type="text"
                      value={project.link}
                      onChange={(e) => {
                        const updatedProjects = [...profileData.projects];
                        updatedProjects[idx].link = e.target.value;
                        setProfileData({ ...profileData, projects: updatedProjects });
                      }}
                      placeholder="Project Link (e.g., github.com/user/project)"
                      style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                    <button
                      onClick={() => setEditingProjectIdx(null)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
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
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => setEditingProjectIdx(idx)}
                          style={{ background: "#3b82f6", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            const updatedProjects = profileData.projects.filter((_, i) => i !== idx);
                            setProfileData({ ...profileData, projects: updatedProjects });
                          }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {editMode && (
          <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f3f4f6", borderRadius: "8px" }}>
            <h4 style={{ marginTop: 0 }}>Add New Project</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="Project Name"
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
              />
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Project Description"
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1", minHeight: "60px" }}
              />
              <input
                type="text"
                value={newProject.tech}
                onChange={(e) => setNewProject({ ...newProject, tech: e.target.value })}
                placeholder="Technologies (comma separated)"
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
              />
              <input
                type="text"
                value={newProject.link}
                onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                placeholder="Project Link (e.g., github.com/user/project)"
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
              />
              <button
                onClick={() => {
                  if (newProject.name.trim()) {
                    setProfileData({
                      ...profileData,
                      projects: [...profileData.projects, newProject]
                    });
                    setNewProject({ name: "", description: "", tech: "", link: "" });
                  }
                }}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                <Plus size={16} /> Add Project
              </button>
            </div>
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
        </div>
        
        {profileData.certifications.length === 0 ? (
          <p>No certifications added yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
            {profileData.certifications.map((cert, idx) => (
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
                {editingCertIdx === idx && editMode ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => {
                        const updatedCerts = [...profileData.certifications];
                        updatedCerts[idx].name = e.target.value;
                        setProfileData({ ...profileData, certifications: updatedCerts });
                      }}
                      placeholder="Certification Name"
                      style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      type="text"
                      value={cert.organization}
                      onChange={(e) => {
                        const updatedCerts = [...profileData.certifications];
                        updatedCerts[idx].organization = e.target.value;
                        setProfileData({ ...profileData, certifications: updatedCerts });
                      }}
                      placeholder="Issuing Organization"
                      style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      type="text"
                      value={cert.date}
                      onChange={(e) => {
                        const updatedCerts = [...profileData.certifications];
                        updatedCerts[idx].date = e.target.value;
                        setProfileData({ ...profileData, certifications: updatedCerts });
                      }}
                      placeholder="Date (MM/YYYY)"
                      style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      type="text"
                      value={cert.id}
                      onChange={(e) => {
                        const updatedCerts = [...profileData.certifications];
                        updatedCerts[idx].id = e.target.value;
                        setProfileData({ ...profileData, certifications: updatedCerts });
                      }}
                      placeholder="Credential ID (optional)"
                      style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                    <button
                      onClick={() => setEditingCertIdx(null)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
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
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => setEditingCertIdx(idx)}
                          style={{ background: "#3b82f6", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            const updatedCerts = profileData.certifications.filter((_, i) => i !== idx);
                            setProfileData({ ...profileData, certifications: updatedCerts });
                          }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {editMode && (
          <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f3f4f6", borderRadius: "8px" }}>
            <h4 style={{ marginTop: 0 }}>Add New Certification</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                type="text"
                value={newCert.name}
                onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                placeholder="Certification Name"
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
              />
              <input
                type="text"
                value={newCert.organization}
                onChange={(e) => setNewCert({ ...newCert, organization: e.target.value })}
                placeholder="Issuing Organization"
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
              />
              <input
                type="text"
                value={newCert.date}
                onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                placeholder="Date (MM/YYYY)"
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
              />
              <input
                type="text"
                value={newCert.id}
                onChange={(e) => setNewCert({ ...newCert, id: e.target.value })}
                placeholder="Credential ID (optional)"
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
              />
              <button
                onClick={() => {
                  if (newCert.name.trim()) {
                    setProfileData({
                      ...profileData,
                      certifications: [...profileData.certifications, newCert]
                    });
                    setNewCert({ name: "", organization: "", date: "", id: "" });
                  }
                }}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                <Plus size={16} /> Add Certification
              </button>
            </div>
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

      <ResumeAnalyzerModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        currentResume={
          student?.resume && student?.resume !== "N/A" && student?.resume !== ""
            ? `${BACKEND_URL}${student.resume}`
            : null
        }
        student={student}
      />
    </StudentLayout>
  );
};

export default StudentProfile;