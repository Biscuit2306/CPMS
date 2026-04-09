import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Building2, Users, TrendingUp, Briefcase, Bell, FileText, CheckCircle, Calendar } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import InterviewFeature from '../InterviewFeature';
import ProjectEvaluator from '../ProjectEvaluator';
import '../../styles/student-css/studentdashboard.css';
import { useStudent } from '../../context/StudentContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cpms-xtz8.onrender.com";

const StudentDashboard = () => {
  const { student, jobDrives, schedules, getDriveDetails, syncStudentSchedules, searchQuery } = useStudent();
  const [stats, setStats] = useState({
    companiesRegistered: 0,
    studentsPlaced: 0,
    placementRate: 0,
    jobOffers: 0
  });
  const [upcomingDrives, setUpcomingDrives] = useState([]);
  const [appliedCompanies, setAppliedCompanies] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // derived filtered arrays based on search
  const query = searchQuery.toLowerCase();
  const filteredUpcomingDrives = upcomingDrives.filter(d =>
    query === '' ||
    (d.company || '').toLowerCase().includes(query) ||
    (d.role || '').toLowerCase().includes(query) ||
    (d.package || '').toLowerCase().includes(query)
  );
  const filteredAppliedCompanies = appliedCompanies.filter(a =>
    query === '' ||
    (a.company || '').toLowerCase().includes(query) ||
    (a.status || '').toLowerCase().includes(query)
  );
  const filteredUpcomingSchedules = upcomingSchedules.filter(s =>
    query === '' ||
    (s.company || '').toLowerCase().includes(query) ||
    (s.position || '').toLowerCase().includes(query)
  );

  // Fetch stats when component mounts and when student data changes
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await axios.get(`${API_BASE}/api/admin/stats`);
        
        if (res.data.success) {
          // Calculate job offers from actual student applications
          const jobOffers = student?.applications?.filter(
            app => app.applicationStatus === 'selected' || app.applicationStatus === 'placed'
          ).length || 0;

          setStats({
            companiesRegistered: res.data.data.partnerCompanies || 0,
            studentsPlaced: res.data.data.totalStudents || 0,
            placementRate: res.data.data.placementRate || 0,
            jobOffers: jobOffers
          });
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err.message);
        
        // Fallback: Calculate from student data
        const jobOffers = student?.applications?.filter(
          app => app.applicationStatus === 'selected' || app.applicationStatus === 'placed'
        ).length || 0;

        setStats({
          companiesRegistered: 0,
          studentsPlaced: 0,
          placementRate: 0,
          jobOffers: jobOffers
        });
      } finally {
        setStatsLoading(false);
      }
    };

    if (student) {
      fetchStats();
    }
  }, [student]);

  // Process drives data with enrichment - Real-time updates
  useEffect(() => {
    const processDrives = async () => {
      if (!jobDrives || jobDrives.length === 0) {
        setUpcomingDrives([]);
        return;
      }

      // Filter upcoming drives (active ones with deadline in future)
      const filtered = jobDrives
        .filter(d => d.status === 'active' && new Date(d.applicationDeadline) > new Date())
        .slice(0, 3);

      if (filtered.length === 0) {
        setUpcomingDrives([]);
        return;
      }

      // Enrich drives with complete details
      const enriched = await Promise.all(
        filtered.map(async (d) => {
          try {
            // Check if drive already has all required fields
            if (d.company && d.salary && d.date) {
              return d; // Already has complete data
            }

            // Fetch complete drive details if missing
            if (d.recruiterId && d._id) {
              const driveDetails = await getDriveDetails(d.recruiterId, d._id);
              return {
                ...d,
                ...driveDetails,
                _id: d._id,
                recruiterId: d.recruiterId,
              };
            }
            return d;
          } catch (err) {
            console.log(`⚠️ Could not enrich drive:`, err.message);
            return d;
          }
        })
      );

      const upcoming = enriched.map(d => ({
        company: d.company || d.companyName || 'Company',
        date: d.date ? new Date(d.date).toLocaleDateString() : 'N/A',
        role: d.position || 'Position',
        package: d.salary || 'N/A'
      }));
      setUpcomingDrives(upcoming);
    };

    processDrives();
  }, [jobDrives, getDriveDetails]);

  // Process applications and schedules - Update when data changes
  useEffect(() => {
    // Get applications for this student with enrichment
    const enrichApps = async () => {
      if (student && student.applications && student.applications.length > 0) {
        const enriched = await Promise.all(
          student.applications.map(async (app) => {
            try {
              // Check if application already has company name
              if (app.company || app.companyName) {
                return app;
              }

              // Try to fetch drive details if company info is missing
              if (app.recruiterId && app.driveId) {
                const driveDetails = await getDriveDetails(app.recruiterId, app.driveId);
                return {
                  ...app,
                  ...driveDetails,
                };
              }
              return app;
            } catch (err) {
              console.log(`⚠️ Could not enrich application:`, err.message);
              return app;
            }
          })
        );

        const applied = enriched.map(app => ({
          company: app.company || app.companyName || 'Unknown',
          status: app.applicationStatus === 'selected' || app.applicationStatus === 'placed' ? 'Placed' : 
                  app.applicationStatus === 'rejected' ? 'Rejected' : 'Applied',
          date: app.applicationDate ? new Date(app.applicationDate).toLocaleDateString() : 
                app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'
        }));
        setAppliedCompanies(applied);
      } else {
        setAppliedCompanies([]);
      }
    };

    enrichApps();
  }, [student?.applications, getDriveDetails]);

  // Process and display upcoming schedules - Real-time updates
  useEffect(() => {
    if (schedules && schedules.length > 0) {
      // Show all schedules (up to 3)
      const allSchedules = schedules
        .map(s => ({
          company: s.company || 'Company',
          position: s.position || 'Position',
          type: s.interviewType || 'Interview',
          date: s.date ? new Date(s.date).toLocaleDateString() : 'N/A',
          time: s.time || 'N/A',
          venue: s.venue || 'TBD'
        }))
        .slice(0, 3);
      setUpcomingSchedules(allSchedules);
    } else {
      setUpcomingSchedules([]);
    }
  }, [schedules]);

  const placementStats = [
    { icon: Building2, label: 'Companies Registered', value: stats.companiesRegistered.toString(), color: '#7c3aed' },
    { icon: Users, label: 'Students Placed', value: stats.studentsPlaced.toString(), color: '#06b6d4' },
    { icon: TrendingUp, label: 'Placement Rate', value: `${stats.placementRate}%`, color: '#10b981' },
    { icon: Briefcase, label: 'Job Offers', value: stats.jobOffers.toString(), color: '#f59e0b' }
  ];

  // Refresh all data
  const handleRefreshData = async () => {
    try {
      // Manually sync schedules
      await syncStudentSchedules();
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

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
              <h3>{statsLoading ? '...' : stat.value}</h3>
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
            {filteredUpcomingDrives.length === 0 ? (
              <div className="empty-message">No upcoming drives</div>
            ) : (
              filteredUpcomingDrives.map((drive, index) => (
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
            {filteredAppliedCompanies.length === 0 ? (
              <div className="empty-message">No applications yet</div>
            ) : (
              filteredAppliedCompanies.map((app, index) => (
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
        <div className="student-schedules-list" style={{ padding: '0', margin: '0', background: '#f9fafb', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {filteredUpcomingSchedules.length === 0 ? (
            <div className="empty-message">
              <Calendar size={20} className="dashboard-schedule-icon" />
              <p>No upcoming schedules</p>
            </div>
          ) : (
            filteredUpcomingSchedules.map((schedule, index) => (
              <div key={index} className="student-application-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#f9fafb', borderRadius: '12px', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="student-company-logo" style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem', fontWeight: '700' }}>
                    <Calendar size={24} />
                  </div>
                  <div className="student-app-details">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem' }}>{schedule.company}</h3>
                    <p className="student-app-date" style={{ fontSize: '0.85rem', color: '#6b7280' }}>{schedule.date} at {schedule.time} • {schedule.venue}</p>
                  </div>
                </div>
                <span className="student-status-badge student-status-interview-scheduled" style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', background: '#dbeafe', color: '#1e40af', whiteSpace: 'nowrap' }}>{schedule.type}</span>
              </div>
            ))
          )}
        </div>
      </div>
      </div>

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