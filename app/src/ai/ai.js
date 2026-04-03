require("dotenv").config();
const axios = require("axios");
const { buildSystemPrompt } = require("./SystemPrompt");

// ⚙️ Config validation
function validateEnv() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY in .env");
  }

  if (!process.env.AI_MODEL) {
    throw new Error("Missing AI_MODEL in .env");
  }
}

// ⏱️ timeout wrapper
function withTimeout(promise, ms = 10000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("AI request timeout")), ms)
  );
  return Promise.race([promise, timeout]);
}

// 💬 fallback replies
function getFallbackReply() {
  const replies = [
    "Thoda busy hu abhi, thodi der me reply karta hu 🙂",
    "Ek min check karke batata hu 👍",
    "Got it! Thoda process kar raha hu, wait kare 😊"
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

// 🤖 AI Reply
async function getAIReply(userMessage) {
  try {
    validateEnv();

    const systemPrompt = buildSystemPrompt();

    const request = axios.post(
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

    const res = await withTimeout(request, 10000);

    // ✅ Safe response parsing
    const content =
      res?.data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      console.error("⚠️ Empty AI response");
      return getFallbackReply();
    }

    return content;

  } catch (err) {
    console.error("❌ AI Error:", err.message);
    return getFallbackReply();
  }
}

module.exports = { getAIReply };