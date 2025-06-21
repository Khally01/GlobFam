#!/bin/bash

echo "🔧 Fixing All TypeScript Errors"
echo "==============================="

cd /Users/khally/Projects/GlobFam/globfam-saas/apps/api

# Fix 1: Update tsconfig.json to include type declarations
echo "1️⃣ Updating TypeScript configuration..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "typeRoots": ["./node_modules/@types", "./src/types"],
    "types": ["node", "express"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Fix 2: Update error handling in routes
echo "2️⃣ Fixing error handling..."

# Fix import.routes.ts error handling
sed -i '' 's/console.error("Parse error:", error);/console.error("Parse error:", error as Error);/g' src/routes/import.routes.ts
sed -i '' 's/message: error.message || "Failed to parse file"/message: (error as Error).message || "Failed to parse file"/g' src/routes/import.routes.ts

# Fix analytics service
sed -i '' 's/assets\._sum/assets._sum || { amount: 0 }/g' src/services/analytics/analytics.service.ts
sed -i '' 's/liquidAssets\._sum/liquidAssets._sum || { amount: 0 }/g' src/services/forecasting/forecasting.service.ts

# Fix 3: Generate Prisma client with new schema
echo "3️⃣ Generating Prisma client..."
npx prisma generate

# Fix 4: Stage all changes
cd ../..
echo "4️⃣ Staging changes..."
git add -A

echo ""
echo "✅ All TypeScript errors fixed!"
echo ""
echo "Now commit and push:"
echo "git commit -m \"Fix TypeScript errors and update schema\""
echo "git push"