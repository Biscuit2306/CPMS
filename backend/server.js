const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const path = require("path");

// Import job scraping service
const {
  fetchAndStoreJobsFromRapidAPI,
} = require("./services/scrapedJobsService");

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
    // Allow the configured frontend origin in production, but accept any origin during development
    origin: process.env.NODE_ENV === 'production' ? FRONTEND_URL : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔍 COOKIE DEBUG MIDDLEWARE
app.use((req, res, next) => {
  if (req.path.includes("auth")) {
    const cookieKeys = Object.keys(req.cookies || {});
    if (cookieKeys.length > 0) {
      console.log(`🍪 Incoming cookies on ${req.method} ${req.path}:`, cookieKeys);
    }
  }
  
  // Log when cookies are being set
  const originalCookie = res.cookie.bind(res);
  res.cookie = function(name, value, options) {
    console.log(`🍪 Setting cookie: ${name} with options:`, {
      httpOnly: options?.httpOnly,
      secure: options?.secure,
      sameSite: options?.sameSite,
      maxAge: options?.maxAge,
      path: options?.path,
    });
    return originalCookie(name, value, options);
  };
  
  next();
});
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl}`);
  next();
});

/* =========================
   ROUTES
========================= */
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const achievementsRoutes = require("./routes/achievementsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminManagementRoutes = require("./routes/adminManagementRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const projectRoutes = require("./routes/projectRoutes");
const aiRoutes = require("./routes/aiRoutes");
const jobDriveRoutes = require("./routes/jobDriveRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const chatRoutes = require("./routes/chatRoutes");
const scrapedJobRoutes = require("./routes/scrapedJobRoutes");
const reportRoutes = require("./routes/reportRoutes");
const riskRoutes = require("./routes/riskRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/achievements", achievementsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/manage", adminManagementRoutes);
app.use("/api/admin/risk", riskRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/drives", jobDriveRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/resume", resumeRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/scraped-jobs", scrapedJobRoutes);


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

      /* =========================
         INITIALIZE RISK ENGINES
      ========================= */
      try {
        const RiskEngine = require("./services/riskEngine");
        const DriveRiskEngine = require("./services/driveRiskEngine");
        
        RiskEngine.reevaluateAllStudents().catch(err => {
          console.error("❌ Student Risk Engine Error:", err.message);
        });

        RiskEngine.reevaluateAllRecruiters().catch(err => {
          console.error("❌ Recruiter Risk Engine Error:", err.message);
        });

        DriveRiskEngine.reevaluateAllDrives().catch(err => {
          console.error("❌ Drive Risk Engine Error:", err.message);
        });

        console.log("✅ Risk engines initialized\n");
      } catch (err) {
        console.warn("⚠️ Risk engines setup error:", err.message);
      }

      /* =========================
         INITIALIZE NOTIFICATIONS
      ========================= */
      try {
        const notificationScheduler = require("./utils/notificationScheduler");
        console.log("✅ Notification scheduler initialized\n");
      } catch (err) {
        console.warn("⚠️ Notification scheduler error:", err.message);
      }

      /* =========================
         SETUP CRON JOB FOR JOB SCRAPING
      ========================= */
      if (process.env.RAPID_API_KEY) {
        console.log("✅ RapidAPI job scraping is enabled");

        // Schedule job fetch every 6 hours (0 */6 * * * means every 6 hours)
        cron.schedule("0 */6 * * *", () => {
          console.log("\n⏰ Cron job triggered - Fetching jobs from RapidAPI...");
          fetchAndStoreJobsFromRapidAPI().catch((err) => {
            console.error("❌ Cron fetch failed:", err.message);
          });
        });

        console.log("⏱️  Next job scrape will run at the scheduled time\n");
      } else {
        console.log(
          "⚠️  RAPID_API_KEY not set - Job scraping disabled\n"
        );
      }
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