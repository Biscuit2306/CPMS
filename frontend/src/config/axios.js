import axios from 'axios';

// ✅ Configure axios to always include credentials (cookies)
axios.defaults.withCredentials = true;

// Add default API base URL if available
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
axios.defaults.baseURL = API_BASE;

// Optional: Add request/response interceptors for debugging
axios.interceptors.request.use(
  (config) => {
    // Ensure withCredentials is always true
    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("🔐 Unauthorized - May need to re-login");
    }
    return Promise.reject(error);
  }
);

export default axios;
