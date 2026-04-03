#!/bin/bash

clear

echo "========================================"
echo "🚀 CODEVIX WHATSAPP AI BOT"
echo "========================================"
echo ""

# 🧠 Check Node.js
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed"
    echo "👉 Install Node.js and try again"
    exit 1
fi

echo "✅ Node.js detected"

# 🧠 Check pnpm (preferred)
if command -v pnpm &> /dev/null
then
    PACKAGE_MANAGER="pnpm"
    echo "⚡ Using pnpm"
else
    PACKAGE_MANAGER="npm"
    echo "⚡ pnpm not found, using npm"
fi

echo ""

# 📁 Move to app folder
cd app || { echo "❌ App folder not found"; exit 1; }

# ⚠️ Check .env
if [ ! -f ".env" ]; then
  echo "⚠️ .env file not found"
  echo "👉 Copy .env.example to .env and fill values"
  exit 1
fi

# 📦 Install dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  $PACKAGE_MANAGER install
fi

echo ""
echo "🚀 Starting WhatsApp AI Bot..."
echo "----------------------------------------"
echo ""

# ▶️ Start bot
if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
  pnpm start
else
  npm start
fi