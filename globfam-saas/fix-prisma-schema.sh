#!/bin/bash

echo "🔧 Fixing Prisma schema..."

cd apps/api

# Install Prisma CLI locally if needed
if ! command -v prisma &> /dev/null; then
    echo "Installing Prisma CLI..."
    npm install -D prisma
fi

# Format the schema
echo "Formatting Prisma schema..."
npx prisma format

# Validate the schema
echo "Validating Prisma schema..."
npx prisma validate

echo "✅ Prisma schema fixed!"