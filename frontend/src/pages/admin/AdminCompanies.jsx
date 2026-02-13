import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, Calendar, Eye, Edit2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/admin-css/admincompanies.css';

const Companies = () => {
  const { recruiters, statsLoading } = useAdmin();
  const [filteredRecruiters, setFilteredRecruiters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let filtered = recruiters;
    if (searchTerm) {
      filtered = recruiters.filter(r => 
        r.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredRecruiters(filtered);
  }, [searchTerm, recruiters]);

  const getTotalHires = (recruiter) => {
    const drives = (recruiter.jobDrives || []).filter(drive =>
      !drive?.isDeleted && drive?.status !== 'deleted' && !drive?.isBlocked && drive?.status !== 'blocked'
    );

    return drives.reduce((sum, drive) => 
      sum + ((drive.applications || drive.applicants || []).filter(a => a.applicationStatus === 'selected').length || 0), 0
    ) || 0;
  };

  const getAvgPackage = (recruiter) => {
    return recruiter.salary || 'N/A';
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>Company Management</h1>
          <p>Manage partner companies and recruiters ({filteredRecruiters.length} companies)</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Search companies..."
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
            <Building2 size={20} />
            Add Company
          </button>
        </div>
      </div>

      {statsLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading companies...</div>
      ) : filteredRecruiters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>No companies found</div>
      ) : (
        <div className="admin-companies-grid">
          {filteredRecruiters.map((recruiter) => (
            <div key={recruiter._id} className="admin-company-card">
              <div className="admin-company-header">
                <div className="admin-company-logo">
                  {(recruiter.companyName || recruiter.fullName || 'C').charAt(0)}
                </div>
                <div className="admin-company-info">
                  <h3>{recruiter.companyName || recruiter.fullName}</h3>
                  <p>{recruiter.designation || 'Recruiter'}</p>
                  <span className="admin-status-badge admin-status-active">
                    Active
                  </span>
                </div>
              </div>
              <div className="admin-company-details">
                <div className="admin-company-row">
                  <Mail size={16} />
                  <span>{recruiter.email || 'N/A'}</span>
                </div>
                <div className="admin-company-row">
                  <Phone size={16} />
                  <span>{recruiter.phone || 'N/A'}</span>
                </div>
                <div className="admin-company-row">
                  <Calendar size={16} />
                  <span>Total Hires: {getTotalHires(recruiter)}</span>
                </div>
                <div className="admin-company-row">
                  <span>Avg Package: {getAvgPackage(recruiter)}</span>
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
      )}
    </AdminLayout>
  );
}; 

export default Companies;