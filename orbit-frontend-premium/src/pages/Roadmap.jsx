import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../utils/api";
import SoftBackground from "../components/SoftBackground";

export default function Roadmap() {
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredStep, setHoveredStep] = useState(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_CONFIG.RESUME_ROADMAP, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoadmapData(data);
      } else if (response.status === 404) {
        setError("Please upload a resume first to generate your personalized roadmap.");
      } else {
        setError("Failed to load roadmap");
      }
    } catch (error) {
      console.error("Error fetching roadmap:", error);
      setError("Error loading roadmap");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return { bg: "from-green-500/20 to-green-600/10", border: "border-green-500/50", icon: "✅" };
      case "current":
        return { bg: "from-cyan-500/20 to-blue-500/10", border: "border-cyan-500/50", icon: "🎯" };
      case "locked":
        return { bg: "from-gray-500/20 to-gray-600/10", border: "border-gray-500/30", icon: "🔒" };
      default:
        return { bg: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/30", icon: "📌" };
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return { color: "text-green-400", bg: "bg-green-500/20" };
      case "Intermediate":
        return { color: "text-yellow-400", bg: "bg-yellow-500/20" };
      case "Advanced":
        return { color: "text-red-400", bg: "bg-red-500/20" };
      default:
        return { color: "text-gray-400", bg: "bg-gray-500/20" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative text-white">
        <SoftBackground />
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🛣️
            </motion.div>
            <p className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Generating your personalized roadmap...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative text-white">
        <SoftBackground />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-8">
              Roadmap Not Available
            </h1>
            <div className="p-10 rounded-3xl bg-gradient-to-r from-red-500/20 to-orange-500/10 border border-red-500/30 backdrop-blur-md">
              <p className="text-xl text-red-200 mb-8">{error}</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold transition-all hover:scale-105"
              >
                📊 Go to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-white">
      <SoftBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-10 rounded-3xl mb-16"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Your AI-Powered Roadmap <span className="text-brand-200">🛣️</span>
          </h1>
          <p className="text-lg text-white/70 mb-8">
            A personalized learning path designed just for you.
          </p>

          {roadmapData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ y: -5 }}
                className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30"
              >
                <p className="text-green-300 text-sm font-semibold">Current Level</p>
                <p className="text-2xl font-bold text-green-400 mt-2">
                  {roadmapData.currentSkills?.slice(0, 2).join(", ") || "Beginner"}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30"
              >
                <p className="text-cyan-300 text-sm font-semibold">ATS Score</p>
                <p className="text-2xl font-bold text-cyan-400 mt-2">{roadmapData.atsScore}%</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30"
              >
                <p className="text-purple-300 text-sm font-semibold">Progress</p>
                <p className="text-2xl font-bold text-purple-400 mt-2">
                  {roadmapData.completedSteps}/{roadmapData.totalSteps}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="p-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30"
              >
                <p className="text-orange-300 text-sm font-semibold">Est. Time</p>
                <p className="text-2xl font-bold text-orange-400 mt-2">
                  {roadmapData.totalSteps * 2}w
                </p>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Progress Bar */}
        {roadmapData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-16">
            <div className="flex justify-between items-center mb-4 px-2">
              <p className="text-gray-300 font-semibold">Overall Progress</p>
              <p className="text-cyan-400 font-bold text-lg">
                {Math.round((roadmapData.completedSteps / roadmapData.totalSteps) * 100)}%
              </p>
            </div>
            <div className="relative h-3 rounded-full overflow-hidden bg-gray-800 border border-gray-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(roadmapData.completedSteps / roadmapData.totalSteps) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
              />
            </div>
          </motion.div>
        )}

        {/* Roadmap Steps */}
        <motion.div className="space-y-6">
          {roadmapData?.roadmap.map((step, idx) => {
            const statusInfo = getStatusColor(step.status);
            const diffInfo = getDifficultyColor(step.difficulty);
            const isCompleted = step.status === "completed";

            return (
              <motion.div
                key={step.id}
                className="relative pl-12 before:content-[''] before:absolute before:top-0 before:left-6 before:h-full before:w-px before:bg-white/10"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onHoverStart={() => setHoveredStep(idx)}
                onHoverEnd={() => setHoveredStep(null)}
              >
                <div className="flex gap-6 items-start">
                  {/* Timeline Icon */}
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 8 }}
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/20 shadow-lg bg-gradient-to-br ${statusInfo.bg}`}
                  >
                    {statusInfo.icon}
                  </motion.div>

                  {/* Card Content */}
                  <motion.div
                    whileHover={{ scale: 1.02, x: 10 }}
                    className={`flex-1 p-8 rounded-2xl border ${statusInfo.border} bg-gradient-to-br ${statusInfo.bg} backdrop-blur-md cursor-pointer transition-all`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-gray-300">
                            Step {idx + 1}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${diffInfo.color} ${diffInfo.bg}`}>
                            {step.difficulty}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                      </div>
                      <motion.div
                        animate={hoveredStep === idx ? { scale: 1.1 } : { scale: 1 }}
                        className="text-3xl"
                      >
                        {step.difficulty === "Beginner" ? "🌱" : step.difficulty === "Intermediate" ? "🌿" : "🌳"}
                      </motion.div>
                    </div>

                    <p className="text-gray-300 mb-6 leading-relaxed">{step.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-white/5">
                        <p className="text-gray-400 text-sm font-semibold mb-2">⏱️ Est. Time</p>
                        <p className="text-white font-bold">{step.estimatedTime}</p>
                      </div>
                      {step.requiredSkills.length > 0 && (
                        <div className="p-4 rounded-xl bg-white/5">
                          <p className="text-gray-400 text-sm font-semibold mb-2">🔗 Prerequisites</p>
                          <p className="text-white font-bold">{step.requiredSkills.join(", ")}</p>
                        </div>
                      )}
                    </div>

                    {/* Resources */}
                    {step.resources && step.resources.length > 0 && (
                      <div className="pt-6 border-t border-white/10">
                        <p className="text-gray-400 text-sm font-semibold mb-3">📚 Recommended Resources</p>
                        <div className="flex flex-wrap gap-2">
                          {step.resources.map((resource, ridx) => (
                            <motion.span
                              key={ridx}
                              whileHover={{ scale: 1.05 }}
                              className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-500/30 to-blue-500/30 border border-purple-500/50 text-purple-300 hover:border-purple-400 transition-all cursor-pointer"
                            >
                              {resource}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <motion.div className="mt-6 pt-4 border-t border-white/10">
                      <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold ${
                        isCompleted ? "bg-green-500/30 text-green-300 border border-green-500/50" :
                        step.status === "current" ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50" :
                        "bg-gray-500/30 text-gray-300 border border-gray-500/50"
                      }`}>
                        {isCompleted ? "✅ Completed" : step.status === "current" ? "🎬 Current Focus" : "🔒 Locked - Complete previous steps"}
                      </span>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Follow-up CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-16 p-10 rounded-3xl bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Keep Growing! 🚀</h2>
          <p className="text-gray-300 mb-8">Need personalized guidance? Chat with our AI tutor</p>
          <button
            onClick={() => navigate("/chat-tutor")}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold transition-all hover:scale-105 text-lg"
          >
            💬 Start Chat with AI Tutor
          </button>
        </motion.div>
      </div>
    </div>
  );
}