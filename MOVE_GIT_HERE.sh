#!/bin/bash

echo "🚚 Moving Git Repository to Projects Folder"
echo "=========================================="
echo ""

# Check if the source exists
if [ ! -d "/Users/khally/Documents/GitHub/GlobFam/globfam-saas/.git" ]; then
    echo "❌ Error: Git repository not found in Documents/GitHub/GlobFam/globfam-saas"
    exit 1
fi

# Check if we already have a .git folder in Projects
if [ -d "/Users/khally/Projects/GlobFam/globfam-saas/.git" ]; then
    echo "✅ Git repository already exists in Projects folder!"
    echo "You can use git from here."
    exit 0
fi

echo "📋 This will:"
echo "1. Copy the .git folder from Documents to Projects"
echo "2. Keep your Documents folder as backup"
echo "3. Let you use git from Projects/GlobFam/globfam-saas"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Copy the .git directory
echo "1️⃣ Copying git repository..."
cp -r /Users/khally/Documents/GitHub/GlobFam/globfam-saas/.git /Users/khally/Projects/GlobFam/globfam-saas/

# Check if successful
if [ -d "/Users/khally/Projects/GlobFam/globfam-saas/.git" ]; then
    echo "   ✅ Git repository copied successfully!"
else
    echo "   ❌ Failed to copy git repository"
    exit 1
fi

# Navigate to the new location
cd /Users/khally/Projects/GlobFam/globfam-saas

echo ""
echo "2️⃣ Checking git status in new location..."
git status
echo ""

echo "✅ Success! Your git repository is now in:"
echo "   /Users/khally/Projects/GlobFam/globfam-saas"
echo ""
echo "You can now run git commands from here:"
echo ""
echo "cd /Users/khally/Projects/GlobFam/globfam-saas"
echo "git add ."
echo "git commit -m \"Fix deployment: Update API dependencies\""
echo "git push"
echo ""
echo "Note: Your original repository in Documents is still there as backup."
echo "You can delete it later if you want."