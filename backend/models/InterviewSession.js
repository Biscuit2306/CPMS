const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema({
  studentId: String,
  role: String,
  level: String,
  techStack: [String],
  messages: [
    {
      role: { type: String }, // "user" | "assistant"
      content: String,
    },
  ],
  completed: { type: Boolean, default: false },
});

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
 