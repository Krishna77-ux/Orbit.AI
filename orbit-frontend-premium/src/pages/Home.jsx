import { motion } from "framer-motion";
import { Sparkles, Rocket, Brain, Target } from "lucide-react";
import SoftBackground from "../components/SoftBackground";

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.03 }}
      transition={{ duration: 0.2 }}
      className="glass-md rounded-2xl p-6 shadow-soft border border-white/15 backdrop-blur-2xl hover:shadow-[0_30px_60px_-30px_rgba(124,58,237,0.55)]"
    >
      <div className="text-4xl text-brand-400 animate-beat">{icon}</div>
      <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-white/70 text-sm">{desc}</p>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <SoftBackground />

      <div className="relative z-10 px-6 py-16 lg:px-12">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/70">
            <Sparkles className="h-5 w-5 text-brand-200" />
            AI-powered career growth, now smoother
          </p>

          <h1 className="mt-10 text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Build your career with <span className="brand-gradient">Orbit AI</span>
          </h1>

          <p className="mt-6 mx-auto max-w-2xl text-base text-white/70">
            Upload your resume, generate a tailored roadmap, and match with jobs using AI-driven insights.
            Everything you need to launch your placement journey in one elegant dashboard.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a href="/signup" className="btn-primary">
              Get started
            </a>
            <a href="/pricing" className="btn-secondary">
              View pricing
            </a>
          </div>
        </motion.section>

        <section className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Brain />}
            title="AI Mentor"
            desc="Personalized guidance for the next steps in your career."
          />
          <FeatureCard
            icon={<Target />}
            title="Career Roadmaps"
            desc="Structured learning paths to make every day count."
          />
          <FeatureCard
            icon={<Rocket />}
            title="Placement Boost"
            desc="Showcase skills that top companies want."
          />
          <FeatureCard
            icon={<Sparkles />}
            title="Resume Analyzer"
            desc="Instant ATS feedback and tailored improvements."
          />
        </section>
      </div>
    </div>
  );
}
