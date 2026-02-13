import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Building2, Users, TrendingUp, Briefcase, Bell, FileText, CheckCircle, Calendar } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import InterviewFeature from '../InterviewFeature';
import ProjectEvaluator from '../ProjectEvaluator';
import '../../styles/student-css/studentdashboard.css';
import { useStudent } from '../../context/StudentContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const StudentDashboard = () => {
  const { student, jobDrives, schedules } = useStudent();
  const [stats, setStats] = useState({
    companiesRegistered: 0,
    studentsPlaced: 0,
    placementRate: 0,
    jobOffers: 0
  });
  const [upcomingDrives, setUpcomingDrives] = useState([]);
  const [appliedCompanies, setAppliedCompanies] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);

  // Fetch stats when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/admin/stats`);
        if (res.data.success) {
          setStats({
            companiesRegistered: res.data.data.partnerCompanies || 0,
            studentsPlaced: res.data.data.totalStudents || 0,
            placementRate: res.data.data.placementRate || 0,
            jobOffers: student?.applications?.filter(app => app.applicationStatus === 'selected').length || 0
          });
        }
      } catch (err) {
        console.log('Failed to fetch stats, using default values:', err.message);
        setStats({
          companiesRegistered: 0,
          studentsPlaced: 0,
          placementRate: 0,
          jobOffers: student?.applications?.filter(app => app.applicationStatus === 'selected').length || 0
        });
      }
    };
    fetchStats();
  }, [student]);

  // Process drives data
  useEffect(() => {
    // Filter upcoming drives (active ones with deadline in future)
    const upcoming = jobDrives
      .filter(d => d.status === 'active' && new Date(d.applicationDeadline) > new Date())
      .slice(0, 3)
      .map(d => ({
        company: d.companyName || d.recruiterName,
        date: new Date(d.date).toLocaleDateString(),
        role: d.position,
        package: d.salary || 'N/A'
      }));
    setUpcomingDrives(upcoming);

    // Get applications for this student
    if (student && student.applications) {
      const applied = student.applications.map(app => ({
        company: app.companyName || 'Unknown',
        status: app.applicationStatus === 'selected' ? 'Placed' : 
                app.applicationStatus === 'rejected' ? 'Rejected' : 'Applied',
        date: new Date(app.appliedAt).toLocaleDateString()
      }));
      setAppliedCompanies(applied);
    }

    // Get upcoming schedules for this student
    if (schedules && schedules.length > 0 && student?.firebaseUid) {
      const mySchedules = schedules
        .filter(s => {
          if (!s.candidates) return false;
          const candidateStatus = s.candidates.find(c => c.studentId === student.firebaseUid);
          return candidateStatus && (candidateStatus.status === 'scheduled' || candidateStatus.status === 'attended');
        })
        .filter(s => new Date(s.date) > new Date())
        .slice(0, 3)
        .map(s => ({
          company: s.company,
          type: s.interviewType,
          date: new Date(s.date).toLocaleDateString(),
          time: s.time,
          venue: s.venue
        }));
      setUpcomingSchedules(mySchedules);
    }
  }, [jobDrives, student, schedules]);

  const placementStats = [
    { icon: Building2, label: 'Companies Registered', value: stats.companiesRegistered.toString(), color: '#7c3aed' },
    { icon: Users, label: 'Students Placed', value: stats.studentsPlaced.toString(), color: '#06b6d4' },
    { icon: TrendingUp, label: 'Placement Rate', value: `${stats.placementRate}%`, color: '#10b981' },
    { icon: Briefcase, label: 'Job Offers', value: stats.jobOffers.toString(), color: '#f59e0b' }
  ];

  return (
    <StudentLayout>
      <div className="student-welcome-banner">
        <div className="student-welcome-content">
          <div className="student-welcome-text">
            <h1>Welcome back, {student?.fullName || 'Student'}!</h1>
            <p>Track your placement journey and upcoming opportunities</p>
          </div>
          <div className="student-welcome-illustration">
            <GraduationCap size={80} />
          </div>
        </div>
      </div>

      <div className="student-stats-grid">
        {placementStats.map((stat, index) => (
          <div key={index} className="student-stat-card">
            <div className="student-stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="student-stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="student-content-grid">
        <div className="student-card">
          <div className="student-card-header">
            <h2>Upcoming Placement Drives</h2>
            <Link to="/student/job-drives" className="student-see-all">See all</Link>
          </div>
          <div className="student-drives-list">
            {upcomingDrives.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>No upcoming drives</div>
            ) : (
              upcomingDrives.map((drive, index) => (
                <div key={index} className="student-drive-item">
                  <div className="student-drive-icon">
                    <Building2 size={24} />
                  </div>
                  <div className="student-drive-info">
                    <h3>{drive.company}</h3>
                    <p className="student-drive-role">{drive.role}</p>
                    <div className="student-drive-meta">
                      <span className="student-drive-date">{drive.date}</span>
                      <span className="student-drive-package">{drive.package}</span>
                    </div>
                  </div>
                  <Link to="/student/job-drives" className="student-apply-btn">Apply</Link>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="student-card">
          <div className="student-card-header">
            <h2>Application Status</h2>
            <Link to="/student/applications" className="student-see-all">See all</Link>
          </div>
          <div className="student-applications-list">
            {appliedCompanies.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>No applications yet</div>
            ) : (
              appliedCompanies.map((app, index) => (
                <div key={index} className="student-application-item">
                  <div className="student-app-company">
                    <div className="student-company-logo">
                      {(app.company || 'C').charAt(0)}
                    </div>
                    <div className="student-app-details">
                      <h3>{app.company}</h3>
                      <p className="student-app-date">{app.date}</p>
                    </div>
                  </div>
                  <span className={`student-status-badge student-status-${app.status.toLowerCase().replace(' ', '-')}`}>
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      <div className="student-card">
        <div className="student-card-header">
          <h2>Upcoming Interview Schedules</h2>
          <Link to="/student/schedule" className="student-see-all">See all</Link>
        </div>
        <div className="student-schedules-list">
          {upcomingSchedules.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
              <Calendar size={20} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p>No upcoming schedules</p>
            </div>
          ) : (
            upcomingSchedules.map((schedule, index) => (
              <div key={index} className="student-schedule-row" style={{
                padding: '12px',
                borderBottom: index < upcomingSchedules.length - 1 ? '1px solid #e5e7eb' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Calendar size={20} style={{ color: '#0ea5e9', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>
                    {schedule.company} - {schedule.type}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    {schedule.date} at {schedule.time} • {schedule.venue}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>      </div>

      <div className="student-card">
        <div className="student-card-header">
          <h2>Recent Notices</h2>
          <a href="#" className="student-see-all">See all</a>
        </div>
        <div className="student-notices-list">
          <div className="student-notice-item">
            <div className="student-notice-icon">
              <Bell size={20} />
            </div>
            <div className="student-notice-content">
              <h3>Pre-Placement Talk - Amazon</h3>
              <p>Join the pre-placement talk scheduled for January 27, 2026 at 10:00 AM in the auditorium.</p>
              <span className="student-notice-time">2 hours ago</span>
            </div>
          </div>
          <div className="student-notice-item">
            <div className="student-notice-icon">
              <FileText size={20} />
            </div>
            <div className="student-notice-content">
              <h3>Update Your Resume</h3>
              <p>Please update your resume in the student portal before January 26, 2026.</p>
              <span className="student-notice-time">1 day ago</span>
            </div>
          </div>
        </div>
      </div>

      <InterviewFeature />
      <ProjectEvaluator />
    </StudentLayout>
  );
};

export default StudentDashboard;