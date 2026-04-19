import React from "react";

export default function SoftBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#050814] overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-40 blur-[4px]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vh] h-[140vh] rounded-full"
          style={{
            background: "radial-gradient(circle at center, #2e4a8a 0%, #050814 70%)",
            boxShadow: "0 0 100px 20px rgba(46, 74, 138, 0.2)"
          }} 
        />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: 'linear-gradient(#8a96c0 1px, transparent 1px), linear-gradient(90deg, #8a96c0 1px, transparent 1px)', backgroundSize: '100px 100px' }} 
        />

        {/* Stars */}
        {[...Array(60)].map((_, idx) => (
          <div
            key={idx}
            className="absolute rounded-full bg-white transition-opacity duration-1000"
            style={{
              width: idx % 4 === 0 ? "2px" : "1px",
              height: idx % 4 === 0 ? "2px" : "1px",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.1 + Math.random() * 0.4,
              animation: `pulse ${4 + Math.random() * 6}s infinite ease-in-out`,
              animationDelay: `${idx * 0.1}s`
            }}
          />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.5; }
        }
      `}} />
    </div>
  );
}
