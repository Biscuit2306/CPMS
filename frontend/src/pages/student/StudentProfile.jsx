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
        profilePhoto: student.profilePhoto || "",
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
      console.log('student profileData before update', profileData.profilePhoto ? profileData.profilePhoto.slice(0,50)+'...' : '(no photo)');
      const updated = await updateStudent(profileData);
      // make sure our local state reflects any server changes
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
      const updated = await updateStudent({ profilePhoto: "" });
      setProfileData(prev => ({ ...prev, profilePhoto: "", ...(updated || {}) }));
      alert('Profile photo removed');
    } catch (err) {
      alert('Failed to remove profile photo: ' + (err.message || err));
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
          {profileData.profilePhoto ? (
            <img
              src={profileData.profilePhoto.startsWith('http') || profileData.profilePhoto.startsWith('data:')
                ? profileData.profilePhoto
                : `http://localhost:5000${profileData.profilePhoto}`}
              alt="Profile"
            />
          ) : (
            <div className="initial-avatar profile-initial">{(profileData.fullName || profileData.email || 'S')[0].toUpperCase()}</div>
          )}

          {editMode && (
            <div className="student-avatar-actions">
              {!profileData.profilePhoto && (
                <button
                  className="student-avatar-upload"
                  onClick={() => document.getElementById('student-photo-upload').click()}
                >
                  <Upload size={16} />
                </button>
              )}
              {profileData.profilePhoto && (
                <button className="student-avatar-remove" onClick={removePhoto}>
                  Remove
                </button>
              )}
            </div>
          )}

          <input
            id="student-photo-upload"
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
            {editMode ? (
              <input
                type="text"
                value={profileData.branch}
                onChange={e => setProfileData({ ...profileData, branch: e.target.value })}
              />
            ) : (
              <span>{profileData.branch}</span>
            )}
          </div>
          <div className="student-profile-field">
            <label>Year</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.year}
                onChange={e => setProfileData({ ...profileData, year: e.target.value })}
              />
            ) : (
              <span>{profileData.year}</span>
            )}
          </div>
          <div className="student-profile-field">
            <label>Roll Number</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.rollNo}
                onChange={e => setProfileData({ ...profileData, rollNo: e.target.value })}
              />
            ) : (
              <span>{profileData.rollNo}</span>
            )}
          </div>
          <div className="student-profile-field">
            <label>Current CGPA</label>
            <div className="student-profile-value">
              <Star size={16} />
              {editMode ? (
                <input
                  type="text"
                  value={profileData.cgpa}
                  onChange={e => setProfileData({ ...profileData, cgpa: e.target.value })}
                />
              ) : (
                <span>{profileData.cgpa}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="student-profile-card">
      <div className="student-profile-section">
        <div className="section-header spaced-between">
          <h3>Skills</h3>
        </div>

        {profileData.skills.length === 0 ? (
          <p>No skills added yet.</p>
        ) : (
          <div className="student-skills-list">
            {profileData.skills.map((skill, idx) => (
              <div key={idx} className="student-skill-item">
                {editingSkillIdx === idx && editMode ? (
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => {
                      const updatedSkills = [...profileData.skills];
                      updatedSkills[idx] = e.target.value;
                      setProfileData({ ...profileData, skills: updatedSkills });
                    }}
                    className="student-skill-item"
                  />
                ) : (
                  <span>{skill}</span>
                )}
                {editMode && (
                  <div className="skill-actions">
                    {editingSkillIdx === idx ? (
                      <button onClick={() => setEditingSkillIdx(null)} className="btn-accept">✓</button>
                    ) : (
                      <button onClick={() => setEditingSkillIdx(idx)} className="btn-edit">Edit</button>
                    )}
                    <button
                      onClick={() => {
                        const updatedSkills = profileData.skills.filter((_, i) => i !== idx);
                        setProfileData({ ...profileData, skills: updatedSkills });
                      }}
                      className="btn-delete"
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
          <div className="form-card">
            <h4 className="subheading">Add New Skill</h4>
            <div className="form-row">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter skill name"
                className="input-full"
              />
              <button
                onClick={() => {
                  if (newSkill.trim()) {
                    setProfileData({ ...profileData, skills: [...profileData.skills, newSkill.trim()] });
                    setNewSkill("");
                  }
                }}
                className="btn-primary small"
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
          <div className="section-header spaced-between">
            <h3>Projects</h3>
          </div>

          {profileData.projects.length === 0 ? (
            <p>No projects added yet.</p>
          ) : (
            <div className="projects-grid">
              {profileData.projects.map((project, idx) => (
                <div key={idx} className="student-project-card">
                  {editingProjectIdx === idx && editMode ? (
                    <div className="project-edit-col">
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => {
                          const updatedProjects = [...profileData.projects];
                          updatedProjects[idx].name = e.target.value;
                          setProfileData({ ...profileData, projects: updatedProjects });
                        }}
                        placeholder="Project Name"
                        className="input-default"
                      />
                      <textarea
                        value={project.description}
                        onChange={(e) => {
                          const updatedProjects = [...profileData.projects];
                          updatedProjects[idx].description = e.target.value;
                          setProfileData({ ...profileData, projects: updatedProjects });
                        }}
                        placeholder="Project Description"
                        className="input-textarea"
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
                        className="input-default"
                      />
                      <input
                        type="text"
                        value={project.link}
                        onChange={(e) => setProfileData({ ...profileData, projects: updatedProjects })}
                        placeholder="Project Link (e.g., github.com/user/project)"
                        className="input-default"
                      />
                      <button onClick={() => setEditingProjectIdx(null)} className="btn-primary">Save</button>
                    </div>
                  ) : (
                    <div className="project-row">
                      <div className="project-main">
                        <h4 className="project-title">{project.name}</h4>
                        <p className="muted-small">{project.description}</p>
                        <p className="muted-small"><strong>Tech:</strong> {project.tech}</p>
                        {project.link && (
                          <a href={`https://${project.link}`} target="_blank" rel="noreferrer" className="link-primary">View Project →</a>
                        )}
                      </div>
                      {editMode && (
                        <div className="project-actions">
                          <button onClick={() => setEditingProjectIdx(idx)} className="btn-outline small">Edit</button>
                          <button onClick={() => { const updatedProjects = profileData.projects.filter((_, i) => i !== idx); setProfileData({ ...profileData, projects: updatedProjects }); }} className="btn-delete"><X size={18} /></button>
                        </div>
                      )}
                    </div>
                  )}
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
        <div className="section-header spaced-between">
          <h3>Certifications</h3>
        </div>

        {profileData.certifications.length === 0 ? (
          <p>No certifications added yet.</p>
        ) : (
          <div className="student-certificates-list">
            {profileData.certifications.map((cert, idx) => (
              <div key={idx} className="student-certificate-item">
                {editingCertIdx === idx && editMode ? (
                  <div className="cert-edit-col">
                    <input type="text" value={cert.name} onChange={(e) => { const updatedCerts = [...profileData.certifications]; updatedCerts[idx].name = e.target.value; setProfileData({ ...profileData, certifications: updatedCerts }); }} placeholder="Certification Name" className="student-certificate-item" />
                    <input type="text" value={cert.organization} onChange={(e) => { const updatedCerts = [...profileData.certifications]; updatedCerts[idx].organization = e.target.value; setProfileData({ ...profileData, certifications: updatedCerts }); }} placeholder="Issuing Organization" className="student-certificate-item" />
                    <input type="text" value={cert.date} onChange={(e) => { const updatedCerts = [...profileData.certifications]; updatedCerts[idx].date = e.target.value; setProfileData({ ...profileData, certifications: updatedCerts }); }} placeholder="Date (MM/YYYY)" className="student-certificate-item" />
                    <input type="text" value={cert.id} onChange={(e) => { const updatedCerts = [...profileData.certifications]; updatedCerts[idx].id = e.target.value; setProfileData({ ...profileData, certifications: updatedCerts }); }} placeholder="Credential ID (optional)" className="student-certificate-item" />
                    <button onClick={() => setEditingCertIdx(null)} className="btn-primary">Save</button>
                  </div>
                ) : (
                  <div className="cert-row">
                    <div className="cert-main">
                      <h4 className="cert-title"><Award size={18} /> {cert.name}</h4>
                      <p className="muted-small"><strong>{cert.organization}</strong></p>
                      <p className="muted-small">{cert.date}</p>
                      {cert.id && (<p className="muted-small">ID: {cert.id}</p>)}
                    </div>
                    {editMode && (
                      <div className="cert-actions">
                        <button onClick={() => setEditingCertIdx(idx)} className="btn-outline small">Edit</button>
                        <button onClick={() => { const updatedCerts = profileData.certifications.filter((_, i) => i !== idx); setProfileData({ ...profileData, certifications: updatedCerts }); }} className="btn-delete"><X size={18} /></button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {editMode && (
          <div className="form-card">
            <h4 className="subheading">Add New Certification</h4>
            <div className="form-col">
              <input type="text" value={newCert.name} onChange={(e) => setNewCert({ ...newCert, name: e.target.value })} placeholder="Certification Name" className="input-default" />
              <input type="text" value={newCert.organization} onChange={(e) => setNewCert({ ...newCert, organization: e.target.value })} placeholder="Issuing Organization" className="input-default" />
              <input type="text" value={newCert.date} onChange={(e) => setNewCert({ ...newCert, date: e.target.value })} placeholder="Date (MM/YYYY)" className="input-default" />
              <input type="text" value={newCert.id} onChange={(e) => setNewCert({ ...newCert, id: e.target.value })} placeholder="Credential ID (optional)" className="input-default" />
              <button onClick={() => { if (newCert.name.trim()) { setProfileData({ ...profileData, certifications: [...profileData.certifications, newCert] }); setNewCert({ name: "", organization: "", date: "", id: "" }); } }} className="btn-primary"><Plus size={16} /> Add Certification</button>
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