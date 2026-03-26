require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Load instructions.txt
function loadInstructions() {
  try {
    const filePath = path.join(__dirname, "instructions.txt");
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "You are a helpful assistant.";
  }
}

// AI Reply
async function getAIReply(userMessage) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return "⚠️ AI not configured.";
    }

    const instructions = loadInstructions();

    // 🔥 hidden system control (force behavior)
    const systemPrompt = `
${instructions}

IMPORTANT RULES:
- Reply in simple Hinglish or English
- Keep replies short (max 2-4 lines)
- Avoid complex Hindi
- Be human-like, not robotic
`;

    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data.choices[0].message.content.trim();

  } catch (err) {
    return "⚠️ AI error, try again.";
  }
}

module.exports = { getAIReply };