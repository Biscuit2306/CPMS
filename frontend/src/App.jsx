import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/StudentDashboard";
import JobDrives from "./pages/JobDrives";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Unauthorized from "./pages/Unauthorized";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        {/* Student Dashboard */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Job Drives for Students */}
        <Route
          path="/pages/jobdrives"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <JobDrives />
            </ProtectedRoute>
          }
        />

        {/* Recruiter Dashboard */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Unauthorized */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
