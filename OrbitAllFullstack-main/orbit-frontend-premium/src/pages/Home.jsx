import { motion } from "framer-motion";
import { Sparkles, Rocket, Brain, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden relative bg-[#050814]">
      {/* Cosmic background (Consistent with Login/Signup) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vh] h-[140vh] rounded-full opacity-30 blur-[4px]"
          style={{
            background: "radial-gradient(circle at center, #2e4a8a 0%, #050814 70%)",
            boxShadow: "0 0 100px 20px rgba(46, 74, 138, 0.2)"
          }} 
        />
        {Array.from({ length: 80 }).map((_, i) => (
          <div key={i}
            className="absolute rounded-full bg-white transition-opacity duration-1000"
            style={{
              width: i % 4 === 0 ? "2px" : "1px",
              height: i % 4 === 0 ? "2px" : "1px",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.05 + Math.random() * 0.4,
              animation: `pulse ${4 + Math.random() * 6}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>

      <nav className="fixed top-0 left-0 w-full px-12 py-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <span className="font-headline font-black text-3xl tracking-tighter text-white">Orbit.</span>
        </div>
        <div className="flex items-center gap-8">
          <Link to="/pricing" className="text-sm font-bold text-[#8a96c0] hover:text-white transition-colors">Pricing</Link>
          <Link to="/login" className="text-sm font-bold text-[#8a96c0] hover:text-white transition-colors">Sign In</Link>
          <Link to="/signup" className="bg-[#5ffbd6] text-[#050814] px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-5xl px-8 flex flex-col items-center text-center py-20 pb-40">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="space-y-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#5ffbd6] text-xs font-bold tracking-widest uppercase">
            <Sparkles className="w-4 h-4" />
            AI-Powered Career Intelligence
          </div>

          <h1 className="font-headline font-extrabold text-7xl md:text-8xl leading-[1] text-white tracking-tight">
            Navigate Your <span className="text-[#5ffbd6]">Future.</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#8a96c0] max-w-2xl mx-auto font-medium opacity-80 leading-relaxed">
            The next-generation career engine. Personalized roadmaps, ATS analysis, and job matching for the modern creator.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link to="/signup" className="group bg-white text-[#050814] px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all flex items-center gap-3">
              Launch Profile
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Minimal Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-40">
          {[
            { icon: <Brain className="w-6 h-6 text-[#5ffbd6]" />, title: "AI Roadmap", desc: "Tailored learning paths generated for your goals." },
            { icon: <Target className="w-6 h-6 text-[#5ffbd6]" />, title: "ATS Optimizer", desc: "Boost your visibility to top companies." },
            { icon: <Rocket className="w-6 h-6 text-[#5ffbd6]" />, title: "Job Matching", desc: "Direct paths to your dream career segments." }
          ].map((f, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.2 }}
               className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-left hover:border-[#5ffbd6]/40 transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#5ffbd6]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-sm text-[#8a96c0] font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="absolute bottom-8 left-0 w-full px-12 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase font-black tracking-[0.3em] text-[#8a96c0]/40 z-20">
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
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.3; }
        }
      `}} />
    </div>
  );
}
