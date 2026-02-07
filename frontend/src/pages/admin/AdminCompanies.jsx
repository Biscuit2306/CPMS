import React from 'react';
import { Building2, Mail, Phone, Calendar, Eye, Edit2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin-css/admincompanies.css';

const Companies = () => {
  const allCompanies = [
    { id: 1, company: 'TechCorp Solutions', industry: 'IT Services', contact: 'hr@techcorp.com', phone: '+91 9876501234', totalHires: 45, avgPackage: '13.5 LPA', status: 'Active', lastVisit: 'Jan 28, 2026' },
    { id: 2, company: 'InnovateTech', industry: 'Software', contact: 'careers@innovate.com', phone: '+91 9876501235', totalHires: 32, avgPackage: '11 LPA', status: 'Active', lastVisit: 'Feb 2, 2026' },
    { id: 3, company: 'Digital Dynamics', industry: 'Analytics', contact: 'jobs@digitaldyn.com', phone: '+91 9876501236', totalHires: 28, avgPackage: '16 LPA', status: 'Active', lastVisit: 'Feb 5, 2026' },
    { id: 4, company: 'CloudWorks', industry: 'Cloud Services', contact: 'recruit@cloudworks.com', phone: '+91 9876501237', totalHires: 38, avgPackage: '14.5 LPA', status: 'Inactive', lastVisit: 'Dec 15, 2025' },
    { id: 5, company: 'NextGen AI', industry: 'AI/ML', contact: 'hiring@nextgenai.com', phone: '+91 9876501238', totalHires: 15, avgPackage: '20 LPA', status: 'Active', lastVisit: 'Feb 12, 2026' },
    { id: 6, company: 'SecureNet', industry: 'Cybersecurity', contact: 'jobs@securenet.com', phone: '+91 9876501239', totalHires: 22, avgPackage: '12 LPA', status: 'Inactive', lastVisit: 'Jan 20, 2026' }
  ];

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>Company Management</h1>
          <p>Manage partner companies and recruiters</p>
        </div>
        <button className="admin-add-btn">
          <Building2 size={20} />
          Add Company
        </button>
      </div>

      <div className="admin-companies-grid">
        {allCompanies.map((company) => (
          <div key={company.id} className="admin-company-card">
            <div className="admin-company-header">
              <div className="admin-company-logo">
                {company.company.charAt(0)}
              </div>
              <div className="admin-company-info">
                <h3>{company.company}</h3>
                <p>{company.industry}</p>
                <span className={`admin-status-badge admin-status-${company.status.toLowerCase()}`}>
                  {company.status}
                </span>
              </div>
            </div>
            <div className="admin-company-details">
              <div className="admin-company-row">
                <Mail size={16} />
                <span>{company.contact}</span>
              </div>
              <div className="admin-company-row">
                <Phone size={16} />
                <span>{company.phone}</span>
              </div>
              <div className="admin-company-stats-row">
                <div className="admin-company-stat">
                  <span className="admin-stat-label">Total Hires</span>
                  <span className="admin-stat-value">{company.totalHires}</span>
                </div>
                <div className="admin-company-stat">
                  <span className="admin-stat-label">Avg. Package</span>
                  <span className="admin-stat-value">{company.avgPackage}</span>
                </div>
              </div>
              <div className="admin-company-row">
                <Calendar size={16} />
                <span>Last Visit: {company.lastVisit}</span>
              </div>
            </div>
            <div className="admin-company-actions">
              <button className="admin-view-btn">
                <Eye size={16} />
                View Details
              </button>
              <button className="admin-edit-btn">
                <Edit2 size={16} />
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}; 

export default Companies;