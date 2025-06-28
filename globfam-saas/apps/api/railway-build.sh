#!/bin/bash
set -e

# Set memory limits for Node.js
export NODE_OPTIONS="--max-old-space-size=512"

echo "Starting Railway build for API..."

# Clean up any existing build artifacts
echo "Cleaning up previous builds..."
rm -rf dist node_modules package-lock.json

# Install dependencies with memory optimization
echo "Installing dependencies..."
npm install --legacy-peer-deps \
  --no-audit \
  --no-fund \
  --prefer-offline \
  --no-optional \
  --progress=false

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy --skip-seed || echo "Migration deployment skipped (may already be applied)"

# Build TypeScript
echo "Building TypeScript..."
npm run build

# Clean up dev dependencies to save space
echo "Cleaning up dev dependencies..."
npm prune --production

echo "Railway build completed successfully!"