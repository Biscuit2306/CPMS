import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, FileText, Calendar, Bell, LogOut, Search, Briefcase, Menu, X, TrendingUp, Users } from 'lucide-react';
import '../styles/student-css/studentlayout.css';
import { auth } from '../firebase';
import { useStudent } from '../context/StudentContext';

const StudentLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { student } = useStudent();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    { id: 'job-drives', icon: Briefcase, label: 'Job Drives', path: '/student/job-drives' },
    { id: 'applications', icon: FileText, label: 'Applications', path: '/student/applications' },
    { id: 'schedule', icon: Calendar, label: 'Schedule', path: '/student/schedule' },
    { id: 'achievements', icon: TrendingUp, label: 'Achievements', path: '/student/achievements' },
    { id: 'profile', icon: Users, label: 'Profile', path: '/student/profile' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await auth.signOut(); // sign out from Firebase
      navigate('/'); // redirect to home
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
              <input type="text" placeholder="Search companies, drives, applications..." />
            </div>
          </div>

          <div className="student-navbar-right">
            <button className="student-notification-btn">
              <Bell size={20} />
              <span className="student-notification-badge">3</span>
            </button>
            <div className="student-user-profile">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.fullName || 'User'}`} 
                alt={student?.fullName || 'User'} 
              />
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
    </div>
  );
};

export default StudentLayout;