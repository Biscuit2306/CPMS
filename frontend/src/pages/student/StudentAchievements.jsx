import React, { useState, useEffect } from "react";
import {
  Award,
  Trophy,
  Medal,
  Star,
  Zap,
  Target,
  Flame,
  Plus,
  Edit2,
  X,
  ExternalLink,
  Download,
  AlertCircle,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import StudentLayout from "../../components/StudentLayout";
import AchievementModal from "../../components/AchievementModal";
import InterviewFeature from "../InterviewFeature";
import ProjectEvaluator from "../ProjectEvaluator";
import achievementsService from "../../services/achievementsService";
import "../../styles/student-css/studentdashboard.css";
import "../../styles/student-css/studentachievements.css";

const StudentAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uid, setUid] = useState(null);

  // Get user UID from Firebase Auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid);
      } else {
        // Fallback to localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            setUid(parsed.uid);
          } catch (e) {
            console.error("Failed to parse user from localStorage:", e);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Category to icon and color mapping
  const categoryConfig = {
    Certification: { icon: Award, color: "#06b6d4" },
    Award: { icon: Trophy, color: "#f59e0b" },
    Hackathon: { icon: Flame, color: "#ef4444" },
    Coding: { icon: Zap, color: "#8b5cf6" },
    Academic: { icon: Target, color: "#10b981" },
    Project: { icon: Target, color: "#3b82f6" },
    Competition: { icon: Medal, color: "#ec4899" },
    Other: { icon: Star, color: "#6b7280" },
  };

  // Fetch achievements on component mount and when UID changes
  useEffect(() => {
    if (uid) {
      fetchAchievements();
    }
  }, [uid]);

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await achievementsService.getAchievements(uid);
      setAchievements(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load achievements");
      console.error("Error fetching achievements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (achievement = null) => {
    setSelectedAchievement(achievement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAchievement(null);
  };

  const handleSaveAchievement = async (formData, certificateFile) => {
    try {
      setIsSaving(true);
      const formDataToSend = achievementsService.buildFormData(
        formData,
        certificateFile
      );

      if (selectedAchievement) {
        // Update existing achievement
        await achievementsService.updateAchievement(
          uid,
          selectedAchievement._id,
          formDataToSend
        );
      } else {
        // Add new achievement
        await achievementsService.addAchievement(uid, formDataToSend);
      }

      // Refresh achievements list
      await fetchAchievements();
      handleCloseModal();
    } catch (err) {
      setError(err.message || "Failed to save achievement");
      console.error("Error saving achievement:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    if (window.confirm("Are you sure you want to delete this achievement?")) {
      try {
        setIsLoading(true);
        await achievementsService.deleteAchievement(uid, achievementId);
        await fetchAchievements();
      } catch (err) {
        setError("Failed to delete achievement");
        console.error("Error deleting achievement:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getAchievementConfig = (category) => {
    return categoryConfig[category] || categoryConfig.Other;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <StudentLayout>
      <div className="achievements-container">
        {/* Header Section */}
        <div className="student-page-header">
          <div>
            <h1>My Achievements</h1>
            <p>
              {achievements.length > 0
                ? `You have ${achievements.length} achievement${achievements.length !== 1 ? "s" : ""}`
                : "Start building your achievement portfolio"}
            </p>
          </div>
          <button
            className="student-add-achievement-btn"
            onClick={() => handleOpenModal()}
            disabled={isLoading}
          >
            <Plus size={20} />
            Add Achievement
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="achievement-error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="achievement-loading">
            <div className="spinner"></div>
            <p>Loading your achievements...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && achievements.length === 0 && (
          <div className="achievement-empty-state">
            <Award size={64} />
            <h3>No achievements yet</h3>
            <p>Start adding your certifications, awards, and accomplishments</p>
            <button
              className="achievement-empty-cta"
              onClick={() => handleOpenModal()}
            >
              <Plus size={18} />
              Add Your First Achievement
            </button>
          </div>
        )}

        {/* Achievements Grid */}
        {!isLoading && achievements.length > 0 && (
          <div className="student-achievements-grid">
            {achievements.map((achievement) => {
              const config = getAchievementConfig(achievement.category);
              const IconComponent = config.icon;

              return (
                <div key={achievement._id} className="student-achievement-card">
                  {/* Card Header */}
                  <div className="achievement-card-header">
                    <div
                      className="achievement-icon"
                      style={{ backgroundColor: `${config.color}15`, color: config.color }}
                    >
                      <IconComponent size={28} />
                    </div>
                    <div className="achievement-actions">
                      <button
                        className="achievement-btn-icon"
                        onClick={() => handleOpenModal(achievement)}
                        title="Edit"
                        disabled={isLoading}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="achievement-btn-icon achievement-btn-delete"
                        onClick={() => handleDeleteAchievement(achievement._id)}
                        title="Delete"
                        disabled={isLoading}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="achievement-card-content">
                    <h3 className="achievement-title">{achievement.title}</h3>

                    {achievement.organization && (
                      <p className="achievement-organization">
                        {achievement.organization}
                      </p>
                    )}

                    {achievement.description && (
                      <p className="achievement-description">
                        {achievement.description}
                      </p>
                    )}

                    <div className="achievement-meta">
                      <span className="achievement-category">
                        {achievement.category}
                      </span>
                      <span className="achievement-date">
                        {formatDate(achievement.date)}
                      </span>
                    </div>

                    {/* Certificate Image */}
                    {achievement.certificateImage && (
                      <div className="achievement-certificate">
                        <img
                          src={`http://localhost:5000${achievement.certificateImage}`}
                          alt="Certificate"
                          className="certificate-image"
                        />
                        <a
                          href={`http://localhost:5000${achievement.certificateImage}`}
                          download
                          className="download-btn"
                          title="Download certificate"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    )}

                    {/* Credential Link */}
                    {achievement.credentialUrl && (
                      <a
                        href={achievement.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="credential-link"
                      >
                        View Credential
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Achievement Modal */}
      <AchievementModal
        isOpen={isModalOpen}
        achievement={selectedAchievement}
        onClose={handleCloseModal}
        onSave={handleSaveAchievement}
        isLoading={isSaving}
      />

      {/* Additional Features */}
      <InterviewFeature />
      <ProjectEvaluator />
    </StudentLayout>
  );
};

export default StudentAchievements;