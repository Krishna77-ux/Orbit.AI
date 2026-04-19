import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import resumeRoutes from "./routes/resumeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// Security Headers for Google Auth & Logic
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use(cors());
app.use(express.json());

// Increase JSON payload limit for larger requests
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", message: "Server is running", timestamp: new Date() });
});

// Add logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/api/debug-ping", (req, res) => res.json({ message: "pong", timestamp: new Date() }));

app.get("/api/test-gemini", async (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.json({ status: "ERROR", reason: "GEMINI_API_KEY is missing" });
  try {
    // First: list all available models for this key
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key}`);
    const listData = await listRes.json();
    const modelNames = listData.models?.map(m => m.name) || [];
    
    // Then: try the first text-capable model we find
    const flashModel = modelNames.find(n => n === "models/gemini-2.0-flash") ||
                       modelNames.find(n => n.includes("2.0-flash")) ||
                       modelNames.find(n => n.includes("1.5-flash")) ||
                       modelNames.find(n => n.includes("flash")) ||
                       modelNames.find(n => n.includes("pro")) ||
                       modelNames[0];

    if (!flashModel) return res.json({ status: "NO_MODELS", availableModels: modelNames, rawResponse: listData });

    const modelId = flashModel.replace("models/", "");
    const genRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Say hello." }] }] })
      }
    );
    const genData = await genRes.json();
    const text = genData.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json({ status: genRes.ok ? "OK" : "GEN_FAILED", usedModel: modelId, availableModels: modelNames, response: text, error: genRes.ok ? undefined : genData });
  } catch (err) {
    res.json({ status: "FETCH_ERROR", error: err.message });
  }
});




// Vercel Serverless Database Connection Middleware
let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log("✅ Vercel DB Connected");
    } catch (err) {
      console.error("❌ Failed to connect to DB:", err.message);
    }
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes); // New Career Orbit routes are registered here
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Orbit Backend Running 🚀");
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



const PORT = parseInt(process.env.PORT) || 5000;

// Only start the local server if we are not in Vercel production
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running locally on port ${PORT}`);
    console.log("🎉 All systems ready!");
  });
}

// Export the app so Vercel can run it statelessly
export default app;
