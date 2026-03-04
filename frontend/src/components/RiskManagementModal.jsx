import React, { useState } from "react";
import AISecurityCenter from "./AISecurityCenter";
import AIDriveRiskPanel from "./AIDriveRiskPanel";
import "../styles/RiskManagementModal.css";

const RiskManagementModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState("accounts");

  if (!isOpen) {
    return (
      <button
        className="risk-modal-trigger"
        onClick={() => setIsOpen(true)}
        title="Open AI Risk Management System"
      >
        🔐
      </button>
    );
  }

  return (
    <>
      {/* Modal Overlay */}
      <div className="risk-modal-overlay" onClick={() => setIsOpen(false)} />

      {/* Modal Container */}
      <div className="risk-modal-container">
        {/* Header */}
        <div className="risk-modal-header">
          <div className="risk-modal-title">
            🤖 AI Risk Management System
          </div>
          <button
            className="risk-modal-close"
            onClick={() => setIsOpen(false)}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="risk-modal-tabs">
          <button
            className={`risk-modal-tab ${activePanel === "accounts" ? "active" : ""}`}
            onClick={() => setActivePanel("accounts")}
          >
            <span className="risk-modal-tab-icon">🛡️</span>
            Account Security
          </button>
          <button
            className={`risk-modal-tab ${activePanel === "drives" ? "active" : ""}`}
            onClick={() => setActivePanel("drives")}
          >
            <span className="risk-modal-tab-icon">⚠️</span>
            Drive Monitoring
          </button>
        </div>

        {/* Modal Content */}
        <div className="risk-modal-content">
          {activePanel === "accounts" ? (
            <AISecurityCenter />
          ) : (
            <AIDriveRiskPanel />
          )}
        </div>
      </div>
    </>
  );
};

export default RiskManagementModal;
