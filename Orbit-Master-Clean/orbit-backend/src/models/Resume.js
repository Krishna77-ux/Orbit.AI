import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    extractedSkills: [String],
    readinessScore: {
      type: Number,
      default: 0,
    },
    roadmapProgress: {
      type: Number,
      default: 0,
    },
    jobsMatched: {
      type: Number,
      default: 0,
    },
    targetRole: {
      type: String,
      default: "Software Engineer",
    },
    personalizedRoadmap: {
      type: Array,
      default: [],
    },
    trackMatches: [
      {
        track: String,
        percentage: Number
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);