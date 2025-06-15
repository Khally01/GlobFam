#!/bin/bash
# Cache busting script for Railway deployments
# Run this to force a complete rebuild on Railway

echo "Cache busting for Railway deployment..."

# Clean all npm caches
echo "Cleaning npm cache..."
npm cache clean --force

# Remove all node_modules and lock files
echo "Removing node_modules and lock files..."
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
find . -name "package-lock.json" -type f -delete

# Update cache bust timestamp in nixpacks.toml
echo "Updating cache bust timestamp..."
TIMESTAMP=$(date +%Y-%m-%d-%H-%M-%S)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/CACHE_BUST = \".*\"/CACHE_BUST = \"$TIMESTAMP\"/" ../nixpacks.toml
    sed -i '' "s/\"CACHE_BUST\": \".*\"/\"CACHE_BUST\": \"$TIMESTAMP\"/" ../railway.json
else
    # Linux
    sed -i "s/CACHE_BUST = \".*\"/CACHE_BUST = \"$TIMESTAMP\"/" ../nixpacks.toml
    sed -i "s/\"CACHE_BUST\": \".*\"/\"CACHE_BUST\": \"$TIMESTAMP\"/" ../railway.json
fi

echo "Cache bust complete! New timestamp: $TIMESTAMP"
echo "Now commit and push these changes to trigger a fresh build on Railway."