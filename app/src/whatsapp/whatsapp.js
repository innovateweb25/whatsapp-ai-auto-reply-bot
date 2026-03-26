const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");
const { getAIReply } = require("../ai/ai");
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const AI_NAME = process.env.AI_NAME || "AI";

// 📁 storage file
const dataPath = path.join(__dirname, "../../data.json");

// save logs
function saveLog(entry) {
  try {
    let data = [];

    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath));
    }

    data.push(entry);

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch {}
}

// format time
function getTime() {
  return new Date().toLocaleTimeString();
}

// delay
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// main start
async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  // 🔥 latest version (IMPORTANT)
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, qr }) => {
    if (qr) {
      console.log("\n📱 Scan QR below:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log(`
========================================
✅ WhatsApp Connected Successfully
========================================
`);
    }

    if (connection === "close") {
      console.log("❌ Disconnected. Reconnecting...");
      startWhatsApp();
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages[0];

      if (!msg.message || msg.key.fromMe) return;

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text;

      if (!text) return;

      const number = msg.key.remoteJid.replace("@s.whatsapp.net", "");

      // 👤 USER LOG
      console.log(`
👤 User (${number}) [${getTime()}]:
${text}
`);

      let reply = "Hello 👋";

      if (process.env.AI_ENABLED === "true") {
        reply = await getAIReply(text);
      }

      // ⏱️ human delay
      const min = Number(process.env.MIN_REPLY_DELAY || 1000);
      const max = Number(process.env.MAX_REPLY_DELAY || 3000);
      const wait = Math.floor(Math.random() * (max - min) + min);

      await delay(wait);

      // 🤖 AI LOG
      console.log(`
🤖 ${AI_NAME}:
${reply}

----------------------------------------
`);

      await sock.sendMessage(msg.key.remoteJid, {
        text: reply
      });

      // 💾 save
      saveLog({
        number,
        userMessage: text,
        aiReply: reply,
        time: new Date().toISOString()
      });

    } catch (err) {
      console.log("⚠️ Error handling message");
    }
  });
}

module.exports = startWhatsApp;