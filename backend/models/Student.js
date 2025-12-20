const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String },
  branch: { type: String },
  year: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
