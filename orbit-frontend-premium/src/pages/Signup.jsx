import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_CONFIG from "../utils/api";
import SoftBackground from "../components/SoftBackground";
import { motion } from "framer-motion";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(API_CONFIG.AUTH_SIGNUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup successful! Please login.");
        navigate("/login");
      } else {
        alert(data.message || "Signup failed.");
      }
    } catch (error) {
      alert("Server error. Please try again later.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <SoftBackground />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass p-10 rounded-3xl">
          <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Start your journey with Orbit AI in minutes.
            </p>
          </div>

          <form onSubmit={handleSignup} className="mt-10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-soft mt-2"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-soft mt-2"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-soft mt-2"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-white/60">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-white hover:text-white">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
