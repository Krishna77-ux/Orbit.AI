import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getApiBase } from "../utils/api";
import SoftBackground from "../components/SoftBackground";

const PLANS = [
  {
    name: "Free Trial",
    price: "₹0",
    priceValue: 0,
    period: "forever",
    resumeUploads: "10",
    features: [
      "10 Resume Analysis",
      "Standard AI Insights",
      "Community Access",
    ],
    highlight: false,
    gradient: "from-slate-500/10 to-slate-400/10",
    border: "border-white/10",
    button: "bg-white/5 text-white cursor-default",
    id: "free"
  },
  {
    name: "Orbit Plus",
    price: "₹499",
    priceValue: 49900,
    period: "month",
    resumeUploads: "50",
    features: [
      "50 Resume Analysis",
      "Priority AI Scout",
      "Full Skill Matrix",
      "Email Support",
    ],
    highlight: true,
    popular: true,
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/50",
    button: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25",
    id: "plus"
  },
  {
    name: "Orbit Pro",
    price: "₹999",
    priceValue: 99900,
    period: "month",
    resumeUploads: "Unlimited",
    features: [
      "Unlimited Analysis",
      "Full AI Career Suite",
      "AI Orbit Intelligence",
      "Priority Job Matching",
      "24/7 Expert Support",
      "Personalized Roadmaps"
    ],
    popular: false,
    gradient: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/20",
    button: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25",
    id: "pro"
  }
];

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState("premium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiBase = useMemo(() => getApiBase(), []);
  const navigate = useNavigate();

  const handleSubscribe = async (planId) => {
    // Check if logged in first
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: { pathname: "/pricing" } } });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBase}/api/payment/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `Server error: ${response.status}`);
      }

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        throw new Error("No checkout URL received from server");
      }
    } catch (err) {
      console.error("Subscription error:", err);
      setError(err.message || "Failed to process subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      <SoftBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Choose the plan that fuels your growth
          </h1>
          <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">
            Unlock powerful tools, priority support, and AI-driven insights with plans designed for every stage.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/subscription")}
              className="btn-secondary"
            >
              Manage Subscription
            </button>
            <p className="text-sm text-gray-400">
              Already subscribed? Manage your plan, see usage, and renew billing.
            </p>
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-center"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`relative rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/30 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-purple-500/20 ${
                plan.popular ? "ring-2 ring-purple-500/40" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 right-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/30">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold tracking-tight mb-2">{plan.name}</h3>

              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-extrabold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  {plan.price}
                </span>
                <span className="text-sm text-gray-300">/ {plan.period}</span>
              </div>

              <div className="mb-6 rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-sm text-gray-200">
                  <span className="font-semibold text-cyan-200">{plan.resumeUploads}</span> resume uploads included
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-3">
                    <span className="mt-1 text-lg text-emerald-300">✓</span>
                    <span className="text-gray-200">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => {
                  setSelectedPlan(plan.id);
                  handleSubscribe(plan.id);
                }}
                disabled={loading}
                className={`w-full rounded-2xl py-3 font-semibold transition ${
                  plan.popular
                    ? "btn-primary"
                    : "btn-secondary"
                } ${loading ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02]"}`}
              >
                {loading ? "Processing…" : "Select & Checkout"}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "Can I change my plan anytime?",
                a: "Yes — you can upgrade or downgrade at any time. Changes take effect immediately."
              },
              {
                q: "Do you offer refunds?",
                a: "We offer a 7-day money-back guarantee — just reach out to support if it's not right for you."
              },
              {
                q: "Is there an annual plan?",
                a: "At the moment we offer monthly plans. Reach out if you'd like to explore custom enterprise pricing."
              },
              {
                q: "What happens if I run out of uploads?",
                a: "You'll be prompted to upgrade to continue uploading resumes without interruption."
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + idx * 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <p className="font-semibold text-gray-100 mb-1">❓ {item.q}</p>
                <p className="text-sm text-gray-300">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
