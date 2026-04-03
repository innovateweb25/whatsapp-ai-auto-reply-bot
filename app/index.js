require("dotenv").config();
const startWhatsApp = require("./src/whatsapp/whatsapp");

// 🧠 Validate ENV (minimal & clean)
function validateEnv() {
  const required = ["OPENROUTER_API_KEY", "AI_MODEL"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`
❌ Missing required environment variables:
${missing.map((m) => `- ${m}`).join("\n")}

👉 Please check your .env file
`);
    process.exit(1);
  }
}

// 🎨 Branding Header
function showBanner() {
  console.clear();

  console.log(`
==================================================
🚀 CODEVIX WHATSAPP AI AUTOMATION
==================================================

🤖 AI Name   : ${process.env.AI_NAME || "Assistant"}
📦 Model     : ${process.env.AI_MODEL}

--------------------------------------------------
💡 Powered by Codevix
--------------------------------------------------

📱 Initializing WhatsApp connection...
`);
}

// 🚀 Start App
async function main() {
  try {
    validateEnv();
    showBanner();

    await startWhatsApp();

  } catch (err) {
    console.error("❌ Startup Error:", err.message);
    process.exit(1);
  }
}

// 🛡️ Global error handling
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

main();