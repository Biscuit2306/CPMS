import axios from "axios";
import { auth } from "../firebase";

// ✅ Axios instance
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API = axios.create({
  baseURL: `${API_BASE}/api`,
});

// ✅ Attach Firebase token automatically
API.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------
// Student API
// ---------------------------
export const studentAPI = {
  // Get student profile
  getProfile: async (uid) => {
    const res = await API.get("/students/profile", { params: { uid } });
    return res.data;
  },

  // Add application
  addApplication: async (uid, applicationData) => {
    const res = await API.post("/students/applications", { uid, ...applicationData });
    return res.data;
  },
};

// ---------------------------
// Register student if not exists
// ---------------------------
export const registerStudentIfNotExists = async (user) => {
  try {
    await API.post("/students/register", {
      firebaseUid: user.uid,
      fullName: user.displayName || "",
      email: user.email,
      role: "student",
    });
    console.log("✅ Student registered successfully in MongoDB");
  } catch (err) {
    if (err.response?.status !== 409 && err.response?.status !== 400) {
      console.error("❌ Student register error:", err);
      throw err;
    } else {
      console.log("ℹ️ Student already exists, skipping registration");
    }
  }
};

// ---------------------------
// Fetch profile with retry
// ---------------------------
export const fetchProfileWithRetry = async (uid, retries = 5, delay = 200) => {
  for (let i = 0; i < retries; i++) {
    try {
      const student = await studentAPI.getProfile(uid);
      return student;
    } catch (err) {
      if (err.response?.status === 404) {
        console.log(`⚡ Student not found yet, retrying... (${i + 1})`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error("❌ Student not found after retries");
};

export default API;
