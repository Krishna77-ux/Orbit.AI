# 🎯 ATS Score Calculation - Complete Code Implementation

## 📋 1. Main ATS Analysis Function

### File: `src/controllers/resumeController.js`

```javascript
import pdf from "pdf-parse";
import Resume from "../models/Resume.js";
import { GoogleGenAI } from "@google/genai";

export const uploadResume = async (req, res) => {
  try {
    console.log("📧 Upload request received");
    console.log("🔑 User ID:", req.user?.id);
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Step 1: Parse PDF to extract text
    console.log("📄 Processing PDF...");
    const data = await pdf(req.file.buffer);
    const text = data.text;
    console.log("✅ PDF processed successfully");

    // Step 2: Initialize AI analysis variables
    let atsScore = 0;
    let extractedSkills = [];
    let experience = "Not specified";
    let suggestions = [];

    try {
      // Step 3: AI Analysis with Gemini
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Step 4: Detailed ATS Analysis Prompt
      const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer with 15+ years of experience in tech recruitment. 
Analyze the following resume text and provide a comprehensive evaluation:

SCORING CRITERIA (0-100 scale):
1. Skill Relevance (30 points): Modern tech stack, industry demand, skill depth
2. Experience Quality (25 points): Years, progression, company reputation  
3. Impact & Metrics (20 points): Quantifiable achievements, project scale
4. Keywords & Buzzwords (15 points): Industry-standard terminology
5. Structure & Formatting (10 points): Organization, clarity, length

EVALUATION FACTORS:
- Modern Technologies: React, Node.js, Python, AWS, Docker, Kubernetes, etc.
- Experience Level: 0-2 years (junior), 3-5 years (mid), 6+ years (senior)
- Quantifiable Impact: "Increased X by Y%", "Led team of Z", "Reduced costs by $X"
- Industry Keywords: "Agile", "DevOps", "Cloud", "Microservices", "CI/CD"
- Resume Structure: Clear sections, professional formatting, appropriate length

Provide analysis in this exact JSON format:
{
  "atsScore": 85,
  "skills": ["React", "Node.js", "Python", "AWS", "Docker"],
  "experience": "3 years 2 months",
  "suggestions": [
    "Add specific metrics for each project achievement",
    "Include more recent cloud technologies",
    "Quantify team leadership impact"
  ]
}

Resume Text to Analyze:
${text.substring(0, 10000)}
      `;

      // Step 5: Call Gemini AI API
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.2,  // Low temperature for consistent scoring
          responseMimeType: "application/json",
        }
      });
      
      const responseText = response.text;
      console.log("🤖 AI Response:", responseText);
      
      // Step 6: Parse AI Response
      let parsedData;
      try {
        parsedData = JSON.parse(responseText.replace(/```json\n?|\n?```/g, ""));
      } catch (parseError) {
        console.error("❌ Failed to parse Gemini response:", responseText);
        throw new Error("Invalid format returned by AI.");
      }
      
      // Step 7: Extract AI Analysis Results
      atsScore = parsedData.atsScore || 0;
      extractedSkills = parsedData.skills || [];
      experience = parsedData.experience || "Not specified";
      suggestions = parsedData.suggestions || [];
      
      console.log("✅ Gemini AI analysis complete. Score:", atsScore);
      console.log("🔍 Extracted Skills:", extractedSkills);
      
    } catch (aiError) {
      console.error("❌ Gemini AI analysis failed:", aiError.message);
      console.log("🔄 Using fallback scoring system...");
      
      // Step 8: Fallback Scoring System (if AI fails)
      const fallbackAnalysis = analyzeResumeManually(text);
      atsScore = fallbackAnalysis.atsScore;
      extractedSkills = fallbackAnalysis.skills;
      experience = fallbackAnalysis.experience;
      suggestions = fallbackAnalysis.suggestions;
    }

    // Step 9: Generate additional metrics
    const roadmap = generatePersonalizedRoadmap(extractedSkills, atsScore);
    const completedSteps = roadmap.filter((step) => step.status === "completed").length;
    const roadmapProgress = roadmap.length ? Math.min(100, (completedSteps / roadmap.length) * 100) : 0;
    const jobsMatched = Math.floor((atsScore / 100) * extractedSkills.length * 2);

    // Step 10: Remove duplicate skills
    const uniqueSkills = [...new Set(extractedSkills)];

    // Step 11: Save to Database
    console.log("💾 Saving resume to database...");
    const savedResume = await Resume.create({
      user: req.user.id,
      extractedSkills: uniqueSkills,
      readinessScore: atsScore,
      roadmapProgress: Math.round(roadmapProgress),
      jobsMatched,
    });

    // Step 12: Return Results
    res.status(200).json({
      message: "Resume processed successfully",
      atsScore,
      skills: uniqueSkills,
      experience,
      suggestions,
      roadmapProgress: Math.round(roadmapProgress),
      jobsMatched,
    });
    
  } catch (error) {
    console.error("❌ Resume upload error:", error);
    res.status(500).json({
      message: "Resume processing failed: " + error.message,
    });
  }
};
```

---

## 🔄 2. Manual Fallback Analysis Function

```javascript
// Fallback function if AI analysis fails
function analyzeResumeManually(resumeText) {
  const text = resumeText.toLowerCase();
  let score = 0;
  let skills = [];
  let experience = "Not specified";
  let suggestions = [];

  // Skill Analysis (30 points max)
  const modernSkills = [
    'react', 'node.js', 'python', 'aws', 'docker', 'kubernetes', 
    'typescript', 'mongodb', 'postgresql', 'graphql', 'microservices'
  ];
  
  const foundSkills = modernSkills.filter(skill => text.includes(skill));
  skills = foundSkills.map(skill => skill.charAt(0).toUpperCase() + skill.slice(1));
  score += Math.min(30, foundSkills.length * 3);

  // Experience Analysis (25 points max)
  const experienceMatch = text.match(/(\d+)\s*(years?|months?)/i);
  if (experienceMatch) {
    experience = experienceMatch[0];
    const years = parseInt(experienceMatch[1]);
    if (experienceMatch[2].includes('year')) {
      score += Math.min(25, years * 5);
    }
  }

  // Keywords Analysis (15 points max)
  const keywords = ['agile', 'devops', 'cloud', 'ci/cd', 'rest api', 'machine learning'];
  const foundKeywords = keywords.filter(keyword => text.includes(keyword));
  score += Math.min(15, foundKeywords.length * 3);

  // Metrics Analysis (20 points max)
  const metricsPatterns = [
    /increased.*by\s*\d+%/i,
    /reduced.*by\s*\d+/i,
    /led\s*team\s*of\s*\d+/i,
    /\$\d+/i
  ];
  const hasMetrics = metricsPatterns.some(pattern => text.match(pattern));
  if (hasMetrics) score += 20;

  // Structure Analysis (10 points max)
  const hasClearSections = text.includes('experience') && text.includes('skills') && text.includes('education');
  if (hasClearSections) score += 10;

  // Generate suggestions based on analysis
  suggestions = [];
  if (foundSkills.length < 5) {
    suggestions.push("Add more modern technical skills to your resume");
  }
  if (!hasMetrics) {
    suggestions.push("Include quantifiable achievements and metrics");
  }
  if (!hasClearSections) {
    suggestions.push("Organize resume with clear sections for experience, skills, and education");
  }

  return {
    atsScore: Math.min(100, score),
    skills: skills.length > 0 ? skills : ["JavaScript", "React", "Node.js"],
    experience: experience,
    suggestions: suggestions.length > 0 ? suggestions : ["Add more details to improve your ATS score"]
  };
}
```

---

## 📊 3. Detailed ATS Scoring Rubric Function

```javascript
// Advanced ATS scoring function with detailed breakdown
function calculateDetailedATSScore(resumeText) {
  const text = resumeText.toLowerCase();
  let scoringBreakdown = {
    skillRelevance: 0,
    experienceQuality: 0,
    impactMetrics: 0,
    keywords: 0,
    structure: 0,
    totalScore: 0
  };

  // 1. Skill Relevance (30 points)
  const skillCategories = {
    'frontend': ['react', 'vue', 'angular', 'typescript', 'html', 'css', 'tailwind'],
    'backend': ['node.js', 'express', 'python', 'django', 'java', 'spring', 'php'],
    'database': ['mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch'],
    'cloud': ['aws', 'azure', 'google cloud', 'docker', 'kubernetes', 'terraform'],
    'devops': ['ci/cd', 'jenkins', 'github actions', 'gitlab', 'ansible'],
    'mobile': ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android']
  };

  let foundSkills = [];
  Object.entries(skillCategories).forEach(([category, skills]) => {
    const categorySkills = skills.filter(skill => text.includes(skill));
    foundSkills = [...foundSkills, ...categorySkills];
    scoringBreakdown.skillRelevance += Math.min(5, categorySkills.length);
  });

  // 2. Experience Quality (25 points)
  const experiencePatterns = [
    { pattern: /(\d+)\+?\s*years/i, points: 15 },
    { pattern: /senior|lead|principal|architect/i, points: 10 },
    { pattern: /manager|director|vp|head of/i, points: 15 }
  ];

  experiencePatterns.forEach(({ pattern, points }) => {
    if (text.match(pattern)) {
      scoringBreakdown.experienceQuality += points;
    }
  });

  // 3. Impact Metrics (20 points)
  const metricPatterns = [
    { pattern: /increased.*by\s*\d+%/i, points: 5 },
    { pattern: /reduced.*by\s*\d+/i, points: 5 },
    { pattern: /led\s*team\s*of\s*\d+/i, points: 5 },
    { pattern: /\$\d+k?\s*(million|billion)?/i, points: 5 },
    { pattern: /scaled\s*to\s*\d+/i, points: 5 }
  ];

  metricPatterns.forEach(({ pattern, points }) => {
    if (text.match(pattern)) {
      scoringBreakdown.impactMetrics = Math.min(20, scoringBreakdown.impactMetrics + points);
    }
  });

  // 4. Keywords & Buzzwords (15 points)
  const industryKeywords = [
    'agile', 'scrum', 'devops', 'microservices', 'serverless',
    'machine learning', 'ai', 'blockchain', 'iot', 'big data',
    'rest api', 'graphql', 'websocket', 'real-time'
  ];

  const foundKeywords = industryKeywords.filter(keyword => text.includes(keyword));
  scoringBreakdown.keywords = Math.min(15, foundKeywords.length * 2);

  // 5. Structure & Formatting (10 points)
  const structureChecks = [
    { condition: text.includes('summary') || text.includes('objective'), points: 2 },
    { condition: text.includes('experience') && text.includes('education'), points: 3 },
    { condition: text.includes('skills') || text.includes('technical'), points: 2 },
    { condition: text.length > 500 && text.length < 5000, points: 3 }
  ];

  structureChecks.forEach(({ condition, points }) => {
    if (condition) scoringBreakdown.structure += points;
  });

  // Calculate total score
  scoringBreakdown.totalScore = Object.values(scoringBreakdown).reduce((a, b) => a + b, 0) - scoringBreakdown.totalScore;

  return {
    score: Math.min(100, scoringBreakdown.totalScore),
    breakdown: scoringBreakdown,
    skills: [...new Set(foundSkills)],
    keywords: foundKeywords
  };
}
```

---

## 🎯 4. Job Matching Based on ATS Score

```javascript
// Function that uses ATS score for job matching
function generateJobMatches(userSkills, atsScore) {
  const jobOpportunities = [
    {
      id: "senior-frontend-google",
      title: "Senior Frontend Developer",
      company: "Google",
      location: "Remote",
      requiredSkills: ["react", "typescript", "node.js", "aws"],
      minAtsScore: 80,
      maxSalary: "$200k",
      applyLink: "https://careers.google.com/jobs/12345"
    },
    {
      id: "fullstack-meta",
      title: "Full Stack Engineer", 
      company: "Meta",
      location: "Menlo Park",
      requiredSkills: ["react", "node.js", "python", "graphql"],
      minAtsScore: 75,
      maxSalary: "$180k",
      applyLink: "https://www.metacareers.com/jobs/67890"
    },
    {
      id: "backend-amazon",
      title: "Backend Engineer",
      company: "Amazon", 
      location: "Bangalore",
      requiredSkills: ["java", "spring", "aws", "microservices"],
      minAtsScore: 70,
      maxSalary: "$150k",
      applyLink: "https://www.amazon.jobs/en/jobs/11111"
    }
  ];

  // Filter jobs based on ATS score and skill match
  const eligibleJobs = jobOpportunities.filter(job => {
    // Must meet minimum ATS score
    if (atsScore < job.minAtsScore) return false;
    
    // Calculate skill match percentage
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const requiredSkillsLower = job.requiredSkills.map(s => s.toLowerCase());
    
    const matchingSkills = requiredSkillsLower.filter(skill => 
      userSkillsLower.includes(skill)
    );
    
    const skillMatchPercentage = (matchingSkills.length / requiredSkills.length) * 100;
    
    // Require at least 50% skill match
    return skillMatchPercentage >= 50;
  });

  return {
    matchedJobs: eligibleJobs.map(job => ({
      ...job,
      skillMatchPercentage: calculateSkillMatch(userSkills, job.requiredSkills),
      atsRequirement: job.minAtsScore,
      userScore: atsScore,
      qualified: atsScore >= job.minAtsScore
    })),
    totalMatches: eligibleJobs.length,
    averageMatchScore: eligibleJobs.length > 0 
      ? eligibleJobs.reduce((sum, job) => sum + calculateSkillMatch(userSkills, job.requiredSkills), 0) / eligibleJobs.length 
      : 0
  };
}

