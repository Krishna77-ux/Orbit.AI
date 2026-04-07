import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { API_CONFIG } from "../utils/api";

export default function Roadmap() {
  const { user } = useContext(AuthContext);
  const [roadmapData, setRoadmapData] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setResumeData({
          skills: data.currentSkills,
          atsScore: data.atsScore,
          targetRole: data.targetRole
        });
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
    { label: "Target Goal", value: resumeData?.targetRole || "Software Engineer", color: "text-blue-400 bg-blue-500/5 border-blue-500/20" },
    { label: "ATS Score", value: (resumeData?.atsScore || 0) + "%", color: "text-cyan-400 bg-cyan-500/5 border-cyan-500/20" },
    { label: "Steps Done", value: `${completedCount}/${roadmapData.length}`, color: "text-purple-400 bg-purple-500/5 border-purple-500/20" },
    { label: "Est. Time", value: roadmapData[0]?.estimatedTime || "Ready", color: "text-orange-400 bg-orange-500/5 border-orange-500/20" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <div className="w-16 h-16 rounded-full border-t-2 border-[#5ffbd6] animate-spin mb-4" />
        <p className="text-[#8a96c0] font-bold">Architecting your custom roadmap...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <header className="mb-12">
        <h1 className="text-6xl font-headline font-extrabold text-white tracking-tighter mb-4 flex items-center gap-4">
          Personalized Roadmap <span className="text-4xl">🛣️</span>
        </h1>
        <p className="text-[#8a96c0] text-xl font-medium opacity-80">
          Generated for your goal: <span className="text-white font-bold">{resumeData?.targetRole || "Career Growth"}</span>
        </p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((s, i) => (
          <div key={i} className={`p-8 rounded-[2rem] border ${s.color} backdrop-blur-xl transition-all hover:scale-[1.03]`}>
             <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">{s.label}</p>
             <h3 className="text-2xl font-headline font-black tracking-tight truncate">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Progress Bar Container */}
      <div className="p-10 rounded-[3rem] glass border border-white/10 mb-12 relative overflow-hidden">
        <div className="flex justify-between items-end mb-6">
           <h3 className="text-2xl font-bold text-white">Path Progression</h3>
           <span className="text-3xl font-headline font-black text-[#5ffbd6]">{progress}%</span>
        </div>
        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
           <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#5ffbd6] rounded-full shadow-[0_0_20px_rgba(95,251,214,0.3)] transition-all duration-1000"
                style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-6">
        {roadmapData.length > 0 ? roadmapData.map((step, idx) => (
          <div key={idx} className="p-8 rounded-[2.5rem] glass border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
             <div className="flex items-center gap-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                   step.status === "completed" ? "bg-green-500/10 border-green-500/20 text-green-400" :
                   step.status === "active" ? "bg-[#7c3aed]/10 border-[#7c3aed]/20 text-[#7c3aed] animate-pulse" :
                   "bg-white/5 border-white/10 text-white/20"
                }`}>
                   <span className="material-symbols-outlined text-2xl font-bold">
                      {step.status === "completed" ? "check" : step.status === "active" ? "auto_awesome" : "lock"}
                   </span>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8a96c0] mb-1">Step {idx + 1} • {step.difficulty || "Skill"}</p>
                   <h4 className="text-2xl font-bold text-white tracking-tight">{step.title}</h4>
                   <p className="text-xs text-[#8a96c0] mt-1 max-w-xl line-clamp-1 group-hover:line-clamp-none transition-all">{step.description}</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
               {step.estimatedTime && <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{step.estimatedTime}</span>}
               <button className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  step.status === "completed" ? "bg-green-500/10 text-green-400" :
                  step.status === "active" ? "bg-white text-[#050814] hover:scale-105" :
                  "bg-white/5 text-white/20 cursor-not-allowed"
               }`}>
                  {step.status === "completed" ? "Revise" : step.status === "active" ? "Learn" : "Locked"}
               </button>
             </div>
          </div>
        )) : (
          <div className="p-20 text-center glass rounded-[3rem] border border-dashed border-white/10">
            <p className="text-[#8a96c0]">No roadmap generated yet. Choose a career goal in the analyzer!</p>
          </div>
        )}
      </div>
    </div>
  );
}