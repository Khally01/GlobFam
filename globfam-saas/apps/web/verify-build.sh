#!/bin/bash
cd "$(dirname "$0")"
echo "📦 Installing dependencies..."
npm install

echo "🔨 Running build..."
npm run build

echo "✅ Build verification complete!"