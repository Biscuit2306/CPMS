import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, FileText, Calendar, Bell, LogOut, Search, Briefcase, Menu, X, TrendingUp, Users, Globe } from 'lucide-react';
import '../styles/student-css/studentlayout.css';
import axios from 'axios';
import { auth } from '../firebase';
import { useStudent } from '../context/StudentContext';
import { useNotification } from '../context/NotificationContext';
import { NotificationCenter } from './Notifications';
import Chatbot from './Chatbot';
import getAvatarUrl from '../utils/avatar';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cpms-xtz8.onrender.com";

const StudentLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { student, searchQuery, setSearchQuery } = useStudent();
  const { unreadCount, fetchUnreadCount } = useNotification();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    { id: 'job-drives', icon: Briefcase, label: 'Job Drives', path: '/student/job-drives' },
    { id: 'external-jobs', icon: Globe, label: 'External Jobs', path: '/student/external-jobs' },
    { id: 'applications', icon: FileText, label: 'Applications', path: '/student/applications' },
    { id: 'schedule', icon: Calendar, label: 'Schedule', path: '/student/schedule' },
    { id: 'achievements', icon: TrendingUp, label: 'Achievements', path: '/student/achievements' },
    { id: 'profile', icon: Users, label: 'Profile', path: '/student/profile' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        
        // ✅ Call backend logout to clear trusted device token
        try {
          await axios.post(
            `${API_BASE}/api/auth/logout`,
            { role: 'student' },
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
              withCredentials: true, // ✅ Include cookies
            }
          );
        } catch (logoutErr) {
          console.warn("Backend logout failed:", logoutErr.message);
          // Continue with Firebase logout even if backend fails
        }
      }

      await auth.signOut(); // sign out from Firebase
      
      // ✅ Clear session data
      localStorage.removeItem("userRole");
      localStorage.removeItem("userData");
      localStorage.removeItem("twoFactorVerified");
      localStorage.removeItem("twoFactorVerifiedAt");
      
      navigate('/'); // redirect to home
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  // Fetch notification count on mount
  useEffect(() => {
    if (student?.firebaseUid) {
      fetchUnreadCount(student.firebaseUid);
    }
  }, [student?.firebaseUid]);

  return (
    <div className="student-dashboard-wrapper">
      <aside className={`student-sidebar ${sidebarOpen ? 'student-sidebar-open' : 'student-sidebar-closed'}`}>
        <div className="student-sidebar-content">
          <div className="student-sidebar-header">
            <div className="student-logo">
              <GraduationCap size={32} />
            </div>
            {sidebarOpen && <span className="student-logo-text">Campus Placement</span>}
          </div>

          <nav className="student-sidebar-nav">
            {menuItems.map(item => (
              <Link
                key={item.id}
                to={item.path}
                className={`student-nav-item ${isActive(item.path) ? 'student-nav-active' : ''}`}
                title={item.label}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

         <button className="student-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className={`student-main-content ${sidebarOpen ? 'student-content-expanded' : 'student-content-full'}`}>
        <nav className="student-top-navbar">
          <div className="student-navbar-left">
            <button className="student-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="student-search-bar">
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Search companies, drives, applications..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="student-navbar-right">
            <button 
              className="student-notification-btn"
              onClick={() => setNotificationCenterOpen(!notificationCenterOpen)}
              style={{ position: 'relative' }}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="student-notification-badge">{unreadCount}</span>}
            </button>
            {notificationCenterOpen && student?.firebaseUid && (
              <NotificationCenter firebaseUid={student.firebaseUid} isOpen={true} onClose={() => setNotificationCenterOpen(false)} />
            )}
            <div className="student-user-profile">
              {student?.profilePhoto ? (
                <img
                  src={student.profilePhoto.startsWith('http') || student.profilePhoto.startsWith('data:')
                    ? student.profilePhoto
                    : `${API_BASE}${student.profilePhoto}`}
                  alt={student?.fullName || 'User'}
                />
              ) : (
                <div className="initial-avatar">{(student?.fullName || student?.email || 'U')[0].toUpperCase()}</div>
              )}
              <div className="student-user-info">
                <span className="student-user-name">{student?.fullName || 'Student'}</span>
                <span className="student-user-year">{student?.year || 'N/A'} - {student?.branch || 'N/A'}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="student-dashboard-content">
          {children}
        </div>
      </main>
      
      <Chatbot />
    </div>
  );
};

export default StudentLayout;