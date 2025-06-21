#!/bin/bash

echo "🚀 GlobFam Deployment Fix - Master Script"
echo "========================================="
echo ""
echo "This script will fix your current deployment issue."
echo "It needs to be run from your Terminal."
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# The actual fix commands
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/api

echo "📍 Working in: $(pwd)"
echo ""

echo "1️⃣ Removing old package-lock.json..."
rm -f package-lock.json

echo "2️⃣ Installing dependencies (this will take 1-2 minutes)..."
npm install

echo "3️⃣ Generating Prisma client..."
npx prisma generate

echo "4️⃣ Going back to repository root..."
cd ../..

echo "5️⃣ Adding changes to git..."
git add apps/api/package-lock.json apps/api/package.json apps/api/Dockerfile

echo "6️⃣ Committing changes..."
git commit -m "Update API dependencies for banking, AI, and analytics features"

echo ""
echo "✅ ALL DONE!"
echo ""
echo "Now just run: git push"
echo ""
echo "Then check your Railway logs. The deployment should work now! 🎉"