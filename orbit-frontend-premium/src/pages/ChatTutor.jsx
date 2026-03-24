import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiBase } from "../utils/api";
import SoftBackground from "../components/SoftBackground";

export default function ChatTutor() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "🤖 Hey there! I'm your AI career coach. What would you like to know?",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  const apiBase = useMemo(() => getApiBase(), []);

  const suggestedQuestions = [
    "What should I learn next?",
    "Which jobs should I apply for?",
    "How can I improve my ATS?",
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    setLoading(true);

    const userMsg = { id: `u-${Date.now()}`, role: "user", content: text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const token = localStorage.getItem("token");
      const url = `${apiBase}/api/resume/tutor`;
      console.log("🔗 Sending tutor request to:", url);
      
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      console.log("📡 Response status:", res.status, "IsOk:", res.ok);
      
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("❌ Error response:", body);
        throw new Error(body?.message || "Tutor request failed");
      }

      const data = await res.json();
      const assistantMsg = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data?.answer || "I couldn't generate an answer. Try again.",
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen relative text-white">
      <SoftBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
            AI Career Tutor 💬
          </h1>
          <p className="text-lg text-gray-300">
            Get personalized guidance from your AI career coach
          </p>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 rounded-3xl bg-gradient-to-b from-gray-900/50 to-black/50 border border-purple-500/30 backdrop-blur-xl overflow-hidden flex flex-col"
        >
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <AnimatePresence>
              {messages.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20, x: m.role === "user" ? 30 : -30 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-3xl px-6 py-4 ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                        : "bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-purple-500/30 text-gray-100"
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {m.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-purple-500/30 text-gray-100 rounded-3xl px-6 py-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      🤔
                    </motion.div>
                    <p className="font-semibold">Thinking...</p>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-200">
                  <p className="font-semibold text-sm">⚠️ {error}</p>
                </div>
              </motion.div>
            )}

            <div ref={endRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-8 py-6 border-t border-purple-500/20"
            >
              <p className="text-sm text-gray-400 font-semibold mb-4">💡 Try asking:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {suggestedQuestions.map((q) => (
                  <motion.button
                    key={q}
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setInput(q)}
                    className="text-left px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-200 text-sm hover:border-purple-400 transition-all"
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input Area */}
          <div className="border-t border-purple-500/20 p-8 bg-gradient-to-t from-black/50 to-transparent">
            <div className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={2}
                    maxLength={500}
                    className="w-full p-4 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 border border-purple-500/30 hover:border-purple-400 focus:border-purple-400 text-white resize-none focus:outline-none transition-all placeholder-gray-500"
                    placeholder="Ask me anything... (Enter to send)"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-right">{input.length}/500</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className={`px-6 py-4 rounded-2xl font-bold transition-all ${
                    loading || !input.trim()
                      ? "bg-purple-500/40 text-white/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/50"
                  }`}
                >
                  {loading ? "⏳" : "✈️"}
                </motion.button>
              </div>

              <div className="text-xs text-gray-500">💡 Tip: Be specific for better answers!</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
