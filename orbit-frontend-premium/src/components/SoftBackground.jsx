import React from "react";

export default function SoftBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      <div className="absolute inset-0 opacity-90">
        <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-500/25 blur-3xl animate-blob" />
        <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-8 left-16 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl animate-blob animation-delay-4000" />

        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.12), transparent 28%), radial-gradient(circle at 80% 70%, rgba(14, 165, 233, 0.12), transparent 28%), radial-gradient(circle at 50% 50%, rgba(251, 113, 133, 0.1), transparent 36%)' }} />

        {[...Array(12)].map((_, idx) => (
          <div
            key={idx}
            className="absolute rounded-full bg-white/20"
            style={{
              width: `${20 + (idx % 5) * 8}px`,
              height: `${20 + (idx % 5) * 8}px`,
              animation: `float ${5 + (idx % 3) * 1.2}s ease-in-out infinite`,
              top: `${Math.random() * 95}%`,
              left: `${Math.random() * 95}%`,
              opacity: 0.25 + (idx % 4) * 0.12,
            }}
          />
        ))}
      </div>
    </div>
  );
}
