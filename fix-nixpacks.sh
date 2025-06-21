#!/bin/bash

echo "🔧 Fixing Nixpacks setup for Railway..."

cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/api

# Generate package-lock.json if missing
if [ ! -f "package-lock.json" ]; then
    echo "📦 Generating package-lock.json..."
    npm install
fi

# Ensure TypeScript is in dependencies (not just devDependencies)
echo "📝 Ensuring TypeScript is in dependencies..."
npm install typescript

echo "✅ Done! Ready to commit and deploy."