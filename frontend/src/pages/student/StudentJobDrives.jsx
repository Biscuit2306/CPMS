import React, { useState } from 'react';
import { DollarSign, MapPin, Calendar, Clock } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import InterviewFeature from '../InterviewFeature';
import ProjectEvaluator from '../ProjectEvaluator';
import '../../styles/student-css/studentdashboard.css';
import '../../styles/student-css/studentjobdrives.css';


const StudentJobDrives = () => {
  const [filterCategory, setFilterCategory] = useState('all');

  const allJobDrives = [
    { id: 1, company: 'TCS', date: 'Jan 28, 2026', role: 'Software Engineer', package: '3.6 LPA', location: 'Mumbai', type: 'On Campus', deadline: 'Jan 26, 2026', eligible: true },
    { id: 2, company: 'Infosys', date: 'Feb 2, 2026', role: 'System Engineer', package: '4.0 LPA', location: 'Bangalore', type: 'On Campus', deadline: 'Jan 30, 2026', eligible: true },
    { id: 3, company: 'Wipro', date: 'Feb 5, 2026', role: 'Project Engineer', package: '3.8 LPA', location: 'Pune', type: 'On Campus', deadline: 'Feb 1, 2026', eligible: true },
    { id: 4, company: 'Google', date: 'Feb 10, 2026', role: 'Software Engineer', package: '18 LPA', location: 'Hyderabad', type: 'Off Campus', deadline: 'Feb 5, 2026', eligible: true },
    { id: 5, company: 'Amazon', date: 'Feb 12, 2026', role: 'SDE-1', package: '20 LPA', location: 'Bangalore', type: 'Off Campus', deadline: 'Feb 7, 2026', eligible: true },
    { id: 6, company: 'Microsoft', date: 'Feb 15, 2026', role: 'Software Developer', package: '16 LPA', location: 'Hyderabad', type: 'Off Campus', deadline: 'Feb 10, 2026', eligible: false }
  ];

  return (
    <StudentLayout>
      <div className="student-page-header">
        <div>
          <h1>Job Drives</h1>
          <p>Browse and apply to upcoming placement drives</p>
        </div>
        <div className="student-filter-section">
          <button className={`student-filter-btn ${filterCategory === 'all' ? 'active' : ''}`} onClick={() => setFilterCategory('all')}>
            All Drives
          </button>
          <button className={`student-filter-btn ${filterCategory === 'on-campus' ? 'active' : ''}`} onClick={() => setFilterCategory('on-campus')}>
            On Campus
          </button>
          <button className={`student-filter-btn ${filterCategory === 'off-campus' ? 'active' : ''}`} onClick={() => setFilterCategory('off-campus')}>
            Off Campus
          </button>
        </div>
      </div>

      <div className="student-job-drives-grid">
        {allJobDrives
          .filter(drive => filterCategory === 'all' || drive.type.toLowerCase().replace(' ', '-') === filterCategory)
          .map((drive) => (
          <div key={drive.id} className="student-job-drive-card">
            <div className="student-job-drive-header">
              <div className="student-company-logo-large">
                {drive.company.charAt(0)}
              </div>
              <div className="student-job-drive-title">
                <h3>{drive.company}</h3>
                <span className={`student-drive-type-badge ${drive.type.toLowerCase().replace(' ', '-')}`}>{drive.type}</span>
              </div>
            </div>
            <h4 className="student-job-role">{drive.role}</h4>
            <div className="student-job-details">
              <div className="student-job-detail-item">
                <DollarSign size={16} />
                <span>{drive.package}</span>
              </div>
              <div className="student-job-detail-item">
                <MapPin size={16} />
                <span>{drive.location}</span>
              </div>
              <div className="student-job-detail-item">
                <Calendar size={16} />
                <span>{drive.date}</span>
              </div>
              <div className="student-job-detail-item">
                <Clock size={16} />
                <span>Deadline: {drive.deadline}</span>
              </div>
            </div>
            <button className={`student-job-apply-btn ${!drive.eligible ? 'disabled' : ''}`} disabled={!drive.eligible}>
              {drive.eligible ? 'Apply Now' : 'Not Eligible'}
            </button>
          </div>
        ))}
      </div>

      <InterviewFeature />
      <ProjectEvaluator />
    </StudentLayout>
  );
};

export default StudentJobDrives;