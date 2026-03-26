#!/bin/bash

clear

echo "========================================"
echo "🚀 CODEVIX WHATSAPP AI BOT"
echo "========================================"
echo ""

# Check if Node.js installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed"
    echo "👉 Please install Node.js and try again"
    exit
fi

echo "✅ Node.js detected"
echo ""

# Move to app folder
cd app || { echo "❌ App folder not found"; exit; }

# Check .env file
if [ ! -f ".env" ]; then
  echo "⚠️ .env file not found"
  echo "👉 Please create .env file (see .env.example)"
  exit
fi

# Install dependencies (if not installed)
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

echo ""
echo "🚀 Starting WhatsApp AI Bot..."
echo "----------------------------------------"
echo ""

# Start bot
npm start