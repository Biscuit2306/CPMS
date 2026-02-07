import React, { useState } from 'react';
import { Briefcase, Calendar, MapPin, Users, DollarSign, Eye, Edit2 } from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import '../../styles/RecruiterCSS/recruiterdrives.css';

const RecruiterDrives = () => {
  const [activeMenu, setActiveMenu] = useState('drives');

  const drivesData = [
    { 
      id: 1, 
      company: 'TechCorp Solutions', 
      position: 'Software Engineer', 
      date: '2026-02-15', 
      location: 'Bangalore',
      salary: '13.5 LPA',
      applicants: 45,
      status: 'active',
      rounds: ['Online Test', 'Technical Interview', 'HR Round']
    },
    { 
      id: 2, 
      company: 'InnovateTech', 
      position: 'Full Stack Developer', 
      date: '2026-02-20', 
      location: 'Hyderabad',
      salary: '12 LPA',
      applicants: 32,
      status: 'scheduled',
      rounds: ['Resume Screening', 'Coding Test', 'Technical Interview']
    },
    { 
      id: 3, 
      company: 'Digital Dynamics', 
      position: 'Data Scientist', 
      date: '2026-02-10', 
      location: 'Chennai',
      salary: '16 LPA',
      applicants: 28,
      status: 'completed',
      rounds: ['Online Test', 'Case Study', 'Technical Interview', 'HR Round']
    },
    { 
      id: 4, 
      company: 'CloudWorks', 
      position: 'DevOps Engineer', 
      date: '2026-03-05', 
      location: 'Pune',
      salary: '14.5 LPA',
      applicants: 38,
      status: 'scheduled',
      rounds: ['Technical Interview', 'System Design', 'HR Round']
    },
    { 
      id: 5, 
      company: 'NextGen AI', 
      position: 'ML Engineer', 
      date: '2026-02-25', 
      location: 'Bangalore',
      salary: '20 LPA',
      applicants: 15,
      status: 'active',
      rounds: ['Online Test', 'ML Round', 'System Design']
    },
  ];

  const getStatusLabel = (status) => {
    if (status === 'active') return 'Active';
    if (status === 'scheduled') return 'Scheduled';
    if (status === 'completed') return 'Completed';
    return 'Active';
  };

  return (
    <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
      <div className="recruiter-dashboard-content">
        <div className="recruiter-page-header">
          <div>
            <h1>Placement Drives</h1>
            <p>Manage and track ongoing recruitment drives</p>
          </div>
          <button className="recruiter-add-drive-btn">
            <Briefcase size={20} />
            Add Drive
          </button>
        </div>

        <div className="recruiter-drives-grid">
          {drivesData.map((drive) => (
            <div key={drive.id} className="recruiter-drive-card">
              <div className="recruiter-drive-card-header">
                <div className="recruiter-company-logo-large">
                  {drive.company.charAt(0)}
                </div>
                <div className="recruiter-drive-title">
                  <h3>{drive.company}</h3>
                  <span className={`recruiter-drive-status-badge ${drive.status}`}>
                    {getStatusLabel(drive.status)}
                  </span>
                </div>
              </div>

              <p className="recruiter-job-role">{drive.position}</p>

              <div className="recruiter-drive-details">
                <div className="recruiter-drive-detail-item">
                  <Calendar size={16} />
                  {new Date(drive.date).toLocaleDateString()}
                </div>
                <div className="recruiter-drive-detail-item">
                  <MapPin size={16} />
                  {drive.location}
                </div>
                <div className="recruiter-drive-detail-item">
                  <DollarSign size={16} />
                  {drive.salary}
                </div>
                <div className="recruiter-drive-detail-item">
                  <Users size={16} />
                  {drive.applicants} Applicants
                </div>
              </div>

              <div className="recruiter-drive-actions">
                <button className="recruiter-view-btn">
                  <Eye size={16} />
                  View Details
                </button>
                <button className="recruiter-manage-action-btn">
                  <Edit2 size={16} />
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterDrives;