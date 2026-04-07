import { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API_CONFIG from "../utils/api";
import SoftBackground from "../components/SoftBackground";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(API_CONFIG.AUTH_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        login(data.user);
        setTimeout(() => navigate(from, { replace: true }), 400);
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (error) {
      alert("Server error. Please try again later.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const stars = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 92 + 2}%`,
    left: `${Math.random() * 92 + 2}%`,
    delay: `${Math.random() * 1.5}s`,
  }));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <SoftBackground />

      {stars.map((star) => (
        <span
          key={star.id}
          className="login-star"
          style={{ width: 3 + Math.random() * 2, height: 3 + Math.random() * 2, top: star.top, left: star.left, animationDelay: star.delay }}
        />
      ))}

      <div className="login-halo" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glow-card p-8 rounded-[2rem] shadow-[0_16px_50px_rgba(49,130,206,0.45)] border border-cyan-300/20 backdrop-blur-xl">
          <div className="text-center">
            <h1 className="text-5xl font-black tracking-tight text-white wave-text">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-cyan-100/80">
              Step into your personalized AI command center.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-10 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-cyan-100 tracking-wide">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="neon-input mt-2"
                placeholder="you@orbit.ai"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cyan-100 tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="neon-input mt-2"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="neon-btn"
            >
              {isLoading ? "🔄 Connecting..." : "� Login"}
            </button>

            <div className="px-3 py-2 rounded-xl border border-cyan-300/20 bg-slate-900/30 text-xs text-cyan-100/75">
              Need an account? <Link to="/signup" className="text-white underline">Join the star crew</Link>
            </div>
          </form>

          <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/40 p-3 text-center text-xs text-white/70">
            Tip: Use your keyboard to move through fields quickly and hit <b>Enter</b> to launch.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
