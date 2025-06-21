#!/bin/bash

echo "🚀 GlobFam SaaS - Railway Deployment Fix"
echo "======================================="
echo ""

# Navigate to the API directory
API_DIR="/Users/khally/Projects/GlobFam/globfam-saas/apps/api"
REPO_ROOT="/Users/khally/Projects/GlobFam/globfam-saas"

if [ ! -d "$API_DIR" ]; then
    echo "❌ Error: API directory not found at $API_DIR"
    exit 1
fi

cd "$API_DIR"
echo "📍 Working in: $(pwd)"
echo ""

# Step 1: Remove old package-lock.json
echo "1️⃣ Removing old package-lock.json..."
rm -f package-lock.json
echo "   ✅ Removed"
echo ""

# Step 2: Install all dependencies
echo "2️⃣ Installing dependencies (this will take 1-2 minutes)..."
echo "   Installing: axios, csv-parse, xlsx, openai, date-fns, multer, decimal.js..."
npm install
if [ $? -eq 0 ]; then
    echo "   ✅ All dependencies installed successfully"
else
    echo "   ❌ Error installing dependencies"
    exit 1
fi
echo ""

# Step 3: Generate Prisma client
echo "3️⃣ Generating Prisma client..."
npx prisma generate
if [ $? -eq 0 ]; then
    echo "   ✅ Prisma client generated"
else
    echo "   ❌ Error generating Prisma client"
    exit 1
fi
echo ""

# Step 4: Navigate back to repo root
cd "$REPO_ROOT"
echo "4️⃣ Back in repository root: $(pwd)"
echo ""

# Step 5: Stage changes
echo "5️⃣ Staging changes for git..."
git add apps/api/package-lock.json
git add apps/api/package.json
echo "   ✅ Changes staged"
echo ""

# Step 6: Show what will be committed
echo "6️⃣ Changes to be committed:"
git status --short
echo ""

echo "======================================="
echo "✅ Deployment fix complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Commit the changes:"
echo "   git commit -m \"Update API dependencies for Phase 2 features (AI, Analytics, Banking, Goals)\""
echo ""
echo "2. Push to GitHub:"
echo "   git push origin main"
echo ""
echo "3. Check Railway deployment at: https://railway.app"
echo ""
echo "The deployment should now succeed! 🎉"
echo ""
echo "Features added:"
echo "- 🤖 AI Transaction Categorization (OpenAI)"
echo "- 📊 Advanced Analytics & Insights"
echo "- 🏦 Banking Integration (Commonwealth Bank, Khan Bank)"
echo "- 🎯 Goals & Financial Forecasting"
echo "- 📁 CSV/Excel Import Support"