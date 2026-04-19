import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STEPS = [
  {
    id: 1,
    icon: "rocket_launch",
    title: "Welcome to Orbit AI",
    subtitle: "Your AI career co-pilot is ready",
    description: "Orbit AI analyzes your resume, identifies skill gaps, builds a personalized roadmap, and preps you for interviews — all powered by real AI.",
    features: [
      { icon: "analytics", text: "ATS Score Analysis" },
      { icon: "map", text: "Personalized Roadmap" },
      { icon: "quiz", text: "Interview Prep Mode" },
      { icon: "hub", text: "Career Tree Explorer" },
    ],
    cta: "Get Started",
    color: "from-[#7c3aed] to-[#5ffbd6]",
  },
  {
    id: 2,
    icon: "upload_file",
    title: "Upload Your Resume",
    subtitle: "Let AI read between the lines",
    description: "Upload your PDF resume and our AI will extract your skills, calculate your ATS score, detect missing skills, and match you to top jobs — in seconds.",
    features: [
      { icon: "description", text: "PDF Resume Support" },
      { icon: "speed", text: "Instant AI Analysis" },
      { icon: "psychology", text: "Skill Extraction" },
      { icon: "work", text: "Job Matching" },
    ],
    cta: "Upload My Resume",
    color: "from-blue-600 to-cyan-400",
  },
  {
    id: 3,
    icon: "explore",
    title: "Start Your Journey",
    subtitle: "Your career orbit begins now",
    description: "Follow your AI-generated roadmap, use learning resources for each step, explore your career tree, and practice interviews. You're ready to launch 🚀",
    features: [
      { icon: "school", text: "Curated Learning Resources" },
      { icon: "trending_up", text: "Progress Tracking" },
      { icon: "stars", text: "Career Path Visualization" },
      { icon: "emoji_events", text: "Interview Confidence" },
    ],
    cta: "Let's Launch 🚀",
    color: "from-emerald-500 to-[#5ffbd6]",
  },
];

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("orbit_onboarded");
    if (!done) {
      // Small delay so the page loads first
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("orbit_onboarded", "true");
    setVisible(false);
  };

  const handleCTA = () => {
    if (step < STEPS.length - 1) {
      setAnimating(true);
      setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 200);
    } else {
      dismiss();
      navigate("/resume-analyzer");
    }
  };

  const handleSecondaryAction = () => {
    if (step === 1) {
      dismiss();
      navigate("/resume-analyzer");
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
      style={{ animation: "fadeIn 0.3s ease" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={dismiss}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #0d0f1f 0%, #12152b 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          animation: animating ? "slideUp 0.2s ease" : "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Skip */}
        <button
          onClick={dismiss}
          className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all z-10"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Gradient Banner */}
        <div className={`w-full h-2 bg-gradient-to-r ${current.color}`} />

        {/* Content */}
        <div className="p-10">
          {/* Icon */}
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 bg-gradient-to-br ${current.color} shadow-2xl`}
            style={{ boxShadow: "0 20px 40px rgba(124,58,237,0.3)" }}
          >
            <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              {current.icon}
            </span>
          </div>

          {/* Text */}
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-2">{current.subtitle}</p>
          <h2 className="text-3xl font-headline font-extrabold text-white mb-3">{current.title}</h2>
          <p className="text-slate-400 leading-relaxed mb-8">{current.description}</p>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {current.features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/3 border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#7c3aed] text-base">{f.icon}</span>
                </div>
                <span className="text-xs font-semibold text-slate-300">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {STEPS.map((_, i) => (
              <div
                key={i}
                onClick={() => !animating && setStep(i)}
                className={`rounded-full cursor-pointer transition-all duration-300 ${
                  i === step ? "w-8 h-2.5 bg-[#7c3aed]" : i < step ? "w-2.5 h-2.5 bg-[#5ffbd6]/40" : "w-2.5 h-2.5 bg-white/15"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSecondaryAction}
              className="flex-1 py-3.5 bg-white/5 text-slate-400 rounded-2xl text-sm font-bold hover:bg-white/10 hover:text-white transition-all border border-white/5"
            >
              {step === STEPS.length - 1 ? "Skip Tour" : "Skip"}
            </button>
            <button
              onClick={handleCTA}
              className={`flex-[2] py-3.5 bg-gradient-to-r ${current.color} text-white rounded-2xl text-sm font-black hover:scale-[1.02] transition-all shadow-lg`}
            >
              {current.cta} →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px) scale(0.97); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}
