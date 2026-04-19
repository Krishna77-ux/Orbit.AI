import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_CONFIG } from "../utils/api";

export default function ChatTutor() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm Orbit, your personalized career navigator. I've analyzed your current profile and roadmap. How can I help you accelerate your journey today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchResumeData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchResumeData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_CONFIG.RESUME_MY_RESUMES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setResumeData(data[0]);
      }
    } catch (e) { console.error(e); }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_CONFIG.TUTOR_CHAT || `${API_CONFIG.BASE_URL}/api/tutor/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, resumeData }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "ai", text: data.reply || data.message || "I'm processing your query..." }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: "I encountered a signal error. Please try again." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Connection lost. Please check your network and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const suggestions = [
    { icon: "bar_chart", title: "Top skills for Data Science?", sub: "Contextual Suggestion" },
    { icon: "description", title: "Improve my ATS score?", sub: "Optimization Protocol" },
    { icon: "lightbulb", title: "Project for my resume?", sub: "Portfolio Builder" },
  ];

  return (
    <div className="flex h-screen bg-background text-on-surface overflow-hidden">
      {/* ── Main Chat Area ── */}
      <section className="flex-1 flex flex-col min-w-0 relative">
        {/* Decoration glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-24 right-24 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Chat header */}
        <header className="px-8 py-6 flex items-center justify-between z-10 border-b border-white/5">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center shadow-2xl shadow-primary/20 animate-float">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <div>
              <h1 className="font-headline font-bold text-2xl text-white tracking-tighter">Orbit AI Career Tutor</h1>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#10b981]" />
                Neural Engine Active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <span className="material-symbols-outlined text-xl">history</span>
            </button>
            <button className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <span className="material-symbols-outlined text-xl">more_vert</span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-thin z-10">
          {/* Date separator */}
          <div className="flex justify-center">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 py-2 px-5 glass rounded-full">
              SYSTEM LOG: TODAY
            </span>
          </div>

          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-5 max-w-4xl animate-fade-in-up ${msg.role === "user" ? "flex-row-reverse ml-auto" : ""}`}>
              <div className={`w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center border
                ${msg.role === "ai" ? "bg-primary/20 border-primary/30" : "bg-secondary/10 border-secondary/30"}`}>
                <span className="material-symbols-outlined text-xl"
                  /* @ts-ignore */
                  style={{ color: msg.role === "ai" ? "#6366f1" : "#10b981", fontVariationSettings: "'FILL' 1" }}>
                  {msg.role === "ai" ? "smart_toy" : "person"}
                </span>
              </div>
              <div className={`p-6 rounded-3xl max-w-2xl ${msg.role === "ai" ? "ai-bubble rounded-tl-none" : "user-bubble rounded-tr-none"}`}>
                <p className="text-base leading-relaxed font-body" style={{ color: msg.role === "ai" ? "#cbd5e1" : "#ecfdf5" }}>
                  {msg.text}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-start gap-5 max-w-4xl animate-fade-in-up">
              <div className="w-11 h-11 rounded-2xl bg-primary/20 border border-primary/30 flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div className="ai-bubble p-6 rounded-3xl rounded-tl-none">
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {/* Suggestion chips — show only when no messages beyond greeting */}
          {messages.length === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4 animate-fade-in-up animate-delay-300">
              {suggestions.map((s) => (
                <button key={s.title} onClick={() => { setInput(s.title); inputRef.current?.focus(); }}
                  className="glass p-5 rounded-3xl hover:bg-white/5 transition-all text-left border-white/5 group relative overflow-hidden">
                  <span className="material-symbols-outlined text-secondary mb-3 block group-hover:scale-110 transition-transform">{s.icon}</span>
                  <p className="text-sm font-bold text-white mb-1">{s.title}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-black">{s.sub}</p>
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-8 py-6 z-20 border-t border-white/5">
          <div className="relative flex items-center glass rounded-3xl p-3 glow-input transition-all duration-300">
            <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-sm font-medium text-white placeholder-slate-500 outline-none"
              placeholder="Ask Orbit anything about your career..."
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-br from-primary to-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all border border-white/10 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-2xl">send</span>
            </button>
          </div>
          <p className="text-center text-[9px] text-slate-500 mt-3 font-black uppercase tracking-[0.4em]">
            Powered by Orbit AI Engine v4.2 • Core v4.0.2
          </p>
        </div>
      </section>

      {/* ── Right Resource Panel ── */}
      <aside className="hidden xl:flex flex-col w-80 p-8 glass-dark z-40 border-l border-white/5">
        <div className="mb-10">
          <h3 className="font-headline font-bold text-xl text-white mb-2 tracking-tight">Telemetry Data</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Contextual Resources</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-10 scrollbar-thin pr-2">
          {/* Resource links */}
          <div>
            <h4 className="text-[9px] font-black text-secondary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />Protocols
            </h4>
            <div className="space-y-4">
              {[
                { icon: "school", label: "Python for Data Analysis", sub: "COURSERA.PROTO", color: "bg-primary/10 text-primary border-primary/20" },
                { icon: "library_books", label: "Stats for ML: Deep Dive", sub: "INTERACTIVE.GUIDE", color: "bg-secondary/10 text-secondary border-secondary/20" },
              ].map((r) => (
                <a key={r.label} href="#" className="flex items-center gap-4 p-4 glass rounded-2xl hover:bg-white/5 transition-all group border border-white/5">
                  <div className={`w-12 h-12 rounded-xl ${r.color} flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-all border`}>
                    <span className="material-symbols-outlined text-xl">{r.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{r.label}</p>
                    <p className="text-[10px] text-slate-500 font-semibold tracking-wider mt-0.5">{r.sub}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-600 text-sm group-hover:text-white transition-colors">open_in_new</span>
                </a>
              ))}
            </div>
          </div>

          {/* ATS match card */}
          {resumeData && (
            <div className="bg-gradient-to-br from-primary/20 to-indigo-900/40 p-6 rounded-[2.5rem] text-white relative overflow-hidden border border-white/10">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Neural Match</span>
                </div>
                <div className="flex items-end justify-between mb-4">
                  <span className="text-3xl font-bold font-headline tracking-tighter text-white">
                    {resumeData.atsScore}<span className="text-sm text-secondary ml-0.5">%</span>
                  </span>
                  <span className="text-[9px] font-black text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20 uppercase tracking-widest">ATS Score</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-4">
                  <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
                    style={{ width: `${resumeData.atsScore}%` }} />
                </div>
                {resumeData.suggestions?.[0] && (
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    {resumeData.suggestions[0].slice(0, 80)}...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Roadmap sync */}
          <div>
            <h4 className="text-[9px] font-black text-secondary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />Roadmap Sync
            </h4>
            <div className="border-l border-white/10 ml-4 space-y-8">
              {[
                { label: "Master Pandas & NumPy", eta: "ETA: 7 DAYS", active: true },
                { label: "Build Portfolio Project #1", eta: "ETA: 14 DAYS", active: false },
              ].map((step) => (
                <div key={step.label} className="relative pl-8">
                  <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ${step.active ? "bg-secondary shadow-[0_0_10px_#10b981]" : "bg-slate-700"}`} />
                  <p className={`text-xs font-bold mb-1 ${step.active ? "text-white" : "text-slate-400"}`}>{step.label}</p>
                  <p className={`text-[10px] font-semibold tracking-wider ${step.active ? "text-slate-500" : "text-slate-600"}`}>{step.eta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
