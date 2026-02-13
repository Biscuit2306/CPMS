import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, Building2, Briefcase, Edit2, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/admin-css/adminrecruiters.css';

const Recruiters = () => {
  const { recruiters, statsLoading } = useAdmin();
  const [filteredRecruiters, setFilteredRecruiters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let filtered = recruiters;
    if (searchTerm) {
      filtered = recruiters.filter(r => 
        r.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredRecruiters(filtered);
  }, [searchTerm, recruiters]);

  const getActiveDrives = (recruiter) => {
    return (recruiter.jobDrives || []).filter(drive =>
      !drive?.isDeleted && drive?.status !== 'deleted' && !drive?.isBlocked && drive?.status !== 'blocked'
    ).length;
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>Recruiter Management</h1>
          <p>Manage recruitment officers and their drives ({filteredRecruiters.length} recruiters)</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Search recruiters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              width: '200px'
            }}
          />
          <button className="admin-add-btn">
            <UserPlus size={20} />
            Add Recruiter
          </button>
        </div>
      </div>

      {statsLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading recruiters...</div>
      ) : filteredRecruiters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>No recruiters found</div>
      ) : (
        <div className="admin-recruiters-grid">
          {filteredRecruiters.map((recruiter) => (
            <div key={recruiter._id} className="admin-recruiter-card">
              <div className="admin-recruiter-header">
                <div className="admin-recruiter-avatar">
                  {(recruiter.fullName || 'R').split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div className="admin-recruiter-info">
                  <h3>{recruiter.fullName || 'N/A'}</h3>
                  <p className="admin-recruiter-role">{recruiter.designation || 'Recruiter'}</p>
                  <span className={`admin-status-badge admin-status-active`}>
                    Active
                  </span>
                </div>
              </div>
              <div className="admin-recruiter-details">
                <div className="admin-recruiter-row">
                  <Mail size={16} />
                  <span>{recruiter.email || 'N/A'}</span>
                </div>
                <div className="admin-recruiter-row">
                  <Phone size={16} />
                  <span>{recruiter.phone || 'N/A'}</span>
                </div>
                <div className="admin-recruiter-row">
                  <Building2 size={16} />
                  <span>{recruiter.companyName || 'N/A'}</span>
                </div>
                <div className="admin-recruiter-row">
                  <Briefcase size={16} />
                  <span>{getActiveDrives(recruiter)} Active Drives</span>
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
      )}
    </AdminLayout>
  );
};

export default Recruiters;