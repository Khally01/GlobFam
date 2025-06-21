#!/bin/bash

echo "🚀 GlobFam Railway Deployment Fix"
echo "================================="
echo ""
echo "This script will fix your deployment issue."
echo ""

# First, let's find where your actual GitHub repo is
echo "Looking for your GlobFam GitHub repository..."

# Check common locations
if [ -d "/Users/khally/Documents/GitHub/GlobFam/globfam-saas" ]; then
    REPO_DIR="/Users/khally/Documents/GitHub/GlobFam/globfam-saas"
elif [ -d "/Users/khally/Projects/GlobFam/globfam-saas" ]; then
    REPO_DIR="/Users/khally/Projects/GlobFam/globfam-saas"
else
    echo "❌ Could not find GlobFam repository!"
    echo "Please enter the full path to your globfam-saas directory:"
    read REPO_DIR
fi

API_DIR="$REPO_DIR/apps/api"

if [ ! -d "$API_DIR" ]; then
    echo "❌ Error: API directory not found at $API_DIR"
    echo "Please check the path and try again."
    exit 1
fi

echo "✅ Found repository at: $REPO_DIR"
echo ""

# Navigate to API directory
cd "$API_DIR"
echo "📍 Working in: $(pwd)"
echo ""

# Fix the deployment issue
echo "🔧 Fixing deployment issue..."
echo ""

echo "1. Removing old package-lock.json..."
rm -f package-lock.json

echo "2. Installing all dependencies..."
npm install

echo "3. Generating Prisma client..."
npx prisma generate

echo "4. Going back to repository root..."
cd "$REPO_DIR"

echo "5. Staging changes..."
git add apps/api/package-lock.json apps/api/package.json

echo ""
echo "✅ Fix complete!"
echo ""
echo "Now run these commands to deploy:"
echo ""
echo "git commit -m \"Fix deployment: Update API dependencies\""
echo "git push"
echo ""
echo "Then check Railway for successful deployment! 🎉"