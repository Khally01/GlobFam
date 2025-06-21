#!/bin/bash

echo "🔧 Fixing Prisma Schema Relations"
echo "================================="

cd /Users/khally/Projects/GlobFam/globfam-saas/apps/api

echo "1️⃣ Formatting Prisma schema..."
npx prisma format

echo "2️⃣ Validating schema..."
npx prisma validate

echo "3️⃣ Generating Prisma client..."
npx prisma generate

cd ../..

echo "4️⃣ Staging changes..."
git add apps/api/prisma/schema.prisma

echo "5️⃣ Committing fix..."
git commit -m "Fix Prisma schema relations for BankConnection and ImportHistory"

echo ""
echo "✅ Schema fixed! Now push to deploy:"
echo "git push"