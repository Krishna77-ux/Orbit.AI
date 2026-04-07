import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Resume from "../models/Resume.js";

// ✅ SIGNUP Controller
export const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists ❌" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Signup successful ✅",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ LOGIN Controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials ❌" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials ❌" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ JOB MATCHING Controller
export const getJobMatches = async (req, res) => {
  try {
    // Get the latest resume for the user
    const latestResume = await Resume.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    
    if (!latestResume) {
      return res.status(404).json({ message: "No resume found. Please upload a resume first." });
    }

    const skills = latestResume.extractedSkills;
    const atsScore = latestResume.readinessScore;

    // Generate job matches and skill roadmap
    const jobAnalysis = generateJobMatches(skills, atsScore);

    res.json({
      message: "Job matches generated successfully",
      jobs: jobAnalysis.matchedJobs,
      totalJobs: jobAnalysis.matchedJobs.length,
      missingSkills: jobAnalysis.missingSkills,
      skillRoadmap: jobAnalysis.skillRoadmap,
      currentSkills: skills,
      atsScore,
      recommendations: {
        improveProfile: jobAnalysis.missingSkills.length > 0 ? 
          `Consider adding these skills: ${jobAnalysis.missingSkills.slice(0, 5).join(", ")}` : 
          "Your skill profile is strong!",
        applyStrategy: "Focus on jobs where you match at least 50% of required skills",
        nextSteps: jobAnalysis.skillRoadmap ? 
          "Complete the recommended skill roadmap before applying" : 
          "Continue building your current skills"
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate job matches" });
  }
};

// Helper function for job matching (moved from resumeController)
function generateJobMatches(userSkills, atsScore) {
  const jobOpportunities = [
    {
      id: "frontend-dev-google",
      title: "Frontend Developer",
      company: "Google",
      location: "Remote",
      requiredSkills: ["react", "javascript", "html", "css", "redux", "typescript", "webpack", "git"],
      minAtsScore: 70,
      applyLink: "https://careers.google.com/jobs/results/12345/",
      description: "Develop and maintain user-facing features using modern frontend technologies."
    },
    {
      id: "backend-eng-amazon",
      title: "Backend Engineer",
      company: "Amazon",
      location: "Bangalore",
      requiredSkills: ["java", "spring", "microservices", "aws", "sql", "docker", "kubernetes", "git"],
      minAtsScore: 75,
      applyLink: "https://www.amazon.jobs/en/jobs/67890/",
      description: "Design, build, and maintain scalable backend services and APIs."
    },
    {
      id: "ai-engineer-microsoft",
      title: "AI Engineer",
      company: "Microsoft",
      location: "Hyderabad",
      requiredSkills: ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "azure", "nlp", "git"],
      minAtsScore: 80,
      applyLink: "https://careers.microsoft.com/jobs/ai-engineer/",
      description: "Build and deploy machine learning models and AI-powered applications."
    },
    {
      id: "fullstack-meta",
      title: "Full Stack Developer",
      company: "Meta",
      location: "Menlo Park",
      requiredSkills: ["react", "node.js", "javascript", "python", "sql", "graphql", "git"],
      minAtsScore: 75,
      applyLink: "https://www.metacareers.com/jobs/678901/",
      description: "Build end-to-end applications across frontend, backend, and infrastructure."
    },
    {
      id: "devops-netflix",
      title: "DevOps Engineer",
      company: "Netflix",
      location: "Los Gatos",
      requiredSkills: ["aws", "docker", "kubernetes", "terraform", "jenkins", "ci/cd", "linux", "python", "git"],
      minAtsScore: 75,
      applyLink: "https://jobs.netflix.com/jobs/123456/",
      description: "Maintain and improve deployment infrastructure for streaming services."
    },
    {
      id: "data-scientist-spark",
      title: "Data Scientist",
      company: "Apache Spark",
      location: "San Francisco",
      requiredSkills: ["python", "pandas", "numpy", "machine learning", "deep learning", "sql", "spark"],
      minAtsScore: 80,
      applyLink: "https://spark.apache.org/jobs/data-scientist/",
      description: "Analyze large datasets and build predictive models using Apache Spark."
    }
  ];

  // Filter jobs based on user's skills and ATS score
  const matchedJobs = jobOpportunities.filter(job => {
    // Check if user meets minimum ATS score
    if (atsScore < job.minAtsScore) return false;
    
    // Check skill alignment
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const requiredSkillsLower = job.requiredSkills.map(s => s.toLowerCase());
    
    const matchingSkills = requiredSkills.filter(skill => 
      userSkillsLower.includes(skill)
    );
    
    // Calculate skill match percentage
    const skillMatchPercentage = (matchingSkills.length / requiredSkills.length) * 100;
    
    // Consider job if user has at least 50% of required skills
    return skillMatchPercentage >= 50;
  });

  // Generate learning roadmap for missing skills
  const generateSkillRoadmap = (missingSkills) => {
    return missingSkills.map((skill, index) => ({
      id: `skill-${index + 1}`,
      title: `Learn ${skill}`,
      description: `Master ${skill} through online courses, projects, and hands-on practice`,
      estimatedTime: "4-8 weeks",
      difficulty: "Intermediate",
      status: "current",
      resources: getSkillResources(skill)
    }));
  };

  const getSkillResources = (skill) => {
    const resourceMap = {
      "python": ["Python.org", "Real Python", "Codecademy Python Course"],
      "react": ["React Documentation", "React Tutorial", "Frontend Masters"],
      "node.js": ["Node.js Docs", "Express.js Guide", "NodeSchool"],
      "aws": ["AWS Free Tier", "AWS Solutions Architect", "CloudGuru"],
      "docker": ["Docker Hub", "Docker Tutorial", "Play with Docker"],
      "kubernetes": ["Kubernetes Docs", "Katacoda", "Kubernetes Academy"],
      "sql": ["SQLBolt", "Mode Analytics", "SQL Zoo"],
      "machine learning": ["Coursera ML", "Fast.ai", "Google ML Crash Course"],
      "git": ["Git Tutorial", "GitHub Skills", "Atlassian Git"]
    };
    return resourceMap[skill.toLowerCase()] || ["General Programming Resources", "Online Learning Platforms", "Tech Communities"];
  };
}