import React, { useState } from 'react';
import { DollarSign, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import InterviewFeature from '../InterviewFeature';
import ProjectEvaluator from '../ProjectEvaluator';
import { useStudent } from '../../context/StudentContext';
import '../../styles/student-css/studentdashboard.css';
import '../../styles/student-css/studentjobdrives.css';


const StudentJobDrives = () => {
  const [filterCategory, setFilterCategory] = useState('all');
  const { jobDrives, drivesLoading, applications, applyForDrive } = useStudent();
  const [appliedDriveIds, setAppliedDriveIds] = useState(
    applications.map(app => app.driveId)
  );

  const handleApply = async (driveId, recruiterId) => {
    try {
      await applyForDrive(recruiterId, driveId);
      setAppliedDriveIds([...appliedDriveIds, driveId]);
      alert('Applied successfully!');
    } catch (err) {
      console.error('Error applying:', err);
      alert(err.response?.data?.error || 'Failed to apply. You may have already applied to this drive.');
    }
  };

  if (drivesLoading) {
    return (
      <StudentLayout>
        <div className="student-page-header">
          <h1>Job Drives</h1>
          <p>Loading available drives...</p>
        </div>
      </StudentLayout>
    );
  }

  const filteredDrives = jobDrives.filter(drive => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'on-campus') return drive.type === 'On Campus';
    if (filterCategory === 'off-campus') return drive.type === 'Off Campus';
    if (filterCategory === 'applied') return appliedDriveIds.includes(drive._id);
    return true;
  });

  return (
    <StudentLayout>
      <div className="student-page-header">
        <div>
          <h1>Job Drives</h1>
          <p>Browse and apply to upcoming placement drives</p>
        </div>
        <div className="student-filter-section">
          <button 
            className={`student-filter-btn ${filterCategory === 'all' ? 'active' : ''}`} 
            onClick={() => setFilterCategory('all')}
          >
            All Drives ({jobDrives.length})
          </button>
          <button 
            className={`student-filter-btn ${filterCategory === 'applied' ? 'active' : ''}`} 
            onClick={() => setFilterCategory('applied')}
          >
            My Applications ({appliedDriveIds.length})
          </button>
        </div>
      </div>

      <div className="student-job-drives-grid">
        {filteredDrives && filteredDrives.length > 0 ? (
          filteredDrives.map((drive) => {
            const hasApplied = appliedDriveIds.includes(drive._id);
            const isDeadlinePassed = new Date(drive.applicationDeadline) < new Date();
            
            return (
              <div key={drive._id} className="student-job-drive-card">
                <div className="student-job-drive-header">
                  <div className="student-company-logo-large">
                    {(drive.companyName || drive.position)?.charAt(0) || 'J'}
                  </div>
                  <div className="student-job-drive-title">
                    <h3>{drive.companyName || drive.position}</h3>
                    <span className={`student-drive-type-badge ${drive.status?.toLowerCase()}`}>
                      {drive.status === 'active' ? 'Hiring' : drive.status === 'scheduled' ? 'Upcoming' : drive.status}
                    </span>
                  </div>
                </div>
                <h4 className="student-job-role">{drive.position}</h4>
                <div className="student-job-details">
                  <div className="student-job-detail-item">
                    <DollarSign size={16} />
                    <span>{drive.salary}</span>
                  </div>
                  <div className="student-job-detail-item">
                    <MapPin size={16} />
                    <span>{drive.location}</span>
                  </div>
                  <div className="student-job-detail-item">
                    <Calendar size={16} />
                    <span>{new Date(drive.date).toLocaleDateString()}</span>
                  </div>
                  <div className="student-job-detail-item">
                    <Clock size={16} />
                    <span>Deadline: {new Date(drive.applicationDeadline).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div style={{mt: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px', fontSize: '14px'}}>
                  <strong>Min CGPA:</strong> {drive.eligibilityCriteria?.minCGPA || 0} | 
                  <strong> Applicants:</strong> {drive.applications?.length || 0}
                </div>

                <button 
                  className={`student-job-apply-btn ${hasApplied || isDeadlinePassed ? 'disabled' : ''}`} 
                  disabled={hasApplied || isDeadlinePassed}
                  onClick={() => handleApply(drive._id, drive.recruiterId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '10px'
                  }}
                >
                  {hasApplied ? (
                    <>
                      <CheckCircle size={16} />
                      Already Applied
                    </>
                  ) : isDeadlinePassed ? (
                    'Deadline Passed'
                  ) : (
                    'Apply Now'
                  )}
                </button>
              </div>
            );
          })
        ) : (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px'}}>
            <p>No drives available at the moment.</p>
          </div>
        )}
      </div>

      <InterviewFeature />
      <ProjectEvaluator />
    </StudentLayout>
  );
};

export default StudentJobDrives;