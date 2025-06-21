#!/bin/bash

echo "🚀 Creating standalone API repository for Railway..."

# Create new directory
mkdir -p ~/globfam-api-standalone
cd ~/globfam-api-standalone

# Copy API files
cp -r /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/api/* .
cp -r /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/api/.[^.]* . 2>/dev/null || true

# Initialize new git repo
git init
git add .
git commit -m "Initial commit - GlobFam API standalone"

echo "✅ Standalone API created at: ~/globfam-api-standalone"
echo ""
echo "Next steps:"
echo "1. Create new GitHub repo: 'globfam-api'"
echo "2. Push this code:"
echo "   cd ~/globfam-api-standalone"
echo "   git remote add origin https://github.com/Khally01/globfam-api.git"
echo "   git push -u origin main"
echo "3. Deploy this new repo to Railway (no root directory needed!)"