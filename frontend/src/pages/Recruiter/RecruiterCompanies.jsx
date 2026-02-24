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
      <div className="company-modal-overlay">
        <div className="company-modal-content">
          <div className="company-modal-header">
            <h2 className="company-modal-title">{company.company}</h2>
            <button
              onClick={onClose}
              className="company-modal-close-btn"
            >
              ×
            </button>
          </div>

          <div className="company-modal-body">
            <div className="company-modal-status-row">
              <span className="company-modal-status-label">Status:</span>
              <span className="company-modal-status-value">
                {company.active ? '● Active' : '● Inactive'}
              </span>
            </div>

            <div className="company-modal-stat-block">
              <strong>Total Hires:</strong>
              <div className="company-modal-stat-number company-modal-stat-blue">
                {company.totalHires}
              </div>
            </div>

            <div className="company-modal-stat-block">
              <strong>Total Applications:</strong>
              <div className="company-modal-stat-number company-modal-stat-amber">
                {company.applications}
              </div>
            </div>

            <div className="company-modal-stat-block">
              <strong>Success Rate:</strong>
              <div className="company-modal-stat-number company-modal-stat-purple">
                {company.successRate}
              </div>
            </div>

            {company.website && (
              <div className="company-modal-website-row">
                <Globe size={18} className="company-modal-icon" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="company-modal-link"
                >
                  {company.website}
                </a>
              </div>
            )}

            {company.size && (
              <div className="company-modal-size-row">
                <Users size={18} className="company-modal-icon" />
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
          <div className="company-empty-state">
            <Building2 size={48} className="company-empty-icon" />
            <h3 className="company-empty-title">No companies yet</h3>
            <p className="company-empty-subtitle">
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