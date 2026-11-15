const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");
const { getAIReply } = require("../ai/ai");
require("dotenv").config();

const fs = require("fs");
const path = require("path");

// 📁 storage file
const dataPath = path.join(__dirname, "../../data.json");

// 💾 Safe log save
function saveLog(entry) {
  try {
    let data = [];

    if (fs.existsSync(dataPath)) {
      const file = fs.readFileSync(dataPath, "utf-8");
      try {
        data = JSON.parse(file);
        if (!Array.isArray(data)) data = [];
      } catch {
        data = [];
      }
    }

    data.push(entry);

    // prevent huge file
    if (data.length > 1000) {
      data = data.slice(-500);
    }

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("⚠️ Log save error:", err.message);
  }
}

// 🕒 time format
function getTime() {
  return new Date().toLocaleTimeString();
}

// ⏱️ smart delay
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// ⏱️ Read a non-negative integer setting, falling back when invalid.
function getDelaySetting(name, fallback) {
  const value = Number.parseInt(process.env[name], 10);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

// 🎯 random human delay
function getHumanDelay() {
  const min = getDelaySetting("MIN_REPLY_DELAY", 1000);
  const configuredMax = getDelaySetting("MAX_REPLY_DELAY", 3000);
  const max = Math.max(min, configuredMax);

  return min + Math.floor(Math.random() * (max - min + 1));
}

// 🚀 MAIN
async function startWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("auth");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      auth: state,
      version,
      printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    // 🔌 connection handling
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

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
        const reason = lastDisconnect?.error?.output?.statusCode;

        console.log("❌ Disconnected:", reason);

        // logout case
        if (reason === DisconnectReason.loggedOut) {
          console.log("⚠️ Session logged out. Please delete auth folder and re-login.");
        } else {
          console.log("🔄 Reconnecting in 5 seconds...");
          setTimeout(() => {
            startWhatsApp();
          }, 5000);
        }
      }
    });

    // 📩 message handler
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

        // 🤖 Respect the AI_ENABLED setting from .env
        if (process.env.AI_ENABLED?.trim().toLowerCase() === "false") {
          console.log("ℹ️ AI replies are disabled (AI_ENABLED=false).");
          return;
        }

        // 🤖 AI reply (safe)
        let reply;
        try {
          reply = await getAIReply(text);
        } catch (err) {
          console.error("⚠️ AI failed:", err.message);
          reply = "Thoda busy hu abhi, baad me reply karta hu 🙂";
        }

        // ⏱️ delay configured through MIN_REPLY_DELAY / MAX_REPLY_DELAY
        await delay(getHumanDelay());

        // 🤖 AI LOG
        console.log(`
🤖 Reply:
${reply}

----------------------------------------
`);

        await sock.sendMessage(msg.key.remoteJid, { text: reply });

        // 💾 save log
        saveLog({
          number,
          userMessage: text,
          aiReply: reply,
          time: new Date().toISOString()
        });

      } catch (err) {
        console.error("⚠️ Message handling error:", err.message);
      }
    });

  } catch (err) {
    console.error("❌ Fatal error:", err.message);
    console.log("🔄 Restarting in 5 seconds...");
    setTimeout(() => startWhatsApp(), 5000);
  }
}

module.exports = startWhatsApp;
