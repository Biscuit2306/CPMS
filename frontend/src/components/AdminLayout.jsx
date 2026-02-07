import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Users, UserCheck, Building2, Briefcase, Activity, Settings, LogOut, Search, Menu, X, Mail } from 'lucide-react';
import '../styles/admin-css/adminlayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { id: 'students', icon: Users, label: 'Students', path: '/admin/students' },
    { id: 'recruiters', icon: UserCheck, label: 'Recruiters', path: '/admin/recruiters' },
    { id: 'companies', icon: Building2, label: 'Companies', path: '/admin/companies' },
    { id: 'drives', icon: Briefcase, label: 'Placement Drives', path: '/admin/drives' },
    { id: 'logs', icon: Activity, label: 'System Logs', path: '/admin/logs' },
    { id: 'profile', icon: Settings, label: 'Profile', path: '/admin/profile' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
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

          <button className="admin-logout-btn">
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
              <input type="text" placeholder="Search students, recruiters, companies..." />
            </div>
          </div>

          <div className="admin-navbar-right">
            <button className="admin-notification-btn">
              <Mail size={20} />
              <span className="admin-notification-badge">3</span>
            </button>
            <div className="admin-user-profile">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh" alt="Dr. Suresh Patel" />
              <div className="admin-user-info">
                <span className="admin-user-name">Dr. Suresh Patel</span>
                <span className="admin-user-role">System Admin</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="admin-dashboard-content admin-scope">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;   