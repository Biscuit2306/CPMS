import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AISecurityCenter.css";

const AISecurityCenter = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const [summary, setSummary] = useState(null);
  const [highRiskAccounts, setHighRiskAccounts] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reEvaluating, setReEvaluating] = useState(false);

  // Fetch summary data
  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/risk/account-summary");
      setSummary(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch summary");
      console.error("Error fetching summary:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch high risk accounts
  const fetchHighRiskAccounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/risk/high-risk-accounts?limit=100");
      setHighRiskAccounts(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch high risk accounts");
      console.error("Error fetching high risk accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch account detail
  const fetchAccountDetail = async (type, id) => {
    setDetailLoading(true);
    try {
      const endpoint = type === "student" ? `/api/admin/risk/student/${id}` : `/api/admin/risk/recruiter/${id}`;
      const response = await axios.get(endpoint);
      setSelectedAccount({
        type,
        ...response.data.data,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch account details");
      console.error("Error fetching account details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Re-evaluate all accounts
  const handleReEvaluate = async () => {
    if (!window.confirm("This will re-evaluate all student and recruiter accounts. Continue?")) {
      return;
    }

    setReEvaluating(true);
    try {
      const response = await axios.post("/api/admin/risk/re-evaluate");
      setError(null);
      alert(`Re-evaluation complete:\nStudents: ${response.data.data.students.processed}/${response.data.data.students.total}\nRecruiters: ${response.data.data.recruiters.processed}/${response.data.data.recruiters.total}`);
      fetchSummary();
      fetchHighRiskAccounts();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to re-evaluate accounts");
    } finally {
      setReEvaluating(false);
    }
  };

  // Mark account as safe
  const handleMarkSafe = async (accountId, type) => {
    if (!window.confirm(`Mark this ${type} account as safe?`)) {
      return;
    }

    try {
      await axios.post("/api/admin/risk/mark-safe", {
        accountId,
        type,
      });
      setError(null);
      setSelectedAccount(null);
      fetchHighRiskAccounts();
      fetchSummary();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to mark account as safe");
    }
  };

  // Initial load
  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="aisc-container">
      {/* Header */}
      <div className="aisc-header">
        <div className="aisc-header-icon">🛡️</div>
        <div className="aisc-header-content">
          <h2>AI Security Center</h2>
          <p>Monitor & manage suspicious accounts in real-time</p>
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
        <div className="aisc-stats-grid">
          <div className="aisc-stat-card high-risk">
            <div className="aisc-stat-label">
              <span className="aisc-stat-icon">🔴</span>
              High Risk Students
            </div>
            <div className="aisc-stat-value">{summary.students.high}</div>
            <div className="aisc-stat-subtext">Requires immediate attention</div>
          </div>

          <div className="aisc-stat-card medium-risk">
            <div className="aisc-stat-label">
              <span className="aisc-stat-icon">🟡</span>
              Medium Risk Students
            </div>
            <div className="aisc-stat-value">{summary.students.medium}</div>
            <div className="aisc-stat-subtext">Monitor closely</div>
          </div>

          <div className="aisc-stat-card low-risk">
            <div className="aisc-stat-label">
              <span className="aisc-stat-icon">🟢</span>
              Low Risk Students
            </div>
            <div className="aisc-stat-value">{summary.students.low}</div>
            <div className="aisc-stat-subtext">Normal accounts</div>
          </div>

          <div className="aisc-stat-card high-risk">
            <div className="aisc-stat-label">
              <span className="aisc-stat-icon">🔴</span>
              High Risk Recruiters
            </div>
            <div className="aisc-stat-value">{summary.recruiters.high}</div>
            <div className="aisc-stat-subtext">Requires immediate attention</div>
          </div>

          <div className="aisc-stat-card medium-risk">
            <div className="aisc-stat-label">
              <span className="aisc-stat-icon">🟡</span>
              Medium Risk Recruiters
            </div>
            <div className="aisc-stat-value">{summary.recruiters.medium}</div>
            <div className="aisc-stat-subtext">Monitor closely</div>
          </div>

          <div className="aisc-stat-card low-risk">
            <div className="aisc-stat-label">
              <span className="aisc-stat-icon">🟢</span>
              Low Risk Recruiters
            </div>
            <div className="aisc-stat-value">{summary.recruiters.low}</div>
            <div className="aisc-stat-subtext">Normal accounts</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="aisc-tabs">
        <button
          className={`aisc-tab ${activeTab === "summary" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("summary");
            fetchSummary();
          }}
        >
          📊 Summary
        </button>
        <button
          className={`aisc-tab ${activeTab === "highRisk" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("highRisk");
            fetchHighRiskAccounts();
          }}
        >
          ⚠️ High Risk Accounts
        </button>
        <button className={`aisc-tab ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>
          📈 Analytics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "summary" && (
        <div style={{ marginBottom: "20px" }}>
          <button className="aisc-btn aisc-btn-primary" onClick={handleReEvaluate} disabled={reEvaluating}>
            {reEvaluating ? "⏳ Re-evaluating..." : "🔄 Re-evaluate All Accounts"}
          </button>
        </div>
      )}

      {activeTab === "highRisk" && (
        <div className="aisc-list-container">
          {!loading && highRiskAccounts && highRiskAccounts.students && highRiskAccounts.students.length > 0 && (
            <>
              <div style={{ padding: "15px 20px", borderBottom: "1px solid #e5e7eb", fontWeight: "700", color: "#1f2937" }}>
                📚 High Risk Students
              </div>
              {highRiskAccounts.students.map((account) => (
                <div key={account._id} className="aisc-account-item">
                  <div className="aisc-account-info">
                    <div className="aisc-account-name">{account.fullName}</div>
                    <div className="aisc-account-email">{account.email}</div>
                    <div className="aisc-account-meta">
                      <span>📱 {account.phone}</span>
                      <span>🎓 {account.rollNo}</span>
                      <span>🏢 {account.branch}</span>
                    </div>
                  </div>

                  <div className="aisc-flags-list">
                    {account.riskAnalysis?.flags?.map((flag, idx) => (
                      <div key={idx} className="aisc-flag-item">
                        <span className="aisc-flag-icon">⚠️</span>
                        {flag}
                      </div>
                    ))}
                  </div>

                  <div className="aisc-account-risk">
                    <div className="aisc-risk-score-box">
                      <div className={`aisc-risk-level ${account.riskAnalysis?.riskLevel}`}>{account.riskAnalysis?.riskLevel}</div>
                      <div className="aisc-risk-score-number">{account.riskAnalysis?.riskScore}%</div>
                    </div>
                    <div className="aisc-actions">
                      <button className="aisc-btn aisc-btn-secondary" onClick={() => fetchAccountDetail("student", account._id)}>
                        👁️ Review
                      </button>
                      <button
                        className="aisc-btn aisc-btn-success"
                        onClick={() => handleMarkSafe(account._id, "student")}
                      >
                        ✅ Mark Safe
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading && highRiskAccounts && highRiskAccounts.recruiters && highRiskAccounts.recruiters.length > 0 && (
            <>
              <div style={{ padding: "15px 20px", borderBottom: "1px solid #e5e7eb", fontWeight: "700", color: "#1f2937", marginTop: "20px" }}>
                🏢 High Risk Recruiters
              </div>
              {highRiskAccounts.recruiters.map((account) => (
                <div key={account._id} className="aisc-account-item">
                  <div className="aisc-account-info">
                    <div className="aisc-account-name">{account.fullName}</div>
                    <div className="aisc-account-email">{account.email}</div>
                    <div className="aisc-account-meta">
                      <span>📱 {account.phone}</span>
                      <span>🏢 {account.companyName}</span>
                    </div>
                  </div>

                  <div className="aisc-flags-list">
                    {account.riskAnalysis?.flags?.map((flag, idx) => (
                      <div key={idx} className="aisc-flag-item">
                        <span className="aisc-flag-icon">⚠️</span>
                        {flag}
                      </div>
                    ))}
                  </div>

                  <div className="aisc-account-risk">
                    <div className="aisc-risk-score-box">
                      <div className={`aisc-risk-level ${account.riskAnalysis?.riskLevel}`}>{account.riskAnalysis?.riskLevel}</div>
                      <div className="aisc-risk-score-number">{account.riskAnalysis?.riskScore}%</div>
                    </div>
                    <div className="aisc-actions">
                      <button className="aisc-btn aisc-btn-secondary" onClick={() => fetchAccountDetail("recruiter", account._id)}>
                        👁️ Review
                      </button>
                      <button
                        className="aisc-btn aisc-btn-success"
                        onClick={() => handleMarkSafe(account._id, "recruiter")}
                      >
                        ✅ Mark Safe
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading && ((!highRiskAccounts || highRiskAccounts.students?.length === 0) && (!highRiskAccounts || highRiskAccounts.recruiters?.length === 0)) && (
            <div className="aisc-empty-state">
              <div className="aisc-empty-icon">✅</div>
              <div className="aisc-empty-text">No High Risk Accounts</div>
              <div className="aisc-empty-subtext">All accounts appear to be legitimate at this time.</div>
            </div>
          )}

          {loading && (
            <div className="aisc-empty-state">
              <div className="aisc-empty-icon">⏳</div>
              <div className="aisc-empty-text">Loading...</div>
            </div>
          )}
        </div>
      )}

      {/* Account Detail Modal */}
      {selectedAccount && (
        <div className="aisc-modal-overlay" onClick={() => setSelectedAccount(null)}>
          <div className="aisc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aisc-modal-header">
              <div className="aisc-modal-title">Account Risk Details</div>
              <button className="aisc-modal-close" onClick={() => setSelectedAccount(null)}>
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div className="aisc-modal-body" style={{ textAlign: "center", padding: "40px" }}>
                ⏳ Loading details...
              </div>
            ) : (
              <>
                <div className="aisc-modal-body">
                  <div style={{ marginBottom: "20px" }}>
                    <strong style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#6b7280" }}>Name</strong>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
                      {selectedAccount.student?.fullName || selectedAccount.recruiter?.fullName}
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <strong style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#6b7280" }}>Risk Score</strong>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#1f2937" }}>
                      {selectedAccount.riskAnalysis?.riskScore}%
                    </div>
                    <div className={`aisc-risk-level ${selectedAccount.riskAnalysis?.riskLevel}`}>
                      {selectedAccount.riskAnalysis?.riskLevel}
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <strong style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#6b7280" }}>Risk Flags</strong>
                    <div>
                      {selectedAccount.riskAnalysis?.flags?.map((flag, idx) => (
                        <div key={idx} className="aisc-flag-item">
                          <span className="aisc-flag-icon">🚩</span>
                          {flag}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <strong style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#6b7280" }}>Last Evaluated</strong>
                    <div style={{ fontSize: "14px", color: "#1f2937" }}>
                      {new Date(selectedAccount.riskAnalysis?.lastEvaluated).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="aisc-modal-footer">
                  <button className="aisc-btn aisc-btn-success" onClick={() => handleMarkSafe(selectedAccount.student?._id || selectedAccount.recruiter?._id, selectedAccount.type)}>
                    ✅ Mark Safe
                  </button>
                  <button className="aisc-btn aisc-btn-secondary" onClick={() => setSelectedAccount(null)}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AISecurityCenter;
