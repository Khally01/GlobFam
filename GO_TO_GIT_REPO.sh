#!/bin/bash

echo "📍 Navigating to your Git repository..."
echo ""

# The script already updated the files in your Projects/GlobFam folder
# But your actual Git repository is in Documents/GitHub/GlobFam

# First, let's copy the updated package-lock.json to your Git repo
echo "1️⃣ Copying updated files to your Git repository..."

if [ -f "/Users/khally/Projects/GlobFam/globfam-saas/apps/api/package-lock.json" ]; then
    cp /Users/khally/Projects/GlobFam/globfam-saas/apps/api/package-lock.json \
       /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/api/
    echo "   ✅ Copied package-lock.json"
else
    echo "   ⚠️  package-lock.json not found in Projects folder"
fi

# Navigate to your actual Git repository
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas

echo ""
echo "2️⃣ Now in Git repository: $(pwd)"
echo ""

# Check git status
echo "3️⃣ Git status:"
git status --short
echo ""

echo "✅ You're now in the correct directory!"
echo ""
echo "Run these commands:"
echo ""
echo "git add apps/api/package-lock.json"
echo "git commit -m \"Fix deployment: Update API dependencies\""
echo "git push"
echo ""