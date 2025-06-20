#!/bin/bash
echo "🚀 Railway Deployment Script for GlobFam Web"
echo "==========================================="

# Ensure we're in the correct directory
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔨 Building the application..."
npm run build

echo "✅ Build complete! Ready for deployment."

# For Railway deployment, we need to ensure the start script works
echo "📋 Available scripts:"
npm run