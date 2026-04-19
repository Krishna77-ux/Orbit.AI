import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_CONFIG, getApiBase } from "../utils/api";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [resumeData, setResumeData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    fetchResumeData();
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${getApiBase()}/api/payment/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSubscription(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchResumeData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_CONFIG.RESUME_MY_RESUMES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.latestResume) {
          setResumeData(data.latestResume);
        } else if (Array.isArray(data) && data.length > 0) {
          setResumeData(data[0]);
        }
      }
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("pdf") && !file.name.endsWith(".pdf")) {
      setUploadMessage("❌ Please upload a PDF file only");
      setTimeout(() => setUploadMessage(""), 5000);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadMessage("❌ File size must be less than 10MB");
      setTimeout(() => setUploadMessage(""), 5000);
      return;
    }
    setUploading(true);
    setUploadProgress(10);
    setUploadMessage("Uploading resume...");
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const token = localStorage.getItem("token");
      setUploadProgress(30);
      const res = await fetch(API_CONFIG.RESUME_UPLOAD, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      setUploadProgress(70);
      const data = await res.json();
      if (res.ok) {
        setUploadProgress(100);
        setResumeData(data);
        setUploadMessage(`✅ ATS: ${data.atsScore}% | Skills: ${data.skills?.length || 0}`);
        setTimeout(() => { setUploadMessage(""); setUploadProgress(0); }, 3000);
        e.target.value = "";
      } else {
        setUploadMessage(`❌ ${data.message || "Upload failed"}`);
        setTimeout(() => setUploadMessage(""), 5000);
      }
    } catch (err) {
      setUploadMessage(`❌ ${err.message || "Connection error"}`);
      setTimeout(() => setUploadMessage(""), 5000);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const atsScore = resumeData?.atsScore ?? 0;
  const roadmapPct = resumeData?.roadmapProgress ?? 0;

  return (
    <div className="min-h-screen p-10 max-w-[1600px]">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />

      {/* Header */}
      <header className="flex justify-between items-center mb-12 animate-fade-in-up">
        <div>
          <h2 className="text-4xl font-headline font-bold text-white tracking-tighter">
            Welcome back, <span className="text-primary">{user?.name}</span>
          </h2>
          <p className="text-slate-400 font-medium mt-1">
            {resumeData
              ? `Your latest resume scored ${atsScore}%.`
              : "Upload your resume to get started."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-white/5">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="flex items-center gap-4 pl-6 border-l border-white/10">
            <div className="text-right">
              <p className="text-sm font-bold text-white">{user?.name || "Operator"}</p>
              <p className="text-[9px] text-secondary font-black uppercase tracking-widest">
                {subscription?.isPremium ? "Pro · Orbit" : "Free · Orbit"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-white font-bold text-lg">
              {(user?.name || "O")[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-8">

        {/* ATS Score Card */}
        <div className="col-span-12 lg:col-span-4 glass p-10 rounded-[3rem] relative overflow-hidden flex flex-col justify-between animate-fade-in-up animate-delay-100">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-white font-headline">ATS Score</h3>
              <span className="material-symbols-outlined text-primary">analytics</span>
            </div>
            <p className="text-xs text-slate-400 mb-8 font-medium">Your resume match rate</p>
          </div>
          <div className="flex items-end justify-between mb-4">
            <span className="text-7xl font-bold font-headline text-white tracking-tighter">
              {atsScore}<span className="text-3xl text-secondary ml-1">%</span>
            </span>
            <span className="text-[10px] font-black text-secondary bg-secondary/10 px-4 py-1.5 rounded-full mb-3 border border-secondary/20">
              {atsScore >= 80 ? "ELITE TIER" : atsScore >= 60 ? "STRONG" : "BUILDING"}
            </span>
          </div>
          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-1000"
              style={{ width: `${atsScore}%` }}
            />
          </div>
          {resumeData?.suggestions?.[0] && (
            <p className="mt-6 text-sm text-slate-400 leading-relaxed font-light italic">
              "{resumeData.suggestions[0]}"
            </p>
          )}
          {!resumeData && (
            <p className="mt-6 text-sm text-slate-400 italic">Upload your resume to see your signal strength.</p>
          )}
        </div>

        {/* Target Role / Upload Hero */}
        <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-indigo-800 to-indigo-950 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl animate-fade-in-up animate-delay-200 border border-white/5">
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="text-xs text-white/70 font-semibold mb-2 block">
                  {resumeData ? "Top Detected Skill" : "Resume Analysis"}
                </span>
                <h3 className="text-4xl font-bold font-headline leading-tight">
                  {resumeData
                    ? (resumeData.skills?.[0] || "Resume Analyzed")
                    : "Upload Your Resume"}
                </h3>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-2.5 rounded-2xl text-xs font-bold tracking-wide">
                {resumeData ? `${resumeData.skills?.length || 0} Skills` : "Get Started"}
              </div>
            </div>

            {resumeData ? (
              <div className="flex flex-wrap gap-3 mb-10">
                {resumeData.skills?.slice(0, 5).map((skill, i) => (
                  <span key={i} className="px-5 py-2 bg-black/20 rounded-xl text-xs font-semibold border border-white/10 backdrop-blur-sm hover:bg-black/30 transition-colors">
                    {skill}
                  </span>
                ))}
                {(resumeData.skills?.length || 0) > 5 && (
                  <span className="px-5 py-2 bg-secondary text-primary-container rounded-xl text-xs font-bold shadow-lg">
                    +{resumeData.skills.length - 5} MORE
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 mb-10">
                {["ATS Analysis", "Skill Detection", "Job Matching", "AI Roadmap"].map((t) => (
                  <span key={t} className="px-5 py-2 bg-black/20 rounded-xl text-xs font-semibold border border-white/10">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-auto flex items-center justify-between">
              {uploadMessage ? (
                <p className="text-sm font-semibold">{uploadMessage}</p>
              ) : (
                <p className="text-xs text-indigo-100 font-medium">
                  {resumeData ? "Your career data is live." : "PDF only · Max 10MB · Instant AI analysis"}
                </p>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                style={{ color: '#3730a3' }}
              >
                {uploading ? `${uploadProgress}%...` : resumeData ? "Re-Analyze" : "Upload PDF"}
              </button>
            </div>
            {uploading && (
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
          </div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/10 rounded-full blur-[80px]" />
          <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-[60px]" />
        </div>

        {/* Roadmap Progress */}
        <div className="col-span-12 glass p-10 rounded-[3rem] animate-fade-in-up animate-delay-300">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-bold text-white font-headline">Career Roadmap</h3>
              <p className="text-sm text-slate-400 font-medium mt-1">
                {resumeData?.targetRole ? `Path to ${resumeData.targetRole}` : "Your AI-generated career path progress"}
              </p>
            </div>
            <div className="flex items-end flex-col">
              <span className="text-4xl font-headline font-bold text-primary">{roadmapPct}%</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 mt-1">Complete</span>
            </div>
          </div>
          <div className="relative py-8">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-[3px] bg-gradient-to-r from-primary to-secondary -translate-y-1/2 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-1000"
              style={{ width: `${roadmapPct}%` }}
            />
            <div className="relative flex justify-between">
              {(resumeData?.personalizedRoadmap?.slice(0, 5) || ["Foundations", "Artifacts", "Optimization", "Engagement", "Deployment"]).map((step, i) => {
                const stepTitle = typeof step === 'string' ? step : step.title;
                const pct = (i / 4) * 100;
                const done = roadmapPct > pct;
                const active = !done && roadmapPct >= (i == 0 ? 0 : ((i - 1) / 4) * 100);
                return (
                  <div key={i} className="flex flex-col items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center z-10 border border-white/20 transition-all duration-500
                      ${done ? "bg-secondary text-primary-container shadow-xl shadow-secondary/20 scale-110"
                             : active ? "bg-primary text-white shadow-2xl shadow-primary/40 animate-pulse scale-105"
                             : "glass text-slate-400 opacity-40 hover:opacity-100 cursor-pointer"}`}
                    >
                      <span className="material-symbols-outlined text-lg" style={done ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        {done ? "check" : active ? "auto_awesome" : i === 4 ? "rocket" : "lock"}
                      </span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] text-center w-28 line-clamp-1
                      ${done ? "text-white" : active ? "text-primary" : "text-slate-500"}`}>
                      {stepTitle}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Operations */}
        <div className="col-span-12 lg:col-span-3 space-y-4 animate-fade-in-up animate-delay-400">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-6">Quick Actions</h3>
          {[
            { icon: "upload_file", label: "Analyze Resume", sub: "Scan new file", color: "text-secondary bg-secondary/10", action: () => fileInputRef.current?.click() },
            { icon: "psychology", label: "AI Tutor", sub: "Ask questions", color: "text-primary bg-primary/10", action: () => navigate("/chat-tutor") },
            { icon: "map", label: "View Roadmap", sub: "Your learning path", color: "text-slate-400 bg-slate-800", action: () => navigate("/roadmap") },
          ].map((op) => (
            <button key={op.label} onClick={op.action} className="w-full p-5 glass hover:bg-white/10 rounded-3xl flex items-center gap-5 transition-all group border border-white/5 active:scale-95 shadow-glow-sm-hover">
              <div className={`w-14 h-14 rounded-2xl ${op.color} flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                <span className="material-symbols-outlined text-2xl">{op.icon}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">{op.label}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">{op.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Capability Matrix */}
        <div className="col-span-12 lg:col-span-5 glass p-10 rounded-[3rem] animate-fade-in-up animate-delay-400">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-bold text-white font-headline">Capability Matrix</h3>
          </div>
          <div className="space-y-7">
            {(resumeData?.skills?.slice(0, 4) || ["Technical Skill 1", "Technical Skill 2", "Soft Skill 1", "Leadership"]).map((skill, i) => {
              const basePct = resumeData ? (atsScore * 0.8) + (i * 3) : 60 + (i * 10);
              const pct = Math.min(98, basePct + (Math.random() * 10));
              const colors = ["from-primary to-indigo-400", "from-secondary to-emerald-400", "from-amber-400 to-orange-500", "from-purple-400 to-pink-500"];
              return (
                <div key={skill} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span className="text-white">{skill}</span>
                    <span className="text-white/40">{Math.round(pct)}% Mastery</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
                    <div className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-1000 delay-300`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Log */}
        <div className="col-span-12 lg:col-span-4 glass p-10 rounded-[3rem] animate-fade-in-up animate-delay-400">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white font-headline">Signal Strength</h3>
            <button onClick={() => navigate("/resume-analyzer")} className="text-xs font-semibold text-primary hover:text-white transition-colors">History</button>
          </div>
          <div className="space-y-8">
            {[
              { icon: "check_circle", label: "Analysis Synced", sub: resumeData ? "Resume profile current" : "Pending upload", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
              { icon: "analytics", label: "Skills Detected", sub: resumeData ? `${resumeData.skills?.length || 0} technical signals` : "No signals detected", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
              { icon: "lightbulb", label: "AI Recommendation", sub: resumeData?.suggestions?.[0]?.slice(0, 45) + "..." || "Complete profile for insights", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
            ].map((ev) => (
              <div key={ev.label} className="flex gap-5 group items-start transition-all hover:translate-x-1">
                <div className={`w-11 h-11 rounded-2xl ${ev.color} flex-shrink-0 flex items-center justify-center border group-hover:scale-110 transition-transform ${ev.icon === 'analytics' && resumeData ? 'pulse-ring' : ''}`}>
                  <span className="material-symbols-outlined text-xl">{ev.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{ev.label}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{ev.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Subscription row */}
        {subscription && (
          <div className="col-span-12 glass p-8 rounded-[2rem] animate-fade-in-up flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Active Plan</p>
              <h3 className="text-2xl font-bold text-white font-headline">
                {subscription.subscription?.plan?.toUpperCase() || "Free"} Tier
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {subscription.resumeUploadsRemaining !== undefined
                  ? `${subscription.resumeUploadsRemaining} uploads remaining`
                  : subscription.subscription?.status}
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => navigate("/subscription")} className="btn-primary text-sm">Manage Plan</button>
              <button onClick={() => navigate("/pricing")} className="btn-secondary text-sm">View Plans</button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 flex justify-between items-center border-t border-white/5 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-white font-headline">Orbit AI</span>
          <span className="text-xs font-medium text-slate-600">© 2024</span>
        </div>
        <div className="flex gap-10">
          {["Privacy", "Terms"].map((l) => (
            <span key={l} className="text-xs font-medium text-slate-500 hover:text-white transition-colors cursor-pointer">{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}