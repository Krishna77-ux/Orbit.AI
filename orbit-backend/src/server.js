import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// 🔍 DEBUG: Verify server file is loading
console.log("🚀 SERVER FILE LOADED - This should appear in Railway logs");

dotenv.config();

const app = express();

// ✅ IMPORTANT: CORS at VERY TOP before everything
app.use(cors({
  origin: "https://orbit-ai-coud.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// 🔍 SIMPLE TEST ROUTE - bypass route imports
app.get("/api/simple-test", (req, res) => {
  console.log("🧪 SIMPLE TEST ROUTE HIT");
  res.status(200).json({ 
    message: "Simple test working!", 
    timestamp: new Date(),
    file: "server.js"
  });
});

// Increase JSON payload limit for larger requests
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Import routes after CORS
import resumeRoutes from "./routes/resumeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/payment", paymentRoutes);

// Test route to verify server is working
app.get("/api/test", (req, res) => {
  res.status(200).json({ 
    message: "Server is working!", 
    timestamp: new Date(),
    routes: {
      auth: "/api/auth/login",
      health: "/api/health"
    }
  });
});

// Health check endpoint for Railway
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", message: "Server is running", timestamp: new Date() });
});

app.get("/", (req, res) => {
  res.status(200).send("Orbit Backend Running 🚀");
});

// Add logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 404 handler
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.path}`);
  res.status(404).json({ message: "Endpoint not found", path: req.path, method: req.method });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

const PORT = parseInt(process.env.PORT) || 3000;
let server;

// Start server after database connection
const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log("🎉 All systems ready!");
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
    
    return server;
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;