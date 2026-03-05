import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Users, UserCheck, Building2, Briefcase, Activity, Settings, LogOut, Search, Menu, X, Mail, Calendar } from 'lucide-react';
import '../styles/admin-css/adminlayout.css';
import axios from 'axios';
import { auth } from '../firebase';
import { useAdmin } from '../context/AdminContext';
import { useNotification } from '../context/NotificationContext';
import { NotificationCenter } from './Notifications';
import RiskManagementModal from './RiskManagementModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, searchQuery, setSearchQuery } = useAdmin();
  const { unreadCount, fetchUnreadCount } = useNotification();

  // Compute admin name using useMemo instead of useState + useEffect
  const adminName = useMemo(() => {
    let name = 'Admin';
    if (admin && admin.fullName) {
      name = admin.fullName;
    } else {
      const user = auth.currentUser;
      if (user) {
        name = user.displayName || user.email?.split('@')[0] || 'Admin';
      }
    }
    return name;
  }, [admin]);

  // Fetch notification count on mount
  useEffect(() => {
    if (admin?.firebaseUid) {
      fetchUnreadCount(admin.firebaseUid);
    }
  }, [admin?.firebaseUid, fetchUnreadCount]);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { id: 'students', icon: Users, label: 'Students', path: '/admin/students' },
    { id: 'recruiters', icon: UserCheck, label: 'Recruiters', path: '/admin/recruiters' },
    { id: 'companies', icon: Building2, label: 'Companies', path: '/admin/companies' },
    { id: 'drives', icon: Briefcase, label: 'Placement Drives', path: '/admin/drives' },
    { id: 'schedules', icon: Calendar, label: 'Interview Schedules', path: '/admin/schedules' },
    { id: 'logs', icon: Activity, label: 'System Logs', path: '/admin/logs' },
    { id: 'profile', icon: Settings, label: 'Profile', path: '/admin/profile' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        
        // ✅ Call backend logout to clear trusted device token
        try {
          await axios.post(
            `${API_BASE}/api/auth/logout`,
            { role: 'admin' },
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

      await auth.signOut();
      
      // ✅ Clear session data
      localStorage.removeItem("userRole");
      localStorage.removeItem("userData");
      localStorage.removeItem("twoFactorVerified");
      localStorage.removeItem("twoFactorVerifiedAt");
      
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar-open' : 'admin-sidebar-closed'}`}>
        <div className="admin-sidebar-content">
          <div className="admin-sidebar-header">
            <div className="admin-logo">
              <Shield size={32} />
            </div>
            {sidebarOpen && <span className="admin-logo-text">Admin Portal</span>}
          </div>

          <nav className="admin-sidebar-nav">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`admin-nav-item ${isActive(item.path) ? 'admin-nav-active' : ''}`}
                onClick={() => navigate(item.path)}
                title={item.label}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className={`admin-main-content ${sidebarOpen ? 'admin-content-expanded' : 'admin-content-full'}`}>
        <nav className="admin-top-navbar">
          <div className="admin-navbar-left">
            <button className="admin-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="admin-search-bar">
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Search students, recruiters, companies..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-navbar-right">
            <button 
              className="admin-notification-btn"
              onClick={() => setNotificationCenterOpen(!notificationCenterOpen)}
            >
              <Mail size={20} />
              {unreadCount > 0 && <span className="admin-notification-badge">{unreadCount}</span>}
            </button>
            {notificationCenterOpen && admin?.firebaseUid && (
              <NotificationCenter firebaseUid={admin.firebaseUid} isOpen={true} onClose={() => setNotificationCenterOpen(false)} />
            )}
            <div className="admin-user-profile">
              {admin?.profilePhoto ? (
                <img 
                  src={admin.profilePhoto.startsWith('http') || admin.profilePhoto.startsWith('data:')
                    ? admin.profilePhoto
                    : `${API_BASE}${admin.profilePhoto}`} 
                  alt={adminName} 
                />
              ) : (
                <div className="initial-avatar">{(adminName || 'A')[0].toUpperCase()}</div>
              )}
              <div className="admin-user-info">
                <span className="admin-user-name">{adminName}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="admin-dashboard-content admin-scope">
          {children}
        </div>

        {/* AI Risk Management System */}
        <RiskManagementModal />
      </main>
    </div>
  );
};

export default AdminLayout;   