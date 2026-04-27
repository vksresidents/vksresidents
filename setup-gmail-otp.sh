#!/bin/bash
# Quick Start Script for Gmail OTP Setup

echo "🚀 Starting Gmail OTP Setup..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install from https://nodejs.org/"
  exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1️⃣  Go to: https://myaccount.google.com/apppasswords"
echo "   - Enable 2FA first if not done"
echo "   - Generate an App Password (16 characters)"
echo ""
echo "2️⃣  Create server/.env file with:"
echo "   GMAIL_USER=your-email@gmail.com"
echo "   GMAIL_PASSWORD=xxxx xxxx xxxx xxxx"
echo "   GMAIL_FROM=your-email@gmail.com"
echo "   PORT=5000"
echo "   NODE_ENV=development"
echo "   FRONTEND_URL=http://localhost:5173"
echo ""
echo "3️⃣  Start backend:"
echo "   cd server && npm run dev"
echo ""
echo "4️⃣  In another terminal, start frontend:"
echo "   npm run dev"
echo ""
echo "5️⃣  Test at: http://localhost:5173"
echo ""
echo "📖 Full guide: Read GMAIL_OTP_SETUP.md"
