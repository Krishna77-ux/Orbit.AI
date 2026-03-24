import { useState, useEffect, useContext, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_CONFIG, getApiBase } from "../utils/api";
import SoftBackground from "../components/SoftBackground";
import MorphingCard from "../components/MorphingCard";
import InteractiveButton from "../components/InteractiveButton";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [resumeData, setResumeData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    fetchResumeData();
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${getApiBase()}/api/payment/subscription`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fetchResumeData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_CONFIG.RESUME_MY_RESUMES, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setResumeData(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching resume data:", error);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      setUploadMessage("");
      return;
    }

    // Validation
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
    setUploadMessage("📤 Uploading your resume...");
    
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setUploadMessage("❌ Please login again");
        setTimeout(() => setUploadMessage(""), 5000);
        setUploading(false);
        return;
      }

      setUploadProgress(30);
      console.log("Uploading resume:", file.name);
      
      const response = await fetch(API_CONFIG.RESUME_UPLOAD, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setUploadProgress(70);
      const data = await response.json();
      
      if (response.ok) {
        setUploadProgress(100);
        setResumeData(data);
        setUploadMessage(`✅ Resume analyzed! ATS: ${data.atsScore}% | Skills: ${data.skills?.length || 0}`);
        
        setTimeout(() => {
          setUploadMessage("");
          setUploadProgress(0);
        }, 3000);
        
        // Reset file input
        event.target.value = "";
      } else {
        console.error("Upload failed:", data);
        setUploadMessage(`❌ ${data.message || "Upload failed"}`);
        setTimeout(() => setUploadMessage(""), 5000);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadMessage(`❌ ${error.message || "Connection error"}`);
      setTimeout(() => setUploadMessage(""), 5000);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, type: "spring" },
    },
  };

  return (
    <div className="min-h-screen relative text-white">
      <SoftBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <header className="mb-14">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Welcome back, <span className="brand-gradient">{user?.name || "Navigator"}</span>
          </h1>
          <p className="mt-2 text-lg text-white/70">
            Your AI-powered career companion is ready to guide you forward.
          </p>
        </header>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="text-6xl font-black mb-4 welcome-text">
            Welcome Back, {user?.name || "Navigator"} 🌟
          </h1>
          <p className="text-xl text-gray-300 font-light">
            Your AI-powered career companion is ready to guide you forward
          </p>
        </motion.div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          <MorphingCard
            icon="📊"
            title="ATS Score"
            value={resumeData?.atsScore ? `${resumeData.atsScore}%` : "0%"}
            gradient={["#667eea", "#764ba2", "#f093fb", "#4facfe"]}
            delay={0}
          />
          <MorphingCard
            icon="🎯"
            title="Roadmap Progress"
            value={resumeData?.roadmapProgress ? `${resumeData.roadmapProgress}%` : "0%"}
            gradient={["#f093fb", "#f5576c", "#4facfe", "#00f2fe"]}
            delay={0.1}
          />
          <MorphingCard
            icon="💼"
            title="Jobs Matched"
            value={resumeData?.jobsMatched || 0}
            gradient={["#4facfe", "#00f2fe", "#667eea", "#764ba2"]}
            delay={0.2}
          />
        </motion.div>

        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-10 rounded-3xl mb-16 shadow-soft"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-300 uppercase tracking-wide">Subscription</p>
                <h2 className="text-3xl font-bold text-white">
                  {subscription.subscription?.plan?.toUpperCase() || "Free"}
                </h2>
                <p className="text-sm text-gray-400">
                  {subscription.subscription?.status
                    ? subscription.subscription.status.charAt(0).toUpperCase() + subscription.subscription.status.slice(1)
                    : "Inactive"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-300">Uploads Remaining</p>
                <p className="text-3xl font-bold text-white">
                  {typeof subscription.resumeUploadsRemaining === "number"
                    ? subscription.resumeUploadsRemaining
                    : "—"}
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs text-gray-300 uppercase tracking-wide">Plan Features</p>
                <ul className="mt-3 space-y-2 text-sm text-gray-200">
                  {subscription.subscription?.plan_details?.features?.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-300">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs text-gray-300 uppercase tracking-wide">Renewal Date</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatDate(subscription.subscription?.currentPeriodEnd)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs text-gray-300 uppercase tracking-wide">Next Step</p>
                <p className="mt-2 text-sm text-gray-200">
                  {subscription.isPremium
                    ? "Change your plan or manage uploads in the subscription portal."
                    : "Subscribe to unlock uploads and advanced features."}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row gap-4">
              <button
                onClick={() => navigate("/subscription")}
                className="btn-primary w-full md:w-auto"
              >
                Manage Subscription
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="btn-secondary w-full md:w-auto"
              >
                View Plans
              </button>
            </div>
          </motion.div>
        )}

        {/* Upload Section */}
        {!resumeData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-12 rounded-3xl mb-16 shadow-soft"
          >
            <div className="text-center">
              <motion.div
                animate={uploading ? { scale: 1.1 } : { scale: 1 }}
                className="text-6xl mb-6"
              >
                📄
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Upload Your Resume
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Let our AI analyze your resume and provide personalized career insights
              </p>

              {/* Upload Button */}
              <button
                onClick={handleUploadClick}
                disabled={uploading}
                className={`
                  relative inline-block px-10 py-4 rounded-2xl font-bold text-lg
                  transition-all duration-300 transform
                  ${uploading ? "opacity-50 cursor-not-allowed" : "hover:scale-105 cursor-pointer"}
                  bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600
                  hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500
                  text-white shadow-lg hover:shadow-2xl
                  border border-cyan-400 hover:border-cyan-300
                `}
              >
                <motion.span
                  animate={uploading ? { opacity: [1, 0.5, 1] } : {}}
                  transition={{ duration: 1.5, repeat: uploading ? Infinity : 0 }}
                >
                  {uploading ? `⏳ Uploading... ${uploadProgress}%` : "📤 Upload PDF Resume"}
                </motion.span>
              </button>

              {/* Progress Bar */}
              {uploading && uploadProgress > 0 && (
                <motion.div className="mt-6">
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Upload Message */}
              {uploadMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl bg-opacity-20 bg-blue-500"
                >
                  <p className="text-white font-semibold">{uploadMessage}</p>
                </motion.div>
              )}

              {/* File Type Info */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-opacity-10 bg-cyan-500">
                  <p className="text-sm text-cyan-300">📋 PDF Format</p>
                  <p className="text-xs text-gray-400">Works best with PDF</p>
                </div>
                <div className="p-4 rounded-lg bg-opacity-10 bg-blue-500">
                  <p className="text-sm text-blue-300">📊 Max 10MB</p>
                  <p className="text-xs text-gray-400">Keep file size optimal</p>
                </div>
                <div className="p-4 rounded-lg bg-opacity-10 bg-purple-500">
                  <p className="text-sm text-purple-300">⚡ AI Analysis</p>
                  <p className="text-xs text-gray-400">Instant skill detection</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* After Upload - Analysis Section */}
        {resumeData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass p-10 rounded-3xl mb-16 shadow-soft"
          >
            <h2 className="text-3xl font-bold text-white mb-6">✨ Resume Analysis Complete</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-xl bg-opacity-10 bg-green-500">
                <p className="text-green-300 text-sm font-semibold">TOP SKILLS DETECTED</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {resumeData.skills?.slice(0, 5).map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-green-500 bg-opacity-20 text-green-300 text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="p-6 rounded-xl bg-opacity-10 bg-blue-500">
                <p className="text-blue-300 text-sm font-semibold">KEY RECOMMENDATIONS</p>
                <ul className="mt-4 space-y-2">
                  {resumeData.suggestions?.slice(0, 3).map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start">
                      <span className="text-blue-400 mr-2">→</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => navigate("/resume-analyzer")}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-white font-bold transition-all"
            >
              📈 View Detailed Analysis
            </button>
          </motion.div>
        )}

        {/* Next Steps Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          className="glass p-10 rounded-3xl mb-16 shadow-soft"
        >
          <h2 className="text-3xl font-bold text-white mb-8">🚀 Explore Your Career Path</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              icon="🛣️"
              title="Roadmap"
              subtitle="Build your growth path"
              onClick={() => navigate("/roadmap")}
              delay={0}
            />
            <QuickActionCard
              icon="💬"
              title="Chat Tutor"
              subtitle="AI career guidance"
              onClick={() => navigate("/chat-tutor")}
              delay={0.1}
            />
            <QuickActionCard
              icon="💼"
              title="Job Matches"
              subtitle="Find perfect roles"
              onClick={() => navigate("/jobs")}
              delay={0.2}
            />
            <QuickActionCard
              icon="📊"
              title="Resume Tips"
              subtitle="Optimize your resume"
              onClick={() => navigate("/resume-analyzer")}
              delay={0.3}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, subtitle, onClick, delay }) {
  return (
    <motion.button
      variants={{
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { delay, duration: 0.5, type: "spring" },
        },
      }}
      initial="hidden"
      whileInView="visible"
      whileHover={{ scale: 1.08, y: -8 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="relative p-8 rounded-2xl glass group overflow-hidden"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-30 transition-all duration-300" />
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-cyan-400 transition-all duration-300" />
      
      <div className="relative text-center">
        <motion.div 
          className="text-5xl mb-3 block"
          whileHover={{ scale: 1.2, rotate: 5 }}
        >
          {icon}
        </motion.div>
        <p className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors mt-2">
            {subtitle}
          </p>
        )}
      </div>
    </motion.button>
  );
}