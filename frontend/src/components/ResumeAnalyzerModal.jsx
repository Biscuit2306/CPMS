import React, { useState } from "react";
import { X, Upload, FileText, Loader2, Sparkles } from "lucide-react";
import "../styles/resumeanalyzermodal.css";
import { uploadResume, analyzeResume } from "../services/resumeApi";

const ResumeAnalyzerModal = ({ isOpen, onClose, currentResume, student }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [resumeUrl, setResumeUrl] = useState(currentResume || "");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError("");
    setAnalysis(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a PDF resume first.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const res = await uploadResume(selectedFile, student.firebaseUid);


      // backend returns { resumeUrl: "/uploads/resumes/xyz.pdf" }
      setResumeUrl(res.resumeUrl);
      alert("Resume uploaded successfully!");
    } catch (err) {
      setError(err?.response?.data?.error || "Resume upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeUrl) {
      setError("Upload resume first, then analyze.");
      return;
    }

    try {
      setAnalyzing(true);
      setError("");
      setAnalysis(null);

      const res = await analyzeResume(student.firebaseUid);


      // backend returns analysis object
      setAnalysis(res.analysis);
    } catch (err) {
      setError(err?.response?.data?.error || "Resume analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="resume-modal-overlay">
      <div className="resume-modal-box">
        {/* Header */}
        <div className="resume-modal-header">
          <h2>
            <Sparkles size={20} /> AI Resume Feedback
          </h2>

          <button className="resume-modal-close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="resume-modal-body">
          {/* Upload Section */}
          <div className="resume-section">
            <h3>1) Upload Resume (PDF)</h3>

            <div className="resume-upload-row">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />

              <button
                className="resume-btn"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="spin" size={18} /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} /> Upload
                  </>
                )}
              </button>
            </div>

            {resumeUrl && (
              <p className="resume-current">
                <FileText size={16} />
                <a href={resumeUrl} target="_blank" rel="noreferrer">
                  View Current Resume
                </a>
              </p>
            )}
          </div>

          {/* Analyze Section */}
          <div className="resume-section">
            <h3>2) Analyze Resume</h3>

            <button
              className="resume-btn analyze-btn"
              onClick={handleAnalyze}
              disabled={analyzing || !resumeUrl}
            >
              {analyzing ? (
                <>
                  <Loader2 className="spin" size={18} /> Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Analyze Resume
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && <p className="resume-error">{error}</p>}

          {/* Results */}
          {analysis && (
            <div className="resume-results">
              <h3>📊 Results</h3>

              {/* ATS Score */}
              <div className="resume-result-card">
                <h4>ATS Score</h4>
                <p className="resume-score">{analysis.atsScore || "N/A"} / 100</p>
              </div>

              {/* Missing Keywords */}
              <div className="resume-result-card">
                <h4>Missing Keywords</h4>
                {analysis.missingKeywords?.length > 0 ? (
                  <div className="resume-tags">
                    {analysis.missingKeywords.map((kw, idx) => (
                      <span key={idx} className="resume-tag">
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No missing keywords found.</p>
                )}
              </div>

              {/* Weak Sections */}
              <div className="resume-result-card">
                <h4>Weak Sections</h4>
                {analysis.weakSections?.length > 0 ? (
                  <ul>
                    {analysis.weakSections.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No weak sections detected.</p>
                )}
              </div>

              {/* Improvements */}
              <div className="resume-result-card">
                <h4>Suggested Improvements</h4>
                {analysis.improvements?.length > 0 ? (
                  <ul>
                    {analysis.improvements.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No improvements suggested.</p>
                )}
              </div>

              {/* Better Bullet Points */}
              <div className="resume-result-card">
                <h4>Suggested Bullet Points</h4>
                {analysis.suggestedBulletPoints?.length > 0 ? (
                  <ul>
                    {analysis.suggestedBulletPoints.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No bullet points generated.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="resume-modal-footer">
          <button className="resume-btn close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzerModal;