import Stripe from "stripe";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");

// Plan definitions
const PLANS = {
  basic: {
    name: "Basic",
    price: 199, // $1.99 in cents
    resumeUploads: 5,
    features: ["5 Resume Uploads", "Basic ATS Analysis", "Email Support"],
    period: "monthly",
  },
  premium: {
    name: "Premium",
    price: 599, // $5.99 in cents
    resumeUploads: 50,
    features: ["50 Resume Uploads", "Advanced ATS Analysis", "AI Tutor Access", "Priority Support"],
    period: "monthly",
  },
  pro: {
    name: "Pro",
    price: 1299, // $12.99 in cents
    resumeUploads: -1, // Unlimited
    features: ["Unlimited Uploads", "Expert Analysis", "Full AI Suite", "24/7 Priority Support", "API Access"],
    period: "monthly",
  },
};

// Create checkout session (mock for testing)
export const createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!PLANS[plan]) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    // Mock successful checkout for testing
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    res.json({
      sessionId: "mock_session_" + Date.now(),
      sessionUrl: `${frontendUrl}/payment-success?session_id=mock_session_${Date.now()}&plan=${plan}`,
      message: "Mock checkout session created (testing mode)"
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    res.status(500).json({ message: "Failed to create checkout session", error: error.message });
  }
};

// Verify payment and activate subscription (mock for testing)
export const handlePaymentSuccess = async (req, res) => {
  try {
    const { sessionId, plan } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // For mock sessions, skip Stripe verification
    if (sessionId && sessionId.startsWith("mock_session_")) {
      console.log("Processing mock payment for plan:", plan);
    } else {
      // Real Stripe verification (when implemented)
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") {
        return res.status(400).json({ message: "Payment not completed" });
      }
    }

    const planData = PLANS[plan];

    // Create or update payment record
    await Payment.create({
      user: user._id,
      email: user.email,
      stripeSessionId: sessionId,
      amount: planData.price,
      currency: "usd",
      status: "completed",
      plan: plan,
      description: `${planData.name} Plan - ${planData.resumeUploads} uploads`,
      metadata: {
        features: planData.features.join(","),
      },
    });

    // Create or update subscription
    let subscription = await Subscription.findOne({ user: user._id });

    if (!subscription) {
      subscription = new Subscription({
        user: user._id,
        email: user.email,
        stripeCustomerId: `mock_customer_${user._id}`,
      });
    }

    subscription.plan = plan;
    subscription.status = "active";
    subscription.plan_details = {
      name: planData.name,
      price: planData.price,
      resumeUploads: planData.resumeUploads,
      features: planData.features,
    };
    subscription.currentPeriodStart = new Date();
    subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await subscription.save();

    // Update user
    user.isPremium = true;
    user.subscription = subscription._id;
    user.resumeUploadsRemaining = planData.resumeUploads;
    await user.save();

    res.json({
      message: "Payment successful! Subscription activated.",
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        resumeUploads: planData.resumeUploads,
        expiresAt: subscription.currentPeriodEnd,
      },
    });
  } catch (error) {
    console.error("Payment success handler error:", error);
    res.status(500).json({ message: "Failed to process payment", error: error.message });
  }
};

// Get current subscription
export const getSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("subscription");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subscription = user.subscription || {
      plan: "free",
      status: "inactive",
      resumeUploads: 0,
      features: [],
    };

    res.json({
      isPremium: user.isPremium,
      resumeUploadsRemaining: user.resumeUploadsRemaining,
      subscription: subscription,
      plans: PLANS,
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ message: "Failed to get subscription", error: error.message });
  }
};

// Check if user can upload resume
export const canUploadResume = async (userId) => {
  try {
    const user = await User.findById(userId).populate("subscription");

    if (!user) {
      return { allowed: false, reason: "User not found" };
    }

    // Free tier: no uploads allowed
    if (!user.isPremium || !user.subscription) {
      return { 
        allowed: false, 
        reason: "Please subscribe to upload resumes",
        currentPlan: "free",
      };
    }

    const subscription = user.subscription;

    // Check if subscription is active
    if (subscription.status !== "active") {
      return {
        allowed: false,
        reason: "Subscription expired. Please renew.",
        currentPlan: subscription.plan,
      };
    }

    // Check if subscription period has ended
    if (new Date() > subscription.currentPeriodEnd) {
      return {
        allowed: false,
        reason: "Subscription expired. Please renew.",
        currentPlan: subscription.plan,
      };
    }

    // Unlimited uploads (-1) or remaining uploads available
    if (subscription.plan_details.resumeUploads === -1 || user.resumeUploadsRemaining > 0) {
      return {
        allowed: true,
        plan: subscription.plan,
        uploadsRemaining: user.resumeUploadsRemaining,
      };
    }

    return {
      allowed: false,
      reason: "No uploads remaining. Please upgrade or renew your plan.",
      currentPlan: subscription.plan,
      uploadsRemaining: 0,
    };
  } catch (error) {
    console.error("Upload check error:", error);
    return { allowed: false, reason: "Error checking subscription" };
  }
};

// Decrement upload count
export const decrementUploadCount = async (userId) => {
  try {
    const user = await User.findById(userId).populate("subscription");
    
    if (user && user.subscription && user.subscription.plan_details.resumeUploads !== -1) {
      user.resumeUploadsRemaining = Math.max(0, user.resumeUploadsRemaining - 1);
      await user.save();
    }
  } catch (error) {
    console.error("Decrement upload count error:", error);
  }
};

export default {
  createCheckoutSession,
  handlePaymentSuccess,
  getSubscription,
  canUploadResume,
  decrementUploadCount,
};
