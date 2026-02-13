const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema({
  studentFirebaseUid: {
    type: String,
    required: true,
    index: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: String,
    required: true,
    trim: true,
  },
  techStack: {
    type: [String],
    required: true,
    default: [],
  },
  currentQuestionNumber: {
    type: Number,
    default: 1,
  },
  questions: [
    {
      questionNumber: Number,
      question: String,
      answer: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  feedback: {
    score: { type: Number, default: null },
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
  },
  status: {
    type: String,
    enum: ["in-progress", "completed", "abandoned"],
    default: "in-progress",
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
 