import React, { useState } from "react";

export default function PathSelection({ onSelect, loading, trackMatches = [] }) {
  const [selected, setSelected] = useState(null);

  // If trackMatches is empty, show a loading/fallback state
  if (!trackMatches || trackMatches.length === 0) {
    return (
      <div className="text-center p-20 animate-pulse">
        <p className="text-[#8a96c0] font-bold">Architecting dynamic missions for your background...</p>
      </div>
    );
  }

  const highestMatch = Math.max(...trackMatches.map(m => m.percentage), 0);

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-headline font-black text-white mb-4 tracking-tighter">Choose Your Mission 🚀</h2>
        <p className="text-[#8a96c0] font-medium max-w-2xl mx-auto text-lg leading-relaxed">
          Orbit AI has analyzed your profile. <span className="text-white font-bold underline decoration-[#5ffbd6] decoration-4 underline-offset-4">Select your future path</span> to generate a personalized roadmap.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-14">
        {trackMatches.map((path, idx) => {
          const isBestFit = path.percentage > 0 && path.percentage === highestMatch;
          const isSelected = selected?.track === path.track;

          return (
            <div 
              key={idx}
              onClick={() => setSelected(path)}
              className={`p-10 rounded-[3rem] cursor-pointer transition-all border relative overflow-hidden group flex flex-col gap-6 ${
                isSelected 
                  ? "bg-[#5ffbd6]/10 border-[#5ffbd6] shadow-[0_0_60px_rgba(95,251,214,0.15)] ring-2 ring-[#5ffbd6]/20" 
                  : "glass border-white/5 hover:bg-white/5 hover:border-white/10 hover:translate-y-[-5px]"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all ${
                  isSelected ? "bg-[#5ffbd6] text-[#050814]" : "bg-white/5 text-[#8a96c0] group-hover:text-white"
                }`}>
                  <span className="material-symbols-outlined text-4xl">
                    {path.icon || (idx === 0 ? "finance" : idx === 1 ? "account_balance" : idx === 2 ? "monitoring" : "insights")}
                  </span>
                </div>
                
                <div className={`px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest ${
                  isBestFit ? "bg-[#5ffbd6] text-[#050814]" : "bg-white/10 text-white/70"
                }`}>
                  {path.percentage}% Fit {isBestFit && "• Best Match"}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight leading-tight">{path.track}</h3>
                <p className="text-sm font-medium text-[#8a96c0] leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                  {path.desc}
                </p>
              </div>

              {isSelected && (
                <div className="absolute bottom-0 right-0 p-6 opacity-20">
                   <span className="material-symbols-outlined text-6xl text-[#5ffbd6]">verified</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pb-20">
        <button
          disabled={!selected || loading}
          onClick={() => onSelect(selected.track)}
          className={`px-16 py-6 rounded-full font-black uppercase tracking-tighter text-sm transition-all flex items-center gap-4 ${
            !selected || loading 
              ? "bg-white/5 text-white/20 cursor-not-allowed grayscale" 
              : "bg-[#5ffbd6] text-[#050814] shadow-[0_25px_60px_rgba(95,251,214,0.4)] hover:scale-105 active:scale-95"
          }`}
        >
          {loading ? (
             <>
               <div className="w-5 h-5 border-3 border-[#050814]/30 border-t-[#050814] rounded-full animate-spin" />
               <span>Architecting {selected?.track}...</span>
             </>
          ) : (
            <>
              <span>Generate Personalized Roadmap</span>
              <span className="material-symbols-outlined font-black">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
