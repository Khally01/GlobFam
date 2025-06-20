#!/bin/bash
echo "🔧 Preparing web app for Railway deployment..."

# Copy shared packages
echo "📦 Copying shared packages..."
mkdir -p ../../packages
cp -r ../../packages/types ./types-temp
cp -r ../../packages/ui ./ui-temp

# Update package.json to use local copies
echo "📝 Updating package.json..."
sed -i.bak 's|"@globfam/types": "file:../../packages/types"|"@globfam/types": "file:./types-temp"|g' package.json
sed -i.bak 's|"@globfam/ui": "file:../../packages/ui"|"@globfam/ui": "file:./ui-temp"|g' package.json

# Install dependencies
echo "📥 Installing dependencies..."
npm install --legacy-peer-deps

# Build
echo "🏗️ Building Next.js app..."
npm run build

# Restore original package.json
mv package.json.bak package.json

echo "✅ Build complete!"