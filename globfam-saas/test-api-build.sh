#!/bin/bash

echo "🧪 Testing API build locally..."

cd apps/api

echo "1. Installing dependencies..."
npm install --legacy-peer-deps

echo "2. Generating Prisma client..."
npx prisma generate

echo "3. Building TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi