import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_CONFIG } from "../utils/api";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(API_CONFIG.AUTH_SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/login");
      } else {
        setError(data.message || "Signup failed.");
      }
    } catch (error) {
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative bg-[#050814]">
      {/* Cosmic background (Same as Login) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/2 w-[120vh] h-[120vh] rounded-full opacity-40 blur-[2px]"
          style={{
            background: "radial-gradient(circle at center, #2e4a8a 0%, #050814 70%)",
            boxShadow: "0 0 100px 20px rgba(46, 74, 138, 0.3)"
          }} 
        />
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i}
            className="absolute rounded-full bg-white transition-opacity duration-1000"
            style={{
              width: i % 3 === 0 ? "2px" : "1px",
              height: i % 3 === 0 ? "2px" : "1px",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.1 + Math.random() * 0.5,
              animation: `pulse ${3 + Math.random() * 5}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>

      <main className="relative z-10 w-full max-w-7xl px-8 md:px-16 flex flex-col lg:flex-row items-center justify-between gap-16 py-12">
        <div className="flex-1 max-w-2xl animate-fade-in-up">
          <div className="mb-12">
            <span className="font-headline font-black text-5xl tracking-tighter text-white">Orbit.</span>
          </div>
          <h1 className="font-headline font-extrabold text-6xl md:text-7xl leading-[1.1] text-white mb-8">
            Create Your <span className="text-[#5ffbd6]">Star Crew</span> Profile.
          </h1>
          <p className="text-xl leading-relaxed mb-12 text-[#8a96c0] max-w-lg font-medium opacity-80">
            Join the most advanced career navigation engine and start your journey into the celestial professional landscape today.
          </p>
        </div>

        <div className="w-full max-w-md animate-fade-in-up md:delay-200">
          <div className="glass-strong rounded-[2.5rem] p-10 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/10 relative">
            <div className="mb-10 text-left">
              <h2 className="text-3xl font-bold text-white mb-3">Launch Profile</h2>
              <p className="text-[#8a96c0] font-medium">Join the next generation of professionals.</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-7">
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-medium animate-shake">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#8a96c0] px-1" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8a96c0] text-xl">person</span>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your Name"
                    className="w-full bg-[#0f172a]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#5ffbd6] focus:ring-1 focus:ring-[#5ffbd6] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#8a96c0] px-1" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8a96c0] text-xl">mail</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@university.edu"
                    className="w-full bg-[#0f172a]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#5ffbd6] focus:ring-1 focus:ring-[#5ffbd6] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#8a96c0] px-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8a96c0] text-xl">lock</span>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#0f172a]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#5ffbd6] focus:ring-1 focus:ring-[#5ffbd6] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#006b5c] to-[#004d40] hover:from-[#00796b] hover:to-[#005a4d] text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-900/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
              >
                {isLoading ? "Initiating..." : "Create Profile"}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm font-medium text-[#8a96c0]">
                Already a member?{" "}
                <Link to="/login" className="text-[#5ffbd6] font-bold hover:underline ml-1">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-8 left-0 w-full px-12 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase font-black tracking-[0.3em] text-[#8a96c0]/40 z-20">
        <div className="flex gap-10">
          <button className="hover:text-white transition-colors">Privacy Charter</button>
          <button className="hover:text-white transition-colors">Navigation Terms</button>
        </div>
        <div>
          <span>Orbit Engine v2.4.0 © 2024 Celestial Systems</span>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.6; }
        }
        .glass-strong {
          background: rgba(11, 25, 60, 0.4);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
        }
      `}} />
    </div>
  );
}
