import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SoftBackground from "../components/SoftBackground";

export default function PaymentCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative text-white flex items-center justify-center">
      <SoftBackground />

      <div className="relative z-10 max-w-md w-full px-6 text-center">
        <motion.div
          animate={{ rotate: -10 }}
          transition={{ duration: 0.5 }}
          className="text-6xl mb-4"
        >
          ❌
        </motion.div>

        <h1 className="text-3xl font-bold mb-4 text-red-400">Payment Cancelled</h1>
        <p className="text-gray-300 mb-8">
          Your payment was cancelled. No charges were made to your account.
        </p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/pricing")}
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/50 transition-all"
          >
            Back to Pricing
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/50 text-purple-300 hover:border-purple-400 transition-all"
          >
            Continue Without Subscription
          </motion.button>
        </div>

        <p className="text-gray-400 text-sm mt-8">
          Have questions? <a href="#" className="text-purple-400 hover:text-purple-300 underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}
