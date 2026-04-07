import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ["free", "basic", "premium", "pro"],
      default: "free",
    },
    plan_details: {
      name: String,
      price: Number, // in cents
      resumeUploads: Number, // -1 for unlimited
      features: [String],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled", "expired"],
      default: "inactive",
    },
    stripeCustomerId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeSubscriptionId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    canceledAt: Date,
    resumeUploadsUsed: {
      type: Number,
      default: 0,
    },
    paymentHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
