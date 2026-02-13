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
    addCandidatesToSchedule
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

  return (
    <RecruiterLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
      <div className="recruiter-dashboard-content">
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
          <p style={{ textAlign: 'center', padding: '40px' }}>Loading schedules...</p>
        ) : displaySchedules.length > 0 ? (
          <div className="recruiter-schedule-grid">
            {displaySchedules.map((schedule) => (
              <div key={schedule._id} className="recruiter-schedule-card" style={schedule.isBlocked || schedule.isCancelled ? { opacity: 0.6, position: 'relative' } : {}}>
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
                    paddingTop: '15px',
                    zIndex: 10,
                    backdropFilter: 'blur(2px)'
                  }}>
                    <div style={{
                      backgroundColor: '#fff',
                      padding: '12px 10px',
                      borderRadius: '6px',
                      textAlign: 'center',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}>
                      <Lock size={24} style={{ color: '#ef4444', marginBottom: '4px' }} />
                      <p style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '2px', fontSize: '12px' }}>Schedule Blocked</p>
                      <p style={{ fontSize: '10px', color: '#666' }}>By Admin</p>
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
                      <span style={{ display: 'block', fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {schedule.position}
                      </span>
                    </div>
                  </div>
                  <span 
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: schedule.status === 'scheduled' ? '#dbeafe' : 
                                       schedule.status === 'completed' ? '#dcfce7' : 
                                       schedule.status === 'ongoing' ? '#fef08a' : '#fee2e2',
                      color: schedule.status === 'scheduled' ? '#0284c7' : 
                             schedule.status === 'completed' ? '#16a34a' : 
                             schedule.status === 'ongoing' ? '#b45309' : '#dc2626',
                      textTransform: 'capitalize'
                    }}
                  >
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
                  <div style={{
                    marginTop: '15px',
                    paddingTop: '15px',
                    borderTop: '1px solid #e5e7eb',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Scheduled Candidates:</p>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {schedule.candidates.map((candidate, idx) => (
                        <div key={idx} style={{
                          padding: '8px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          <p style={{ margin: '0 0 3px 0', fontWeight: '500' }}>{candidate.studentName}</p>
                          <p style={{ margin: '0', color: '#6b7280' }}>{candidate.studentEmail}</p>
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
                    className="recruiter-notify-btn"
                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
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
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <Calendar size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
            <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>No schedules yet</h3>
            <p style={{ color: '#9ca3af', marginBottom: '20px' }}>
              Create your first interview schedule to get started
            </p>
            <button 
              onClick={handleAddClick}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Create Schedule
            </button>
          </div>
        )}
      </div>

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