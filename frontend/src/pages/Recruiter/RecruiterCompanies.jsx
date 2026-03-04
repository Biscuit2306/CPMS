import React, { useState, useEffect } from 'react';
import { Building2, Eye, Globe, Users } from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { useRecruiter } from '../../context/RecruiterContext';
import '../../styles/RecruiterCSS/recruitercompanies.css';

const Companies = () => {
  const [activeMenu, setActiveMenu] = useState('companies');
  const { getCompanies, searchQuery } = useRecruiter();
  const [companies, setCompanies] = useState([]);

  const query = (searchQuery || '').trim().toLowerCase();
  const filteredCompanies = query
    ? companies.filter(c => (c.company || '').toLowerCase().includes(query))
    : companies;
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

  // ── Company Details Modal ──────────────────────────────────────────────────
  const CompanyDetailsModal = ({ company, onClose }) => {
    if (!company) return null;

    return (
      <div className="company-modal-overlay" onClick={onClose}>
        <div className="company-modal-content" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="company-modal-header">
            <h2 className="company-modal-title">Company Details</h2>
            <button onClick={onClose} className="company-modal-close-btn">×</button>
          </div>

          <div className="company-modal-body">

            {/* Hero */}
            <div className="cmo-hero">
              <div className="cmo-hero-avatar">
                {company.company?.charAt(0)?.toUpperCase()}
              </div>
              <div className="cmo-hero-info">
                <h3 className="cmo-hero-name">{company.company}</h3>
                {company.size && (
                  <span style={{ fontSize: '0.83rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Users size={13} /> {company.size}
                  </span>
                )}
              </div>
              <span className={`cmo-hero-status cmo-hero-status--${company.active ? 'active' : 'inactive'}`}>
                <span className="cmo-status-dot" />
                {company.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="cmo-stats-grid">
              <div className="cmo-stat-card">
                <span className="cmo-stat-label">Total Hires</span>
                <span className="cmo-stat-value cmo-stat-value--blue">{company.totalHires ?? 0}</span>
              </div>
              <div className="cmo-stat-card">
                <span className="cmo-stat-label">Applications</span>
                <span className="cmo-stat-value cmo-stat-value--amber">{company.applications ?? 0}</span>
              </div>
              <div className="cmo-stat-card">
                <span className="cmo-stat-label">Success Rate</span>
                <span className="cmo-stat-value cmo-stat-value--purple">{company.successRate ?? 'N/A'}</span>
              </div>
            </div>

            {/* Website */}
            {company.website && (
              <div className="cmo-info-row">
                <Globe size={16} />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cmo-info-link"
                >
                  {company.website}
                </a>
              </div>
            )}

            {/* Company Size row (if not shown in hero) */}
            {company.size && (
              <div className="cmo-info-row">
                <Users size={16} />
                <span>Company Size: <strong>{company.size}</strong></span>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
        <div className="recruiter-dashboard-content">
          <p>Loading companies...</p>
        </div>
      </RecruiterLayout>
    );
  }

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
      {/* <div className="recruiter-dashboard-content"> */}

        {/* Page Header */}
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

        {/* Companies Grid */}
        {filteredCompanies && filteredCompanies.length > 0 ? (
          <div className="recruiter-companies-grid">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="recruiter-company-card">

                {/* ── NEW: Professional Card Header ── */}
                <div className="rco-card-header">
                  {/* Status badge — absolute top-right */}
                  <span className={`rco-status-pill ${company.active ? 'rco-pill--active' : 'rco-pill--inactive'}`}>
                    <span className="rco-status-dot" />
                    {company.active ? 'Active' : 'Inactive'}
                  </span>

                  {/* Logo + Company name */}
                  <div className="rco-identity">
                    <div className="rco-avatar">
                      {company.company.charAt(0)}
                    </div>
                    <div className="rco-title-block">
                      <h3 className="rco-name">{company.company}</h3>
                      {company.size && (
                        <p className="rco-meta">
                          <Users size={12} />
                          {company.size}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── UNCHANGED: Stats ── */}
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

                {/* ── UNCHANGED: Action ── */}
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
          /* Empty State */
          <div className="company-empty-state">
            <Building2 size={48} className="company-empty-icon" />
            <h3 className="company-empty-title">
              {query ? `No companies match "${searchQuery}"` : 'No companies yet'}
            </h3>
            {!query && (
              <p className="company-empty-subtitle">
                Start by creating a job drive to add your company
              </p>
            )}
          </div>
        )}

      {/* </div> */}

      {/* Modal */}
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