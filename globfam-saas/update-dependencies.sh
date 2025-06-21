#!/bin/bash

echo "🔧 Updating GlobFam API dependencies..."
echo "======================================="

# Navigate to API directory
cd "$(dirname "$0")/apps/api"

# Remove old package-lock.json
echo "1. Removing old package-lock.json..."
rm -f package-lock.json
echo "   ✅ Removed"

# Install all dependencies
echo -e "\n2. Installing dependencies..."
npm install
echo "   ✅ Dependencies installed"

# Generate Prisma client
echo -e "\n3. Generating Prisma client..."
npx prisma generate
echo "   ✅ Prisma client generated"

# Show what was installed
echo -e "\n4. New dependencies added:"
echo "   - axios (HTTP client)"
echo "   - csv-parse (CSV parsing)"
echo "   - date-fns (Date utilities)"
echo "   - decimal.js (Precise decimal math)"
echo "   - multer (File uploads)"
echo "   - openai (AI integration)"
echo "   - xlsx (Excel parsing)"

# Stage the changes
echo -e "\n5. Staging changes for git..."
cd ../..
git add apps/api/package-lock.json
git add apps/api/package.json
git add apps/api/Dockerfile

# Show git status
echo -e "\n6. Git status:"
git status --short

echo -e "\n======================================="
echo "✅ Dependencies updated successfully!"
echo ""
echo "The changes have been staged. You can now commit with:"
echo "git commit -m \"Update API dependencies and fix Dockerfile\""
echo "git push"