#!/bin/bash

echo "🔧 Fixing web app dependencies for proper deployment..."

# Navigate to web directory
cd "$(dirname "$0")"

# Step 1: Copy workspace packages
echo "📦 Step 1: Copying workspace packages..."
mkdir -p src/lib/shared-types
mkdir -p src/components/shared-ui

# Copy types
cp ../../packages/types/index.ts src/lib/shared-types/index.ts
cp ../../packages/types/package.json src/lib/shared-types/package.json

# Copy UI components
cp -r ../../packages/ui/components/* src/components/shared-ui/
cp ../../packages/ui/lib/utils.ts src/lib/utils-shared.ts
cp ../../packages/ui/index.tsx src/components/shared-ui/index.tsx

# Step 2: Update imports in all files
echo "🔄 Step 2: Updating import statements..."
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak \
  -e 's|from "@globfam/types"|from "@/lib/shared-types"|g' \
  -e 's|from "@globfam/ui"|from "@/components/shared-ui"|g' {} \;

# Step 3: Update package.json
echo "📝 Step 3: Updating package.json..."
# Remove workspace dependencies
sed -i.bak '/"@globfam\/types":/d; /"@globfam\/ui":/d' package.json

# Step 4: Clean up backup files
find src -name "*.bak" -delete
rm -f package.json.bak

# Step 5: Install missing dependencies that shared packages need
echo "📥 Step 5: Installing missing dependencies..."
npm install --save \
  @radix-ui/react-separator \
  @radix-ui/react-checkbox \
  @radix-ui/react-radio-group \
  @radix-ui/react-switch \
  @radix-ui/react-tooltip

echo "✅ Dependencies fixed! Ready for deployment."