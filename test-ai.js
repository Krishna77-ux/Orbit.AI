import dotenv from 'dotenv';
dotenv.config({ path: './orbit-backend/.env' });

async function testAI() {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  console.log("Checking keys...");
  console.log("Groq Key present:", !!groqKey);
  console.log("Gemini Key present:", !!geminiKey);

  if (!groqKey) {
    console.error("GROQ_API_KEY is missing in .env");
    return;
  }

  const prompt = "Say 'Hello, AI is working!' in JSON format: { 'message': '...' }";

  try {
    console.log("Testing Groq...");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      })
    });
    const data = await response.json();
    if (!response.ok) {
        console.error("Groq Failed:", JSON.stringify(data));
    } else {
        console.log("Groq Success:", data.choices[0].message.content);
    }
  } catch (err) {
    console.error("Groq Fetch Error:", err.message);
  }

  if (geminiKey) {
    try {
      console.log("\nTesting Gemini...");
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );
      const data = await response.json();
      if (!response.ok) {
          console.error("Gemini Failed:", JSON.stringify(data));
      } else {
          console.log("Gemini Success:", data.candidates[0].content.parts[0].text);
      }
    } catch (err) {
      console.error("Gemini Fetch Error:", err.message);
    }
  }
}

testAI();
