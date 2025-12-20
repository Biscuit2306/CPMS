const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// ✅ ROUTES (THIS PART IS CRITICAL)
const studentRoutes = require("./routes/studentroutes");
const adminRoutes = require("./routes/adminroutes");
const recruiterRoutes = require("./routes/recruiterroutes");

app.use("/api/students", studentRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/recruiters", recruiterRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// server
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error(err));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
