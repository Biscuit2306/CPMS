import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PortalModal from "./components/PortalModal";
import StudentDashboard from "./pages/StudentDashboard";
import JobDrives from "./pages/JobDrives";
import Applications from "./pages/Applications";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import JobPosting from "./pages/JobPosting";
import AdminDashboard from "./pages/AdminDashboard";
import Unauthorized from "./pages/Unauthorized";
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";

import ProtectedRoute from "./routes/ProtectedRoute";
import SchedulePage from "./pages/SchedulePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/portal" element={<PortalModal />} />

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

        {/* Application for Students */}
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Applications />
            </ProtectedRoute>
          }
        /> 
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Profile />
            </ProtectedRoute>
          }
        /> 

        {/* Schedule for Students */}
        <Route
          path="/schedulepage"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <SchedulePage />
            </ProtectedRoute>
          } 
        />
        {/* Achievements for Students */}
        <Route
          path="/achievements"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Achievements />
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

        {/* Job Posting for recruiter*/}
        <Route
          path="/JobPosting"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <JobPosting />
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