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
      required: function() { return !this.googleId && !this.githubId; },
    },

    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },

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
      default: 10, 
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);