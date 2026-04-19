/**
 * generatePDF — Creates a branded Orbit AI analysis report
 * Uses zero external dependencies — pure browser print API.
 */
export function generatePDF(resumeData, userName = "User") {
  const {
    atsScore = 0,
    readinessScore,
    skills = [],
    strengths = [],
    suggestions = [],
    missingSkills = [],
    targetRole = "Career Growth",
    createdAt,
  } = resumeData;

  const score = atsScore || readinessScore || 0;
  const date = createdAt
    ? new Date(createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  const scoreColor = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#7c3aed";
  const scoreLabel = score >= 80 ? "ELITE TIER" : score >= 60 ? "STRONG PROFILE" : "GROWING";

  const skillPills = skills.slice(0, 12).map(s =>
    `<span style="display:inline-block;background:#f3f4f6;color:#374151;border-radius:8px;padding:4px 12px;font-size:12px;font-weight:600;margin:3px;border:1px solid #e5e7eb;">${s}</span>`
  ).join("");

  const missingPills = missingSkills.slice(0, 8).map(s =>
    `<span style="display:inline-block;background:#fef3c7;color:#92400e;border-radius:8px;padding:4px 12px;font-size:12px;font-weight:600;margin:3px;border:1px solid #fde68a;">${s}</span>`
  ).join("");

  const strengthItems = (strengths.length > 0 ? strengths : ["Strong technical foundation detected"]).slice(0, 3).map(s =>
    `<li style="margin-bottom:8px;color:#065f46;font-size:13px;line-height:1.6;">${s}</li>`
  ).join("");

  const suggestionItems = (suggestions.length > 0 ? suggestions : ["Add more quantifiable achievements to boost ATS score"]).slice(0, 4).map(s =>
    `<li style="margin-bottom:8px;color:#92400e;font-size:13px;line-height:1.6;">${s}</li>`
  ).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Orbit AI — Career Analysis Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { margin: 0; size: A4; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: white;
      color: #111827;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 0;
      background: white;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #0d0f1f 0%, #1e0a4e 100%);
      padding: 36px 48px 28px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .logo-row { display: flex; align-items: center; gap: 12px; }
    .logo-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: #5ffbd6;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 900; color: #050814;
    }
    .logo-text { font-size: 26px; font-weight: 900; color: white; letter-spacing: -1px; }
    .header-sub { color: #8a96c0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-top: 2px; }
    .header-meta { text-align: right; }
    .header-meta p { color: #8a96c0; font-size: 11px; }
    .header-meta .meta-name { color: white; font-size: 14px; font-weight: 700; margin-bottom: 4px; }
    .header-meta .meta-date { font-size: 11px; color: #5ffbd6; }

    /* Score Hero */
    .score-section {
      background: linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%);
      padding: 36px 48px;
      display: flex;
      align-items: center;
      gap: 40px;
      border-bottom: 3px solid ${scoreColor}22;
    }
    .score-ring {
      width: 120px; height: 120px; flex-shrink: 0;
      border-radius: 50%;
      background: white;
      border: 6px solid ${scoreColor};
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      box-shadow: 0 4px 24px ${scoreColor}33;
    }
    .score-number { font-size: 36px; font-weight: 900; color: ${scoreColor}; line-height:1; }
    .score-label-small { font-size: 10px; color: #6b7280; font-weight: 600; margin-top: 2px; }
    .score-info h2 { font-size: 28px; font-weight: 800; color: #111827; margin-bottom: 6px; }
    .score-info .tier-badge {
      display: inline-block;
      background: ${scoreColor}15;
      color: ${scoreColor};
      border: 1px solid ${scoreColor}40;
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    .score-bar-outer { width: 100%; height: 10px; background: #e5e7eb; border-radius: 20px; overflow: hidden; }
    .score-bar-inner { height: 100%; background: ${scoreColor}; border-radius: 20px; width: ${score}%; }
    .target-role { margin-top: 8px; font-size: 13px; color: #6b7280; }
    .target-role strong { color: #111827; }

    /* Content */
    .content { padding: 32px 48px; }
    .section { margin-bottom: 28px; }
    .section-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #9ca3af;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f3f4f6;
    }

    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

    .box {
      background: #f9fafb;
      border-radius: 14px;
      padding: 18px 20px;
      border: 1px solid #e5e7eb;
    }
    .box.green { background: #f0fdf4; border-color: #bbf7d0; }
    .box.amber { background: #fffbeb; border-color: #fde68a; }
    .box.red { background: #fff1f2; border-color: #fecdd3; }
    .box-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
    .box-title.green { color: #059669; }
    .box-title.amber { color: #d97706; }
    .box-title.red { color: #dc2626; }
    ul { list-style: none; padding-left: 0; }
    ul li::before { content: "▸ "; }

    /* Skills */
    .skills-wrap { display: flex; flex-wrap: wrap; gap: 4px; }

    /* Footer */
    .footer {
      background: #0d0f1f;
      padding: 20px 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }
    .footer p { color: #4b5563; font-size: 11px; }
    .footer .orbit-brand { color: #5ffbd6; font-weight: 800; font-size: 13px; }
    .footer .disclaimer { color: #374151; font-size: 10px; }
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div>
      <div class="logo-row">
        <div class="logo-icon">O</div>
        <div>
          <div class="logo-text">Orbit.</div>
          <div class="header-sub">Career Intelligence Report</div>
        </div>
      </div>
    </div>
    <div class="header-meta">
      <p class="meta-name">${userName}</p>
      <p class="meta-date">Generated ${date}</p>
      <p style="color:#5ffbd6;font-size:10px;margin-top:4px;font-weight:700;">orbit-ai-eta.vercel.app</p>
    </div>
  </div>

  <!-- Score Hero -->
  <div class="score-section">
    <div class="score-ring">
      <div class="score-number">${score}</div>
      <div class="score-label-small">ATS SCORE</div>
    </div>
    <div class="score-info" style="flex:1;">
      <div class="tier-badge">${scoreLabel}</div>
      <h2>Resume Analysis Report</h2>
      <div class="score-bar-outer"><div class="score-bar-inner"></div></div>
      <p class="target-role">Target Role: <strong>${targetRole}</strong></p>
    </div>
  </div>

  <!-- Content -->
  <div class="content">
    <!-- Skills -->
    <div class="section">
      <div class="section-title">Detected Skills (${skills.length} found)</div>
      <div class="skills-wrap">${skillPills || "<span style='color:#9ca3af;font-size:13px;'>No skills detected — please re-upload your resume.</span>"}</div>
    </div>

    <!-- Strengths + Suggestions -->
    <div class="two-col">
      <div class="box green">
        <div class="box-title green">✅ Strengths</div>
        <ul>${strengthItems}</ul>
      </div>
      <div class="box amber">
        <div class="box-title amber">⚡ Improvements</div>
        <ul>${suggestionItems}</ul>
      </div>
    </div>

    ${missingSkills.length > 0 ? `
    <!-- Missing Skills -->
    <div class="section" style="margin-top:24px;">
      <div class="section-title">Skills Gap — Add These to Your Resume</div>
      <div class="box red" style="padding:14px 18px;">
        <div class="box-title red" style="margin-bottom:10px;">🎯 Missing Skills for ${targetRole}</div>
        <div class="skills-wrap">${missingPills}</div>
      </div>
    </div>
    ` : ""}

    <!-- Next Steps -->
    <div class="section" style="margin-top:24px;">
      <div class="section-title">Recommended Next Steps</div>
      <div class="two-col">
        ${[
          { n: "1", t: "View Your Roadmap", d: "Follow your AI-generated step-by-step learning path", c: "#7c3aed" },
          { n: "2", t: "Practice Interviews", d: "Complete your AI-generated interview prep questions", c: "#059669" },
          { n: "3", t: "Fill Skill Gaps", d: "Use curated resources to learn missing skills", c: "#d97706" },
          { n: "4", t: "Explore Career Orbit", d: "Visualize all possible career paths from your profile", c: "#0891b2" },
        ].map(s => `
          <div style="display:flex;gap:12px;align-items:flex-start;padding:14px;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;">
            <div style="width:28px;height:28px;border-radius:8px;background:${s.c}15;border:1px solid ${s.c}30;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:${s.c};flex-shrink:0;">${s.n}</div>
            <div>
              <p style="font-size:13px;font-weight:700;color:#111827;">${s.t}</p>
              <p style="font-size:11px;color:#6b7280;margin-top:2px;">${s.d}</p>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div>
      <span class="orbit-brand">Orbit AI</span>
      <p class="disclaimer" style="margin-top:3px;">Powered by Groq LLaMA 3.3 70B · AI-generated analysis</p>
    </div>
    <p style="color:#4b5563;font-size:10px;text-align:right;">This report is confidential and generated exclusively<br>for <strong style="color:#9ca3af;">${userName}</strong> on ${date}</p>
  </div>
</div>
<script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert("Please allow popups for this site to export the PDF report.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
