import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Try local MongoDB first, fallback to Atlas
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/orbitai";
    
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    
    // Try fallback to local if Atlas fails
    if (!process.env.MONGO_URI?.includes("localhost")) {
      console.log("🔄 Trying fallback to local MongoDB...");
      try {
        await mongoose.connect("mongodb://localhost:27017/orbitai");
        console.log("✅ Local MongoDB Connected Successfully");
      } catch (localError) {
        console.error("❌ Local MongoDB also failed:", localError.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;