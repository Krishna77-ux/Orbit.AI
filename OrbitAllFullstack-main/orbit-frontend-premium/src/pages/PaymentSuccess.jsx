import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getApiBase } from "../utils/api";
import SoftBackground from "../components/SoftBackground";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const sessionId = searchParams.get("session_id");
  const plan = searchParams.get("plan");

  useEffect(() => {
    // With Razorpay, payment verification happens in Pricing.jsx immediately upon popup success.
    // So if the user lands here, we assume it's successful based on query params.
    if (sessionId && plan) {
      setSuccess(true);
      setMessage(`Welcome to ${plan.toUpperCase()}! You can now access your new features.`);
      setLoading(false);
    } else {
      setMessage("No valid payment session found.");
      setLoading(false);
    }
  }, [sessionId, plan]);

  return (
    <div className="min-h-screen relative text-white flex items-center justify-center">
      <SoftBackground />

      <div className="relative z-10 max-w-md w-full px-6">
        {loading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ⏳
            </motion.div>
            <p className="text-xl text-gray-300">Verifying your payment...</p>
          </motion.div>
        ) : success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ✅
            </motion.div>
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Payment Successful!
            </h1>
            <p className="text-gray-300 mb-8">{message}</p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/dashboard")}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/50 transition-all"
            >
              Go to Dashboard
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: -10 }}
              transition={{ duration: 0.5 }}
              className="text-6xl mb-4"
            >
              ⚠️
            </motion.div>
            <h1 className="text-3xl font-bold mb-4 text-red-400">Payment Failed</h1>
            <p className="text-gray-300 mb-8">{message}</p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/pricing")}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/50 transition-all"
            >
              Try Again
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
