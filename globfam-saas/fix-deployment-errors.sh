#!/bin/bash

echo "🔧 Fixing Railway Deployment Errors"
echo "=================================="

# Fix 1: Update package-lock.json for API
echo "1️⃣ Updating API dependencies..."
cd apps/api
rm -f package-lock.json
npm install
echo "✅ API dependencies updated"

# Fix 2: Update package-lock.json for Web
echo ""
echo "2️⃣ Updating Web dependencies..."
cd ../web
rm -f package-lock.json
npm install
echo "✅ Web dependencies updated"

# Fix 3: Verify builds
echo ""
echo "3️⃣ Testing builds..."

# Test API build
echo "Testing API build..."
cd ../api
npm run build
if [ $? -eq 0 ]; then
    echo "✅ API builds successfully"
else
    echo "❌ API build failed"
    exit 1
fi

# Test Web build
echo ""
echo "Testing Web build..."
cd ../web
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Web builds successfully"
else
    echo "❌ Web build failed"
    exit 1
fi

echo ""
echo "✅ All fixes applied successfully!"
echo ""
echo "Next steps:"
echo "1. Commit the changes: git add -A && git commit -m 'Fix deployment errors'"
echo "2. Push to repository: git push"
echo "3. Railway will automatically redeploy"