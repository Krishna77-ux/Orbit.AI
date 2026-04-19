import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

// Initialize Razorpay
const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "mock_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret",
});
// Plan definitions (prices in USD cents)
const PLANS = {
  plus: {
    name: "Plus",
    price: 49900,       // ₹499.00
    displayPrice: "₹499",
    resumeUploads: 50,
    features: [
      "50 Resume Uploads",
      "Priority ATS Analysis",
      "Full Skill Matrix",
      "Email Support"
    ],
    period: "monthly",
  },
  pro: {
    name: "Pro",
    price: 99900,      // ₹999.00
    displayPrice: "₹999",
    resumeUploads: -1, // Unlimited
    features: [
      "Unlimited Resume Uploads",
      "Full AI Career Suite",
      "AI Orbit Intelligence",
      "Priority Job Matching",
      "24/7 Expert Support",
      "Personalized Roadmaps"
    ],
    period: "monthly",
  },
};

// Create checkout session
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

    const planData = PLANS[plan];

    // Development bypass if no Razorpay Key is provided
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === "mock_key") {
      return res.json({
        isMock: true,
        orderId: "mock_order_" + Date.now(),
        amount: planData.price,
        currency: "INR",
        plan: plan
      });
    }

    // Create Razorpay checkout session (order)
    const options = {
      amount: planData.price, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${user._id.toString().substring(0,10)}_${Date.now()}`
    };

    const order = await getRazorpay().orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: plan,
      userId: user._id.toString(),
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Checkout order creation error:", error);
    res.status(500).json({ message: "Failed to create checkout order", error: error.message });
  }
};

// Verify payment and activate subscription
export const handlePaymentSuccess = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, isMock } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!isMock) {
      // Verify Razorpay signature
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest("hex");

      if (digest !== razorpay_signature) {
        return res.status(400).json({ message: "Transaction signature verification failed" });
      }
    }

    const planData = PLANS[plan];
    const sessionId = razorpay_order_id || `mock_session_${Date.now()}`;

    // Upsert payment record (prevent duplicate key error on retry)
    await Payment.findOneAndUpdate(
      { stripeSessionId: sessionId },
      {
        user: user._id,
        email: user.email,
        stripeSessionId: sessionId, // we keep the field name but store razorpay id
        amount: planData.price,
        currency: "inr",
        status: "completed",
        plan: plan,
        description: `${planData.name} Plan - ${planData.resumeUploads} uploads`,
        metadata: { features: planData.features.join(","), razorpay_payment_id },
      },
      { upsert: true, new: true }
    );

    // Upsert subscription (keyed on user to avoid duplicates)
    const subscriptionUpdate = {
      user: user._id,
      email: user.email,
      plan: plan,
      status: "active",
      plan_details: {
        name: planData.name,
        price: planData.price,
        resumeUploads: planData.resumeUploads,
        features: planData.features,
      },
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    // Only set stripeCustomerId if not null (avoids unique index collision)
    if (razorpay_payment_id) {
      subscriptionUpdate.stripeCustomerId = razorpay_payment_id; // Using field name from existing schema
    }

    const subscription = await Subscription.findOneAndUpdate(
      { user: user._id },
      subscriptionUpdate,
      { upsert: true, new: true }
    );

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
      if (user.resumeUploadsRemaining > 0) {
        return {
          allowed: true,
          plan: "free",
          uploadsRemaining: user.resumeUploadsRemaining,
        };
      }
      return { 
        allowed: false, 
        reason: "Trial limit reached (10 Free Analyses used). Upgrade to Pro for unlimited access!",
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
