import React, { useState } from 'react';
import { FolderKanban, X, Send, CheckCircle, AlertCircle, TrendingUp, Award, Loader, History, Trash2, Star } from 'lucide-react';
import '../styles/projectevaluator.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ProjectEvaluator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('form'); // form, result, history

  const [formData, setFormData] = useState({
    title: "",
    domain: "",
    description: "",
    techStack: "",
    repoUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---------------------------
  // SUBMIT PROJECT FOR EVALUATION
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/projects/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Evaluation failed");
      }

      setResult(data.data);
      setCurrentView('result');
    } catch (err) {
      setError(err.message || "AI evaluation failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // FETCH HISTORY
  // ---------------------------
  const fetchHistory = async () => {
    setHistoryLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/projects/history`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error("Failed to load history");
      }

      setHistory(data.data);
      setCurrentView('history');
    } catch (err) {
      setError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ---------------------------
  // DELETE HISTORY ITEM
  // ---------------------------
  const deleteHistory = async (id) => {
    if (!window.confirm("Delete this evaluation?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      domain: "",
      description: "",
      techStack: "",
      repoUrl: "",
    });
    setResult(null);
    setError("");
    setCurrentView('form');
  };

  const renderForm = () => (
    <div className="project-eval-form-section">
      <div className="project-eval-header">
        <FolderKanban size={48} className="project-eval-header-icon" />
        <h2>AI Project Evaluator</h2>
        <p>Get recruiter-grade AI feedback on your projects</p>
      </div>

      <form onSubmit={handleSubmit} className="project-eval-form">
        <div className="project-eval-form-group">
          <label>Project Title *</label>
          <input
            type="text"
            name="title"
            placeholder="e.g., E-Commerce Platform"
            value={formData.title}
            onChange={handleChange}
            className="project-eval-input"
            required
          />
        </div>

        <div className="project-eval-form-group">
          <label>Project Domain *</label>
          <input
            type="text"
            name="domain"
            placeholder="e.g., Web Development, AI/ML, Mobile App"
            value={formData.domain}
            onChange={handleChange}
            className="project-eval-input"
            required
          />
        </div>

        <div className="project-eval-form-group">
          <label>Project Description *</label>
          <textarea
            name="description"
            placeholder="Describe your project, its features, and what problems it solves..."
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="project-eval-textarea"
            required
          />
        </div>

        <div className="project-eval-form-group">
          <label>Tech Stack *</label>
          <input
            type="text"
            name="techStack"
            placeholder="e.g., React, Node.js, MongoDB, AWS"
            value={formData.techStack}
            onChange={handleChange}
            className="project-eval-input"
            required
          />
        </div>

        <div className="project-eval-form-group">
          <label>GitHub Repository (Optional)</label>
          <input
            type="url"
            name="repoUrl"
            placeholder="https://github.com/username/project"
            value={formData.repoUrl}
            onChange={handleChange}
            className="project-eval-input"
          />
        </div>

        {error && (
          <div className="project-eval-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="project-eval-button-group">
          <button 
            type="submit" 
            className="project-eval-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={20} className="project-eval-spinner" />
                Evaluating...
              </>
            ) : (
              <>
                <Send size={20} />
                Evaluate Project
              </>
            )}
          </button>

          <button 
            type="button"
            className="project-eval-history-btn"
            onClick={fetchHistory}
            disabled={historyLoading}
          >
            {historyLoading ? (
              <>
                <Loader size={20} className="project-eval-spinner" />
                Loading...
              </>
            ) : (
              <>
                <History size={20} />
                View History
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderResult = () => (
    <div className="project-eval-result-section">
      <div className="project-eval-result-header">
        <div className="project-eval-score-circle">
          <Award size={48} />
          <span className="project-eval-score">{result.score}/100</span>
        </div>
        <h2>Evaluation Complete!</h2>
        <p>Here's your detailed project assessment</p>
      </div>

      <div className="project-eval-feedback-sections">
        <div className="project-eval-feedback-card project-eval-strengths">
          <div className="project-eval-feedback-card-header">
            <CheckCircle size={24} />
            <h3>Strengths</h3>
          </div>
          <ul>
            {result.strengths.map((strength, idx) => (
              <li key={idx}>{strength}</li>
            ))}
          </ul>
        </div>

        <div className="project-eval-feedback-card project-eval-improvements">
          <div className="project-eval-feedback-card-header">
            <AlertCircle size={24} />
            <h3>Areas to Improve</h3>
          </div>
          <ul>
            {result.improvements.map((improvement, idx) => (
              <li key={idx}>{improvement}</li>
            ))}
          </ul>
        </div>

        <div className="project-eval-feedback-card project-eval-readiness">
          <div className="project-eval-feedback-card-header">
            <TrendingUp size={24} />
            <h3>Interview Readiness</h3>
          </div>
          <p className="project-eval-readiness-text">{result.interviewReadiness}</p>
        </div>
      </div>

      <div className="project-eval-button-group">
        <button className="project-eval-new-btn" onClick={resetForm}>
          <FolderKanban size={20} />
          Evaluate Another Project
        </button>
        <button className="project-eval-history-btn" onClick={fetchHistory}>
          <History size={20} />
          View History
        </button>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="project-eval-history-section">
      <div className="project-eval-history-header">
        <History size={48} className="project-eval-header-icon" />
        <h2>Evaluation History</h2>
        <p>Your previously evaluated projects</p>
      </div>

      {history.length === 0 ? (
        <div className="project-eval-empty-state">
          <FolderKanban size={64} className="project-eval-empty-icon" />
          <p>No evaluation history found</p>
          <button className="project-eval-new-btn" onClick={() => setCurrentView('form')}>
            <FolderKanban size={20} />
            Evaluate Your First Project
          </button>
        </div>
      ) : (
        <>
          <div className="project-eval-history-grid">
            {history.map((item) => (
              <div key={item._id} className="project-eval-history-card">
                <div className="project-eval-history-card-header">
                  <div className="project-eval-history-icon">
                    <FolderKanban size={24} />
                  </div>
                  <div className="project-eval-history-score-badge">
                    <Star size={16} />
                    {item.score}/100
                  </div>
                </div>
                <h4>{item.title}</h4>
                <p className="project-eval-history-domain">{item.domain}</p>
                <div className="project-eval-history-actions">
                  <button 
                    className="project-eval-delete-btn"
                    onClick={() => deleteHistory(item._id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="project-eval-new-btn" onClick={() => setCurrentView('form')}>
            <FolderKanban size={20} />
            Evaluate New Project
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Floating Project Evaluator Button */}
      <button 
        className="project-eval-floating-btn"
        onClick={() => setIsOpen(true)}
        title="AI Project Evaluator"
      >
        <FolderKanban size={24} />
      </button>

      {/* Project Evaluator Modal */}
      {isOpen && (
        <div className="project-eval-modal-overlay">
          <div className="project-eval-modal">
            <button 
              className="project-eval-close-btn"
              onClick={() => {
                setIsOpen(false);
                if (currentView === 'result') {
                  resetForm();
                }
              }}
            >
              <X size={24} />
            </button>

            <div className="project-eval-modal-content">
              {currentView === 'form' && renderForm()}
              {currentView === 'result' && renderResult()}
              {currentView === 'history' && renderHistory()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectEvaluator;