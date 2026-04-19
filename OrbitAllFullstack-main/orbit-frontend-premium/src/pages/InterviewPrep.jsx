import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../utils/api";

const CATEGORIES = ["All", "Behavioral", "Technical", "Situational", "Role-Specific"];

export default function InterviewPrep() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [userAnswer, setUserAnswer] = useState("");
  const [answered, setAnswered] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_CONFIG.BASE_URL}/resume/interview-prep`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      } else {
        const d = await res.json();
        setError(d.message || "Failed to load questions");
      }
    } catch (e) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeCategory === "All"
    ? questions
    : questions.filter(q => q.category === activeCategory);

  const current = filtered[currentIdx];
  const progress = filtered.length > 0 ? Math.round(((currentIdx + 1) / filtered.length) * 100) : 0;

  const handleNext = () => {
    setShowAnswer(false);
    setUserAnswer("");
    setCurrentIdx(i => Math.min(i + 1, filtered.length - 1));
  };

  const handlePrev = () => {
    setShowAnswer(false);
    setUserAnswer("");
    setCurrentIdx(i => Math.max(i - 1, 0));
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentIdx(0);
    setShowAnswer(false);
    setUserAnswer("");
  };

  const DIFF_COLOR = {
    Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    Hard: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  const CAT_COLOR = {
    Behavioral: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    Technical: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    Situational: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    "Role-Specific": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 rounded-full border-t-2 border-[#5ffbd6] animate-spin mb-6" />
      <p className="text-[#8a96c0] font-bold text-lg">AI is crafting your interview questions...</p>
      <p className="text-slate-600 text-sm mt-2">Analyzing your resume & target role</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <span className="material-symbols-outlined text-5xl text-slate-600 mb-4">error</span>
      <p className="text-white font-bold mb-2">Couldn't load questions</p>
      <p className="text-slate-400 text-sm mb-6">{error}</p>
      <div className="flex gap-3">
        <button onClick={fetchQuestions} className="px-6 py-3 bg-[#7c3aed] text-white rounded-2xl text-sm font-bold hover:bg-[#6d28d9] transition-all">Retry</button>
        <button onClick={() => navigate("/resume-analyzer")} className="px-6 py-3 bg-white/5 text-white rounded-2xl text-sm font-bold hover:bg-white/10 transition-all border border-white/10">Upload Resume First</button>
      </div>
    </div>
  );

  if (questions.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <span className="material-symbols-outlined text-5xl text-slate-600 mb-4">quiz</span>
      <p className="text-white font-bold mb-2">No questions generated yet</p>
      <p className="text-slate-400 text-sm mb-6">Upload your resume first to get personalized interview questions</p>
      <button onClick={() => navigate("/resume-analyzer")} className="px-6 py-3 bg-[#7c3aed] text-white rounded-2xl text-sm font-bold hover:scale-105 transition-all">Go to Resume Analyzer</button>
    </div>
  );

  return (
    <div className="animate-fade-in-up max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-5xl font-headline font-extrabold text-white tracking-tighter mb-3 flex items-center gap-4">
          Interview Prep <span className="text-4xl">🎯</span>
        </h1>
        <p className="text-[#8a96c0] text-lg">
          {questions.length} AI-generated questions personalized for your profile
        </p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Questions", value: questions.length, icon: "quiz" },
          { label: "Answered", value: Object.keys(answered).length, icon: "check_circle" },
          { label: "Progress", value: `${progress}%`, icon: "trending_up" },
        ].map((s, i) => (
          <div key={i} className="p-6 glass rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#7c3aed] text-lg">{s.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
              activeCategory === cat
                ? "bg-[#7c3aed] text-white border-[#7c3aed] shadow-lg shadow-[#7c3aed]/20"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-gradient-to-r from-[#7c3aed] to-[#5ffbd6] rounded-full transition-all duration-500"
          style={{ width: `${((currentIdx + 1) / filtered.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      {current && (
        <div className="mb-6">
          {/* Card */}
          <div
            className="p-10 rounded-[2.5rem] border border-white/8 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(13,15,31,0.95) 100%)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#7c3aed]/5 rounded-full blur-[60px]" />

            {/* Tags */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border ${CAT_COLOR[current.category] || "text-slate-400 bg-white/5 border-white/10"}`}>
                {current.category}
              </span>
              {current.difficulty && (
                <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border ${DIFF_COLOR[current.difficulty] || "text-slate-400 bg-white/5 border-white/10"}`}>
                  {current.difficulty}
                </span>
              )}
              <span className="text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border border-white/10 text-slate-500 ml-auto">
                {currentIdx + 1} / {filtered.length}
              </span>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed relative z-10">
              {current.question}
            </h2>

            {/* User answer textarea */}
            {!showAnswer && (
              <div className="mb-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">
                  Your Answer (optional — practice writing it)
                </label>
                <textarea
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here before revealing the model answer..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#7c3aed]/50 focus:bg-white/8 transition-all resize-none"
                />
              </div>
            )}

            {/* Model Answer */}
            {showAnswer && (
              <div className="mb-6 p-6 rounded-2xl bg-[#5ffbd6]/5 border border-[#5ffbd6]/20 animate-fade-in-up">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#5ffbd6] mb-3">✨ Model Answer</p>
                <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">{current.answer}</p>
                {current.tips && (
                  <div className="mt-4 pt-4 border-t border-[#5ffbd6]/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">💡 Tips</p>
                    <p className="text-slate-400 text-xs leading-relaxed">{current.tips}</p>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-4 flex-wrap">
              {!showAnswer ? (
                <button
                  onClick={() => { setShowAnswer(true); setAnswered(a => ({ ...a, [currentIdx]: true })); }}
                  className="px-8 py-3 bg-[#7c3aed] text-white rounded-2xl text-sm font-bold hover:bg-[#6d28d9] transition-all hover:scale-105 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">visibility</span>
                  Reveal Answer
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowAnswer(false); setUserAnswer(""); }}
                    className="px-6 py-3 bg-white/5 text-white rounded-2xl text-sm font-bold hover:bg-white/10 transition-all border border-white/10"
                  >
                    Re-attempt
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="px-6 py-3 glass rounded-2xl text-sm font-bold text-slate-400 hover:text-white transition-all border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Previous
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {filtered.slice(Math.max(0, currentIdx - 2), currentIdx + 3).map((_, i) => {
                const realIdx = Math.max(0, currentIdx - 2) + i;
                return (
                  <button
                    key={realIdx}
                    onClick={() => { setCurrentIdx(realIdx); setShowAnswer(false); setUserAnswer(""); }}
                    className={`rounded-full transition-all ${
                      realIdx === currentIdx ? "w-6 h-3 bg-[#7c3aed]" : answered[realIdx] ? "w-3 h-3 bg-[#5ffbd6]/50" : "w-3 h-3 bg-white/15"
                    }`}
                  />
                );
              })}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIdx === filtered.length - 1}
              className="px-6 py-3 bg-[#7c3aed] rounded-2xl text-sm font-bold text-white transition-all hover:bg-[#6d28d9] hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Refresh */}
      <div className="text-center mt-4">
        <button
          onClick={fetchQuestions}
          className="text-xs text-slate-500 hover:text-white transition-colors font-bold flex items-center gap-2 mx-auto"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Generate New Questions
        </button>
      </div>
    </div>
  );
}
