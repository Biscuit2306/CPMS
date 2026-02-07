import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell, Users, LogOut,LayoutDashboard,Briefcase,Calendar,Building2,Settings} from 'lucide-react';
import '../styles/RecruiterCSS/recruiterLayout.css';
import { auth } from '../firebase';
import { useRecruiter } from '../context/RecruiterContext';

const RecruiterLayout = ({ activeMenu, setActiveMenu, userProfile, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [recruiterName, setRecruiterName] = useState('Recruiter');
  const navigate = useNavigate();
  const { recruiter } = useRecruiter();

  useEffect(() => {
    if (recruiter && recruiter.fullName) {
      setRecruiterName(recruiter.fullName);
    } else {
      const user = auth.currentUser;
      if (user) {
        setRecruiterName(user.displayName || user.email?.split('@')[0] || 'Recruiter');
      }
    }
  }, [recruiter]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/recruiter' },
    { id: 'drives', icon: Briefcase, label: 'Drives', path: '/recruiter/drives' },
    { id: 'candidates', icon: Users, label: 'Candidates', path: '/recruiter/candidates' },
    { id: 'schedule', icon: Calendar, label: 'Schedule', path: '/recruiter/schedule' },
    { id: 'companies', icon: Building2, label: 'Companies', path: '/recruiter/companies' },
    { id: 'profile', icon: Settings, label: 'Profile', path: '/recruiter/profile' }
  ];

  return (
    <div className="recruiter-dashboard-wrapper">
      <aside className={`nav-sidebar ${sidebarOpen ? 'nav-sidebar-open' : 'nav-sidebar-closed'}`}>
        <div className="nav-sidebar-content">
          <div className="nav-sidebar-header">
            <div className="nav-logo">
              <Briefcase size={32} />
            </div>
            {sidebarOpen && <span className="nav-logo-text">Recruitment Portal</span>}
          </div>

          <nav className="nav-sidebar-nav">
            {menuItems.map(item => (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-item ${activeMenu === item.id ? 'nav-active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
                title={item.label}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          <button className="nav-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Top Navbar */}
      <nav className={`nav-topbar ${sidebarOpen ? 'nav-topbar-expanded' : 'nav-topbar-full'}`}>
        <div className="nav-topbar-left">
          <button className="nav-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="nav-search-bar">
            <Search size={20} />
            <input type="text" placeholder="Search candidates, companies, drives..." />
          </div>
        </div>

        <div className="nav-topbar-right">
          <button className="nav-notification-btn">
            <Bell size={20} />
            <span className="nav-notification-badge">5</span>
          </button>
          <div className="nav-user-profile">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${recruiterName}`} 
              alt={recruiterName} 
            />
            <div className="nav-user-info">
              <span className="nav-user-name">{recruiterName}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className={`recruiter-main-content ${sidebarOpen ? 'recruiter-content-expanded' : 'recruiter-content-full'}`}>
        {children}
      </main>
    </div>
)};

export default RecruiterLayout;