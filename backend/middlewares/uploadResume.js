const multer = require("multer");
const path = require("path");
const fs = require("fs");

const resumeDir = path.join(process.cwd(), "uploads/resumes");

if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resumeDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName = file.originalname.replace(/\s+/g, "_").replace(ext, "");
    cb(null, `${safeName}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF resumes allowed!"), false);
  }
  cb(null, true);
};

const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { uploadResume };