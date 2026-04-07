import pdf from "pdf-parse";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

// Load env explicitly
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const testResume = `
Jane Doe
Software Engineer
Skills: JavaScript, React, Node.js, Python, MongoDB.
Experience: 3 years at Tech Corp performing full-stack development and increasing database efficiency by 15%.
`;

async function runTest() {
  console.log("Starting test...");
  console.log("Checking API Key exists:", !!process.env.GEMINI_API_KEY);
  
  if (!process.env.GEMINI_API_KEY) {
      console.log("API Key missing from .env!");
      process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume text and provide:
1. An ATS Score (0-100) based on industry standards, skill relevance, and impact.
2. A list of technical and soft skills found in the resume.
3. Total calculated years or months of experience (e.g., "3 years 2 months (including internship)").
4. 3-5 specific, actionable suggestions for improving the resume.

Respond ONLY with a valid JSON object in the exact format shown below, with no markdown, no code blocks, and no extra text:
{
  "atsScore": 85,
  "skills": ["React", "Node.js", "Python"],
  "experience": "2 years",
  "suggestions": ["Add more metrics to your experience", "Include soft skills"]
}

Resume Text:
${testResume}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          temperature: 0.2,
          responseMimeType: "application/json",
      }
    });

    console.log("RAW AI RESPONSE:\\n", response.text);
    
    // Test parsing
    const parsedData = JSON.parse(response.text.replace(/\`\`\`json\\n?|\\n?\`\`\`/g, ""));
    console.log("PARSED DATA SUCCESSFULLY:", parsedData);
    
  } catch (error) {
    console.error("Test execution failed:", error);
  }
}

runTest();
