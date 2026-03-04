import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Activity, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/admin-css/adminsystemlogs.css';
import axios from 'axios';

const AdminSystemLogs = () => {
  const { admin } = useAdmin();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, success, info, warning
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Auto-refresh logs every 5 seconds
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Fetch activity logs from admin endpoint
      const response = await axios.get(`${API_BASE}/api/admin/logs/activity?limit=100`);
      if (response.data.success && response.data.notifications) {
        const formattedLogs = response.data.notifications.map((notif) => ({
          id: notif._id,
          action: notif.title,
          user: notif.metadata?.adminName || notif.metadata?.recruiterName || notif.metadata?.studentName || 'System',
          details: notif.message,
          timestamp: new Date(notif.createdAt).toLocaleString(),
          type: getLogType(notif.type, notif.actionType),
          priority: notif.priority,
        }));
        setLogs(formattedLogs);
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLogType = (type, actionType) => {
    if (actionType === 'delete' || type === 'error') return 'warning';
    if (actionType === 'block' || actionType === 'unblock') return 'info';
    if (type === 'admin_action') return 'info';
    return 'success';
  };

  // Filter logs based on type and search
  useEffect(() => {
    let filtered = logs;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, filterType, searchTerm]);

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system_logs_${new Date().toISOString()}.json`;
    link.click();
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} />;
      case 'info':
        return <Activity size={24} />;
      case 'warning':
        return <AlertCircle size={24} />;
      default:
        return <Activity size={24} />;
    }
  };

  return (
    <AdminLayout>
      {/* Banner with Title */}
      <div className="admin-banner">
        <div className="admin-banner-content">
          <div className="admin-banner-text">
            <h1>System Activity Logs</h1>
            <p>Real-time system activities and events ({filteredLogs.length} logs)</p>
          </div>
          <div className="admin-banner-icon">
            <Activity size={80} />
          </div>
        </div>
      </div>

      {/* Header - removed, content moved to banner */}
      <div className="admin-page-header" style={{display: 'none'}}>
        <div>
          <h1>System Activity Logs</h1>
          <p>Real-time system activities and events ({filteredLogs.length} logs)</p>
        </div>
        <div className="admin-header-actions">
          <button 
            className="admin-refresh-btn"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button className="admin-export-btn" onClick={exportLogs}>
            <Download size={18} />
            Export Logs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-logs-filters">
        <div className="admin-filter-group">
          <Filter size={18} />
          <button 
            className={`filter-btn filter-btn-all ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn filter-btn-success ${filterType === 'success' ? 'active' : ''}`}
            onClick={() => setFilterType('success')}
          >
            Success
          </button>
          <button 
            className={`filter-btn filter-btn-info ${filterType === 'info' ? 'active' : ''}`}
            onClick={() => setFilterType('info')}
          >
            Info
          </button>
          <button 
            className={`filter-btn filter-btn-warning ${filterType === 'warning' ? 'active' : ''}`}
            onClick={() => setFilterType('warning')}
          >
            Warning
          </button>
          <button 
            className="admin-refresh-btn"
            onClick={fetchLogs}
            disabled={loading}
            style={{ marginLeft: 'auto' }}
          >
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search-logs"
        />
      </div>

      {/* Logs Display */}
      <div className="admin-logs-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <RefreshCw size={40} style={{ margin: '0 auto 10px', animation: 'spin 1s linear infinite' }} />
            <p>Loading activity logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <Activity size={40} style={{ opacity: 0.5, margin: '0 auto 10px' }} />
            <p>No activity logs found</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className={`admin-log-card admin-log-${log.type}`}>
              <div className={`admin-log-icon admin-log-icon-${log.type}`}>
                {getLogIcon(log.type)}
              </div>
              <div className="admin-log-content">
                <div className="admin-log-header">
                  <h3>{log.action}</h3>
                  <span className="admin-log-time">{log.timestamp}</span>
                </div>
                <p className="admin-log-details">{log.details}</p>
                <span className="admin-log-user">By: {log.user}</span>
              </div>
              <div className="admin-log-actions">
                {log.type === 'success' && (
                  <button className="admin-log-btn admin-log-btn-success">✓ View</button>
                )}
                {log.type === 'info' && (
                  <button className="admin-log-btn admin-log-btn-info">ℹ Info</button>
                )}
                {log.type === 'warning' && (
                  <button className="admin-log-btn admin-log-btn-warning">⚠ Alert</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminSystemLogs;