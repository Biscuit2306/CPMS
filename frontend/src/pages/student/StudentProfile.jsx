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
  X
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
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const [showResumeModal, setShowResumeModal] = useState(false);

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

              {profileData.resume && profileData.resume !== "N/A" ? (
                <a
                  href={`${BACKEND_URL}${profileData.resume}`}
                  target="_blank"
                  rel="noreferrer"
                  className="student-resume-link"
                >
                  View Resume
                </a>
              ) : (
                <span className="student-no-resume">
                  No resume uploaded
                </span>
              )}

              <div className="resume-action-buttons">
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
                  disabled={!profileData.resume || profileData.resume === "N/A"}
                >
                  Analyze
                </button>
              </div>
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
        <div className="student-flex-between">
          <h3>Skills</h3>
          {editMode && (
            <button
              className="student-add-btn student-add-btn-small"
              onClick={() => {
                const newSkill = prompt("Enter skill name:");
                if (newSkill) setSkills([...skills, newSkill]);
              }}
            >
              <Plus size={16} /> Add Skill
            </button>
          )}
        </div>

        {skills.length === 0 ? (
          <p>No skills added yet.</p>
        ) : (
          <div className="student-skills-tags">
            {skills.map((skill, idx) => (
              <div key={idx} className="student-skill-tag">
                {skill}
                {editMode && (
                  <button
                    className="student-remove-icon-btn"
                    onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
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
        <div className="student-flex-between">
          <h3>Projects</h3>
          {editMode && (
            <button
              className="student-add-btn student-add-btn-small"
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
            >
              <Plus size={16} /> Add Project
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <p>No projects added yet.</p>
        ) : (
          <div className="student-projects-list">
            {projects.map((project, idx) => (
              <div key={idx} className="student-project-card">
                <div className="student-project-top">
                  <div className="student-project-main">
                    <h4 className="student-project-name">{project.name}</h4>

                    <p className="student-project-desc">
                      {project.description}
                    </p>

                    <p className="student-project-tech">
                      <strong>Tech:</strong> {project.tech}
                    </p>

                    {project.link && (
                      <a
                        href={`https://${project.link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="student-project-link"
                      >
                        View Project →
                      </a>
                    )}
                  </div>

                  {editMode && (
                    <button
                      className="student-delete-btn"
                      onClick={() =>
                        setProjects(projects.filter((_, i) => i !== idx))
                      }
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
        <div className="student-flex-between">
          <h3>Certifications</h3>
          {editMode && (
            <button
              className="student-add-btn student-add-btn-small"
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
            >
              <Plus size={16} /> Add Certification
            </button>
          )}
        </div>

        {certifications.length === 0 ? (
          <p>No certifications added yet.</p>
        ) : (
          <div className="student-certifications-list">
            {certifications.map((cert, idx) => (
              <div key={idx} className="student-certification-card">
                <div className="student-certification-top">
                  <div className="student-certification-main">
                    <h4 className="student-certification-name">
                      <Award size={18} /> {cert.name}
                    </h4>

                    <p className="student-certification-org">
                      <strong>{cert.organization}</strong>
                    </p>

                    <p className="student-certification-date">{cert.date}</p>

                    {cert.id && (
                      <p className="student-certification-id">
                        ID: {cert.id}
                      </p>
                    )}
                  </div>

                  {editMode && (
                    <button
                      className="student-delete-btn"
                      onClick={() =>
                        setCertifications(
                          certifications.filter((_, i) => i !== idx)
                        )
                      }
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

      <ResumeAnalyzerModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        currentResume={
          student?.resume && student?.resume !== "N/A"
            ? `${BACKEND_URL}${student.resume}`
            : null
        }
        student={student}
      />
    </StudentLayout>
  );
};

export default StudentProfile;
