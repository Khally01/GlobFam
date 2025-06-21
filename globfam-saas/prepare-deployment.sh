#!/bin/bash

echo "🚀 Preparing GlobFam for Railway deployment..."
echo "============================================="

# Navigate to the repository root
cd "$(dirname "$0")"

# 1. Remove API Dockerfile if it exists
echo "1. Removing API Dockerfile..."
if [ -f "apps/api/Dockerfile" ]; then
    rm apps/api/Dockerfile
    echo "   ✅ API Dockerfile removed"
else
    echo "   ✅ API Dockerfile already removed"
fi

# 2. Regenerate API package-lock.json
echo -e "\n2. Regenerating API package-lock.json..."
cd apps/api
rm -f package-lock.json
npm install
echo "   ✅ API dependencies installed"

# 3. Generate Prisma client
echo -e "\n3. Generating Prisma client..."
npx prisma generate
echo "   ✅ Prisma client generated"

# Return to repo root
cd ../..

# 4. Check for Web Dockerfile
echo -e "\n4. Checking Web Dockerfile..."
if [ -f "apps/web/Dockerfile" ]; then
    rm apps/web/Dockerfile
    echo "   ✅ Web Dockerfile removed"
else
    echo "   ✅ Web Dockerfile already removed"
fi

# 5. Summary of changes
echo -e "\n============================================="
echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Review the changes:"
echo "   git status"
echo ""
echo "2. Commit the changes:"
echo "   git add -A"
echo "   git commit -m \"Remove Dockerfiles and update dependencies for Railway deployment\""
echo "   git push"
echo ""
echo "3. Check Railway deployment logs after push"
echo ""
echo "Environment variables needed in Railway:"
echo "- API Service:"
echo "  DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, REDIS_URL, ALLOWED_ORIGINS"
echo "- Web Service:"
echo "  NEXT_PUBLIC_API_URL"