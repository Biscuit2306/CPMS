import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ================= PUBLIC ================= */
import Home from "./pages/Home";
import UnifiedLogin from "./pages/UnifiedLogin";
import UnifiedRegister from "./pages/UnifiedRegister";
import VerifyEmail from "./pages/VerifyEmail";

import { StudentProvider } from "./context/StudentContext";

/* ================= STUDENT ================= */
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentJobDrives from "./pages/student/StudentJobDrives";
import StudentApplications from "./pages/student/StudentApplications";
import StudentSchedule from "./pages/student/StudentSchedule";
import StudentAchievements from "./pages/student/StudentAchievements";
import StudentProfile from "./pages/student/StudentProfile";

/* ================= RECRUITER ================= */
import RecruiterDashboard from "./pages/RecruiterDashboard";

/* ================= ADMIN ================= */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminRecruiters from "./pages/admin/AdminRecruiters";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminPlacementDrives from "./pages/admin/AdminPlacementDrives";
import AdminSystemLogs from "./pages/admin/AdminSystemLogs";
import AdminProfile from "./pages/admin/AdminProfile";

/* ================= FEATURES ================= */
import ProjectEvaluator from "./pages/ProjectEvaluator";
import InterviewFeature from "./pages/InterviewFeature";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login/:role" element={<UnifiedLogin />} />
        <Route path="/register/:role" element={<UnifiedRegister />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* FEATURES */}
        <Route path="/project-evaluator" element={<ProjectEvaluator />} />
        <Route path="/interview" element={<InterviewFeature />} />

        {/* STUDENT ROUTES */}
        <Route path="/student/dashboard" element={<StudentProvider><StudentDashboard /></StudentProvider>} />
        <Route path="/student/job-drives" element={<StudentProvider><StudentJobDrives /></StudentProvider>} />
        <Route path="/student/applications" element={<StudentProvider><StudentApplications /></StudentProvider>} />
        <Route path="/student/schedule" element={<StudentProvider><StudentSchedule /></StudentProvider>} />
        <Route path="/student/achievements" element={<StudentProvider><StudentAchievements /></StudentProvider>} />
        <Route path="/student/profile" element={<StudentProvider><StudentProfile /></StudentProvider>} />
        <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />

        {/* RECRUITER */}
        <Route path="/recruiter" element={<RecruiterDashboard />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/recruiters" element={<AdminRecruiters />} />
        <Route path="/admin/companies" element={<AdminCompanies />} />
        <Route path="/admin/drives" element={<AdminPlacementDrives />} />
        <Route path="/admin/logs" element={<AdminSystemLogs />} />
        <Route path="/admin/profile" element={<AdminProfile />} />

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
