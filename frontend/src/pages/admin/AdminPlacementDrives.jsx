import React, { useState } from 'react';
import { DollarSign, Calendar, Users, CheckCircle, UserCheck, Eye, Settings } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin-css/adminplacementdrives.css';

const PlacementDrives = () => {
  const [filterCategory, setFilterCategory] = useState('all');

  const allDrives = [
    { id: 1, company: 'TechCorp Solutions', date: 'Jan 28, 2026', role: 'Software Engineer', package: '12-15 LPA', applicants: 145, selected: 12, status: 'Active', recruiter: 'Dr. Anjali Mehta' },
    { id: 2, company: 'InnovateTech', date: 'Feb 2, 2026', role: 'Full Stack Developer', package: '10-12 LPA', applicants: 98, selected: 8, status: 'Active', recruiter: 'Prof. Rajesh Kumar' },
    { id: 3, company: 'Digital Dynamics', date: 'Feb 5, 2026', role: 'Data Scientist', package: '15-18 LPA', applicants: 67, selected: 6, status: 'Scheduled', recruiter: 'Dr. Priya Sharma' },
    { id: 4, company: 'CloudWorks', date: 'Feb 10, 2026', role: 'Cloud Engineer', package: '14-16 LPA', applicants: 52, selected: 0, status: 'Scheduled', recruiter: 'Dr. Anjali Mehta' },
    { id: 5, company: 'NextGen AI', date: 'Feb 12, 2026', role: 'ML Engineer', package: '18-22 LPA', applicants: 89, selected: 5, status: 'Active', recruiter: 'Ms. Deepa Rao' },
    { id: 6, company: 'SecureNet', date: 'Jan 20, 2026', role: 'Security Analyst', package: '11-13 LPA', applicants: 76, selected: 15, status: 'Completed', recruiter: 'Prof. Rajesh Kumar' }
  ];

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>Placement Drives</h1>
          <p>Monitor and manage all recruitment drives</p>
        </div>
        <div className="admin-header-actions">
          <div className="admin-filter-section">
            <button className={`admin-filter-btn ${filterCategory === 'all' ? 'active' : ''}`} onClick={() => setFilterCategory('all')}>
              All Drives
            </button>
            <button className={`admin-filter-btn ${filterCategory === 'active' ? 'active' : ''}`} onClick={() => setFilterCategory('active')}>
              Active
            </button>
            <button className={`admin-filter-btn ${filterCategory === 'scheduled' ? 'active' : ''}`} onClick={() => setFilterCategory('scheduled')}>
              Scheduled
            </button>
            <button className={`admin-filter-btn ${filterCategory === 'completed' ? 'active' : ''}`} onClick={() => setFilterCategory('completed')}>
              Completed
            </button>
          </div>
        </div>
      </div>

      <div className="admin-drives-grid">
        {allDrives
          .filter(drive => filterCategory === 'all' || drive.status.toLowerCase() === filterCategory)
          .map((drive) => (
            <div key={drive.id} className="admin-drive-card">
              <div className="admin-drive-header">
                <div className="admin-company-logo-large">
                  {drive.company.charAt(0)}
                </div>
                <div className="admin-drive-title">
                  <h3>{drive.company}</h3>
                  <span className={`admin-drive-status-badge ${drive.status.toLowerCase()}`}>{drive.status}</span>
                </div>
              </div>
              <h4 className="admin-job-role">{drive.role}</h4>
              <div className="admin-drive-details">
                <div className="admin-drive-detail-item">
                  <DollarSign size={16} />
                  <span>{drive.package}</span>
                </div>
                <div className="admin-drive-detail-item">
                  <Calendar size={16} />
                  <span>{drive.date}</span>
                </div>
                <div className="admin-drive-detail-item">
                  <Users size={16} />
                  <span>{drive.applicants} Applicants</span>
                </div>
                <div className="admin-drive-detail-item">
                  <CheckCircle size={16} />
                  <span>{drive.selected} Selected</span>
                </div>
                <div className="admin-drive-detail-item">
                  <UserCheck size={16} />
                  <span>{drive.recruiter}</span>
                </div>
              </div>
              <div className="admin-drive-actions">
                <button className="admin-view-btn">
                  <Eye size={16} />
                  View Details
                </button>
                <button className="admin-manage-btn">
                  <Settings size={16} />
                  Manage
                </button>
              </div>
            </div>
          ))}
      </div>
    </AdminLayout>
  );
};

export default PlacementDrives;