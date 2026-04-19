import pdf from "pdf-parse/lib/pdf-parse.js";
import Resume from "../models/Resume.js";
import { canUploadResume, decrementUploadCount } from "./paymentController.js";

// Groq AI helper — free tier, 14,400 req/day, no billing needed
async function callAI(prompt) {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // Try Groq first (free, reliable)
  if (groqKey) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 4096
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(`Groq error ${response.status}: ${JSON.stringify(data.error)}`);
      const text = data.choices?.[0]?.message?.content || "";
      console.log("✅ Groq AI responded successfully");
      return text;
    } catch (err) {
      console.warn("⚠️ Groq failed, trying Gemini fallback:", err.message);
    }
  }

  // Fallback: Gemini v1beta
  if (geminiKey) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 }
        })
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(`Gemini API error ${response.status}: ${JSON.stringify(data.error)}`);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  throw new Error("No AI API key configured (GROQ_API_KEY or GEMINI_API_KEY required)");
}

// Keep callGemini as alias for backward compat
const callGemini = callAI;


export const uploadResume = async (req, res) => {
  try {
    console.log("📧 Upload request received");
    console.log("🔑 User ID:", req.user?.id);
    console.log("📁 File:", req.file ? { name: req.file.originalname, size: req.file.size } : "No file");
    
    // Check if user has active subscription and remaining uploads
    const uploadCheck = await canUploadResume(req.user.id);
    if (!uploadCheck.allowed) {
      console.log("❌ Upload denied:", uploadCheck.reason);
      return res.status(403).json({ 
        message: uploadCheck.reason,
        requiresPayment: true,
        currentPlan: uploadCheck.currentPlan,
        uploadsRemaining: uploadCheck.uploadsRemaining,
      });
    }

    console.log("✅ Upload allowed for plan:", uploadCheck.plan);

    if (!req.user) {
      console.error("❌ No user authenticated");
      return res.status(401).json({ message: "User not authenticated. Please login again." });
    }

    if (!req.file) {
      console.error("❌ No file provided");
      return res.status(400).json({ message: "No file uploaded. Please select a PDF resume." });
    }

    if (!req.file.buffer) {
      console.error("❌ File buffer missing");
      return res.status(400).json({ message: "File upload failed. Please try again." });
    }

    console.log("📄 Processing PDF...");
    let text = "";
    try {
      const data = await pdf(req.file.buffer);
      text = data.text;
    } catch (pdfError) {
      console.warn("⚠️ pdf-parse failed (bad XRef), falling back to raw text extraction:", pdfError.message);
      // Fallback: extract readable ASCII text directly from the PDF buffer
      text = req.file.buffer
        .toString("utf-8")
        .replace(/[^\x20-\x7E\n\r\t]/g, " ")
        .replace(/\s{3,}/g, " ")
        .trim();
    }

    if (!text || text.trim().length === 0) {
      console.error("❌ PDF text extraction failed or file is empty");
      return res.status(400).json({ message: "PDF could not be parsed. Ensure it is not an image-only PDF." });
    }

    console.log("🤖 Analyzing resume with Gemini AI...");
    let atsScore = 0;
    let extractedSkills = [];
    let experience = "Not specified";
    let suggestions = [];

    try {
      const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume text and provide:
1. An ATS Score (0-100) based on industry standards.
2. A list of technical and soft skills.
3. Total experience (e.g. "2 years 6 months").
4. 3-5 specific suggestions for improvement.
5. Identify the top 4 career paths (missions) most suitable for this user based on their unique background (e.g. if commerce resume, suggest finance roles; if tech, suggest dev roles). For each, provide a title, a short description, a match percentage, and a Material Symbols icon name.

Respond ONLY with a valid JSON object in the exact format shown below, with no markdown, no code blocks, and no extra text:
{
  "atsScore": 85,
  "skills": ["React", "Node.js", "Python"],
  "experience": "2 years",
  "suggestions": ["Add more metrics to your experience", "Include soft skills"],
  "trackMatches": [
    { "track": "Strategic Financial Analyst", "percentage": 95, "desc": "Optimize fiscal performance and drive corporate growth.", "icon": "trending_up" },
    { "track": "Investment Strategist", "percentage": 82, "desc": "Master portfolio management and market trend analysis.", "icon": "account_balance" },
    { "track": "Corporate Auditor", "percentage": 78, "desc": "Ensure compliance and transparency in financial systems.", "icon": "verified_user" },
    { "track": "Startup Data Architect", "percentage": 45, "desc": "Bridge the gap between commerce and tech modeling.", "icon": "hub" }
  ]
}

Resume Text:
${text.substring(0, 10000)}
      `;

      console.log("🔄 Calling Gemini v1 API directly...");
      const responseText = await callGemini(prompt);
      console.log("📥 Raw AI Response (First 100 char):", responseText.substring(0, 100));
      
      let parsedData;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
        parsedData = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", responseText);
        try {
           const fallbackMatch = responseText.match(/\{.*\}/s);
           parsedData = JSON.parse(fallbackMatch ? fallbackMatch[0] : "{}");
        } catch (e2) {
           throw new Error("AI returned malformed data format.");
        }
      }
      
      atsScore = parsedData.atsScore || 0;
      extractedSkills = parsedData.skills || [];
      experience = parsedData.experience || "Not specified";
      suggestions = parsedData.suggestions || [];
      const trackMatches = parsedData.trackMatches || [];
      
      const roadmap = generatePersonalizedRoadmap(extractedSkills, atsScore);
      const completedSteps = roadmap.filter((step) => step.status === "completed").length;
      const roadmapProgress = roadmap.length ? Math.min(100, (completedSteps / roadmap.length) * 100) : 0;
      const jobsMatched = Math.floor((atsScore / 100) * extractedSkills.length * 2);

      const uniqueSkills = [...new Set(extractedSkills)];

      console.log("💾 Saving resume to database...");
      const savedResume = await Resume.create({
        user: req.user.id,
        extractedSkills: uniqueSkills,
        readinessScore: atsScore,
        roadmapProgress: Math.round(roadmapProgress),
        jobsMatched,
        trackMatches: trackMatches
      });

      await decrementUploadCount(req.user.id);

      return res.status(200).json({
        message: "Resume processed successfully",
        atsScore,
        skills: uniqueSkills,
        experience,
        suggestions,
        roadmapProgress: Math.round(roadmapProgress),
        jobsMatched,
        trackMatches: trackMatches
      });
    } catch (aiError) {
      console.error("⛔ AI FINAL ERROR:", aiError.message, aiError.status, aiError.errorDetails);
      
      // Fallback to simulated analysis for ANY AI failure
      console.log("🛠️ AI unavailable — Triggering Simulated Analysis Fallback. Reason:", aiError.message);
      const simulatedData = {
        atsScore: 78,
        skills: ["Project Management", "React", "Data Analysis", "Communication", "Leadership"],
        experience: "3 years (Simulated)",
        suggestions: ["AI was temporarily busy — retry soon for full AI-powered insights", "Optimize keywords for specific roles"],
        trackMatches: [
          { "track": "Product Manager", "percentage": 85, "desc": "Lead cross-functional teams to build epic tools.", "icon": "rocket_launch" },
          { "track": "Full Stack Lead", "percentage": 82, "desc": "Master the entire orbit of development.", "icon": "hub" },
          { "track": "Operations Director", "percentage": 75, "desc": "Streamline complex systems and workflows.", "icon": "settings" }
        ]
      };

      try {
        await Resume.create({
          user: req.user.id,
          extractedSkills: simulatedData.skills,
          readinessScore: simulatedData.atsScore,
          roadmapProgress: 45,
          jobsMatched: 12,
          trackMatches: simulatedData.trackMatches
        });
        await decrementUploadCount(req.user.id);
      } catch (dbErr) {
        console.error("⛔ DB fallback save error:", dbErr.message);
      }

      return res.status(200).json({
        message: "Simulated Analysis (AI temporarily unavailable)",
        ...simulatedData,
        roadmapProgress: 45,
        jobsMatched: 12,
        isSimulated: true
      });
    }
  } catch (error) {
    console.error("❌ Resume upload error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Resume processing failed: " + error.message,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getMyResumes = async (req, res) => {
  try {
    const latestResume = await Resume.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    const resumes = await Resume.find({ user: req.user.id }).sort({ createdAt: -1 });

    const transformedResumes = resumes.map((resume) => ({
      ...resume.toObject(),
      atsScore: resume.readinessScore,
      skills: resume.extractedSkills,
      roadmapProgress: resume.roadmapProgress,
      jobsMatched: resume.jobsMatched,
    }));

    if (!latestResume) {
      return res.json({ latestResume: null, resumes: transformedResumes });
    }

    res.json({
      latestResume: {
        ...latestResume.toObject(),
        atsScore: latestResume.readinessScore,
        skills: latestResume.extractedSkills,
        roadmapProgress: latestResume.roadmapProgress,
        jobsMatched: latestResume.jobsMatched,
        trackMatches: latestResume.trackMatches,
      },
      resumes: transformedResumes.map(r => ({ ...r, trackMatches: r.trackMatches })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch resumes" });
  }
};

export const generateRoadmap = async (req, res) => {
  try {
    const latestResume = await Resume.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!latestResume) {
      return res.status(404).json({ message: "No resume found. Please upload a resume first." });
    }

    // If we already have a personalized AI roadmap, use it
    if (latestResume.personalizedRoadmap && latestResume.personalizedRoadmap.length > 0) {
      return res.json({
        roadmap: latestResume.personalizedRoadmap,
        targetRole: latestResume.targetRole,
        currentSkills: latestResume.extractedSkills,
        atsScore: latestResume.readinessScore,
        totalSteps: latestResume.personalizedRoadmap.length,
        completedSteps: latestResume.personalizedRoadmap.filter((s) => s.status === "completed").length,
      });
    }

    const skills = latestResume.extractedSkills;
    const atsScore = latestResume.readinessScore;
    const roadmap = generatePersonalizedRoadmap(skills, atsScore);

    res.json({
      roadmap,
      currentSkills: skills,
      atsScore,
      totalSteps: roadmap.length,
      completedSteps: roadmap.filter((s) => s.status === "completed").length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate roadmap" });
  }
};

export const setTargetRole = async (req, res) => {
  try {
    const { targetRole } = req.body;
    if (!targetRole) return res.status(400).json({ message: "Target role is required" });

    const latestResume = await Resume.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!latestResume) return res.status(404).json({ message: "No resume found" });

    console.log(`🤖 Generating AI Roadmap for goal: ${targetRole}...`);
    
    let roadmap = [];
    try {
      const prompt = `
        You are an expert career architect.
        User Skills: ${latestResume.extractedSkills.join(", ")}
        User Goal: ${targetRole}

        Generate a high-quality career roadmap with 6-8 structured steps to reach the goal.
        Each step MUST have:
        - id (number)
        - title (string)
        - description (string)
        - estimatedTime (string)
        - difficulty (string)
        - status (string: "completed" if user already has skills for it, "active" if it's the next logical step, or "locked")

        Respond ONLY with a valid JSON array of objects. No markdown.
      `;

      console.log("🔄 Calling Gemini v1 for roadmap...");
      const responseText = await callGemini(prompt);
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
      roadmap = JSON.parse(cleanJson);
    } catch (err) {
      console.error("❌ AI Roadmap Gen Error:", err.message);
      // Fallback
      roadmap = generatePersonalizedRoadmap(latestResume.extractedSkills, latestResume.readinessScore);
    }

    latestResume.targetRole = targetRole;
    latestResume.personalizedRoadmap = roadmap;
    await latestResume.save();

    res.json({ message: "Roadmap generated", roadmap, targetRole });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update target role" });
  }
};

function generatePersonalizedRoadmap(skills, atsScore) {
  const userSkillsLower = skills.map((s) => s.toLowerCase());

  const allSteps = [
    {
      id: 1,
      title: "Programming Fundamentals",
      description: "Master basic programming concepts, variables, loops, and functions",
      estimatedTime: "2-4 weeks",
      difficulty: "Beginner",
      requiredSkills: [],
      status: hasAnySkill(userSkillsLower, ["python", "java", "c++", "javascript", "typescript", "go", "rust"]) ? "completed" : "current",
      resources: ["Codecademy", "FreeCodeCamp", "CS50", "The Odin Project"],
    },
    {
      id: 2,
      title: "Data Structures & Algorithms",
      description: "Learn arrays, linked lists, trees, graphs, and algorithmic thinking",
      estimatedTime: "6-8 weeks",
      difficulty: "Intermediate",
      requiredSkills: ["python", "java", "c++", "javascript", "dsa", "algorithms"],
      status: hasAnySkill(userSkillsLower, ["dsa", "algorithms", "data structures"]) ? "completed" : hasAnySkill(userSkillsLower, ["python", "java", "c++", "javascript"]) ? "current" : "locked",
      resources: ["LeetCode", "HackerRank", "GeeksforGeeks", "AlgoExpert"],
    },
    {
      id: 3,
      title: "Web Development Basics",
      description: "HTML, CSS, JavaScript fundamentals and responsive design",
      estimatedTime: "4-6 weeks",
      difficulty: "Beginner",
      requiredSkills: [],
      status: hasAnySkill(userSkillsLower, ["html", "css", "javascript", "react", "angular", "vue"]) ? "completed" : "current",
      resources: ["MDN Web Docs", "CSS Tricks", "JavaScript.info", "Frontend Masters"],
    },
    {
      id: 4,
      title: "Frontend Framework Mastery",
      description: "Deep dive into React, Vue, or Angular with state management",
      estimatedTime: "6-8 weeks",
      difficulty: "Intermediate",
      requiredSkills: ["react", "angular", "vue", "next.js", "svelte"],
      status: hasAnySkill(userSkillsLower, ["react", "angular", "vue", "next.js"]) ? "completed" : hasAnySkill(userSkillsLower, ["html", "css", "javascript"]) ? "current" : "locked",
      resources: ["React Documentation", "Vue Mastery", "Angular University", "Next.js Docs"],
    },
    {
      id: 5,
      title: "Backend Development",
      description: "Server-side programming with Node.js, Express, databases, and APIs",
      estimatedTime: "6-8 weeks",
      difficulty: "Intermediate",
      requiredSkills: ["node.js", "express.js", "django", "flask", "spring", "ruby on rails"],
      status: hasAnySkill(userSkillsLower, ["node.js", "express.js", "django", "flask", "spring"]) ? "completed" : hasAnySkill(userSkillsLower, ["node.js", "python", "java", "javascript"]) ? "current" : "locked",
      resources: ["Node.js Docs", "Express.js Guide", "MongoDB University", "API Design"],
    },
    {
      id: 6,
      title: "Database Management",
      description: "SQL and NoSQL databases, query optimization, and data modeling",
      estimatedTime: "4-6 weeks",
      difficulty: "Intermediate",
      requiredSkills: ["mongodb", "sql", "postgresql", "mysql", "redis", "cassandra"],
      status: hasAnySkill(userSkillsLower, ["mongodb", "sql", "postgresql", "mysql"]) ? "completed" : hasAnySkill(userSkillsLower, ["node.js", "python", "java"]) ? "current" : "locked",
      resources: ["SQLBolt", "MongoDB Docs", "PostgreSQL Tutorial", "Database Design"],
    },
    {
      id: 7,
      title: "Cloud & DevOps Fundamentals",
      description: "Learn AWS, Docker, Kubernetes, and deployment strategies",
      estimatedTime: "6-8 weeks",
      difficulty: "Intermediate",
      requiredSkills: ["aws", "azure", "google cloud", "docker", "kubernetes", "terraform"],
      status: hasAnySkill(userSkillsLower, ["aws", "azure", "docker", "kubernetes"]) ? "completed" : hasAnySkill(userSkillsLower, ["aws", "azure", "google cloud"]) ? "current" : "locked",
      resources: ["AWS Free Tier", "Docker Hub", "Kubernetes Docs", "DevOps Roadmap"],
    },
    {
      id: 8,
      title: "Version Control & Collaboration",
      description: "Git workflows, GitHub, and team collaboration best practices",
      estimatedTime: "2-3 weeks",
      difficulty: "Beginner",
      requiredSkills: ["git", "github", "gitlab", "bitbucket"],
      status: hasAnySkill(userSkillsLower, ["git", "github", "gitlab"]) ? "completed" : "current",
      resources: ["Git Tutorial", "GitHub Skills", "Atlassian Git", "Git Flow"],
    },
    {
      id: 9,
      title: "Machine Learning & AI",
      description: "Introduction to ML concepts, algorithms, and neural networks",
      estimatedTime: "8-12 weeks",
      difficulty: "Advanced",
      requiredSkills: ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "pandas"],
      status: hasAnySkill(userSkillsLower, ["machine learning", "deep learning", "tensorflow", "pytorch"]) ? "completed" : hasAnySkill(userSkillsLower, ["python", "data science", "artificial intelligence"]) ? "current" : "locked",
      resources: ["Coursera ML", "Fast.ai", "TensorFlow Tutorials", "PyTorch Docs"],
    },
    {
      id: 10,
      title: "System Design & Architecture",
      description: "Design scalable systems, microservices, and distributed applications",
      estimatedTime: "8-10 weeks",
      difficulty: "Advanced",
      requiredSkills: ["node.js", "python", "java", "sql", "mongodb", "system design", "microservices"],
      status: hasAnySkill(userSkillsLower, ["system design", "microservices", "architecture"]) ? "completed" : hasAllSkills(userSkillsLower, ["node.js", "python", "sql", "mongodb"]) && atsScore > 70 ? "current" : "locked",
      resources: ["System Design Primer", "Designing Data-Intensive Apps", "Grokking System Design", "Alex Xu Blog"],
    },
    {
      id: 11,
      title: "Full-Stack Integration",
      description: "Build complete applications with frontend, backend, and deployment",
      estimatedTime: "8-10 weeks",
      difficulty: "Advanced",
      requiredSkills: ["react", "node.js", "mongodb", "aws", "docker"],
      status: hasAllSkills(userSkillsLower, ["react", "node.js", "mongodb"]) && hasAnySkill(userSkillsLower, ["aws", "docker"]) ? "completed" : hasAnySkill(userSkillsLower, ["react", "node.js", "mongodb"]) ? "current" : "locked",
      resources: ["Full Stack Open", "MERN Stack Tutorial", "Deployment Guides", "Cloud Architecture"],
    },
    {
      id: 12,
      title: "Interview Preparation",
      description: "Technical interviews, behavioral questions, and problem-solving strategies",
      estimatedTime: "4-6 weeks",
      difficulty: "Intermediate",
      requiredSkills: ["dsa", "algorithms", "system design"],
      status: atsScore > 75 ? "current" : "locked",
      resources: ["Interview Cake", "Pramp", "LeetCode Interview Prep", "Glassdoor Interview Questions"],
    },
    {
      id: 13,
      title: "Specialization Tracks",
      description: "Deep dive into your chosen domain: Cloud, ML, or Web Development",
      estimatedTime: "10-12 weeks",
      difficulty: "Advanced",
      requiredSkills: [],
      status: atsScore > 80 ? "current" : "locked",
      resources: generateSpecializationResources(userSkillsLower),
    },
  ];

  return allSteps;
}

function hasAnySkill(userSkills, skills) {
  return skills.some((skill) => userSkills.includes(skill.toLowerCase()));
}

function hasAllSkills(userSkills, skills) {
  if (skills.length === 0) return true;
  return skills.every((skill) => userSkills.includes(skill.toLowerCase()));
}

function generateSpecializationResources(userSkills) {
  const resources = [];

  if (hasAnySkill(userSkills, ["aws", "azure", "google cloud"])) {
    resources.push("AWS Solutions Architect", "Azure Developer", "Google Cloud Professional");
  }

  if (hasAnySkill(userSkills, ["machine learning", "deep learning", "tensorflow"])) {
    resources.push("ML Specialization", "Deep Learning Course", "AI Engineer Path");
  }

  if (hasAnySkill(userSkills, ["react", "angular", "vue", "next.js"])) {
    resources.push("Frontend Masters", "React Advanced Patterns", "UI/UX Design");
  }

  if (hasAnySkill(userSkills, ["node.js", "express", "django", "spring"])) {
    resources.push("Backend Architecture", "API Design", "Microservices Course");
  }

  return resources.length > 0 ? resources : ["Career Development", "Industry Certifications", "Open Source Contributions"];
}

function generateJobMatches(userSkills, atsScore) {
  const jobOpportunities = [
    {
      id: "product-mgr-apple",
      title: "Product Manager",
      company: "Apple",
      location: "Cupertino",
      requiredSkills: ["product strategy", "roadmap planning", "agile", "user experience", "market research"],
      minAtsScore: 70,
      applyLink: "https://www.apple.com/careers",
      description: "Define product vision and collaborate across engineering and design teams.",
    },
    {
      id: "finance-analyst-goldman",
      title: "Financial Analyst",
      company: "Goldman Sachs",
      location: "New York",
      requiredSkills: ["financial modeling", "excel", "data analysis", "accounting", "risk management"],
      minAtsScore: 75,
      applyLink: "https://www.goldmansachs.com/careers",
      description: "Perform quantitative analysis and drive investment strategy.",
    },
    {
      id: "marketing-lead-nike",
      title: "Marketing Lead",
      company: "Nike",
      location: "Oregon",
      requiredSkills: ["brand strategy", "digital marketing", "seo", "content creation", "analytics"],
      minAtsScore: 65,
      applyLink: "https://jobs.nike.com",
      description: "Lead global brand campaigns and drive consumer engagement.",
    },
    {
      id: "frontend-dev-google",
      title: "Frontend Developer",
      company: "Google",
      location: "Remote",
      requiredSkills: ["react", "javascript", "html", "css", "redux", "typescript", "webpack", "git"],
      minAtsScore: 70,
      applyLink: "https://www.google.com/careers",
      description: "Develop and maintain user-facing features using modern frontend technologies.",
    },
    {
      id: "backend-eng-amazon",
      title: "Backend Engineer",
      company: "Amazon",
      location: "Bangalore",
      requiredSkills: ["java", "spring", "microservices", "aws", "sql", "docker", "kubernetes", "git"],
      minAtsScore: 75,
      applyLink: "https://www.amazon.jobs",
      description: "Design, build, and maintain scalable backend services and APIs.",
    },
    {
      id: "ai-engineer-microsoft",
      title: "AI Engineer",
      company: "Microsoft",
      location: "Hyderabad",
      requiredSkills: ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "azure", "nlp", "git"],
      minAtsScore: 80,
      applyLink: "https://jobs.careers.microsoft.com",
      description: "Build and deploy machine learning models and AI-powered applications.",
    },
  ];

  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  const targetRoleLower = (typeof arguments !== 'undefined' && arguments[2]) ? arguments[2].toLowerCase() : "";

  // Prioritize jobs that match the user's TARGET ROLE first, then skills
  let matchedJobs = jobOpportunities.filter((job) => {
    const titleMatch = targetRoleLower && job.title.toLowerCase().includes(targetRoleLower.split(' ')[0]);
    const skillMatches = job.requiredSkills.filter((skill) => userSkillsLower.includes(skill.toLowerCase()));
    const skillMatchPercentage = (skillMatches.length / job.requiredSkills.length) * 100;

    // Show it if title matches OR if there's at least a 10% skill match
    return titleMatch || skillMatchPercentage >= 10;
  });

  // Ensure we have at least 3 jobs by grabbing defaults if needed
  if (matchedJobs.length < 3) {
    const extraJobs = jobOpportunities.filter(j => !matchedJobs.some(mj => mj.id === j.id)).slice(0, 3 - matchedJobs.length);
    matchedJobs = [...matchedJobs, ...extraJobs];
  }

  const missingSkills = matchedJobs.flatMap((job) =>
    job.requiredSkills.filter((skill) => !userSkillsLower.includes(skill.toLowerCase()))
  );

  return {
    matchedJobs: matchedJobs.map((job) => ({
      ...job,
      skillMatchPercentage: Math.round(
        (job.requiredSkills.filter((skill) => userSkillsLower.includes(skill.toLowerCase())).length / job.requiredSkills.length) * 100
      ),
    })),
    missingSkills: [...new Set(missingSkills.map((s) => s.toLowerCase()))],
    skillRoadmap: null,
  };
}

export const getJobMatches = async (req, res) => {
  try {
    const latestResume = await Resume.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!latestResume) {
      return res.status(404).json({ message: "No resume found. Please upload a resume first." });
    }

    const skills = latestResume.extractedSkills;
    const atsScore = latestResume.readinessScore;
    const targetRole = latestResume.targetRole || (latestResume.trackMatches?.[0]?.track) || "Career Advancement";

    console.log(`💼 Scouting personalized jobs for ${targetRole} via Gemini...`);

    let jobs = [];
    let missingSkills = [];

    try {
      const prompt = `
        Search for 5 high-quality, personalized job opportunities specifically for a ${targetRole}.
        User Background:
        Skills: ${skills.join(", ")}
        Resume Score: ${atsScore}%

        Even if the user's current skills don't perfectly match a ${targetRole} yet, suggest the best-available "Step-up" or "Entry" roles for that career path.
        For each job, provide:
        - title (string)
        - company (string)
        - location (string)
        - skillMatchPercentage (number: 0-100)
        - description (string: 1 short sentence)
        - requiredSkills (array: list of 5 core skills for this role)

        Respond ONLY with a valid JSON array of objects.
      `;

      console.log("🔄 Calling Gemini v1 for job matches...");
      const responseText = await callGemini(prompt);
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      jobs = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
      
      const userSkillsLower = skills.map(s => s.toLowerCase());
      missingSkills = [...new Set(jobs.flatMap(j => 
        j.requiredSkills.filter(s => !userSkillsLower.includes(s.toLowerCase()))
      ))];

    } catch (err) {
      console.error("❌ AI Job Scouting Error:", err.message);
      // Fallback to dynamic local logic that respects targetRole
      const jobAnalysis = generateJobMatches(skills, atsScore, targetRole);
      jobs = jobAnalysis.matchedJobs;
      missingSkills = jobAnalysis.missingSkills;
    }

    res.json({
      message: "Job matches generated successfully",
      jobs,
      totalJobs: jobs.length,
      missingSkills,
      currentSkills: skills,
      atsScore,
      targetRole
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate job matches" });
  }
};

/**
 * @desc Generate a hierarchical career tree for the "Celestial Orbit" visualization
 * @route GET /api/resume/career-tree
 */
export const getCareerTree = async (req, res) => {
  let latestResume;
  try {
    latestResume = await Resume.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!latestResume) {
      return res.status(404).json({ message: "No resume found. Please upload a resume first." });
    }

    const skills = latestResume.extractedSkills;
    const atsScore = latestResume.readinessScore;
    const targetRole = latestResume.targetRole || "Career Growth";
    const missions = latestResume.trackMatches || [];

    console.log(`🌌 Generating Career Orbit Tree for ${targetRole} via Gemini...`);

    const prompt = `
      Analyze this user's professional profile:
      Current Skills: ${skills.join(", ")}
      Current Readiness Score: ${atsScore}%
      Target Role: ${targetRole}
      AI-Identified Missions (Preferred Paths): ${missions.map(m => m.track).join(", ")}

      Generate a hierarchical tree of potential career paths (3 levels) leading towards or branching from ${targetRole}.
      Level 1: Current Profile (Identity)
      Level 2: Neighboring Roles or Step-up Roles related to ${targetRole} - 3 nodes
      Level 3: Strategic Aspiration Roles (Long-term senior roles) - 2 nodes branching from the Level 2 nodes

      Respond ONLY with a valid JSON object in this exact format:
      {
        "nodes": [
          { "id": "current", "label": "Current Standing", "type": "root", "color": "#7c3aed" },
          { "id": "n1", "label": "Role Name", "type": "neighbor", "description": "Short desc", "parent": "current", "gapSkills": ["Skill A", "Skill B"] }
          ...
        ],
        "edges": [
          { "id": "e-c-n1", "source": "current", "target": "n1", "animated": true }
          ...
        ]
      }
    `;

    console.log("🔄 Calling Gemini v1 for career tree...");
    const responseText = await callGemini(prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const treeData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

    res.json({
      message: "Career tree generated successfully",
      treeData
    });

  } catch (error) {
    console.error("❌ Career Tree Generation Failed:", error);
    const isQuota = error.message?.includes("429") || error.message?.includes("quota");
    
    if (isQuota) {
      const targetRole = latestResume.targetRole || (latestResume.trackMatches?.[0]?.track) || "Product Manager";
      const missions = latestResume.trackMatches || [];
      console.log(`🛠️ Quota exceeded - Returning Simulated Career Orbit based on missions for ${targetRole}...`);
      
      return res.json({
        message: "Simulated Orbit (AI Quota Full)",
        treeData: {
          nodes: [
            { id: 'current', label: 'Current Profile', type: 'root', color: '#7c3aed' },
            { id: 'n1', label: `${targetRole}`, type: 'neighbor', description: `Your active target orbit.`, parent: 'current', gapSkills: ['Industry Expertise', 'Strategic Planning'] },
            { id: 'n2', label: `${missions[1]?.track || 'Senior Strategy'}`, type: 'neighbor', description: 'Advanced orbital trajectory.', parent: 'current', gapSkills: ['Leadership', 'Team Management'] },
            { id: 'n3', label: `${missions[2]?.track || 'Innovation Lead'}`, type: 'neighbor', description: 'Exploring boundary-pushing paths.', parent: 'current', gapSkills: ['Advanced Analysis', 'Ops Optimization'] },
            { id: 'a1', label: `Global ${targetRole} head`, type: 'aspiration', description: 'Commanding multiple career orbits.', parent: 'n1', gapSkills: ['Organizational Design'] },
            { id: 'a2', label: `Executive VP`, type: 'aspiration', description: 'Executive level orbital mastery.', parent: 'n2', gapSkills: ['Business Strategy'] }
          ],
          edges: [
            { id: 'e1', source: 'current', target: 'n1', animated: true },
            { id: 'e2', source: 'current', target: 'n2', animated: true },
            { id: 'e3', source: 'current', target: 'n3', animated: true },
            { id: 'e4', source: 'n1', target: 'a1', animated: true },
            { id: 'e5', source: 'n2', target: 'a2', animated: true }
          ]
        }
      });
    }

    res.status(500).json({ message: "Failed to generate career orbit", error: error.message });
  }
};

export const tutorChat = async (req, res) => {
  try {
    console.log("🤖 tutorChat function called");
    console.log("📋 Request body:", { message: req.body.message });
    console.log("👤 User ID:", req.user?.id);
    
    const { message } = req.body || {};
    const question = typeof message === "string" ? message.trim() : "";
    if (!question) {
      return res.status(400).json({ message: "Message is required" });
    }

    const latestResume = await Resume.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!latestResume) {
      return res.status(404).json({ message: "No resume found. Please upload a resume first." });
    }

    const skills = Array.isArray(latestResume.extractedSkills) ? latestResume.extractedSkills : [];
    const atsScore = latestResume.readinessScore || 0;
    const roadmap = generatePersonalizedRoadmap(skills, atsScore);
    const jobAnalysis = generateJobMatches(skills, atsScore);

    const q = question.toLowerCase();
    const completed = roadmap.filter((s) => s.status === "completed");
    const current = roadmap.filter((s) => s.status === "current");
    
    const jobs = Array.isArray(jobAnalysis?.matchedJobs) ? jobAnalysis.matchedJobs : [];
    const missingSkills = Array.isArray(jobAnalysis?.missingSkills) ? jobAnalysis.missingSkills : [];

    let answer = "";

    try {
      const prompt = `
You are an expert AI Career Coach named "Orbit AI Tutor".
The user is asking: "${question}"

Context about the User:
- ATS Score: ${atsScore}%
- Extracted Skills: ${skills.join(", ") || "None"}
- Shortage/Missing Skills for Top Jobs: ${missingSkills.join(", ") || "None"}
- Active Learning Goals: ${current.map(c => c.title).join(", ") || "None"}
- Top Job Recommendations: ${jobs.slice(0, 3).map(j => `${j.title} at ${j.company}`).join(" | ") || "None"}

Please provide a helpful, tailored, and very concise coaching answer directly to the user based on their specific profile and question. Be conversational, encouraging, and format your output beautifully with emojis and markdown (e.g. boldings, lists) where appropriate. Limit your response to 2-3 short paragraphs max.
      `;

      console.log("🔄 Calling Gemini v1 for tutor chat...");
      answer = await callGemini(prompt);
      console.log("✅ Tutor AI response generated successfully.");

    } catch (aiError) {
      console.error("❌ Tutor AI Generation Failed:", aiError.message);
      // Fallback
      answer = "Oops! My AI circuits are currently overloaded. Please make sure your Gemini API Key is configured correctly in the backend. Meanwhile, keep focusing on learning new skills and applying for jobs!";
    }

    res.json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Tutor chat failed" });
  }
};
