import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Edit2, Mail, Trash2, Plus, X, Save, Lock, AlertCircle } from 'lucide-react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { useRecruiter } from '../../context/RecruiterContext';
import '../../styles/RecruiterCSS/recruiterschedule.css';

const Schedule = () => {
  const [activeMenu, setActiveMenu] = useState('schedule');
  const { 
    recruiter,
    drives,
    schedules, 
    schedulesLoading,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    addCandidatesToSchedule,
    searchQuery
  } = useRecruiter();
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [displaySchedules, setDisplaySchedules] = useState([]);
  const [formData, setFormData] = useState({
    jobDriveId: '',
    company: recruiter?.companyName || '',
    position: '',
    interviewType: 'Technical Interview',
    date: '',
    time: '10:00 AM',
    venue: 'Conference Room A',
    platform: 'Offline',
    meetingLink: '',
    rounds: [],
    capacity: 50,
    description: '',
  });

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        if (recruiter?.firebaseUid) {
          await fetchSchedules(recruiter.firebaseUid);
        }
      } catch (err) {
        console.error('Error loading schedules:', err);
      }
    };
    loadSchedules();
  }, [recruiter?.firebaseUid]);

  useEffect(() => {
    // Filter out blocked/cancelled schedules - safety net frontend filter
    const filteredSchedules = (schedules || []).filter(s => !s.isBlocked && s.status !== 'blocked');
    setDisplaySchedules(filteredSchedules);
  }, [schedules]);

  // apply search filtering
  const scheduleQuery = (searchQuery || '').trim().toLowerCase();
  const filteredDisplaySchedules = scheduleQuery
    ? displaySchedules.filter(s =>
        (s.company || '').toLowerCase().includes(scheduleQuery) ||
        (s.position || '').toLowerCase().includes(scheduleQuery)
      )
    : displaySchedules;

  const handleAddClick = () => {
    setFormData({
      jobDriveId: '',
      company: recruiter?.companyName || '',
      position: '',
      interviewType: 'Technical Interview',
      date: '',
      time: '10:00 AM',
      venue: 'Conference Room A',
      platform: 'Offline',
      meetingLink: '',
      rounds: [],
      capacity: 50,
      description: '',
    });
    setEditingSchedule(null);
    setShowModal(true);
  };

  const handleEditClick = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      jobDriveId: schedule.jobDriveId || '',
      company: schedule.company,
      position: schedule.position,
      interviewType: schedule.interviewType,
      date: new Date(schedule.date).toISOString().split('T')[0],
      time: schedule.time,
      venue: schedule.venue,
      platform: schedule.platform,
      meetingLink: schedule.meetingLink,
      rounds: schedule.rounds || [],
      capacity: schedule.capacity,
      description: schedule.description,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.jobDriveId) {
        alert('Please select a job drive');
        return;
      }
      if (!formData.position) {
        alert('Please enter the position');
        return;
      }
      if (!formData.date) {
        alert('Please select a date');
        return;
      }
      if (!formData.time) {
        alert('Please select a time');
        return;
      }
      if (!formData.venue) {
        alert('Please enter the venue');
        return;
      }
      
      if (editingSchedule) {
        await updateSchedule(editingSchedule._id, formData);
        alert('Schedule updated successfully!');
      } else {
        await createSchedule(formData);
        alert('Schedule created successfully!');
      }
      
      setShowModal(false);
      setEditingSchedule(null);
    } catch (err) {
      console.error('Error saving schedule:', err);
      alert('Failed to save schedule: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        setLoading(true);
        await deleteSchedule(scheduleId);
        alert('Schedule deleted successfully!');
      } catch (err) {
        console.error('Error deleting schedule:', err);
        alert('Failed to delete schedule');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusClassName = (status) => {
    if (status === 'scheduled') return 'schedule-status-badge schedule-status-scheduled';
    if (status === 'completed') return 'schedule-status-badge schedule-status-completed';
    if (status === 'ongoing') return 'schedule-status-badge schedule-status-ongoing';
    return 'schedule-status-badge schedule-status-cancelled';
  };

  return (
    <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
      {/* <div className="recruiter-dashboard-content"> */}
        <div className="recruiter-page-header">
          <div>
            <h1>Interview Schedule</h1>
            <p>Manage upcoming interviews and placement events</p>
          </div>
          <button 
            className="recruiter-add-schedule-btn"
            onClick={handleAddClick}
          >
            <Plus size={20} />
            Schedule Event
          </button>
        </div>

        {schedulesLoading || loading ? (
          <p className="schedule-loading-text">Loading schedules...</p>
        ) : filteredDisplaySchedules.length > 0 ? (
          <div className="recruiter-schedule-grid">
            {filteredDisplaySchedules.map((schedule) => (
              <div
                key={schedule._id}
                className={`recruiter-schedule-card${schedule.isBlocked || schedule.isCancelled ? ' schedule-card-blocked' : ''}`}
              >
                {(schedule.isBlocked || schedule.isCancelled) && (
                  <div className="schedule-blocked-overlay">
                    <div className="schedule-blocked-badge">
                      <Lock size={24} className="schedule-blocked-icon" />
                      <p className="schedule-blocked-title">Schedule Blocked</p>
                      <p className="schedule-blocked-subtitle">By Admin</p>
                    </div>
                  </div>
                )}
                <div className="recruiter-schedule-header">
                  <div className="recruiter-schedule-company">
                    <div className="recruiter-company-logo-small">
                      {schedule.company.charAt(0)}
                    </div>
                    <div>
                      <h3>{schedule.company}</h3>
                      <span className="recruiter-schedule-type">{schedule.interviewType}</span>
                      <span className="schedule-position-text">
                        {schedule.position}
                      </span>
                    </div>
                  </div>
                  <span className={getStatusClassName(schedule.status)}>
                    {schedule.status}
                  </span>
                </div>
                <div className="recruiter-schedule-details">
                  <div className="recruiter-schedule-info">
                    <Calendar size={18} />
                    <span>{new Date(schedule.date).toLocaleDateString()}</span>
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
                    <span>{schedule.candidates?.length || 0} Candidates</span>
                  </div>
                </div>
                {schedule.candidates && schedule.candidates.length > 0 && (
                  <div className="schedule-candidates-section">
                    <p className="schedule-candidates-title">Scheduled Candidates:</p>
                    <div className="schedule-candidates-grid">
                      {schedule.candidates.map((candidate, idx) => (
                        <div key={idx} className="schedule-candidate-item">
                          <p className="schedule-candidate-name">{candidate.studentName}</p>
                          <p className="schedule-candidate-email">{candidate.studentEmail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="recruiter-schedule-actions">
                  <button 
                    className="recruiter-edit-schedule-btn"
                    onClick={() => handleEditClick(schedule)}
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button 
                    className="recruiter-notify-btn schedule-delete-btn"
                    onClick={() => handleDelete(schedule._id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="schedule-empty-state">
            <Calendar size={48} className="schedule-empty-icon" />
            <h3 className="schedule-empty-title">
              {scheduleQuery
                ? `No schedules match "${searchQuery}"`
                : 'No schedules yet'}
            </h3>
            {!scheduleQuery && (
              <p className="schedule-empty-subtitle">
                Create your first interview schedule to get started
              </p>
            )}
            {!scheduleQuery && (
              <button 
                onClick={handleAddClick}
                className="schedule-empty-create-btn"
              >
                Create Schedule
              </button>
            )}
          </div>
        )}
      {/* </div> */}

      {showModal && (
        <div className="schedule-modal-overlay" onClick={(e) => e.currentTarget === e.target && setShowModal(false)}>
          <div className="schedule-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="schedule-modal-header">
              <h2>
                {editingSchedule ? 'Edit Interview Schedule' : 'Create Interview Schedule'}
              </h2>
              <button 
                className="schedule-modal-close-btn"
                onClick={() => setShowModal(false)}
                type="button"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="schedule-form">
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label" htmlFor="job-drive">
                    Job Drive <span className="required">*</span>
                  </label>
                  <select
                    id="job-drive"
                    value={formData.jobDriveId}
                    onChange={(e) => setFormData({ ...formData, jobDriveId: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select a job drive</option>
                    {drives.map(drive => (
                      <option key={drive._id} value={drive._id}>
                        {drive.position} - {drive.companyName || recruiter?.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label" htmlFor="position">
                      Position <span className="required">*</span>
                    </label>
                    <input
                      id="position"
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="e.g., Software Engineer"
                      className="form-input"
                      autoComplete="off"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="interview-type">Interview Type</label>
                    <select
                      id="interview-type"
                      value={formData.interviewType}
                      onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
                      className="form-select"
                    >
                      <option>Technical Interview</option>
                      <option>HR Interview</option>
                      <option>Aptitude Test</option>
                      <option>Pre-Placement Talk</option>
                      <option>Group Discussion</option>
                      <option>Final Round</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label" htmlFor="schedule-date">
                      Date <span className="required">*</span>
                    </label>
                    <input
                      id="schedule-date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="schedule-time">Time</label>
                    <input
                      id="schedule-time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label" htmlFor="platform">Platform</label>
                    <select
                      id="platform"
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="form-select"
                    >
                      <option>Online</option>
                      <option>Offline</option>
                      <option>Hybrid</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="capacity">Capacity</label>
                    <input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 50 })}
                      min="1"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="venue">
                    Venue <span className="required">*</span>
                  </label>
                  <input
                    id="venue"
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g., Conference Room A"
                    className="form-input"
                    autoComplete="off"
                  />
                </div>

                {formData.platform === 'Online' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="meeting-link">Meeting Link</label>
                    <input
                      id="meeting-link"
                      type="url"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      className="form-input"
                      autoComplete="off"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add any additional details or instructions..."
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-submit"
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RecruiterLayout>
  );
};

export default Schedule;