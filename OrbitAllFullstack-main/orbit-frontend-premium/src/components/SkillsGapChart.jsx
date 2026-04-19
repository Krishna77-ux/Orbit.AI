// Pure SVG Skills Gap Radar/Bar Chart — no dependencies needed
export default function SkillsGapChart({ skills = [], atsScore = 0, targetRole = "Target Role" }) {
  if (!skills || skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <span className="material-symbols-outlined text-3xl text-slate-600 mb-2">radar</span>
        <p className="text-slate-500 text-xs">Upload resume to see skills gap</p>
      </div>
    );
  }

  // Generate "required" levels for the target role — AI-powered in reality,
  // here we derive from ATS score and skill position
  const chartSkills = skills.slice(0, 6).map((skill, i) => {
    const userLevel = Math.min(95, Math.max(40, atsScore * 0.85 + (i % 3) * 7 - (i * 2)));
    const requiredLevel = Math.min(99, 70 + (i % 4) * 5);
    return { name: skill, user: Math.round(userLevel), required: Math.round(requiredLevel) };
  });

  const colors = ["#7c3aed", "#5ffbd6", "#f59e0b", "#3b82f6", "#10b981", "#f97316"];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#7c3aed]" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Level</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#5ffbd6]/40 border border-[#5ffbd6]" style={{ borderStyle: "dashed" }} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Required for {targetRole}</span>
        </div>
      </div>

      {chartSkills.map((skill, i) => {
        const gap = skill.required - skill.user;
        const hasGap = gap > 0;
        return (
          <div key={i} className="group">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-white truncate max-w-[150px]" title={skill.name}>
                {skill.name}
              </span>
              <div className="flex items-center gap-3">
                {hasGap ? (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    +{gap}% needed
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                    ✓ Met
                  </span>
                )}
                <span className="text-[10px] text-slate-500 w-12 text-right">{skill.user}%</span>
              </div>
            </div>

            {/* Stacked bar */}
            <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
              {/* Required level marker */}
              <div
                className="absolute top-0 h-full border-r-2 border-dashed border-[#5ffbd6]/60 z-10"
                style={{ left: `${skill.required}%` }}
              />
              {/* User level fill */}
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${skill.user}%`,
                  background: hasGap
                    ? `linear-gradient(90deg, ${colors[i % colors.length]}, ${colors[i % colors.length]}bb)`
                    : "linear-gradient(90deg, #10b981, #5ffbd6)",
                  boxShadow: hasGap ? "none" : "0 0 8px rgba(95,251,214,0.3)"
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Skills Meeting Target</p>
          <p className="text-2xl font-bold text-white">
            {chartSkills.filter(s => s.user >= s.required).length}
            <span className="text-slate-500 text-sm font-medium ml-1">/ {chartSkills.length}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Avg Gap</p>
          <p className="text-2xl font-bold text-amber-400">
            {Math.round(chartSkills.filter(s => s.required > s.user).reduce((a, s) => a + (s.required - s.user), 0) / Math.max(1, chartSkills.filter(s => s.required > s.user).length))}
            <span className="text-slate-500 text-sm font-medium ml-1">%</span>
          </p>
        </div>
      </div>
    </div>
  );
}
