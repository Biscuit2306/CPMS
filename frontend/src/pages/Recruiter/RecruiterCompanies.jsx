import React, { useState } from 'react';
import { Building2, Eye } from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import '../../styles/RecruiterCSS/recruitercompanies.css';

const Companies = () => {
  const [activeMenu, setActiveMenu] = useState('companies');

  const companyStats = [
    { id: 1, company: 'TechCorp Solutions', totalHires: 45, avgPackage: '13.5 LPA', successRate: '88%', active: true },
    { id: 2, company: 'InnovateTech', totalHires: 32, avgPackage: '11 LPA', successRate: '82%', active: true },
    { id: 3, company: 'Digital Dynamics', totalHires: 28, avgPackage: '16 LPA', successRate: '85%', active: true },
    { id: 4, company: 'CloudWorks', totalHires: 38, avgPackage: '14.5 LPA', successRate: '90%', active: false },
    { id: 5, company: 'NextGen AI', totalHires: 15, avgPackage: '20 LPA', successRate: '78%', active: true },
    { id: 6, company: 'SecureNet', totalHires: 22, avgPackage: '12 LPA', successRate: '80%', active: false },
    { id: 7, company: 'DataCrunch Analytics', totalHires: 19, avgPackage: '15 LPA', successRate: '83%', active: true },
    { id: 8, company: 'WebScale Systems', totalHires: 27, avgPackage: '13 LPA', successRate: '86%', active: true }
  ];

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

          <div className="recruiter-companies-grid">
            {companyStats.map((company) => (
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
                <button className="recruiter-company-details-btn">
                  <Eye size={18} />
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
    </RecruiterLayout>
  );
};

export default Companies;