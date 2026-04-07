import pdf from "pdf-parse";
import Resume from "../models/Resume.js";
import { canUploadResume, decrementUploadCount } from "./paymentController.js";
import { GoogleGenAI } from "@google/genai";

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
    const data = await pdf(req.file.buffer);
    const text = data.text;

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
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from environment variables.");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.1,
            responseMimeType: "application/json",
        }
      });
      
      const responseText = response.text;
      console.log("📥 Raw AI Response (First 100 char):", responseText.substring(0, 100));
      
      let parsedData;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
        parsedData = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", responseText);
        throw new Error("AI returned malformed data format.");
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
      console.error("⛔ CRITICAL AI ERROR:", aiError);
      const isQuota = aiError.message?.includes("429") || aiError.message?.includes("quota") || aiError.status === 429;
      res.status(500).json({ 
        message: isQuota ? "AI Quota exceeded. Please try again in 1 minute." : "AI Analysis failed", 
        detail: aiError.message,
        isQuotaExceeded: isQuota
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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.3, responseMimeType: "application/json" }
      });

      const responseText = response.text;
      const jsonMatch = responseText.match(/\[[\s\S]*\]/); // Array match
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
      id: "frontend-dev-google",
      title: "Frontend Developer",
      company: "Google",
      location: "Remote",
      requiredSkills: ["react", "javascript", "html", "css", "redux", "typescript", "webpack", "git"],
      minAtsScore: 70,
      applyLink: "https://www.google.com/about/careers/applications/jobs/results/?q=Frontend%20Developer",
      description: "Develop and maintain user-facing features using modern frontend technologies.",
    },
    {
      id: "backend-eng-amazon",
      title: "Backend Engineer",
      company: "Amazon",
      location: "Bangalore",
      requiredSkills: ["java", "spring", "microservices", "aws", "sql", "docker", "kubernetes", "git"],
      minAtsScore: 75,
      applyLink: "https://www.amazon.jobs/en/search?base_query=Backend%20Engineer",
      description: "Design, build, and maintain scalable backend services and APIs.",
    },
    {
      id: "ai-engineer-microsoft",
      title: "AI Engineer",
      company: "Microsoft",
      location: "Hyderabad",
      requiredSkills: ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "azure", "nlp", "git"],
      minAtsScore: 80,
      applyLink: "https://jobs.careers.microsoft.com/global/en/search?q=AI%20Engineer",
      description: "Build and deploy machine learning models and AI-powered applications.",
    },
    {
      id: "fullstack-meta",
      title: "Full Stack Developer",
      company: "Meta",
      location: "Menlo Park",
      requiredSkills: ["react", "node.js", "javascript", "python", "sql", "graphql", "git"],
      minAtsScore: 75,
      applyLink: "https://www.metacareers.com/jobs/?q=Full%20Stack%20Developer",
      description: "Build end-to-end applications across frontend, backend, and infrastructure.",
    },
    {
      id: "devops-netflix",
      title: "DevOps Engineer",
      company: "Netflix",
      location: "Los Gatos",
      requiredSkills: ["aws", "docker", "kubernetes", "terraform", "jenkins", "ci/cd", "linux", "python", "git"],
      minAtsScore: 75,
      applyLink: "https://jobs.netflix.com/search?q=DevOps%20Engineer",
      description: "Maintain and improve deployment infrastructure for streaming services.",
    },
    {
      id: "data-scientist-spark",
      title: "Data Scientist",
      company: "Apache Spark",
      location: "San Francisco",
      requiredSkills: ["python", "pandas", "numpy", "machine learning", "deep learning", "sql", "spark"],
      minAtsScore: 80,
      applyLink: "https://www.linkedin.com/jobs/search/?keywords=Data%20Scientist%20Spark",
      description: "Analyze large datasets and build predictive models using Apache Spark.",
    },
  ];

  const userSkillsLower = userSkills.map((s) => s.toLowerCase());

  const matchedJobs = jobOpportunities.filter((job) => {
    if (atsScore < job.minAtsScore) return false;

    const matchingSkills = job.requiredSkills.filter((skill) => userSkillsLower.includes(skill.toLowerCase()));
    const skillMatchPercentage = (matchingSkills.length / job.requiredSkills.length) * 100;
    return skillMatchPercentage >= 50;
  });

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
    const jobAnalysis = generateJobMatches(skills, atsScore);

    res.json({
      message: "Job matches generated successfully",
      jobs: jobAnalysis.matchedJobs,
      totalJobs: jobAnalysis.matchedJobs.length,
      missingSkills: jobAnalysis.missingSkills,
      skillRoadmap: jobAnalysis.skillRoadmap,
      currentSkills: skills,
      atsScore,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate job matches" });
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
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      answer = response.text;
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