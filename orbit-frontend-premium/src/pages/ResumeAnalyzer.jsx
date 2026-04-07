import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API_CONFIG from "../utils/api";
import SoftBackground from "../components/SoftBackground";

export default function ResumeAnalyzer() {
  // Premium UI/UX redesign with drag-and-drop and animations
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please upload a PDF file");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please upload a PDF file");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_CONFIG.RESUME_UPLOAD, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysis(data);
        setFile(null);
      } else {
        setError(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Error uploading resume");
    } finally {
      setUploading(false);
    }
  };

  const getAtsColor = (score) => {
    if (score >= 80) return "from-green-400 to-emerald-400";
    if (score >= 60) return "from-cyan-400 to-blue-400";
    if (score >= 40) return "from-yellow-400 to-orange-400";
    return "from-red-400 to-pink-400";
  };

  return (
    <div className="min-h-screen relative text-white">
      <SoftBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 min-h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Resume Analyzer 📄
          </h1>
          <p className="text-lg text-gray-300">
            Upload your resume and get AI-powered recommendations to boost your ATS score
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          {/* Left Column - Upload Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-full"
            >
              {/* File Upload Box */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative h-64 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 cursor-pointer overflow-hidden group ${
                  dragActive
                    ? "border-purple-400 bg-purple-500/20"
                    : "border-purple-500/50 bg-gradient-to-br from-gray-900/50 to-black/50 hover:border-purple-400"
                }`}
              >
                {/* Gradient Background */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-300"
                  onClick={() => fileInputRef.current?.click()}
                />

                {/* Content */}
                <div className="relative z-10 text-center">
                  <motion.div
                    animate={{ y: dragActive ? -5 : 0 }}
                    className="text-5xl mb-3"
                  >
                    📤
                  </motion.div>
                  <p className="text-lg font-semibold text-purple-300 mb-2">
                    {file ? file.name : "Drop your PDF here"}
                  </p>
                  <p className="text-sm text-gray-400">
                    or click to browse
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`w-full mt-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  !file || uploading
                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/50"
                }`}
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ⏳
                    </motion.div>
                    Analyzing...
                  </div>
                ) : (
                  "Analyze Resume"
                )}
              </motion.button>
            </motion.div>
          </div>

          {/* Right Column - Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              {analysis ? (
                <div className="space-y-6">
                  {/* ATS Score Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-3xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-purple-500/30 p-8 overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" />
                    <div className="relative z-10">
                      <p className="text-gray-400 text-sm font-semibold mb-3">ATS Score</p>
                      <div className="flex items-end gap-6 mb-6">
                        <div className={`text-6xl font-black bg-gradient-to-r ${getAtsColor(analysis.atsScore)} bg-clip-text text-transparent`}>
                          {analysis.atsScore}%
                        </div>
                        <motion.div
                          animate={{ width: `${analysis.atsScore}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`flex-1 h-3 rounded-full bg-gradient-to-r ${getAtsColor(analysis.atsScore)}`}
                        />
                      </div>
                      <p className="text-gray-400 text-sm">
                        {analysis.atsScore >= 80
                          ? "🌟 Excellent! Your resume is highly optimized."
                          : analysis.atsScore >= 60
                          ? "👍 Good! Some improvements possible."
                          : analysis.atsScore >= 40
                          ? "⚠️ Average. Consider the suggestions below."
                          : "❌ Needs significant improvement. Follow the suggestions."}
                      </p>
                    </div>
                  </motion.div>

                  {/* Skills Card */}
                  {analysis.skills && analysis.skills.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="rounded-3xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-cyan-500/30 p-8 overflow-hidden relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-blue-600/10" />
                      <div className="relative z-10">
                        <p className="text-gray-400 text-sm font-semibold mb-4">🛠️ Skills Detected</p>
                        <motion.div className="flex flex-wrap gap-3">
                          {analysis.skills.slice(0, 12).map((skill, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.03 }}
                              className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 text-cyan-300 text-sm font-semibold hover:border-cyan-300 transition-all"
                            >
                              {skill}
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Suggestions Card */}
                  {analysis.suggestions && analysis.suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-3xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-green-500/30 p-8 overflow-hidden relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10" />
                      <div className="relative z-10">
                        <p className="text-gray-400 text-sm font-semibold mb-4">💡 Suggestions</p>
                        <motion.div className="space-y-3">
                          {analysis.suggestions.slice(0, 5).map((suggestion, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="flex gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20 hover:border-green-400/40 transition-all"
                            >
                              <span className="text-green-400 flex-shrink-0">✓</span>
                              <p className="text-gray-300 text-sm">{suggestion}</p>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* New Upload Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAnalysis(null)}
                    className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-300 hover:border-purple-400 transition-all"
                  >
                    📤 Upload Another Resume
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-96 rounded-3xl bg-gradient-to-br from-gray-900/50 to-black/50 border border-purple-500/20"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      📋
                    </motion.div>
                    <p className="text-gray-400">
                      Upload a resume to see analysis results
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}