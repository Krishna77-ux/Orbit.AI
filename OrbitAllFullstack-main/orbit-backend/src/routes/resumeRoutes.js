import express from "express";
import multer from "multer";
import { uploadResume, getMyResumes, generateRoadmap, getJobMatches, tutorChat, setTargetRole, getCareerTree } from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer with size limits and file filtering
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept PDF files
    if (file.mimetype === "application/pdf" || file.originalname.endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File size exceeds 10MB limit" });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message || "Upload failed" });
  }
  next();
};

router.post("/upload", protect, upload.single("resume"), handleMulterError, uploadResume);
router.get("/my-resumes", protect, getMyResumes);
router.get("/roadmap", protect, generateRoadmap);
router.get("/jobs", protect, getJobMatches);
router.get("/career-tree", protect, getCareerTree);
router.get("/test", (req, res) => {
  console.log("✅ Resume routes test endpoint hit");
  res.json({ message: "Resume routes are working!", timestamp: new Date() });
});
router.post("/tutor", protect, tutorChat);
router.post("/set-target-role", protect, setTargetRole);

export default router;