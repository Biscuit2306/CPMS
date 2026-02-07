import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Edit2, Mail } from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import '../../styles/RecruiterCSS/recruiterschedule.css';
const Schedule = () => {
  const [activeMenu, setActiveMenu] = useState('schedule');

  const scheduleData = [
    { id: 1, company: 'TechCorp Solutions', type: 'Technical Interview', date: 'Jan 30, 2026', time: '10:00 AM', venue: 'Conference Room A', candidates: 12, status: 'Upcoming' },
    { id: 2, company: 'InnovateTech', type: 'Aptitude Test', date: 'Feb 2, 2026', time: '2:00 PM', venue: 'Lab Room 101', candidates: 45, status: 'Upcoming' },
    { id: 3, company: 'Digital Dynamics', type: 'Pre-Placement Talk', date: 'Jan 27, 2026', time: '11:00 AM', venue: 'Auditorium', candidates: 150, status: 'Upcoming' },
    { id: 4, company: 'CloudWorks', type: 'HR Round', date: 'Jan 28, 2026', time: '9:00 AM', venue: 'Online Platform', candidates: 8, status: 'Completed' },
    { id: 5, company: 'NextGen AI', type: 'Group Discussion', date: 'Feb 5, 2026', time: '3:00 PM', venue: 'Conference Room B', candidates: 20, status: 'Upcoming' },
    { id: 6, company: 'SecureNet', type: 'Technical Test', date: 'Feb 8, 2026', time: '10:30 AM', venue: 'Computer Lab 2', candidates: 35, status: 'Upcoming' }
  ];

  return (
    <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
        <div className="recruiter-dashboard-content">
          <div className="recruiter-page-header">
            <div>
              <h1>Interview Schedule</h1>
              <p>Manage upcoming interviews and placement events</p>
            </div>
            <button className="recruiter-add-schedule-btn">
              <Calendar size={20} />
              Schedule Event
            </button>
          </div>

          <div className="recruiter-schedule-grid">
            {scheduleData.map((schedule) => (
              <div key={schedule.id} className="recruiter-schedule-card">
                <div className="recruiter-schedule-header">
                  <div className="recruiter-schedule-company">
                    <div className="recruiter-company-logo-small">
                      {schedule.company.charAt(0)}
                    </div>
                    <div>
                      <h3>{schedule.company}</h3>
                      <span className="recruiter-schedule-type">{schedule.type}</span>
                    </div>
                  </div>
                  <span className={`recruiter-schedule-status recruiter-schedule-${schedule.status.toLowerCase()}`}>
                    {schedule.status}
                  </span>
                </div>
                <div className="recruiter-schedule-details">
                  <div className="recruiter-schedule-info">
                    <Calendar size={18} />
                    <span>{schedule.date}</span>
                  </div>
                  <div className="recruiter-schedule-info">
                    <Clock size={18} />
                    <span>{schedule.time}</span>
                  </div>
                  <div className="recruiter-schedule-info">
                    <MapPin size={18} />
                    <span>{schedule.venue}</span>
                  </div>
                  <div className="recruiter-schedule-info">
                    <Users size={18} />
                    <span>{schedule.candidates} Candidates</span>
                  </div>
                </div>
                {schedule.status === 'Upcoming' && (
                  <div className="recruiter-schedule-actions">
                    <button className="recruiter-edit-schedule-btn">
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button className="recruiter-notify-btn">
                      <Mail size={16} />
                      Notify
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
    </RecruiterLayout>
  );
};

export default Schedule;