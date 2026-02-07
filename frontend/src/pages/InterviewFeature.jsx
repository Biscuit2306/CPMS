import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle, AlertCircle, TrendingUp, Award, Loader } from 'lucide-react';
import '../styles/interviewfeature.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const InterviewFeature = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState('setup'); // setup, interview, feedback
  const [interviewData, setInterviewData] = useState({
    role: '',
    level: '',
    techStack: []
  });
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'DevOps Engineer',
    'Mobile Developer'
  ];

  const levels = [
    'Fresher',
    'Intermediate',
    'Advanced'
  ];

  const techStackOptions = [
    'React',
    'Node.js',
    'JavaScript',
    'Python',
    'Java',
    'MongoDB',
    'SQL',
    'AWS',
    'Docker',
    'Git'
  ];

  const handleTechStackToggle = (tech) => {
    setInterviewData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const startInterview = async () => {
  if (!interviewData.role || !interviewData.level || interviewData.techStack.length === 0) {
    alert('Please fill all fields');
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(`${API_BASE}/api/ai/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(interviewData)
    });

    const data = await response.json();

    setCurrentQuestion(data.question);
    setCurrentStep("interview");
    setQuestionNumber(1);
  } catch (err) {
    console.error("Start interview error:", err);
    alert("Failed to start interview");
  } finally {
    setIsLoading(false);
  }
};


  const submitAnswer = async () => {
  if (!currentAnswer.trim()) {
    alert("Please provide an answer");
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(`${API_BASE}/api/ai/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        answer: currentAnswer,
        questionNumber
      })
    });

    const data = await response.json();

    if (data.nextQuestion) {
      setCurrentQuestion(data.nextQuestion);
      setQuestionNumber(prev => prev + 1);
      setCurrentAnswer("");
    } else {
      // 🔥 FINAL EVALUATION
      const evalResponse = await fetch(`${API_BASE}/api/ai/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const feedback = await evalResponse.json();
      setFeedback(feedback);
      setCurrentStep("feedback");
    }
  } catch (err) {
    console.error("Submit answer error:", err);
    alert("Failed to submit answer");
  } finally {
    setIsLoading(false);
  }
};



  const resetInterview = () => {
    setCurrentStep('setup');
    setInterviewData({ role: '', level: '', techStack: [] });
    setCurrentQuestion('');
    setCurrentAnswer('');
    setQuestionNumber(1);
    setFeedback(null);
  };

  const renderSetup = () => (
    <div className="interview-setup">
      <div className="interview-setup-header">
        <MessageSquare size={48} className="interview-header-icon" />
        <h2>AI Mock Interview</h2>
        <p>Prepare for your placements with AI-powered interviews</p>
      </div>

      <div className="interview-form">
        <div className="interview-form-group">
          <label>Select Role</label>
          <select 
            value={interviewData.role}
            onChange={(e) => setInterviewData({...interviewData, role: e.target.value})}
            className="interview-select"
          >
            <option value="">Choose a role...</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="interview-form-group">
          <label>Experience Level</label>
          <div className="interview-level-buttons">
            {levels.map(level => (
              <button
                key={level}
                type="button"
                className={`interview-level-btn ${interviewData.level === level ? 'active' : ''}`}
                onClick={() => setInterviewData({...interviewData, level})}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="interview-form-group">
          <label>Tech Stack (Select multiple)</label>
          <div className="interview-tech-grid">
            {techStackOptions.map(tech => (
              <button
                key={tech}
                type="button"
                className={`interview-tech-btn ${interviewData.techStack.includes(tech) ? 'active' : ''}`}
                onClick={() => handleTechStackToggle(tech)}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        <button 
          className="interview-start-btn"
          onClick={startInterview}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader size={20} className="interview-spinner" />
              Starting Interview...
            </>
          ) : (
            <>
              <MessageSquare size={20} />
              Start Interview
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderInterview = () => (
    <div className="interview-active">
      <div className="interview-progress-bar">
        <div className="interview-progress-fill" style={{width: `${(questionNumber / totalQuestions) * 100}%`}}></div>
      </div>
      
      <div className="interview-question-header">
        <span className="interview-question-number">Question {questionNumber} of {totalQuestions}</span>
        <span className="interview-question-badge">{interviewData.role}</span>
      </div>

      <div className="interview-question-box">
        <h3>{currentQuestion}</h3>
      </div>

      <div className="interview-answer-section">
        <label>Your Answer</label>
        <textarea
          className="interview-answer-textarea"
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows={6}
          disabled={isLoading}
        />
      </div>

      <button 
        className="interview-submit-btn"
        onClick={submitAnswer}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader size={20} className="interview-spinner" />
            Processing...
          </>
        ) : questionNumber < totalQuestions ? (
          <>
            <Send size={20} />
            Submit & Next
          </>
        ) : (
          <>
            <CheckCircle size={20} />
            Finish Interview
          </>
        )}
      </button>
    </div>
  );

  const renderFeedback = () => (
    <div className="interview-feedback">
      <div className="interview-feedback-header">
        <div className="interview-score-circle">
          <Award size={48} />
          <span className="interview-score">{feedback.score}%</span>
        </div>
        <h2>Interview Completed!</h2>
        <p>Here's your detailed feedback</p>
      </div>

      <div className="interview-feedback-sections">
        <div className="interview-feedback-card interview-strengths">
          <div className="interview-feedback-card-header">
            <CheckCircle size={24} />
            <h3>Strengths</h3>
          </div>
          <ul>
            {feedback.strengths.map((strength, idx) => (
              <li key={idx}>{strength}</li>
            ))}
          </ul>
        </div>

        <div className="interview-feedback-card interview-weaknesses">
          <div className="interview-feedback-card-header">
            <AlertCircle size={24} />
            <h3>Areas to Improve</h3>
          </div>
          <ul>
            {feedback.weaknesses.map((weakness, idx) => (
              <li key={idx}>{weakness}</li>
            ))}
          </ul>
        </div>

        <div className="interview-feedback-card interview-suggestions">
          <div className="interview-feedback-card-header">
            <TrendingUp size={24} />
            <h3>Suggestions</h3>
          </div>
          <ul>
            {feedback.suggestions.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
        </div>
      </div>

      <button className="interview-restart-btn" onClick={resetInterview}>
        <MessageSquare size={20} />
        Start New Interview
      </button>
    </div>
  );

  return (
    <>
      {/* Floating Interview Button */}
      <button 
        className="interview-floating-btn"
        onClick={() => setIsOpen(true)}
        title="AI Mock Interview"
      >
        <MessageSquare size={24} />
      </button>

      {/* Interview Modal */}
      {isOpen && (
        <div className="interview-modal-overlay">
          <div className="interview-modal">
            <button 
              className="interview-close-btn"
              onClick={() => {
                setIsOpen(false);
                if (currentStep === 'feedback') {
                  resetInterview();
                }
              }}
            >
              <X size={24} />
            </button>

            <div className="interview-modal-content">
              {currentStep === 'setup' && renderSetup()}
              {currentStep === 'interview' && renderInterview()}
              {currentStep === 'feedback' && renderFeedback()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InterviewFeature;