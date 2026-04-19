import express from "express";
import {
  createCheckoutSession,
  handlePaymentSuccess,
  getSubscription,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a checkout session
router.post("/create-checkout-session", protect, createCheckoutSession);

// Verify payment and activate subscription
router.post("/verify-payment", protect, handlePaymentSuccess);

// Get current subscription status
router.get("/subscription", protect, getSubscription);

export default router;
