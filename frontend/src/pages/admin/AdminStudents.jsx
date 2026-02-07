import React from 'react';
import { UserPlus, Download, Mail, Phone, Building2, Eye, MoreVertical } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin-css/adminstudents.css';

const Students = () => {
  const allStudents = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@college.edu', phone: '+91 9876543210', branch: 'CSE', cgpa: '8.5', year: 'Final Year', status: 'Placed', company: 'TechCorp' },
    { id: 2, name: 'Priya Patel', email: 'priya.patel@college.edu', phone: '+91 9876543211', branch: 'IT', cgpa: '8.9', year: 'Final Year', status: 'Active', company: '-' },
    { id: 3, name: 'Amit Kumar', email: 'amit.kumar@college.edu', phone: '+91 9876543212', branch: 'CSE', cgpa: '9.1', year: 'Final Year', status: 'Placed', company: 'InnovateTech' },
    { id: 4, name: 'Sneha Reddy', email: 'sneha.reddy@college.edu', phone: '+91 9876543213', branch: 'ECE', cgpa: '7.8', year: 'Final Year', status: 'Active', company: '-' },
    { id: 5, name: 'Arjun Verma', email: 'arjun.verma@college.edu', phone: '+91 9876543214', branch: 'CSE', cgpa: '8.7', year: 'Final Year', status: 'Placed', company: 'Digital Dynamics' },
    { id: 6, name: 'Kavya Singh', email: 'kavya.singh@college.edu', phone: '+91 9876543215', branch: 'IT', cgpa: '8.3', year: 'Final Year', status: 'Active', company: '-' },
    { id: 7, name: 'Rohan Desai', email: 'rohan.desai@college.edu', phone: '+91 9876543216', branch: 'CSE', cgpa: '8.8', year: 'Final Year', status: 'Inactive', company: '-' },
    { id: 8, name: 'Ananya Iyer', email: 'ananya.iyer@college.edu', phone: '+91 9876543217', branch: 'IT', cgpa: '9.0', year: 'Final Year', status: 'Placed', company: 'NextGen AI' }
  ];

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>Student Management</h1>
          <p>Manage student profiles and placement status</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-export-btn">
            <Download size={18} />
            Export Data
          </button>
          <button className="admin-add-btn">
            <UserPlus size={20} />
            Add Student
          </button>
        </div>
      </div>

      <div className="admin-students-grid">
        {allStudents.map((student) => (
          <div key={student.id} className="admin-student-card">
            <div className="admin-student-header">
              <div className="admin-student-avatar">
                {student.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="admin-student-info">
                <h3>{student.name}</h3>
                <p>{student.branch} • {student.year}</p>
                <span className="admin-cgpa-badge">CGPA: {student.cgpa}</span>
              </div>
            </div>
            <div className="admin-student-details">
              <div className="admin-student-row">
                <Mail size={16} />
                <span>{student.email}</span>
              </div>
              <div className="admin-student-row">
                <Phone size={16} />
                <span>{student.phone}</span>
              </div>
              <div className="admin-student-row">
                <Building2 size={16} />
                <span>{student.company !== '-' ? student.company : 'Not Placed'}</span>
              </div>
              <div className="admin-student-row">
                <span className="admin-label">Status:</span>
                <span className={`admin-status-badge admin-status-${student.status.toLowerCase()}`}>
                  {student.status}
                </span>
              </div>
            </div>
            <div className="admin-student-actions">
              <button className="admin-view-btn">
                <Eye size={16} />
                View Profile
              </button>
              <button className="admin-action-menu-btn">
                <MoreVertical size={16} />
                Actions
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Students;