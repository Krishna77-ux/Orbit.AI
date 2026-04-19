import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_CONFIG } from "../utils/api";
import { generatePDF } from "../utils/exportPDF";

function getResources(stepTitle) {
  const q = encodeURIComponent(stepTitle + " tutorial for beginners");
  const qAdv = encodeURIComponent(stepTitle + " complete course");
  return [
    {
      icon: "play_circle",
      label: "YouTube Tutorial",
      desc: "Free video walkthrough",
      color: "text-red-400 bg-red-500/10 border-red-500/20",
      url: `https://www.youtube.com/results?search_query=${q}`,
    },
    {
      icon: "school",
      label: "Coursera Course",
      desc: "Structured learning path",
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      url: `https://www.coursera.org/search?query=${encodeURIComponent(stepTitle)}`,
    },
    {
      icon: "local_library",
      label: "Udemy Course",
      desc: "Project-based learning",
      color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
      url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(stepTitle)}`,
    },
    {
      icon: "article",
      label: "Documentation / Articles",
      desc: "Read & deep dive",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      url: `https://www.google.com/search?q=${qAdv}+documentation+guide`,
    },
    {
      icon: "code",
      label: "Practice on GitHub",
      desc: "Real-world projects",
      color: "text-green-400 bg-green-500/10 border-green-500/20",
      url: `https://github.com/search?q=${encodeURIComponent(stepTitle)}&type=repositories`,
    },
  ];
}

