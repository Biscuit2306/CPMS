import React from 'react';
import { Download, CheckCircle, Activity, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin-css/adminsystemlogs.css';

const SystemLogs = () => {
  const systemLogs = [
    { id: 1, action: 'New company registered', user: 'Admin', details: 'NextGen AI added to system', timestamp: 'Jan 24, 2026 10:30 AM', type: 'success' },
    { id: 2, action: 'Drive created', user: 'Dr. Anjali Mehta', details: 'TechCorp Software Engineer drive', timestamp: 'Jan 24, 2026 09:15 AM', type: 'info' },
    { id: 3, action: 'Student account activated', user: 'System', details: 'Batch of 150 students activated', timestamp: 'Jan 23, 2026 04:45 PM', type: 'success' },
    { id: 4, action: 'Failed login attempt', user: 'Unknown', details: 'Multiple failed attempts detected', timestamp: 'Jan 23, 2026 02:20 PM', type: 'warning' },
    { id: 5, action: 'Placement confirmed', user: 'Prof. Rajesh Kumar', details: '12 students placed at TechCorp', timestamp: 'Jan 22, 2026 11:00 AM', type: 'success' },
    { id: 6, action: 'Recruiter account created', user: 'Admin', details: 'New recruiter Ms. Deepa Rao added', timestamp: 'Jan 21, 2026 03:00 PM', type: 'info' }
  ];

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>System Activity Logs</h1>
          <p>Monitor all system activities and events</p>
        </div>
        <button className="admin-export-btn">
          <Download size={18} />
          Export Logs
        </button>
      </div>

      <div className="admin-logs-container">
        {systemLogs.map((log) => (
          <div key={log.id} className={`admin-log-card admin-log-${log.type}`}>
            <div className={`admin-log-icon admin-log-icon-${log.type}`}>
              {log.type === 'success' && <CheckCircle size={24} />}
              {log.type === 'info' && <Activity size={24} />}
              {log.type === 'warning' && <AlertCircle size={24} />}
            </div>
            <div className="admin-log-content">
              <div className="admin-log-header">
                <h3>{log.action}</h3>
                <span className="admin-log-time">{log.timestamp}</span>
              </div>
              <p className="admin-log-details">{log.details}</p>
              <span className="admin-log-user">By: {log.user}</span>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default SystemLogs;