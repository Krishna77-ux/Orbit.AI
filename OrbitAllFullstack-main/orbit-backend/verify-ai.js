import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from current folder
dotenv.config({ path: path.join(__dirname, '.env') });

const log = console.log;
const info = (msg) => log('ℹ [INFO] ' + msg);
const success = (msg) => log('✔ [SUCCESS] ' + msg);
const warn = (msg) => log('⚠ [WARNING] ' + msg);
const error = (msg) => log('✖ [ERROR] ' + msg);
const header = (msg) => log('\n' + '=== ' + msg.toUpperCase() + ' ===');

/**
 * Centered AI Caller (Mirrors logic in controllers/resumeController.js)
 */
async function callAI(prompt, featureName) {
  const groqKeys = [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_2].filter(Boolean);
  const sambanovaKeys = [process.env.SAMBANOVA_API_KEY, process.env.SAMBANOVA_API_KEY_2].filter(Boolean);
  const geminiKey = process.env.GEMINI_API_KEY;

  info(`Testing ${featureName}...`);

  // Try Groq
  for (const [i, key] of groqKeys.entries()) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1
        })
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        success(`${featureName}: Groq (Key #${i + 1}) Success`);
        return content;
      }
    } catch (e) { /* continue */ }
  }

  // Try SambaNova
  for (const [i, key] of sambanovaKeys.entries()) {
    try {
      const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({
          model: "Meta-Llama-3.1-70B-Instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1
        })
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        success(`${featureName}: SambaNova (Key #${i + 1}) Success`);
        return content;
      }
    } catch (e) { /* continue */ }
  }

  // Try Gemini
  if (geminiKey) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            }
          );
        if (response.ok) {
            const data = await response.json();
            success(`${featureName}: Gemini Success`);
            return data.candidates[0].content.parts[0].text;
        }
    } catch (e) { /* continue */ }
  }

  throw new Error(`All providers failed for ${featureName}`);
}

async function runHealthCheck() {
  header("ORBIT AI STATUS CHECK");

  const keys = {
    GROQ: !!process.env.GROQ_API_KEY,
    SAMBANOVA: !!process.env.SAMBANOVA_API_KEY,
    GEMINI: !!process.env.GEMINI_API_KEY,
    MONGO: !!process.env.MONGO_URI,
  };

  log("Environment Status:");
  Object.entries(keys).forEach(([k, v]) => {
    v ? success(`${k} Key: Found`) : warn(`${k} Key: Missing`);
  });

  try {
    // 1. Test Resume Analysis Analysis Logic
    const analysisPrompt = `Analyze this resume snippet: "John Doe, Senior Web Developer with 5 years experience in React and Node.js." 
    Respond ONLY with JSON: { "atsScore": 85, "skills": ["React", "Node.js"] }`;
    const analysisResult = await callAI(analysisPrompt, "Resume Analysis");
    log("  > Result Snapshot: " + analysisResult.substring(0, 100).replace(/\n/g, ' ') + "...");

    // 2. Test Roadmap Generation Logic
    const roadmapPrompt = `Create a 3-step roadmap for a "Cloud Architect". 
    Respond ONLY with JSON array: [{ "id": 1, "title": "AWS Basics" }]`;
    const roadmapResult = await callAI(roadmapPrompt, "Roadmap Generation");
    log("  > Result Snapshot: " + roadmapResult.substring(0, 100).replace(/\n/g, ' ') + "...");

    // 3. Test Interview Prep Logic
    const interviewPrompt = `Generate 2 interview questions for a "React Developer". 
    Respond ONLY with JSON array: [{ "question": "..." }]`;
    const interviewResult = await callAI(interviewPrompt, "Interview Prep");
    log("  > Result Snapshot: " + interviewResult.substring(0, 100).replace(/\n/g, ' ') + "...");

    // 4. Test Chat Tutor Logic
    const tutorPrompt = `You are a career tutor. Briefly explain what a "Full Stack Developer" does in 1 sentence.`;
    const tutorResult = await callAI(tutorPrompt, "AI Career Tutor");
    log("  > Result Snapshot: " + tutorResult.trim());

    header("FINAL RESULT: SYSTEM HEALTHY 🚀");
    log("All AI features are responding correctly with current API keys.");

  } catch (err) {
    header("FINAL RESULT: CRITICAL ERROR ❌");
    error(err.message);
    log("\nTroubleshooting tips:");
    log("1. Check if your API keys in .env are still valid (not expired/revoked).");
    log("2. Verify your internet connection can reach groq.com or googleapis.com.");
    log("3. If using Vercel, ensure these variables are added to the Vercel Dashboard.");
  }
}

runHealthCheck();
