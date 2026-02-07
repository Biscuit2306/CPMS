import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ================= PUBLIC ================= */
import Home from "./pages/Home";
import UnifiedLogin from "./pages/UnifiedLogin";
import UnifiedRegister from "./pages/UnifiedRegister";
import VerifyEmail from "./pages/VerifyEmail";

import { StudentProvider } from "./context/StudentContext";
import { AdminProvider } from "./context/AdminContext";
import { RecruiterProvider } from "./context/RecruiterContext";

/* ================= STUDENT ================= */
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentJobDrives from "./pages/student/StudentJobDrives";
import StudentApplications from "./pages/student/StudentApplications";
import StudentSchedule from "./pages/student/StudentSchedule";
import StudentAchievements from "./pages/student/StudentAchievements";
import StudentProfile from "./pages/student/StudentProfile";

/* ================= RECRUITER ================= */
import RecruiterDashboard from "./pages/Recruiter/RecruiterDashboard";
import RecruiterCandidates from "./pages/Recruiter/RecruiterCandidates";
import RecruiterSchedule from "./pages/Recruiter/RecruiterSchedule";
import RecruiterProfile from "./pages/Recruiter/RecruiterProfile";
import RecruiterDrives from "./pages/Recruiter/RecruiterDrives";
import RecruiterCompanies from "./pages/Recruiter/RecruiterCompanies";

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
        <Route path="/recruiter" element={<RecruiterProvider><RecruiterDashboard /></RecruiterProvider>} />
        <Route path="/recruiter/candidates" element={<RecruiterProvider><RecruiterCandidates /></RecruiterProvider>} />
        <Route path="/recruiter/schedule" element={<RecruiterProvider><RecruiterSchedule /></RecruiterProvider>} />
        <Route path="/recruiter/profile" element={<RecruiterProvider><RecruiterProfile /></RecruiterProvider>} />
        <Route path="/recruiter/drives" element={<RecruiterProvider><RecruiterDrives /></RecruiterProvider>} />
        <Route path="/recruiter/companies" element={<RecruiterProvider><RecruiterCompanies /></RecruiterProvider>} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminProvider><AdminDashboard /></AdminProvider>} />
        <Route path="/admin/dashboard" element={<AdminProvider><AdminDashboard /></AdminProvider>} />
        <Route path="/admin/students" element={<AdminProvider><AdminStudents /></AdminProvider>} />
        <Route path="/admin/recruiters" element={<AdminProvider><AdminRecruiters /></AdminProvider>} />
        <Route path="/admin/companies" element={<AdminProvider><AdminCompanies /></AdminProvider>} />
        <Route path="/admin/drives" element={<AdminProvider><AdminPlacementDrives /></AdminProvider>} />
        <Route path="/admin/logs" element={<AdminProvider><AdminSystemLogs /></AdminProvider>} />
        <Route path="/admin/profile" element={<AdminProvider><AdminProfile /></AdminProvider>} />

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