export default function Roadmap() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(null); // for resource panel

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_CONFIG.RESUME_ROADMAP, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setRoadmapData(data.roadmap || []);
        setResumeData({ skills: data.currentSkills, atsScore: data.atsScore, targetRole: data.targetRole });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = roadmapData.filter(s => s.status === "completed").length;
  const progress = roadmapData.length > 0 ? Math.round((completedCount / roadmapData.length) * 100) : 0;

  const stats = [
    { label: "Target Goal", value: resumeData?.targetRole || "Career Growth", color: "text-blue-400 bg-blue-500/5 border-blue-500/20" },
    { label: "ATS Score", value: (resumeData?.atsScore || 0) + "%", color: "text-cyan-400 bg-cyan-500/5 border-cyan-500/20" },
    { label: "Steps Done", value: `${completedCount}/${roadmapData.length}`, color: "text-purple-400 bg-purple-500/5 border-purple-500/20" },
    { label: "Progress", value: `${progress}%`, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <div className="w-16 h-16 rounded-full border-t-2 border-[#5ffbd6] animate-spin mb-4" />
        <p className="text-[#8a96c0] font-bold">Architecting your custom roadmap...</p>
      </div>
    );
  }

  const resources = activeStep ? getResources(activeStep.title) : [];

  return (
    <div className="animate-fade-in-up relative">
      {/* Learning Resources Panel — Slide-in overlay */}
      {activeStep && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setActiveStep(null)}>
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease" }}
          />
          <div
            className="relative w-full max-w-lg h-full overflow-y-auto shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #0d0f1f 0%, #12152b 100%)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              animation: "slideInRight 0.3s cubic-bezier(0.34,1.56,0.64,1)"
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="p-8 border-b border-white/5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border
                  ${activeStep.status === "completed"
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : "bg-[#7c3aed]/10 border-[#7c3aed]/20 text-[#7c3aed]"}`}>
                  <span className="material-symbols-outlined text-2xl">
                    {activeStep.status === "completed" ? "check_circle" : "auto_awesome"}
                  </span>
                </div>
                <button
                  onClick={() => setActiveStep(null)}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{activeStep.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed">{activeStep.description}</p>
              <div className="flex gap-3 mt-4">
                {activeStep.estimatedTime && (
                  <span className="text-[10px] px-3 py-1.5 rounded-full bg-white/5 text-slate-400 font-bold uppercase tracking-widest border border-white/5">
                    ⏱ {activeStep.estimatedTime}
                  </span>
                )}
                {activeStep.difficulty && (
                  <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border
                    ${activeStep.difficulty === "Beginner" ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : activeStep.difficulty === "Intermediate" ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {activeStep.difficulty}
                  </span>
                )}
              </div>
            </div>

            {/* Resources */}
            <div className="p-8">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Learning Resources</p>
              <div className="space-y-4">
                {resources.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-5 p-5 rounded-2xl border bg-white/3 hover:bg-white/8 transition-all group hover:scale-[1.02] active:scale-[0.98]"
                    style={{ borderColor: "rgba(255,255,255,0.07)" }}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 ${r.color} group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined text-xl">{r.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white group-hover:text-[#5ffbd6] transition-colors">{r.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-600 group-hover:text-white transition-colors">open_in_new</span>
                  </a>
                ))}
              </div>

              {/* Tips */}
              <div className="mt-8 p-6 rounded-2xl bg-[#7c3aed]/5 border border-[#7c3aed]/20">
                <p className="text-xs font-black uppercase tracking-widest text-[#7c3aed] mb-3">💡 Pro Tip</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Start with YouTube for a quick overview, then commit to a structured Coursera or Udemy course.
                  Practice on real GitHub projects to build your portfolio.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="mb-12">
        <h1 className="text-6xl font-headline font-extrabold text-white tracking-tighter mb-4 flex items-center gap-4">
          Personalized Roadmap <span className="text-4xl">🛣️</span>
        </h1>
        <p className="text-[#8a96c0] text-xl font-medium opacity-80">
          Generated for your goal: <span className="text-white font-bold">{resumeData?.targetRole || "Career Growth"}</span>
        </p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((s, i) => (
          <div key={i} className={`p-8 rounded-[2rem] border ${s.color} backdrop-blur-xl transition-all hover:scale-[1.03]`}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">{s.label}</p>
            <h3 className="text-2xl font-headline font-black tracking-tight truncate">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="p-10 rounded-[3rem] glass border border-white/10 mb-12 relative overflow-hidden">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-bold text-white">Path Progression</h3>
          <span className="text-3xl font-headline font-black text-[#5ffbd6]">{progress}%</span>
        </div>
        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#7c3aed] to-[#5ffbd6] rounded-full shadow-[0_0_20px_rgba(95,251,214,0.3)] transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-4 font-medium">
          {completedCount} of {roadmapData.length} steps completed · Click <span className="text-white">LEARN</span> on any step to open curated resources
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-12">
        {roadmapData.length > 0 ? roadmapData.map((step, idx) => (
          <div
            key={idx}
            className="p-6 rounded-[2rem] glass border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all hover:border-white/10"
          >
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all flex-shrink-0 ${
                step.status === "completed" ? "bg-green-500/10 border-green-500/20 text-green-400" :
                step.status === "active" || step.status === "current" ? "bg-[#7c3aed]/10 border-[#7c3aed]/20 text-[#7c3aed] animate-pulse" :
                "bg-white/5 border-white/10 text-white/20"
              }`}>
                <span className="material-symbols-outlined text-2xl font-bold">
                  {step.status === "completed" ? "check" : (step.status === "active" || step.status === "current") ? "auto_awesome" : "lock"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8a96c0] mb-1">
                  Step {idx + 1} {step.difficulty ? `• ${step.difficulty}` : ""}
                </p>
                <h4 className="text-xl font-bold text-white tracking-tight">{step.title}</h4>
                <p className="text-xs text-[#8a96c0] mt-1 max-w-xl line-clamp-1 group-hover:line-clamp-none transition-all">
                  {step.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-4 flex-shrink-0">
              {step.estimatedTime && (
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest hidden lg:block">
                  {step.estimatedTime}
                </span>
              )}
              <button
                onClick={() => {
                  if (step.status !== "locked") setActiveStep(step);
                }}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  step.status === "completed"
                    ? "bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:scale-105 cursor-pointer"
                    : step.status === "active" || step.status === "current"
                    ? "bg-white text-[#050814] hover:scale-105 shadow-lg cursor-pointer"
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
              >
                {step.status === "completed" ? "Revise" : (step.status === "active" || step.status === "current") ? "Learn" : "Locked"}
              </button>
            </div>
          </div>
        )) : (
          <div className="p-20 text-center glass rounded-[3rem] border border-dashed border-white/10">
            <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">map</span>
            <p className="text-[#8a96c0] mb-4">No roadmap generated yet.</p>
            <button
              onClick={() => navigate("/resume-analyzer")}
              className="px-8 py-3 bg-[#7c3aed] text-white rounded-2xl text-sm font-bold hover:bg-[#6d28d9] transition-all hover:scale-105"
            >
              Go to Resume Analyzer →
            </button>
          </div>
        )}
      </div>

      {/* Career Tree CTA */}
      {roadmapData.length > 0 && (
        <div
          className="p-10 rounded-[3rem] relative overflow-hidden border border-[#7c3aed]/30 mb-8"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(95,251,214,0.05) 100%)" }}
        >
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#7c3aed]/10 rounded-full blur-[60px]" />
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#5ffbd6]/5 rounded-full blur-[60px]" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-[#7c3aed] mb-3 block">
                🌌 Next Step
              </span>
              <h3 className="text-3xl font-headline font-extrabold text-white mb-2">
                Explore Your Career Orbit Tree
              </h3>
              <p className="text-slate-400 max-w-lg leading-relaxed">
                See a 3-level AI-generated visualization of all career paths available to you —
                neighboring roles, step-up positions, and your long-term strategic aspirations.
              </p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <button
                onClick={() => navigate("/career-orbit")}
                className="px-10 py-4 bg-[#7c3aed] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#6d28d9] transition-all hover:scale-105 shadow-2xl shadow-[#7c3aed]/30 flex items-center gap-3 whitespace-nowrap"
              >
                <span className="material-symbols-outlined">hub</span>
                View Career Tree
              </button>
              <button
                onClick={() => generatePDF(resumeData ? { ...resumeData, targetRole: resumeData.targetRole } : {}, user?.name || "User")}
                className="px-10 py-4 bg-gradient-to-r from-[#7c3aed] to-[#5ffbd6] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-3 whitespace-nowrap"
              >
                <span className="material-symbols-outlined">picture_as_pdf</span>
                Download Report
              </button>
              <button
                onClick={() => navigate("/job-match")}
                className="px-10 py-4 bg-white/5 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10 flex items-center gap-3 whitespace-nowrap"
              >
                <span className="material-symbols-outlined">work</span>
                Browse Job Matches
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}