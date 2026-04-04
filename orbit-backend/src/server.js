import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// DEBUG: Log environment variables at startup
console.log("🔍 SERVER STARTUP DEBUG");
console.log("🔍 NODE_ENV:", process.env.NODE_ENV);
console.log("🔍 PORT:", process.env.PORT);
console.log("🔍 MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("🔍 MONGO_URI preview:", process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 30) + "..." : "NOT SET");

import resumeRoutes from "./routes/resumeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
// CORS configuration for production - allow all origins for now
const corsOptions = {
  origin: '*', // Allow all origins temporarily
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Increase JSON payload limit for larger requests
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/payment", paymentRoutes);

// Health check endpoint for Railway
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", message: "Server is running", timestamp: new Date() });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).send("Orbit Backend Running 🚀");
});

// Add logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 404 handler - must be AFTER all routes
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.path}`);
  res.status(404).json({ message: "Endpoint not found", path: req.path, method: req.method });
});

// Error handling middleware - must be LAST
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