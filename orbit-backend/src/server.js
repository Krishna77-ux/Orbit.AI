import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

console.log("🔍 SERVER STARTUP DEBUG");
console.log("🔍 NODE_ENV:", process.env.NODE_ENV);
console.log("🔍 PORT:", process.env.PORT);
console.log("🔍 MONGO_URI exists:", !!process.env.MONGO_URI);

const app = express();
const PORT = parseInt(process.env.PORT) || 3000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Root endpoint - FIRST
app.get("/", (req, res) => {
  console.log("🏠 Root endpoint hit");
  res.status(200).send("Orbit Backend Running 🚀");
});

// Health endpoint - SECOND
app.get("/api/health", (req, res) => {
  console.log("💚 Health endpoint hit");
  res.status(200).json({ 
    status: "healthy", 
    message: "Server is running", 
    timestamp: new Date(),
    port: PORT 
  });
});

// Test endpoint - THIRD
app.get("/api/test", (req, res) => {
  console.log("🧪 Test endpoint hit");
  res.status(200).json({ 
    message: "API is working!", 
    timestamp: new Date() 
  });
});

// 404 handler - LAST
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: "Endpoint not found", 
    path: req.path, 
    method: req.method 
  });
});

// Start server - NO database connection for now
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`� Server URL: http://0.0.0.0:${PORT}`);
  console.log("🎉 Minimal server ready for testing!");
});

export default app;