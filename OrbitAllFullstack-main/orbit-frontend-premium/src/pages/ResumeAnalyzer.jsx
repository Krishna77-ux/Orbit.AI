import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_CONFIG } from "../utils/api";
import PathSelection from "../components/PathSelection";

export default function ResumeAnalyzer() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [resumeData, setResumeData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [showPathSelection, setShowPathSelection] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  useEffect(() => { fetchResumeData(); }, []);

  const fetchResumeData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_CONFIG.RESUME_MY_RESUMES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.latestResume) setResumeData(data.latestResume);
        else if (data.length > 0) setResumeData(data[0]);
      }
    } catch (e) { console.error(e); }
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.includes("pdf") && !file.name.endsWith(".pdf")) {
      setUploadMessage("❌ Please upload a PDF file only");
      setTimeout(() => setUploadMessage(""), 4000);
      return;
    }
    setUploading(true);
    setUploadProgress(15);
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const token = localStorage.getItem("token");
      setUploadProgress(40);
      const res = await fetch(API_CONFIG.RESUME_UPLOAD, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      setUploadProgress(80);
      const data = await res.json();
      if (res.ok) {
        setUploadProgress(100);
        setResumeData(data);
        setUploadMessage("✅ Analysis complete!");
        setTimeout(() => {
          setUploadMessage("");
          setShowPathSelection(true);
        }, 1500);
      } else {
        setUploadMessage(`❌ ${data.message || "Upload failed"}`);
        setTimeout(() => setUploadMessage(""), 4000);
      }
    } catch (err) {
      setUploadMessage(`❌ Connection error`);
      setTimeout(() => setUploadMessage(""), 4000);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSelectPath = async (targetRole) => {
    setGeneratingRoadmap(true);
    console.log("🚀 Path selection triggered for role:", targetRole);
    console.log("🔗 URL:", API_CONFIG.RESUME_SET_TARGET_ROLE);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_CONFIG.RESUME_SET_TARGET_ROLE, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ targetRole }),
      });
      if (res.ok) {
        navigate("/roadmap");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to generate roadmap");
      }
    } catch (err) {
      alert("Connection error occurred while building roadmap");
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  if (showPathSelection) {
    return <PathSelection onSelect={handleSelectPath} loading={generatingRoadmap} trackMatches={resumeData?.trackMatches || []} />;
  }

  return (
    <div className="animate-fade-in-up">
      <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />

      <header className="mb-12">
        <h1 className="text-6xl font-headline font-extrabold text-[#22d3ee] tracking-tighter mb-4 flex items-center gap-4">
          Resume Analyzer <span className="text-4xl">📄</span>
        </h1>
        <p className="text-[#8a96c0] text-xl font-medium opacity-80">
          Upload your resume and get AI-powered recommendations to boost your ATS score
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Upload Area */}
        <div className="flex flex-col gap-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
            className={`p-10 md:py-24 rounded-[3rem] glass border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
              dragging ? "border-[#5ffbd6] bg-[#5ffbd6]/5 scale-[1.02]" : "border-[#7c3aed]/30 hover:border-[#5ffbd6]/50 hover:bg-white/5"
            }`}
          >
             <div className="w-20 h-20 rounded-3xl bg-[#7c3aed]/20 flex items-center justify-center mb-8 shadow-glow-sm group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[#7c3aed] text-4xl">cloud_upload</span>
             </div>
             <h3 className="text-3xl font-headline font-bold text-white mb-2">Drop your PDF here</h3>
             <p className="text-[#8a96c0] font-medium">or click to browse</p>
          </div>

          <button 
             onClick={() => fileInputRef.current?.click()}
             disabled={uploading}
             className="w-full py-5 rounded-[2rem] bg-white/5 border border-white/10 text-[#8a96c0] font-bold hover:bg-white/10 hover:text-white transition-all uppercase tracking-[0.2em] text-xs"
          >
             {uploading ? `Analyzing ${uploadProgress}%...` : "Analyze Resume"}
          </button>
          
          {uploadMessage && (
            <p className="text-center font-bold text-sm" style={{ color: uploadMessage.includes("❌") ? "#ef4444" : "#5ffbd6" }}>
              {uploadMessage}
            </p>
          )}
        </div>

        {/* Right: Results / Placeholder */}
        <div className="rounded-[3rem] glass border border-white/5 p-12 min-h-[400px] flex flex-col items-center justify-center text-center">
          {resumeData ? (
             <div className="w-full animate-fade-in-up text-left">
                <div className="flex justify-between items-center mb-10">
                   <div className="text-left">
                      <h3 className="text-3xl font-headline font-bold text-white mb-1">ATS Score</h3>
                      <p className="text-[#8a96c0] font-medium">Performance Metrics</p>
                   </div>
                   <div className="w-24 h-24 rounded-full border-4 border-[#5ffbd6]/20 flex items-center justify-center">
                      <span className="text-3xl font-headline font-black text-[#5ffbd6]">{resumeData.atsScore || resumeData.readinessScore}%</span>
                   </div>
                </div>
                
                <div className="space-y-6">
                   <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/20">
                      <h4 className="text-green-400 font-bold mb-2 uppercase tracking-widest text-[10px]">Strengths</h4>
                      <p className="text-sm text-white/80 leading-relaxed font-medium">
                         {resumeData.strengths?.[0] || "Found strong technical skills in React and Systems Design."}
                      </p>
                   </div>
                   <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/20">
                      <h4 className="text-orange-400 font-bold mb-2 uppercase tracking-widest text-[10px]">Improvement Area</h4>
                      <p className="text-sm text-white/80 leading-relaxed font-medium">
                         {resumeData.suggestions?.[0] || "Consider adding more measurable impact metrics for your projects."}
                      </p>
                   </div>
                </div>

                <div className="mt-10">
                   <button 
                     onClick={() => setShowPathSelection(true)}
                     className="w-full py-4 rounded-xl bg-[#5ffbd6]/10 text-[#5ffbd6] border border-[#5ffbd6]/20 font-bold text-xs uppercase tracking-widest hover:bg-[#5ffbd6] hover:text-[#050814] transition-all"
                   >
                     Update Career Goal
                   </button>
                </div>
             </div>
          ) : (
            <div className="opacity-40">
               <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center">
                  <span className="material-symbols-outlined text-7xl">assignment</span>
               </div>
               <p className="text-xl font-medium text-[#8a96c0]">Upload a resume to see analysis results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}