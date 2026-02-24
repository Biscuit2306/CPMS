// API service for achievements management

const API_BASE = "http://localhost:5000/api";

export const achievementsService = {
  /**
   * Get all achievements for a student
   */
  getAchievements: async (uid) => {
    try {
      const response = await fetch(`${API_BASE}/achievements/${uid}`);
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add new achievement with certificate image
   */
  addAchievement: async (uid, formData) => {
    try {
      // formData should be FormData object with:
      // - title, description, category, date, organization, credentialUrl (text fields)
      // - certificateImage (file, optional)
      
      const response = await fetch(`${API_BASE}/achievements/${uid}`, {
        method: "POST",
        body: formData, // Don't set Content-Type, browser will set it with boundary
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add achievement");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update achievement with optional new certificate image
   */
  updateAchievement: async (uid, achievementId, formData) => {
    try {
      // formData should be FormData object with:
      // - title, description, category, date, organization, credentialUrl (text fields)
      // - certificateImage (file, optional)

      const response = await fetch(`${API_BASE}/achievements/${uid}/${achievementId}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update achievement");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete achievement
   */
  deleteAchievement: async (uid, achievementId) => {
    try {
      const response = await fetch(`${API_BASE}/achievements/${uid}/${achievementId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete achievement");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Build FormData from achievement data
   */
  buildFormData: (achievementData, certificateFile = null) => {
    const formData = new FormData();

    formData.append("title", achievementData.title || "");
    formData.append("description", achievementData.description || "");
    formData.append("category", achievementData.category || "Other");
    formData.append("date", achievementData.date || new Date().toISOString().split("T")[0]);
    formData.append("organization", achievementData.organization || "");
    formData.append("credentialUrl", achievementData.credentialUrl || "");

    if (certificateFile) {
      formData.append("certificateImage", certificateFile);
    }

    return formData;
  },
};

export default achievementsService;
