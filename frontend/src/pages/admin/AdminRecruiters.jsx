import React from 'react';
import { UserPlus, Mail, Phone, Building2, Briefcase, Edit2, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin-css/adminrecruiters.css';

const Recruiters = () => {
  const allRecruiters = [
    { id: 1, name: 'Dr. Anjali Mehta', email: 'anjali.mehta@college.edu', phone: '+91 9876543200', department: 'Career Development Cell', role: 'Placement Officer', status: 'Active', drives: 8 },
    { id: 2, name: 'Prof. Rajesh Kumar', email: 'rajesh.kumar@college.edu', phone: '+91 9876543201', department: 'Training & Placement', role: 'Senior Coordinator', status: 'Active', drives: 12 },
    { id: 3, name: 'Dr. Priya Sharma', email: 'priya.sharma@college.edu', phone: '+91 9876543202', department: 'Student Relations', role: 'Placement Coordinator', status: 'Active', drives: 6 },
    { id: 4, name: 'Mr. Vikram Singh', email: 'vikram.singh@college.edu', phone: '+91 9876543203', department: 'Corporate Relations', role: 'Industry Liaison', status: 'Inactive', drives: 4 },
    { id: 5, name: 'Ms. Deepa Rao', email: 'deepa.rao@college.edu', phone: '+91 9876543204', department: 'Career Development', role: 'Training Officer', status: 'Active', drives: 9 }
  ];

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>Recruiter Management</h1>
          <p>Manage placement officers and coordinators</p>
        </div>
        <button className="admin-add-btn">
          <UserPlus size={20} />
          Add Recruiter
        </button>
      </div>

      <div className="admin-recruiters-grid">
        {allRecruiters.map((recruiter) => (
          <div key={recruiter.id} className="admin-recruiter-card">
            <div className="admin-recruiter-header">
              <div className="admin-recruiter-avatar">
                {recruiter.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="admin-recruiter-info">
                <h3>{recruiter.name}</h3>
                <p className="admin-recruiter-role">{recruiter.role}</p>
                <span className={`admin-status-badge admin-status-${recruiter.status.toLowerCase()}`}>
                  {recruiter.status}
                </span>
              </div>
            </div>
            <div className="admin-recruiter-details">
              <div className="admin-recruiter-row">
                <Mail size={16} />
                <span>{recruiter.email}</span>
              </div>
              <div className="admin-recruiter-row">
                <Phone size={16} />
                <span>{recruiter.phone}</span>
              </div>
              <div className="admin-recruiter-row">
                <Building2 size={16} />
                <span>{recruiter.department}</span>
              </div>
              <div className="admin-recruiter-row">
                <Briefcase size={16} />
                <span>{recruiter.drives} Active Drives</span>
              </div>
            </div>
            <div className="admin-recruiter-actions">
              <button className="admin-edit-btn">
                <Edit2 size={16} />
                Edit
              </button>
              <button className="admin-delete-btn">
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Recruiters;