import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});
export const uploadResume = async (file, firebaseUid) => {
  const formData = new FormData();

  formData.append("resume", file);
  formData.append("firebaseUid", String(firebaseUid));

  const res = await API.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return res.data;
};


export const analyzeResume = async (firebaseUid) => {
  const res = await API.post("/resume/analyze", { firebaseUid });
  return res.data;
};

export const getLatestAnalysis = async (firebaseUid) => {
  const res = await API.get(`/resume/latest/${firebaseUid}`);
  return res.data;
};