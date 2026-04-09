/**
 * Get the full avatar URL for a user profile photo
 * @param {string} photoPath - The photo path or URL from the database
 * @param {string} apiBase - The API base URL
 * @returns {string} The complete URL for the avatar image
 */
const getAvatarUrl = (photoPath, apiBase = import.meta.env.VITE_API_BASE_URL || "https://cpms-xtz8.onrender.com") => {
  if (!photoPath) {
    return null;
  }

  // If it's already a full URL (http, https) or data URI, return as is
  if (photoPath.startsWith('http') || photoPath.startsWith('https') || photoPath.startsWith('data:')) {
    return photoPath;
  }

  // Otherwise, prepend the API base URL
  return `${apiBase}${photoPath}`;
};

export default getAvatarUrl;
