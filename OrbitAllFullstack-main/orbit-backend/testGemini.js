import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Hello, who are you?");
    console.log(result.response.text());
  } catch (err) {
    console.error("AI Error:", err);
  }
}

test();
