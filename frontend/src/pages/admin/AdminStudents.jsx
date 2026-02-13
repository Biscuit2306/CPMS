import React, { useState, useEffect } from 'react';
import { UserPlus, Download, Mail, Phone, Building2, Eye, MoreVertical } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/admin-css/adminstudents.css';

const Students = () => {
  const { students, statsLoading } = useAdmin();
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let filtered = students;
    if (searchTerm) {
      filtered = students.filter(s => 
        s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const getStatusBadge = (student) => {
    if (student.applications && student.applications.length > 0) {
      const hasPlaced = student.applications.some(a => a.applicationStatus === 'selected');
      return hasPlaced ? 'Placed' : 'Active';
    }
    return 'Active';
  };

  const getPlacedCompany = (student) => {
    if (student.applications && student.applications.length > 0) {
      const placed = student.applications.find(a => a.applicationStatus === 'selected');
      return placed?.companyName || '-';
    }
    return '-';
  };

  const exportData = () => {
    const dataStr = JSON.stringify(students, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students_' + new Date().toISOString() + '.json';
    link.click();
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>Student Management</h1>
          <p>Manage student profiles and placement status ({filteredStudents.length} students)</p>
        </div>
        <div className="admin-header-actions">
          <input 
            type="text" 
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              marginRight: '10px',
              width: '200px'
            }}
          />
          <button className="admin-export-btn" onClick={exportData}>
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      {statsLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading students...</div>
      ) : filteredStudents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>No students found</div>
      ) : (
        <div className="admin-students-grid">
          {filteredStudents.map((student) => (
            <div key={student._id} className="admin-student-card">
              <div className="admin-student-header">
                <div className="admin-student-avatar">
                  {(student.fullName || 'S').split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div className="admin-student-info">
                  <h3>{student.fullName || 'N/A'}</h3>
                  <p>{student.branch || 'N/A'} • {student.year || 'N/A'}</p>
                  <span className="admin-cgpa-badge">CGPA: {student.cgpa || '0.0'}</span>
                </div>
              </div>
              <div className="admin-student-details">
                <div className="admin-student-row">
                  <Mail size={16} />
                  <span>{student.email || 'N/A'}</span>
                </div>
                <div className="admin-student-row">
                  <Phone size={16} />
                  <span>{student.phone || 'N/A'}</span>
                </div>
                <div className="admin-student-row">
                  <Building2 size={16} />
                  <span>{getPlacedCompany(student)}</span>
                </div>
                <div className="admin-student-row">
                  <span className="admin-label">Status:</span>
                  <span className={`admin-status-badge admin-status-${getStatusBadge(student).toLowerCase()}`}>
                    {getStatusBadge(student)}
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
      )}
    </AdminLayout>
  );
};

export default Students;