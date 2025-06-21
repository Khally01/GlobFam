#!/bin/bash
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/api
rm -f package-lock.json
npm install
npx prisma generate
cd ../..
git add .
git commit -m "Update API dependencies and fix Dockerfile"
echo "✅ Done! Now run: git push"