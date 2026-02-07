import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import InterviewFeature from '../InterviewFeature';
import ProjectEvaluator from '../ProjectEvaluator';
import '../../styles/student-css/studentdashboard.css';
import '../../styles/student-css/studentschedule.css';


const StudentSchedule = () => {
  const scheduleData = [
    { id: 1, company: 'Google', type: 'Interview', date: 'Jan 30, 2026', time: '10:00 AM', venue: 'Online - Google Meet', status: 'Upcoming' },
    { id: 2, company: 'Amazon', type: 'Technical Test', date: 'Feb 2, 2026', time: '2:00 PM', venue: 'Lab Room 101', status: 'Upcoming' },
    { id: 3, company: 'TCS', type: 'Pre-Placement Talk', date: 'Jan 27, 2026', time: '11:00 AM', venue: 'Auditorium', status: 'Upcoming' },
    { id: 4, company: 'Microsoft', type: 'Aptitude Test', date: 'Jan 28, 2026', time: '9:00 AM', venue: 'Online Platform', status: 'Completed' },
    { id: 5, company: 'Infosys', type: 'HR Interview', date: 'Feb 5, 2026', time: '3:00 PM', venue: 'Conference Room A', status: 'Upcoming' }
  ];

  return (
    <StudentLayout>
      <div className="student-page-header">
        <div>
          <h1>Schedule</h1>
          <p>Your upcoming interviews, tests, and placement events</p>
        </div>
      </div>

      <div className="student-schedule-grid">
        {scheduleData.map((schedule) => (
          <div key={schedule.id} className="student-schedule-card">
            <div className="student-schedule-header">
              <div className="student-schedule-company">
                <div className="student-company-logo-small">
                  {schedule.company.charAt(0)}
                </div>
                <div>
                  <h3>{schedule.company}</h3>
                  <span className="student-schedule-type">{schedule.type}</span>
                </div>
              </div>
              <span className={`student-schedule-status student-schedule-${schedule.status.toLowerCase()}`}>
                {schedule.status}
              </span>
            </div>
            <div className="student-schedule-details">
              <div className="student-schedule-info">
                <Calendar size={18} />
                <span>{schedule.date}</span>
              </div>
              <div className="student-schedule-info">
                <Clock size={18} />
                <span>{schedule.time}</span>
              </div>
              <div className="student-schedule-info">
                <MapPin size={18} />
                <span>{schedule.venue}</span>
              </div>
            </div>
            {schedule.status === 'Upcoming' && (
              <button className="student-schedule-btn">Join / View Details</button>
            )}
          </div>
        ))}
      </div>

      <InterviewFeature />
      <ProjectEvaluator />
    </StudentLayout>
  );
};

export default StudentSchedule;