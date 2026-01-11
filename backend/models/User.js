const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  name: { type: String },
  username: { type: String, unique: true },
  email: { type: String },
  studentId: { type: String },
  collegeName: { type: String },
  companyId: { type: String },
  companyName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
