import React, { useState, useEffect } from 'react';
import { Building2, Eye, Globe, Users } from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { useRecruiter } from '../../context/RecruiterContext';
import '../../styles/RecruiterCSS/recruitercompanies.css';

const Companies = () => {
  const [activeMenu, setActiveMenu] = useState('companies');
  const { getCompanies } = useRecruiter();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const companiesData = await getCompanies();
        setCompanies(companiesData);
      } catch (err) {
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const CompanyDetailsModal = ({ company, onClose }) => {
    if (!company) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>{company.company}</h2>
            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>Status:</span>
              <span style={{ color: '#10b981', fontWeight: '500' }}>
                {company.active ? '● Active' : '● Inactive'}
              </span>
            </div>

            <div>
              <strong>Total Hires:</strong>
              <div style={{ fontSize: '24px', color: '#0ea5e9', fontWeight: 'bold', marginTop: '5px' }}>
                {company.totalHires}
              </div>
            </div>

            <div>
              <strong>Total Applications:</strong>
              <div style={{ fontSize: '24px', color: '#f59e0b', fontWeight: 'bold', marginTop: '5px' }}>
                {company.applications}
              </div>
            </div>

            <div>
              <strong>Success Rate:</strong>
              <div style={{ fontSize: '24px', color: '#8b5cf6', fontWeight: 'bold', marginTop: '5px' }}>
                {company.successRate}
              </div>
            </div>

            {company.website && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                <Globe size={18} color="#0ea5e9" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9', textDecoration: 'none' }}>
                  {company.website}
                </a>
              </div>
            )}

            {company.size && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} color="#0ea5e9" />
                <span>Company Size: <strong>{company.size}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
        <div className="recruiter-dashboard-content">
          <p>Loading companies...</p>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
      <div className="recruiter-dashboard-content">
        <div className="recruiter-page-header">
          <div>
            <h1>Recruiting Companies</h1>
            <p>Track company partnerships and hiring statistics</p>
          </div>
          <button className="recruiter-add-company-btn">
            <Building2 size={20} />
            Add Company
          </button>
        </div>

        {companies && companies.length > 0 ? (
          <div className="recruiter-companies-grid">
            {companies.map((company) => (
              <div key={company.id} className="recruiter-company-card">
                <div className="recruiter-company-card-header">
                  <div className="recruiter-company-logo-xl">
                    {company.company.charAt(0)}
                  </div>
                  <div className="recruiter-company-title">
                    <h3>{company.company}</h3>
                    <span className={`recruiter-active-badge ${company.active ? 'active' : 'inactive'}`}>
                      {company.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="recruiter-company-stats">
                  <div className="recruiter-company-stat">
                    <span className="recruiter-stat-label">Total Hires</span>
                    <span className="recruiter-stat-value">{company.totalHires}</span>
                  </div>
                  <div className="recruiter-company-stat">
                    <span className="recruiter-stat-label">Avg. Package</span>
                    <span className="recruiter-stat-value">{company.avgPackage}</span>
                  </div>
                  <div className="recruiter-company-stat">
                    <span className="recruiter-stat-label">Success Rate</span>
                    <span className="recruiter-stat-value">{company.successRate}</span>
                  </div>
                </div>
                <button 
                  className="recruiter-company-details-btn"
                  onClick={() => {
                    setSelectedCompany(company);
                    setShowModal(true);
                  }}
                >
                  <Eye size={18} />
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <Building2 size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
            <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>No companies yet</h3>
            <p style={{ color: '#9ca3af' }}>
              Start by creating a job drive to add your company
            </p>
          </div>
        )}
      </div>

      {showModal && selectedCompany && (
        <CompanyDetailsModal 
          company={selectedCompany} 
          onClose={() => {
            setShowModal(false);
            setSelectedCompany(null);
          }}
        />
      )}
    </RecruiterLayout>
  );
};

export default Companies;