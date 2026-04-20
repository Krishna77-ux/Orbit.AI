import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { API_CONFIG } from "../utils/api";

const DEFAULT_JOBS = [
  { title: "Full Stack Developer", match: 86, ats: 75, desc: "Building scalable web architectures with React and Node.js.", color: "border-green-500/30 bg-green-500/5", matchColor: "text-green-400" },
  { title: "Frontend Developer", match: 63, ats: 70, desc: "Crafting beautiful interfaces with modern web technologies.", color: "border-yellow-500/30 bg-yellow-500/5", matchColor: "text-yellow-400" },
];

export default function Jobs() {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missingSkills, setMissingSkills] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch latest resume data for the stats
      const resumeRes = await fetch(API_CONFIG.RESUME_MY_RESUMES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resumeRes.ok) {
        const resumeData = await resumeRes.json();
        if (resumeData.latestResume) {
          setResumeData(resumeData.latestResume);
        }
      }

      // Fetch dynamic AI jobs
      const jobsRes = await fetch(API_CONFIG.RESUME_JOBS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.jobs || []);
        setMissingSkills(data.missingSkills || []);
      }
    } catch (err) {
      console.error("❌ Job Fetch Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const atsScore = resumeData?.atsScore || 0;
  const avgMatch = jobs.length ? Math.round(jobs.reduce((acc, j) => acc + (j.skillMatchPercentage || 0), 0) / jobs.length) : atsScore;

  const stats = [
    { label: "Total Matches", value: jobs.length, color: "bg-blue-600/10 border-blue-500/20 text-blue-400" },
    { label: "Average Match", value: avgMatch + "%", color: "bg-green-600/10 border-green-500/20 text-green-400" },
    { label: "Your ATS", value: atsScore + "%", color: "bg-purple-600/10 border-purple-500/20 text-purple-400" },
    { label: "Skills Gap", value: missingSkills.length, color: "bg-orange-600/10 border-orange-500/20 text-orange-400" },
  ];

  const suggestedSkills = missingSkills;

  return (
    <div className="animate-fade-in-up">
      <header className="mb-12">
        <h1 className="text-6xl font-headline font-extrabold text-white tracking-tighter mb-4 flex items-center gap-4">
          Perfect Job Matches <span className="text-4xl">💼</span>
        </h1>
        <p className="text-[#8a96c0] text-xl font-medium opacity-80">
          Discover {jobs.length} opportunities tailored to your profile
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((s, i) => (
          <div key={i} className={`p-8 rounded-[2rem] border ${s.color} backdrop-blur-xl`}>
             <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">{s.label}</p>
             <h3 className="text-5xl font-headline font-black tracking-tighter">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-4">
           <span className="text-xs font-bold text-[#8a96c0] uppercase tracking-widest">Sort By:</span>
           <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-primary">
              <option>Best Match</option>
              <option>Highest ATS</option>
           </select>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <span className="text-xs font-bold text-[#8a96c0] uppercase tracking-widest">Skills to Develop:</span>
           {suggestedSkills.map((s, i) => (
             <span key={i} className="px-4 py-1.5 rounded-full bg-orange-500/5 border border-orange-500/20 text-xs font-bold text-orange-400/80">
               {s}
             </span>
           ))}
        </div>
      </div>

      {/* Simplified Job List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {jobs.map((j, i) => (
          <div key={i} className={`p-10 rounded-[3rem] glass border ${j.color || "border-white/10"} relative overflow-hidden group hover:scale-[1.02] transition-all duration-500`}>
             <div className="flex justify-between items-start mb-8">
                <div className="flex gap-3">
                   <div className="px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-black text-green-400 uppercase tracking-widest">
                      {j.skillMatchPercentage}% Match
                   </div>
                   <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                      {atsScore}+ ATS
                   </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                   <span className="material-symbols-outlined text-yellow-400 text-xl">lightbulb</span>
                </div>
             </div>
             <h3 className="text-3xl font-headline font-bold text-white mb-3">{j.title}</h3>
             <p className="text-[#8a96c0] font-medium mb-12">{j.description || j.desc}</p>
             <button 
                onClick={() => j.applyLink && window.open(j.applyLink, "_blank")}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
             >
                View Career Page
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}