import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },

    isPremium: {
      type: Boolean,
      default: false,
    },

    resumeUploadsRemaining: {
      type: Number,
      default: 0, // 0 means free tier, no uploads
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);