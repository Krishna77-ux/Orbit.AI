import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBMf324iOY5ATAq3NnQLUPdT9ph59Kz4U4";

async function testModels() {
  const ai = new GoogleGenerativeAI(API_KEY);
  
  const modelsToTest = [
    "gemini-2.5-flash",
    "gemini-2.0-flash", 
    "gemini-1.5-flash",
    "gemini-pro",
  ];

  for (const name of modelsToTest) {
    try {
      console.log(`\nTesting: ${name}...`);
      const model = ai.getGenerativeModel({ model: name });
      const result = await model.generateContent("Reply with just the word OK");
      const text = result.response.text();
      console.log(`✅ ${name} WORKS! Response: "${text.trim().substring(0, 50)}"`);
      return name; // Return first working model
    } catch (e) {
      console.log(`❌ ${name} FAILED: ${e.message?.substring(0, 120)}`);
    }
  }
  console.log("\n🚨 ALL MODELS FAILED - API key may be invalid or network issue");
}

testModels().then((working) => {
  if (working) console.log(`\n🎯 USE THIS MODEL: ${working}`);
  process.exit(0);
}).catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
