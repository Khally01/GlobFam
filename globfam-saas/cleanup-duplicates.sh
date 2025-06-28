#!/bin/bash

# GlobFam Repository Cleanup Script
# This script removes duplicate, backup, and unnecessary files

echo "🧹 Starting GlobFam repository cleanup..."
echo "This will remove 62 duplicate/unnecessary files"
echo ""

# Counter for removed files
removed=0

# API Directory Cleanup
echo "📁 Cleaning apps/api directory..."
cd apps/api 2>/dev/null || { echo "apps/api directory not found"; exit 1; }

files_to_remove=(
    "Dockerfile.disabled"
    "Dockerfile.optimized"
    "build-errors.log"
    "install-deps.sh"
    "nixpacks.toml.optimized"
    "package.json.optimized"
    "railway-build.sh"
    "railway.docker.toml"
    "railway.json"
    "railway.toml.backup"
    "tsconfig.tsbuildinfo"
)

for file in "${files_to_remove[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ Removed $file"
        ((removed++))
    fi
done

cd ../..

# Web Directory Cleanup
echo ""
echo "📁 Cleaning apps/web directory..."
cd apps/web 2>/dev/null || { echo "apps/web directory not found"; exit 1; }

files_to_remove=(
    "BUILD_FIX_SUMMARY.md"
    "DEPLOYMENT_GUIDE.md"
    "Dockerfile.backup"
    "Dockerfile.disabled"
    "Dockerfile.optimized"
    "build-fix.js"
    "build.sh"
    "fix-all-imports.js"
    "fix-dependencies.sh"
    "fix-imports.sh"
    "next.config.js.optimized"
    "package.json.backup"
    "package.json.optimized"
    "package.json.temp"
    "prebuild.js"
    "railway-build.sh"
    "railway-deploy.sh"
    "railway.docker.json"
    "railway.json.optimized"
    "tailwind.config.globfam.js"
    "validate-build-fix.js"
    "verify-build.sh"
)

for file in "${files_to_remove[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ Removed $file"
        ((removed++))
    fi
done

# Remove duplicate UI components
echo ""
echo "📁 Cleaning duplicate UI components..."
cd src/components/ui 2>/dev/null

ui_duplicates=(
    "button-globfam.tsx"
    "card-globfam.tsx"
)

for file in "${ui_duplicates[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ Removed $file"
        ((removed++))
    fi
done

# Remove duplicate page
cd ../../app/\(auth\)/login 2>/dev/null
if [ -f "page-branded.tsx" ]; then
    rm "page-branded.tsx"
    echo "  ✓ Removed page-branded.tsx"
    ((removed++))
fi

# Remove test pages if they exist
cd ../../\(dashboard\)/dashboard 2>/dev/null
if [ -f "page-new.tsx" ]; then
    rm "page-new.tsx"
    echo "  ✓ Removed page-new.tsx"
    ((removed++))
fi

cd ../../../../../..

# Root Directory Cleanup
echo ""
echo "📁 Cleaning root directory..."

root_files_to_remove=(
    "RAILWAY_DEPLOYMENT_CHECKLIST.md"
    "RAILWAY_DEPLOYMENT_FIXES.md"
    "RAILWAY_DEPLOYMENT_GUIDE.md"
    "RAILWAY_DEPLOYMENT_SOLUTION.md"
    "RAILWAY_DEPLOY_SOLUTION.md"
    "RAILWAY_DOCKER_DEPLOYMENT.md"
    "RAILWAY_FIX.md"
    "RAILWAY_MONOREPO_SETUP.md"
    "RAILWAY_SALES_PITCH_DEPLOY.md"
    "SETUP_GUIDE.md"
    "STRIPE_SETUP_GUIDE.md"
    "fix-imports.js"
    "fix-imports.sh"
    ".prettierrc"
    ".prettierignore"
)

for file in "${root_files_to_remove[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ Removed $file"
        ((removed++))
    fi
done

# Remove dist directory from web if it exists
if [ -d "apps/web/dist" ]; then
    rm -rf "apps/web/dist"
    echo "  ✓ Removed apps/web/dist directory"
    ((removed++))
fi

echo ""
echo "✅ Cleanup complete! Removed $removed files/directories"
echo ""
echo "💡 Next steps:"
echo "1. Review the changes with 'git status'"
echo "2. Commit the cleanup: git add -A && git commit -m 'chore: clean up duplicate and unnecessary files'"
echo "3. The repository is now organized and decluttered!"