import React, { useState } from 'react';
import { Mail, Phone, Briefcase, Eye, MoreVertical, Download } from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import '../../styles/RecruiterCSS/recruitercandidates.css';

const Candidates = () => {
  const [activeMenu, setActiveMenu] = useState('candidates');

  const allCandidates = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@college.edu', phone: '+91 9876543210', branch: 'CSE', cgpa: '8.5', year: 'Final Year', status: 'Shortlisted', appliedFor: 'Software Engineer' },
    { id: 2, name: 'Priya Patel', email: 'priya.patel@college.edu', phone: '+91 9876543211', branch: 'IT', cgpa: '8.9', year: 'Final Year', status: 'Under Review', appliedFor: 'Full Stack Developer' },
    { id: 3, name: 'Amit Kumar', email: 'amit.kumar@college.edu', phone: '+91 9876543212', branch: 'CSE', cgpa: '9.1', year: 'Final Year', status: 'Interview Scheduled', appliedFor: 'Data Scientist' },
    { id: 4, name: 'Sneha Reddy', email: 'sneha.reddy@college.edu', phone: '+91 9876543213', branch: 'ECE', cgpa: '7.8', year: 'Final Year', status: 'Rejected', appliedFor: 'Backend Developer' },
    { id: 5, name: 'Arjun Verma', email: 'arjun.verma@college.edu', phone: '+91 9876543214', branch: 'CSE', cgpa: '8.7', year: 'Final Year', status: 'Selected', appliedFor: 'DevOps Engineer' },
    { id: 6, name: 'Kavya Singh', email: 'kavya.singh@college.edu', phone: '+91 9876543215', branch: 'IT', cgpa: '8.3', year: 'Final Year', status: 'Shortlisted', appliedFor: 'Frontend Developer' },
    { id: 7, name: 'Rohan Desai', email: 'rohan.desai@college.edu', phone: '+91 9876543216', branch: 'CSE', cgpa: '8.8', year: 'Final Year', status: 'Under Review', appliedFor: 'Backend Developer' },
    { id: 8, name: 'Ananya Iyer', email: 'ananya.iyer@college.edu', phone: '+91 9876543217', branch: 'IT', cgpa: '9.0', year: 'Final Year', status: 'Shortlisted', appliedFor: 'ML Engineer' }
  ];

  return (
    <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
        <div className="recruiter-dashboard-content">
          <div className="recruiter-page-header">
            <div>
              <h1>Candidate Management</h1>
              <p>Review and manage student applications</p>
            </div>
            <div className="recruiter-header-actions">
              <button className="recruiter-export-btn">
                <Download size={18} />
                Export Data
              </button>
            </div>
          </div>

          <div className="recruiter-candidates-grid">
            {allCandidates.map((candidate) => (
              <div key={candidate.id} className="recruiter-candidate-card">
                <div className="recruiter-candidate-header">
                  <div className="recruiter-candidate-avatar-large">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="recruiter-candidate-info">
                    <h3>{candidate.name}</h3>
                    <p>{candidate.branch} • {candidate.year}</p>
                    <span className="recruiter-cgpa-badge">CGPA: {candidate.cgpa}</span>
                  </div>
                </div>
                <div className="recruiter-candidate-details">
                  <div className="recruiter-candidate-row">
                    <Mail size={16} />
                    <span>{candidate.email}</span>
                  </div>
                  <div className="recruiter-candidate-row">
                    <Phone size={16} />
                    <span>{candidate.phone}</span>
                  </div>
                  <div className="recruiter-candidate-row">
                    <Briefcase size={16} />
                    <span>{candidate.appliedFor}</span>
                  </div>
                  <div className="recruiter-candidate-row">
                    <span className="recruiter-label">Status:</span>
                    <span className={`recruiter-status-badge recruiter-status-${candidate.status.toLowerCase().replace(' ', '-')}`}>
                      {candidate.status}
                    </span>
                  </div>
                </div>
                <div className="recruiter-candidate-actions">
                  <button className="recruiter-view-profile-btn">
                    <Eye size={16} />
                    View Profile
                  </button>
                  <button className="recruiter-action-menu-btn">
                    <MoreVertical size={16} />
                    Actions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
    </RecruiterLayout>
  );
};

export default Candidates;