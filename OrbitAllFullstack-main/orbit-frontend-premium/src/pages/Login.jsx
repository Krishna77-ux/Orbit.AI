import { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_CONFIG, getApiBase } from "../utils/api";
import { useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  const { login: authLogin } = useContext(AuthContext);
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const res = await fetch(`${window.location.origin.includes('localhost') ? 'http://localhost:5000' : ''}/api/auth/social-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            token: tokenResponse.access_token, 
            provider: 'google' 
          }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("token", data.token);
          authLogin(data.user);
          navigate(from, { replace: true });
        } else {
          setError(data.message || "Google authentication failed.");
        }
      } catch (err) {
        setError("Connection to Orbit servers failed.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError("Google Sign-In was cancelled or failed."),
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(API_CONFIG.AUTH_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        authLogin(data.user);
        setTimeout(() => navigate(from, { replace: true }), 300);
      } else {
        setError(data.message || "Invalid credentials. Check your email and password.");
      }
    } catch {
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative bg-[#050814]">
      {/* ── Cosmic background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Large Planet Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/2 w-[120vh] h-[120vh] rounded-full opacity-40 blur-[2px]"
          style={{
            background: "radial-gradient(circle at center, #2e4a8a 0%, #050814 70%)",
            boxShadow: "0 0 100px 20px rgba(46, 74, 138, 0.3)"
          }} 
        />
        
        {/* Stars */}
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

      {/* ── Main content ── */}
      <main className="relative z-10 w-full max-w-7xl px-8 md:px-16 flex flex-col lg:flex-row items-center justify-between gap-16 py-12">
        
        {/* Left: Branding */}
        <div className="flex-1 max-w-2xl animate-fade-in-up">
          <div className="mb-12">
            <span className="font-headline font-black text-5xl tracking-tighter text-white">Orbit.</span>
          </div>
          <h1 className="font-headline font-extrabold text-6xl md:text-7xl leading-[1.1] text-white mb-8">
            Navigate the <span className="text-[#5ffbd6]">Next Frontier</span> of Your Career.
          </h1>
          <p className="text-xl leading-relaxed mb-12 text-[#8a96c0] max-w-lg font-medium opacity-80">
            The most advanced career navigation engine for the next generation of engineers and creators. Your journey into the celestial professional landscape starts here.
          </p>
          
          {/* Social Proof */}
          <div className="flex items-center gap-5">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-[#050814] bg-[#1e293b] flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-[#8a96c0] text-xl">person</span>
                </div>
              ))}
            </div>
            <span className="text-sm font-semibold tracking-wide text-[#8a96c0] opacity-80">
              Joined by 10,000+ navigators
            </span>
          </div>
        </div>

        {/* Right: Login Card */}
        <div className="w-full max-w-md animate-fade-in-up md:delay-200">
          <div className="glass-strong rounded-[2.5rem] p-10 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/10 relative">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
              <p className="text-[#8a96c0] font-medium">Please enter your credentials to continue.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-7">
              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-medium animate-shake">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {error}
                </div>
              )}

              {/* Email */}
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

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between px-1">
                  <label className="block text-sm font-bold text-[#8a96c0]" htmlFor="password">
                    Password
                  </label>
                  <button type="button" className="text-xs font-bold text-[#5ffbd6] hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8a96c0] text-xl">lock</span>
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#0f172a]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-[#5ffbd6] focus:ring-1 focus:ring-[#5ffbd6] transition-all"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a96c0] hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">{showPw ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-3 px-1">
                <div className="relative flex items-center">
                  <input id="remember" type="checkbox" className="w-5 h-5 rounded border-white/10 bg-[#0f172a] accent-[#5ffbd6] cursor-pointer" />
                </div>
                <label htmlFor="remember" className="text-sm font-medium text-[#8a96c0] cursor-pointer">
                  Stay logged in for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#006b5c] to-[#004d40] hover:from-[#00796b] hover:to-[#005a4d] text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-900/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-10 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <span className="relative px-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#8a96c0] bg-transparent">
                Or Continue With
              </span>
            </div>

            {/* Social Logins */}
            <div className="flex justify-center">
              <button 
                type="button"
                onClick={() => googleLogin()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-2xl py-3.5 hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
              >
                <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
                <span className="text-sm font-bold text-white">Continue with Google</span>
              </button>
            </div>

            {/* Register link */}
            <div className="mt-10 text-center">
              <p className="text-sm font-medium text-[#8a96c0]">
                Don't have an account?{" "}
                <Link to="/signup" className="text-[#5ffbd6] font-bold hover:underline ml-1">
                  Launch your profile
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
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
