require("dotenv").config();
const startWhatsApp = require("./src/whatsapp/whatsapp");

// Clear terminal
console.clear();

// Branding header
console.log(`
==================================================
🚀 CODEVIX WHATSAPP AI AUTOMATION
==================================================

🌐 Website   : www.codevix.in
🤖 AI Name   : ${process.env.AI_NAME || "AI"}
📦 Model     : ${process.env.AI_MODEL}
⚙️  AI Status: ${process.env.AI_ENABLED === "true" ? "Enabled" : "Disabled"}

--------------------------------------------------
💡 Powered by Codevix
--------------------------------------------------

📱 Initializing WhatsApp connection...
`);

// Start bot
startWhatsApp();