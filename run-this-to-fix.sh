#!/bin/bash

# This script will fix your deployment and stage all changes
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/api

# Remove old package-lock.json
rm -f package-lock.json

# Install all dependencies (including the new ones)
npm install

# Generate Prisma client
npx prisma generate

# Go back to repo root
cd ../..

# Stage all the changes
git add apps/api/package-lock.json apps/api/package.json apps/api/Dockerfile

# Show what will be committed
echo "Changes staged for commit:"
git status --short

echo ""
echo "✅ Done! All changes are staged."
echo "You can now commit with: git commit -m 'Update API dependencies'"