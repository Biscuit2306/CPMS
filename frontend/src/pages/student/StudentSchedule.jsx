import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Users, AlertCircle, Video, MapPin as LocationIcon, Lock } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import { useStudent } from '../../context/StudentContext';
import InterviewFeature from '../InterviewFeature';
import ProjectEvaluator from '../ProjectEvaluator';
import '../../styles/student-css/studentschedule.css';

const StudentSchedule = () => {
  const { schedules, schedulesLoading, fetchAllSchedules, student } = useStudent();
  const [loading, setLoading] = useState(true);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoading(true);
        // Fetch all available schedules (not just student-specific ones)
        await fetchAllSchedules();
      } finally {
        setLoading(false);
      }
    };
    loadSchedules();
  }, []);

  useEffect(() => {
    let filtered = schedules || [];

    // Filter out blocked/cancelled schedules - safety net frontend filter
    filtered = filtered.filter(s => !s.isBlocked && s.status !== 'blocked');

    if (selectedFilter === 'upcoming') {
      filtered = filtered.filter(s => new Date(s.date) > new Date() && s.status !== 'completed');
    } else if (selectedFilter === 'completed') {
      filtered = filtered.filter(s => s.status === 'completed');
    }

    setFilteredSchedules(filtered);
  }, [schedules, selectedFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return { bg: '#dbeafe', color: '#0284c7' };
      case 'ongoing':
        return { bg: '#fef08a', color: '#b45309' };
      case 'completed':
        return { bg: '#dcfce7', color: '#16a34a' };
      case 'cancelled':
        return { bg: '#fee2e2', color: '#dc2626' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getCandidateStatus = (schedule, studentId) => {
    if (!schedule.candidates) return 'Not invited';
    const candidate = schedule.candidates.find(c => c.studentId === studentId);
    return candidate ? candidate.status : 'Not invited';
  };

  return (
    <StudentLayout>
      <div className="student-page-header">
        <div>
          <h1>Interview Schedule</h1>
          <p>Your upcoming interviews, tests, and placement events</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '25px',
        flexWrap: 'wrap'
      }}>
        {['all', 'upcoming', 'completed'].map(filter => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              backgroundColor: selectedFilter === filter ? '#0284c7' : 'white',
              color: selectedFilter === filter ? 'white' : 'black',
              cursor: 'pointer',
              fontWeight: selectedFilter === filter ? '600' : '400',
              textTransform: 'capitalize'
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading || schedulesLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading schedules...</p>
        </div>
      ) : filteredSchedules.length > 0 ? (
        <div className="student-schedule-grid">
          {filteredSchedules.map((schedule) => {
            const candidateStatus = getCandidateStatus(schedule, student?.firebaseUid);
            const isScheduledForMe = candidateStatus !== 'Not invited';
            const statusInfo = getStatusColor(candidateStatus);

            return (
              <div key={schedule._id} className="student-schedule-card" style={schedule.isBlocked || schedule.isCancelled ? { opacity: 0.6, position: 'relative' } : {}}>
                {(schedule.isBlocked || schedule.isCancelled) && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: '20px',
                    zIndex: 10,
                    backdropFilter: 'blur(2px)'
                  }}>
                    <div style={{
                      backgroundColor: '#fff',
                      padding: '14px 12px',
                      borderRadius: '6px',
                      textAlign: 'center',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}>
                      <AlertCircle size={28} style={{ color: '#ef4444', marginBottom: '6px' }} />
                      <p style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '2px', fontSize: '13px' }}>Interview Cancelled</p>
                      <p style={{ fontSize: '11px', color: '#666' }}>By Admin</p>
                    </div>
                  </div>
                )}
                <div className="student-schedule-header">
                  <div className="student-schedule-company">
                    <div className="student-company-logo-small">
                      {schedule.company.charAt(0)}
                    </div>
                    <div>
                      <h3>{schedule.company}</h3>
                      <span className="student-schedule-type">{schedule.interviewType}</span>
                      <span style={{ display: 'block', fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        Position: {schedule.position}
                      </span>
                    </div>
                  </div>
                  <span 
                    className="student-schedule-status"
                    style={{
                      backgroundColor: getStatusColor(schedule.status).bg,
                      color: getStatusColor(schedule.status).color,
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}
                  >
                    {schedule.status}
                  </span>
                </div>

                <div className="student-schedule-details">
                  <div className="student-schedule-info">
                    <Calendar size={18} />
                    <span>{new Date(schedule.date).toLocaleDateString()}</span>
                  </div>
                  <div className="student-schedule-info">
                    <Clock size={18} />
                    <span>{schedule.time}</span>
                  </div>
                  <div className="student-schedule-info">
                    {schedule.platform === 'Online' ? <Video size={18} /> : <LocationIcon size={18} />}
                    <span>{schedule.venue}</span>
                  </div>
                  <div className="student-schedule-info">
                    <Users size={18} />
                    <span>{schedule.candidates?.length || 0} Candidates</span>
                  </div>
                </div>

                {/* My Status */}
                {isScheduledForMe && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: statusInfo.bg,
                    color: statusInfo.color,
                    borderRadius: '4px',
                    marginTop: '12px',
                    textAlign: 'center',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    Your Status: {candidateStatus}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  {schedule.status === 'scheduled' && isScheduledForMe && (
                    <>
                      {schedule.platform === 'Online' && schedule.meetingLink ? (
                        <a
                          href={schedule.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="student-schedule-btn"
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            backgroundColor: '#0284c7',
                            color: 'white',
                            padding: '10px',
                            borderRadius: '4px',
                            textDecoration: 'none'
                          }}
                        >
                          Join Meeting
                        </a>
                      ) : (
                        <button
                          className="student-schedule-btn"
                          style={{
                            flex: 1,
                            backgroundColor: '#0284c7',
                            color: 'white',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Mark Attendance
                        </button>
                      )}
                    </>
                  )}
                  {!isScheduledForMe && schedule.status === 'scheduled' && (
                    <button
                      className="student-schedule-btn"
                      style={{
                        flex: 1,
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '4px',
                        cursor: 'not-allowed'
                      }}
                      disabled
                    >
                      Not Scheduled
                    </button>
                  )}
                  {schedule.description && (
                    <button
                      className="student-schedule-btn"
                      title={schedule.description}
                      style={{
                        backgroundColor: '#e5e7eb',
                        color: '#374151',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <AlertCircle size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
          <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>No schedules available</h3>
          <p style={{ color: '#9ca3af' }}>
            Interview schedules from recruiters will appear here
          </p>
        </div>
      )}

      <InterviewFeature />
      <ProjectEvaluator />
    </StudentLayout>
  );
};

export default StudentSchedule;