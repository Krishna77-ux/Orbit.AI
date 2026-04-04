import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Use environment variable directly (no fallback for production)
    const mongoURI = process.env.MONGO_URI;
    
    console.log("🔍 DEBUG - MONGO_URI value:", mongoURI);
    console.log("🔍 DEBUG - Type:", typeof mongoURI);
    console.log("🔍 DEBUG - Starts with mongodb:", mongoURI ? mongoURI.startsWith('mongodb') : 'N/A');
    
    if (!mongoURI) {
      throw new Error("MONGO_URI is required in environment variables");
    }
    
    if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
      console.error("❌ Invalid MONGO_URI format:", mongoURI.substring(0, 50) + "...");
      throw new Error("MONGO_URI must start with mongodb:// or mongodb+srv://");
    }
    
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;