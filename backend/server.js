const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();

/* =========================
   HARD FAIL ENV CHECK
========================= */
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

console.log("\n=== ENVIRONMENT CHECK ===");
console.log("📦 MONGO_URI: ✓ Set");
console.log("🌐 PORT:", PORT);
console.log("🌍 FRONTEND_URL:", FRONTEND_URL);
console.log("========================\n");

/* =========================
   MIDDLEWARE
========================= */
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 🔍 REQUEST LOGGER
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl}`);
  next();
});

/* =========================
   ROUTES
========================= */
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const projectRoutes = require("./routes/projectRoutes");
const aiRoutes = require("./routes/aiRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/ai", aiRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/resume", resumeRoutes);


/* =========================
   ROOT & HEALTH
========================= */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Campus Placement Backend API",
    status: "running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    server: "healthy",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* =========================
   START SERVER
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log("\n🚀 Server running");
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`📍 Health: http://localhost:${PORT}/api/health\n`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

/* =========================
   GRACEFUL SHUTDOWN
========================= */
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");
  await mongoose.connection.close();
  console.log("✅ MongoDB disconnected");
  process.exit(0);
});

module.exports = app;
