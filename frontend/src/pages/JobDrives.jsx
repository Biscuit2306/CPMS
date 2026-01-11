import React, { useState } from 'react';
import {
  Bell, Calendar, Briefcase, User, LogOut, Menu, X,
  Search, Filter, MapPin, DollarSign, Users, Clock,
  ChevronRight, Building2
} from 'lucide-react';
import { Link } from "react-router-dom";
import '../styles/jobdrives.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function JobDrives() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const jobDrives = [
    {
      id: 1,
      company: 'Google',
      logo: '🔵',
      role: 'Software Engineer',
      type: 'Full-time',
      location: 'Bangalore',
      package: '₹18-25 LPA',
      openings: 15,
      deadline: 'Jan 15, 2026',
      eligibility: 'B.Tech CSE/IT - CGPA 7.5+',
      status: 'Open',
      registeredStudents: 45,
      description: 'Looking for talented engineers to join our cloud platform team.'
    },
    {
      id: 2,
      company: 'Microsoft',
      logo: '🟦',
      role: 'Data Analyst',
      type: 'Full-time',
      location: 'Hyderabad',
      package: '₹12-18 LPA',
      openings: 10,
      deadline: 'Jan 18, 2026',
      eligibility: 'All branches - CGPA 7.0+',
      status: 'Open',
      registeredStudents: 67,
      description: 'Join our data insights team to work on cutting-edge analytics.'
    },
    {
      id: 3,
      company: 'Amazon',
      logo: '🟠',
      role: 'Full Stack Developer',
      type: 'Full-time',
      location: 'Pune',
      package: '₹15-22 LPA',
      openings: 20,
      deadline: 'Jan 22, 2026',
      eligibility: 'B.Tech - CGPA 7.0+',
      status: 'Open',
      registeredStudents: 89,
      description: 'Build scalable web applications for millions of customers.'
    },
    {
      id: 4,
      company: 'TCS',
      logo: '🔷',
      role: 'System Engineer',
      type: 'Full-time',
      location: 'Multiple',
      package: '₹3.5-4.5 LPA',
      openings: 100,
      deadline: 'Jan 12, 2026',
      eligibility: 'All branches - CGPA 6.0+',
      status: 'Closing Soon',
      registeredStudents: 234,
      description: 'Join India\'s largest IT services company.'
    },
    {
      id: 5,
      company: 'Infosys',
      logo: '🟢',
      role: 'Software Developer',
      type: 'Full-time',
      location: 'Bangalore',
      package: '₹4.5-6 LPA',
      openings: 80,
      deadline: 'Jan 20, 2026',
      eligibility: 'All branches - CGPA 6.5+',
      status: 'Open',
      registeredStudents: 178,
      description: 'Work on innovative digital transformation projects.'
    },
    {
      id: 6,
      company: 'Wipro',
      logo: '🟣',
      role: 'Project Engineer',
      type: 'Full-time',
      location: 'Chennai',
      package: '₹3.5-5 LPA',
      openings: 60,
      deadline: 'Jan 8, 2026',
      eligibility: 'All branches - CGPA 6.0+',
      status: 'Closed',
      registeredStudents: 156,
      description: 'Be part of global technology consulting projects.'
    }
  ];

  const filteredDrives = jobDrives.filter(drive => {
    const matchesSearch =
      drive.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' ||
      drive.status.toLowerCase().replace(' ', '-') === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="job-drives">
      <Navbar />

      <div className="job-drives__layout">
        {/* Sidebar */}
        <aside className={`job-drives__sidebar ${sidebarOpen ? 'job-drives__sidebar--open' : ''}`}>
          <div className="job-drives__sidebar-content">
            <nav className="job-drives__nav">

              <Link to="/student" className="job-drives__nav-item">
                <Briefcase size={20} />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/jobdrives"
                className="job-drives__nav-item job-drives__nav-item--active"
              >
                <Building2 size={20} />
                <span>Job Drives</span>
              </Link>

              <Link to="/applications" className="job-drives__nav-item">
                <Calendar size={20} />
                <span>Applications</span>
              </Link>

              <Link to="/schedule" className="job-drives__nav-item">
                <Clock size={20} />
                <span>Schedule</span>
              </Link>

              <Link to="/profile" className="job-drives__nav-item">
                <User size={20} />
                <span>Profile</span>
              </Link>

            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="job-drives__main">
          <div className="job-drives__content">

            {/* Header */}
            <div className="job-drives__header">
              <div>
                <h2 className="job-drives__title">Placement Drives</h2>
                <p className="job-drives__subtitle">
                  Browse and apply to campus recruitment drives
                </p>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="job-drives__toolbar">
              <div className="job-drives__search-box">
                <Search size={20} className="job-drives__search-icon" />
                <input
                  type="text"
                  placeholder="Search by company or role..."
                  className="job-drives__search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="job-drives__filters">
                <button onClick={() => setSelectedFilter('all')}>All</button>
                <button onClick={() => setSelectedFilter('open')}>Open</button>
                <button onClick={() => setSelectedFilter('closing-soon')}>Closing Soon</button>
                <button onClick={() => setSelectedFilter('closed')}>Closed</button>
              </div>
            </div>

            {/* Cards */}
            <div className="job-drives__grid">
              {filteredDrives.map((drive) => (
                <div key={drive.id} className="job-drives__card">
                  <h3>{drive.company}</h3>
                  <p>{drive.role}</p>
                  <button disabled={drive.status === "Closed"}>
                    Apply Now <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
