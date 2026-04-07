import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../utils/api";
import SoftBackground from "../components/SoftBackground";

export default function Jobs() {
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("match");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_CONFIG.RESUME_JOBS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobData(data);
      } else {
        setError("Failed to load job matches");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Error loading jobs");
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return { color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/50" };
    if (percentage >= 60) return { color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/50" };
    if (percentage >= 40) return { color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/50" };
    return { color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/50" };
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner": return { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/50" };
      case "Intermediate": return { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/50" };
      case "Advanced": return { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/50" };
      default: return { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/50" };
    }
  };

  const getSortedJobs = () => {
    if (!jobData?.jobs) return [];
    let sorted = [...jobData.jobs];
    
    if (sortBy === "match") {
      sorted.sort((a, b) => b.skillMatchPercentage - a.skillMatchPercentage);
    } else if (sortBy === "ats") {
      sorted.sort((a, b) => b.minAtsScore - a.minAtsScore);
    } else if (sortBy === "recent") {
      sorted = sorted.reverse();
    }
    
    return sorted;
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
              💼
            </motion.div>
            <p className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Finding perfect job matches for you...
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
              Job Matches Not Available
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

  const sortedJobs = getSortedJobs();
  const matchColor = jobData ? getMatchColor(jobData.atsScore) : {};

  return (
    <div className="min-h-screen relative text-white">
      <SoftBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            Perfect Job Matches 💼
          </h1>
          <p className="text-xl text-gray-300">
            Discover {jobData?.totalJobs || 0} opportunities tailored to your profile
          </p>
        </motion.div>

        {/* Stats Banner */}
        {jobData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 backdrop-blur-md"
            >
              <p className="text-blue-300 text-sm font-semibold">Total Matches</p>
              <p className="text-3xl font-black text-blue-400 mt-2">{jobData.totalJobs}</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className={`p-6 rounded-2xl bg-gradient-to-br ${getMatchColor(jobData.atsScore).bg} border ${getMatchColor(jobData.atsScore).border} backdrop-blur-md`}
            >
              <p className={`text-sm font-semibold ${getMatchColor(jobData.atsScore).color}`}>
                Average Match
              </p>
              <p className={`text-3xl font-black mt-2 ${getMatchColor(jobData.atsScore).color}`}>
                {jobData.atsScore}%
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 backdrop-blur-md"
            >
              <p className="text-purple-300 text-sm font-semibold">Your ATS</p>
              <p className="text-3xl font-black text-purple-400 mt-2">{jobData.atsScore}%</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 backdrop-blur-md"
            >
              <p className="text-orange-300 text-sm font-semibold">Skills Gap</p>
              <p className="text-3xl font-black text-orange-400 mt-2">
                {jobData.missingSkills?.length || 0}
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row gap-6 items-start md:items-center"
        >
          {/* Sort Dropdown */}
          <div>
            <label className="text-gray-400 font-semibold mb-2 block">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white cursor-pointer hover:border-cyan-500 transition-all"
            >
              <option value="match">🎯 Best Match</option>
              <option value="ats">📊 Highest ATS</option>
              <option value="recent">⏰ Recently Added</option>
            </select>
          </div>

          {/* Missing Skills */}
          {jobData?.missingSkills && jobData.missingSkills.length > 0 && (
            <div className="flex-1">
              <p className="text-gray-400 font-semibold mb-2">Skills to Develop:</p>
              <div className="flex flex-wrap gap-2">
                {jobData.missingSkills.map((skill, idx) => (
                  <motion.span
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-500/20 border border-orange-500/50 text-orange-300"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Jobs Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16"
        >
          {sortedJobs.map((job, idx) => {
            const matchInfo = getMatchColor(job.skillMatchPercentage);
            
            return (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.03, y: -8 }}
                onClick={() => setSelectedJob(job)}
                className={`group p-8 rounded-3xl border ${matchInfo.border} bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-md cursor-pointer transition-all overflow-hidden relative`}
              >
                {/* Glow Background */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity ${matchInfo.bg} blur-3xl`} />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${matchInfo.border} ${matchInfo.bg} ${matchInfo.color}`}>
                          {job.skillMatchPercentage}% Match
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-700 text-gray-300">
                          {job.minAtsScore}+ ATS
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-cyan-400 font-semibold mb-1">{job.company}</p>
                      <p className="text-gray-400 text-sm">📍 {job.location}</p>
                    </div>
                    <motion.div
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className="text-4xl"
                    >
                      💡
                    </motion.div>
                  </div>

                  <p className="text-gray-300 mb-6 line-clamp-2">{job.description}</p>

                  {/* Skills */}
                  <div className="mb-6">
                    <p className="text-gray-400 text-xs font-semibold mb-2">REQUIRED SKILLS</p>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills?.slice(0, 5).map((skill, idx) => (
                        <motion.span
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/30 border border-purple-500/50 text-purple-300"
                        >
                          {skill}
                        </motion.span>
                      ))}
                      {job.requiredSkills?.length > 5 && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-gray-300">
                          +{job.requiredSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <motion.a
                    href={job.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`block w-full py-3 rounded-xl font-bold text-center transition-all ${matchInfo.bg} border ${matchInfo.border} ${matchInfo.color} hover:opacity-80`}
                  >
                    Apply Now →
                  </motion.a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Job Details Modal */}
        <AnimatePresence>
          {selectedJob && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedJob(null)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
              >
                <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-cyan-500/30 backdrop-blur-xl">
                  <div className="p-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-2">
                          {selectedJob.title}
                        </h2>
                        <p className="text-2xl text-cyan-400 font-bold">{selectedJob.company}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedJob(null)}
                        className="text-4xl text-gray-400 hover:text-white transition-colors"
                      >
                        ✕
                      </motion.button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-10">
                      {[
                        { label: "Match %", value: selectedJob.skillMatchPercentage + "%", color: "green" },
                        { label: "Min ATS", value: selectedJob.minAtsScore + "%", color: "blue" },
                        { label: "Location", value: selectedJob.location, color: "purple" }
                      ].map((stat, idx) => (
                        <div key={idx} className={`p-4 rounded-xl bg-opacity-20 border border-opacity-30 ${
                          stat.color === "green" ? "bg-green-500 border-green-500" :
                          stat.color === "blue" ? "bg-blue-500 border-blue-500" :
                          "bg-purple-500 border-purple-500"
                        }`}>
                          <p className="text-gray-400 text-xs font-semibold">{stat.label}</p>
                          <p className="text-white font-bold mt-1">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Description */}
                    <div className="mb-10">
                      <h3 className="text-xl font-bold text-cyan-400 mb-4">About This Role</h3>
                      <p className="text-gray-300 leading-relaxed">{selectedJob.description}</p>
                    </div>

                    {/* Skills */}
                    <div className="mb-10">
                      <h3 className="text-xl font-bold text-cyan-400 mb-4">Required Skills</h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedJob.requiredSkills?.map((skill, idx) => (
                          <motion.span
                            key={idx}
                            whileHover={{ scale: 1.1 }}
                            className="px-4 py-2 rounded-full font-semibold bg-purple-500/30 border border-purple-500/50 text-purple-300"
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Roadmap if Available */}
                    {selectedJob.skillRoadmap && selectedJob.skillRoadmap.length > 0 && (
                      <div className="mb-10">
                        <h3 className="text-xl font-bold text-cyan-400 mb-4">Learning Path</h3>
                        <div className="space-y-3">
                          {selectedJob.skillRoadmap.map((step, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-xl border ${
                                step.status === "completed" ? "bg-green-500/10 border-green-500/30" :
                                step.status === "current" ? "bg-blue-500/10 border-blue-500/30" :
                                "bg-gray-800/50 border-gray-700/30"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-xl">
                                  {step.status === "completed" ? "✅" : step.status === "current" ? "🎯" : "🔒"}
                                </span>
                                <div className="flex-1">
                                  <p className="font-bold text-white">{step.title}</p>
                                  <p className="text-sm text-gray-400">{step.estimatedTime}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="flex gap-4">
                      <motion.a
                        href={selectedJob.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold transition-all text-center"
                      >
                        Apply on Company Website
                      </motion.a>
                      <motion.button
                        onClick={() => setSelectedJob(null)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition-all"
                      >
                        Close
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}