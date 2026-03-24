import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_CONFIG } from "../utils/api";
import SoftBackground from "../components/SoftBackground";

export default function Subscription() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please sign in to view your subscription.");
        navigate("/login");
        return;
      }

      const response = await fetch(API_CONFIG.PAYMENT_SUBSCRIPTION, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else if (response.status === 401) {
        setError("Session expired. Please sign in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(result.message || "Unable to load subscription details.");
      }
    } catch (err) {
      console.error("Subscription load error:", err);
      setError("Unable to load subscription details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const subscription = data?.subscription || {};
  const isPremium = data?.isPremium;

  return (
    <div className="min-h-screen relative text-white">
      <SoftBackground />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Subscription & Billing
          </h1>
          <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">
            View your active plan, remaining uploads, and manage your subscription.
          </p>
        </motion.div>

        <div className="glass-md p-10 rounded-3xl border border-white/15">
          {loading ? (
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                ⏳
              </motion.div>
              <p className="text-gray-300">Fetching subscription details…</p>
            </div>
          ) : error ? (
            <div className="text-center space-y-4">
              <p className="text-red-300 font-semibold mb-4">{error}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={fetchSubscription}
                  className="btn-secondary"
                >
                  Refresh
                </button>
                <button
                  onClick={() => navigate("/pricing")}
                  className="btn-primary"
                >
                  View Subscription Plans
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-gray-300 uppercase tracking-wide">Current Plan</p>
                  <h2 className="text-3xl font-bold mt-2">
                    {subscription?.plan ? subscription.plan.toUpperCase() : "Free"}
                  </h2>
                  <p className="mt-2 text-sm text-gray-300">{subscription?.status ? subscription.status : "Inactive"}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-gray-300 uppercase tracking-wide">Uploads Remaining</p>
                  <h2 className="text-3xl font-bold mt-2">
                    {data?.resumeUploadsRemaining ?? "—"}
                  </h2>
                  <p className="mt-2 text-sm text-gray-300">
                    {subscription?.plan_details?.resumeUploads === -1
                      ? "Unlimited uploads"
                      : "Resets monthly"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-gray-300 uppercase tracking-wide">Billing Period</p>
                <div className="mt-2 flex flex-col gap-1">
                  <p className="text-lg font-semibold">
                    Expires: {formatDate(subscription?.currentPeriodEnd)}
                  </p>
                  <p className="text-sm text-gray-300">
                    {isPremium
                      ? "Your subscription is active and will renew automatically unless canceled."
                      : "Subscribe to unlock uploads and premium features."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <button
                  onClick={() => navigate("/pricing")}
                  className="btn-primary w-full md:w-auto"
                >
                  {isPremium ? "Change Plan" : "Get Started"}
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn-secondary w-full md:w-auto"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
