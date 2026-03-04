import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AIDriveRiskPanel.css";

const AIDriveRiskPanel = () => {
  const [summary, setSummary] = useState(null);
  const [highRiskDrives, setHighRiskDrives] = useState([]);
  const [autoBlockedDrives, setAutoBlockedDrives] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [reEvaluating, setReEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const response = await axios.get("/api/admin/risk/drive-summary");
      setSummary(response.data.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  // Fetch high risk and auto-blocked drives
  const fetchDrives = async () => {
    setLoading(true);
    try {
      const [highRiskRes, autoBlockedRes] = await Promise.all([
        axios.get("/api/admin/risk/high-risk-drives?limit=100"),
        axios.get("/api/admin/risk/auto-blocked-drives?limit=100"),
      ]);

      setHighRiskDrives(highRiskRes.data.data || []);
      setAutoBlockedDrives(autoBlockedRes.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch drives");
      console.error("Error fetching drives:", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-evaluate all drives
  const handleReEvaluate = async () => {
    if (!window.confirm("This will re-evaluate all job drives. Continue?")) {
      return;
    }

    setReEvaluating(true);
    try {
      const response = await axios.post("/api/admin/risk/drives/re-evaluate");
      alert(`Re-evaluation complete:\nProcessed: ${response.data.data.processed}/${response.data.data.total}\nAuto-blocked: ${response.data.data.autoBlocked}`);
      fetchSummary();
      fetchDrives();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to re-evaluate drives");
    } finally {
      setReEvaluating(false);
    }
  };

  // Approve flagged drive
  const handleApproveDrive = async (driveId) => {
    if (!window.confirm("Approve this drive for posting?")) {
      return;
    }

    setActionLoading(driveId);
    try {
      const reason = prompt("Enter reason for approval (optional):");
      await axios.post("/api/admin/risk/drive/approve", {
        driveId,
        reason: reason || "",
      });
      fetchDrives();
      fetchSummary();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to approve drive");
    } finally {
      setActionLoading(null);
    }
  };

  // Reject drive
  const handleRejectDrive = async (driveId) => {
    if (!window.confirm("Reject this drive?")) {
      return;
    }

    setActionLoading(driveId);
    try {
      const reason = prompt("Enter reason for rejection:");
      if (!reason) {
        setActionLoading(null);
        return;
      }

      await axios.post("/api/admin/risk/drive/reject", {
        driveId,
        reason,
      });
      fetchDrives();
      fetchSummary();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reject drive");
    } finally {
      setActionLoading(null);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSummary();
    fetchDrives();
  }, []);

  // Get filtered drives
  const getFilteredDrives = () => {
    if (activeFilter === "all") {
      return highRiskDrives;
    } else if (activeFilter === "blocked") {
      return autoBlockedDrives;
    } else if (activeFilter === "high") {
      return highRiskDrives.filter((d) => d.riskAnalysis?.riskLevel === "high");
    } else if (activeFilter === "medium") {
      return highRiskDrives.filter((d) => d.riskAnalysis?.riskLevel === "medium");
    }
    return [];
  };

  const filteredDrives = getFilteredDrives();
  const isBlocked = activeFilter === "blocked";

  return (
    <div className="aidrp-container">
      {/* Header */}
      <div className="aidrp-header">
        <div className="aidrp-header-icon">🚨</div>
        <div className="aidrp-header-content">
          <h2>AI Drive Risk Alerts</h2>
          <p>Monitor and manage suspicious job posting activities</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "20px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats Grid */}
      {summary && (
        <div className="aidrp-stats-grid">
          <div className="aidrp-stat-card high">
            <div className="aidrp-stat-label">
              <span className="aidrp-stat-icon">🔴</span>
              High Risk Drives
            </div>
            <div className="aidrp-stat-value">{summary.high || 0}</div>
            <div className="aidrp-stat-subtext">Requires review</div>
          </div>

          <div className="aidrp-stat-card medium">
            <div className="aidrp-stat-label">
              <span className="aidrp-stat-icon">🟡</span>
              Medium Risk Drives
            </div>
            <div className="aidrp-stat-value">{summary.medium || 0}</div>
            <div className="aidrp-stat-subtext">Monitor closely</div>
          </div>

          <div className="aidrp-stat-card low">
            <div className="aidrp-stat-label">
              <span className="aidrp-stat-icon">🟢</span>
              Low Risk Drives
            </div>
            <div className="aidrp-stat-value">{summary.low || 0}</div>
            <div className="aidrp-stat-subtext">Normal drives</div>
          </div>

          <div className="aidrp-stat-card blocked">
            <div className="aidrp-stat-label">
              <span className="aidrp-stat-icon">🚫</span>
              Auto-Blocked Drives
            </div>
            <div className="aidrp-stat-value">{summary.autoBlocked || 0}</div>
            <div className="aidrp-stat-subtext">Awaiting decision</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="aidrp-controls">
        <div className="aidrp-filter">
          <button
            className={`aidrp-filter-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            📊 All High Risk
          </button>
          <button
            className={`aidrp-filter-btn ${activeFilter === "high" ? "active" : ""}`}
            onClick={() => setActiveFilter("high")}
          >
            🔴 High Only
          </button>
          <button
            className={`aidrp-filter-btn ${activeFilter === "medium" ? "active" : ""}`}
            onClick={() => setActiveFilter("medium")}
          >
            🟡 Medium Only
          </button>
          <button
            className={`aidrp-filter-btn ${activeFilter === "blocked" ? "active" : ""}`}
            onClick={() => setActiveFilter("blocked")}
          >
            🚫 Auto-Blocked
          </button>
        </div>

        <button className="aidrp-refresh-btn" onClick={handleReEvaluate} disabled={reEvaluating}>
          <span className={`aidrp-refresh-icon ${reEvaluating ? "spinning" : ""}`}>🔄</span>
          {reEvaluating ? "Re-evaluating..." : "Re-evaluate All"}
        </button>
      </div>

      {/* Alerts Section */}
      <div className="aidrp-alerts-section">
        <div className="aidrp-alerts-title">
          {isBlocked ? "🚫 Auto-Blocked Drives" : "⚠️ Drive Risk Alerts"}
        </div>

        {loading ? (
          <div className="aidrp-empty-state">
            <div className="aidrp-empty-icon">⏳</div>
            <div className="aidrp-empty-text">Loading drives...</div>
          </div>
        ) : filteredDrives.length > 0 ? (
          filteredDrives.map((drive) => (
            <div
              key={drive._id}
              className={`aidrp-alert-item ${drive.riskAnalysis?.riskLevel || "medium"}`}
            >
              <div className="aidrp-alert-header">
                <div className="aidrp-alert-title">
                  <div className="aidrp-alert-company">{drive.company}</div>
                  <div className="aidrp-alert-position">{drive.position}</div>
                  {drive.recruiterId?.fullName && (
                    <div className="aidrp-alert-recruiter">
                      By: {drive.recruiterId.fullName} ({drive.recruiterId.companyName})
                    </div>
                  )}
                </div>

                <div className="aidrp-alert-score">
                  <div className="aidrp-score-value">
                    {drive.riskAnalysis?.riskScore || 0}%
                  </div>
                  <div className="aidrp-score-label">Risk Score</div>
                </div>
              </div>

              <div className="aidrp-alert-body">
                <div className="aidrp-reasons-title">🚩 Risk Indicators:</div>
                <ul className="aidrp-reasons-list">
                  {drive.riskAnalysis?.flags?.map((flag, idx) => (
                    <li key={idx} className="aidrp-reason-item">
                      <span className="aidrp-reason-icon">•</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="aidrp-alert-footer">
                {drive.riskAnalysis?.autoBlocked && (
                  <div className="aidrp-status-badge">🚫 Auto-Blocked</div>
                )}

                {!isBlocked ? (
                  <>
                    <button
                      className="aidrp-action-btn approve"
                      onClick={() => handleApproveDrive(drive._id)}
                      disabled={actionLoading === drive._id}
                    >
                      {actionLoading === drive._id ? "⏳ Processing..." : "✅ Approve"}
                    </button>
                    <button
                      className="aidrp-action-btn investigate"
                      onClick={() => window.open(`/admin/placement-drives/${drive._id}`, "_blank")}
                    >
                      🔍 Investigate
                    </button>
                    <button
                      className="aidrp-action-btn reject"
                      onClick={() => handleRejectDrive(drive._id)}
                      disabled={actionLoading === drive._id}
                    >
                      {actionLoading === drive._id ? "⏳ Processing..." : "❌ Reject"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="aidrp-action-btn approve"
                      onClick={() => handleApproveDrive(drive._id)}
                      disabled={actionLoading === drive._id}
                    >
                      {actionLoading === drive._id ? "⏳ Processing..." : "✅ Approve Anyway"}
                    </button>
                    <button
                      className="aidrp-action-btn investigate"
                      onClick={() => window.open(`/admin/placement-drives/${drive._id}`, "_blank")}
                    >
                      🔍 View Details
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="aidrp-empty-state">
            <div className="aidrp-empty-icon">✅</div>
            <div className="aidrp-empty-text">
              {isBlocked ? "No Auto-Blocked Drives" : "No High Risk Drives"}
            </div>
            <div className="aidrp-empty-subtext">
              {isBlocked
                ? "All drives have been reviewed or approved."
                : "All drives appear to be legitimate."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDriveRiskPanel;
