#!/bin/bash

# Fix current deployment issue
echo "🔧 Fixing GlobFam Deployment Issue"
echo "=================================="

# Check if we're in the right place
if [ ! -d "/Users/khally/Documents/GitHub/GlobFam/globfam-saas" ]; then
    echo "❌ Error: GlobFam repository not found at expected location"
    echo "Expected: /Users/khally/Documents/GitHub/GlobFam/globfam-saas"
    exit 1
fi

# Navigate to API directory
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/api

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Remove old package-lock.json
echo "1️⃣ Removing old package-lock.json..."
rm -f package-lock.json
echo "   ✅ Done"
echo ""

# Step 2: Install dependencies
echo "2️⃣ Installing all dependencies (this may take a minute)..."
npm install
echo "   ✅ Dependencies installed"
echo ""

# Step 3: Generate Prisma client
echo "3️⃣ Generating Prisma client..."
npx prisma generate
echo "   ✅ Prisma client generated"
echo ""

# Step 4: Go back to repo root
cd ../..

# Step 5: Show git status
echo "4️⃣ Git status:"
git status --short
echo ""

# Step 6: Stage changes
echo "5️⃣ Staging changes..."
git add apps/api/package-lock.json apps/api/package.json
echo "   ✅ Changes staged"
echo ""

echo "=================================="
echo "✅ Fix complete!"
echo ""
echo "Next steps:"
echo "1. Commit the changes:"
echo "   git commit -m \"Update API dependencies for new features\""
echo ""
echo "2. Push to GitHub:"
echo "   git push"
echo ""
echo "3. Check Railway deployment logs"
echo ""
echo "The deployment should now succeed! 🚀"