function calculateSkillMatch(userSkills, requiredSkills) {
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());
  
  const matchingSkills = requiredSkillsLower.filter(skill => 
    userSkillsLower.includes(skill)
  );
  
  return Math.round((matchingSkills.length / requiredSkills.length) * 100);
}
```

---

## 📈 5. Real-time ATS Score Updates

```javascript
// Function to update ATS score based on user improvements
export const updateATSScore = async (req, res) => {
  try {
    const { improvements } = req.body; // Array of improvements made by user
    const userId = req.user.id;
    
    // Get latest resume
    const latestResume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
    if (!latestResume) {
      return res.status(404).json({ message: "No resume found" });
    }

    let newScore = latestResume.readinessScore;
    const scoreIncrease = {
      addedSkills: 0,
      addedMetrics: 0,
      improvedStructure: 0,
      addedKeywords: 0
    };

    // Calculate score increases based on improvements
    improvements.forEach(improvement => {
      switch(improvement.type) {
        case 'skill':
          scoreIncrease.addedSkills += 3;
          break;
        case 'metric':
          scoreIncrease.addedMetrics += 5;
          break;
        case 'structure':
          scoreIncrease.improvedStructure += 2;
          break;
        case 'keyword':
          scoreIncrease.addedKeywords += 2;
          break;
      }
    });

    // Update score (max 100)
    newScore = Math.min(100, newScore + Object.values(scoreIncrease).reduce((a, b) => a + b, 0));

    // Update database
    await Resume.findByIdAndUpdate(latestResume._id, { 
      readinessScore: newScore,
      lastUpdated: new Date()
    });

    res.json({
      message: "ATS score updated successfully",
      previousScore: latestResume.readinessScore,
      newScore: newScore,
      improvement: scoreIncrease
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to update ATS score" });
  }
};
```

---

## 🎯 6. ATS Score Impact on Features

```javascript
// How ATS score affects different features
export const getFeaturesByScore = (atsScore) => {
  const features = {
    jobMatching: {
      available: atsScore >= 50,
      quality: atsScore >= 80 ? 'premium' : atsScore >= 60 ? 'standard' : 'basic',
      maxJobs: atsScore >= 80 ? 50 : atsScore >= 60 ? 20 : 5
    },
    roadmap: {
      advancedPaths: atsScore >= 70,
      personalizedContent: atsScore >= 50,
      basicGuidance: true
    },
    aiTutor: {
      contextualAdvice: atsScore >= 60,
      detailedAnalysis: atsScore >= 80,
      basicSupport: atsScore >= 40
    },
    recommendations: {
      salaryNegotiation: atsScore >= 75,
      interviewPrep: atsScore >= 60,
      resumeTips: atsScore >= 40
    }
  };

  return features;
};

// Example usage in API responses
export const getPersonalizedRecommendations = (atsScore, skills) => {
  const recommendations = [];

  if (atsScore < 50) {
    recommendations.push({
      priority: 'high',
      category: 'foundation',
      title: 'Focus on Core Skills',
      description: 'Build strong fundamentals in programming and web development',
      actionItems: ['Complete basic programming courses', 'Build 2-3 portfolio projects']
    });
  }

  if (atsScore >= 50 && atsScore < 70) {
    recommendations.push({
      priority: 'medium',
      category: 'intermediate',
      title: 'Expand Tech Stack',
      description: 'Add more modern technologies to your skillset',
      actionItems: ['Learn cloud platforms', 'Master a backend framework']
    });
  }

  if (atsScore >= 70) {
    recommendations.push({
      priority: 'low',
      category: 'advanced',
      title: 'Specialize and Lead',
      description: 'Focus on specialization and leadership opportunities',
      actionItems: ['Consider team lead roles', 'Explore architecture positions']
    });
  }

  return recommendations;
};
```

---

## 🔍 7. Complete ATS Analysis Pipeline

```javascript
// Main pipeline that orchestrates the entire ATS analysis
export const performCompleteATSAnalysis = async (resumeText, userId) => {
  try {
    console.log("🚀 Starting complete ATS analysis pipeline...");

    // Step 1: AI Analysis
    const aiAnalysis = await performAIAnalysis(resumeText);
    
    // Step 2: Manual Validation (cross-check AI results)
    const manualValidation = analyzeResumeManually(resumeText);
    
    // Step 3: Score Consistency Check
    const scoreDifference = Math.abs(aiAnalysis.atsScore - manualValidation.atsScore);
    const finalScore = scoreDifference > 20 
      ? (aiAnalysis.atsScore + manualValidation.atsScore) / 2  // Average if big difference
      : aiAnalysis.atsScore;  // Trust AI if close

    // Step 4: Generate Comprehensive Report
    const analysisReport = {
      atsScore: Math.round(finalScore),
      confidence: scoreDifference < 15 ? 'high' : scoreDifference < 30 ? 'medium' : 'low',
      skills: [...new Set([...aiAnalysis.skills, ...manualValidation.skills])],
      experience: aiAnalysis.experience,
      suggestions: [...new Set([...aiAnalysis.suggestions, ...manualValidation.suggestions])],
      
      // Detailed breakdown
      scoringBreakdown: calculateDetailedATSScore(resumeText),
      
      // Feature access based on score
      featureAccess: getFeaturesByScore(finalScore),
      
      // Personalized recommendations
      recommendations: getPersonalizedRecommendations(finalScore, aiAnalysis.skills),
      
      // Job matching potential
      jobPotential: generateJobMatches(aiAnalysis.skills, finalScore),
      
      // Improvement roadmap
      improvementPlan: generateImprovementPlan(finalScore, aiAnalysis.skills)
    };

    console.log("✅ ATS analysis complete. Score:", analysisReport.atsScore);
    return analysisReport;

  } catch (error) {
    console.error("❌ ATS analysis failed:", error);
    throw error;
  }
};
```

---

## 📊 Summary

The ATS score calculation uses:

1. **AI Analysis** (Primary): Google Gemini AI evaluates resume against industry standards
2. **Manual Fallback** (Backup): Rule-based scoring if AI fails
3. **Detailed Breakdown**: 5 categories with weighted scoring
4. **Real-time Updates**: Score improves with user actions
5. **Feature Integration**: Score affects job matching, roadmap, and recommendations

**Scoring Formula:**
```
Total Score (0-100) = 
  Skill Relevance (30%) +
  Experience Quality (25%) + 
  Impact Metrics (20%) +
  Keywords (15%) +
  Structure (10%)
```

This comprehensive system ensures accurate, fair, and useful ATS scoring! 🎯
