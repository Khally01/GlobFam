#!/bin/bash

echo "📦 Creating GitHub repository for standalone API..."

cd ~/globfam-api-standalone

# Check if we already have a remote
if git remote get-url origin &>/dev/null; then
    echo "Remote already exists, removing..."
    git remote remove origin
fi

# Initialize if needed
if [ ! -d .git ]; then
    git init
    git add .
    git commit -m "Initial commit - GlobFam API"
fi

echo ""
echo "✅ Repository is ready!"
echo ""
echo "Now do the following:"
echo "1. Go to https://github.com/new"
echo "2. Create a new repo called 'globfam-api'"
echo "3. DO NOT initialize with README"
echo "4. After creating, run these commands:"
echo ""
echo "cd ~/globfam-api-standalone"
echo "git remote add origin https://github.com/Khally01/globfam-api.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "5. Then deploy this new repo to Railway!"