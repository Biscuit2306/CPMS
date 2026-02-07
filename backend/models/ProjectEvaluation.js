const mongoose = require("mongoose");

  const projectEvaluationSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: [true, "Project title is required"],
        trim: true,
      },
      domain: {
        type: String,
        required: [true, "Domain is required"],
        trim: true,
      },
      techStack: {
        type: String,
        required: [true, "Tech stack is required"],
        trim: true,
      },
      repoUrl: {
        type: String,
        trim: true,
        default: null,
      },
      
      // AI Evaluation Results
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      strengths: {
        type: [String],
        required: true,
        validate: {
          validator: function(v) {
            return v && v.length >= 3;
          },
          message: "At least 3 strengths are required"
        }
      },
      improvements: {
        type: [String],
        required: true,
        validate: {
          validator: function(v) {
            return v && v.length >= 3;
          },
          message: "At least 3 improvements are required"
        }
      },
      interviewReadiness: {
        type: String,
        required: true,
        trim: true,
      },
    },
    { 
      timestamps: true 
    }
  );

  module.exports = mongoose.model("ProjectEvaluation", projectEvaluationSchema);