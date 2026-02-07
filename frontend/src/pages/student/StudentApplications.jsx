import React from 'react';
import StudentLayout from '../../components/StudentLayout';
import InterviewFeature from '../InterviewFeature';
import ProjectEvaluator from '../ProjectEvaluator';
import '../../styles/student-css/studentdashboard.css';
import '../../styles/student-css/studentapplications.css';


const StudentApplications = () => {
  const appliedCompanies = [
    { company: 'Google', status: 'Interview Scheduled', date: 'Jan 30, 2026', role: 'Software Engineer', package: '18 LPA' },
    { company: 'Microsoft', status: 'Applied', date: 'Jan 25, 2026', role: 'SDE Intern', package: '15 LPA' },
    { company: 'Amazon', status: 'Test Cleared', date: 'Jan 26, 2026', role: 'Software Developer', package: '20 LPA' },
    { company: 'Flipkart', status: 'Rejected', date: 'Jan 20, 2026', role: 'Backend Developer', package: '12 LPA' },
    { company: 'TCS', status: 'Selected', date: 'Jan 15, 2026', role: 'System Engineer', package: '3.6 LPA' }
  ];

  return (
    <StudentLayout>
      <div className="student-page-header">
        <div>
          <h1>My Applications</h1>
          <p>Track your application status and interview schedules</p>
        </div>
      </div>

      <div className="student-applications-grid">
        {appliedCompanies.map((app, index) => (
          <div key={index} className="student-application-card">
            <div className="student-application-card-header">
              <div className="student-company-logo-large">
                {app.company.charAt(0)}
              </div>
              <div>
                <h3>{app.company}</h3>
                <p className="student-application-role">{app.role}</p>
              </div>
            </div>
            <div className="student-application-details">
              <div className="student-application-info-row">
                <span className="student-info-label">Package:</span>
                <span className="student-info-value">{app.package}</span>
              </div>
              <div className="student-application-info-row">
                <span className="student-info-label">Applied Date:</span>
                <span className="student-info-value">{app.date}</span>
              </div>
              <div className="student-application-info-row">
                <span className="student-info-label">Status:</span>
                <span className={`student-status-badge student-status-${app.status.toLowerCase().replace(' ', '-')}`}>
                  {app.status}
                </span>
              </div>
            </div>
            <button className="student-view-details-btn">View Details</button>
          </div>
        ))}
      </div>

      <InterviewFeature />
      <ProjectEvaluator />
    </StudentLayout>
  );
};

export default StudentApplications;