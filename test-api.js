const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testAPI() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
    const result = await model.generateContent("Hello, test message");
    console.log("API Key is valid. Response:", result.response.text());
  } catch (error) {
    console.error("API Key invalid or error:", error.message);
  }
}

testAPI();