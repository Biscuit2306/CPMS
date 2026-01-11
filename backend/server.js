const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const app = express();

// ------------------
// MIDDLEWARE
// ------------------
app.use(cors());
app.use(express.json());

// ------------------
// ROUTES
// ------------------
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const userRoutes = require("./routes/userRoutes"); // new general user route

app.use("/api/students", studentRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/recruiters", recruiterRoutes);
app.use("/api/users", userRoutes); // register any role

// ------------------
// TEST ROUTE
// ------------------
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ------------------
// CONNECT MONGODB
// ------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error(err));

// ------------------
// START SERVER
// ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
