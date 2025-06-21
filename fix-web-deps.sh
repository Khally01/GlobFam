#!/bin/bash

echo "Fixing GlobFam Web App Dependencies..."

# Navigate to web app
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/web

# Remove node_modules and package-lock
rm -rf node_modules package-lock.json

# Create a temporary package.json without workspace dependencies
cp package.json package.json.backup

# Replace workspace dependencies with actual versions
cat package.json | sed 's/"@globfam\/types": "workspace:\*"/"@globfam\/types": "file:..\/..\/packages\/types"/' | \
                  sed 's/"@globfam\/ui": "workspace:\*"/"@globfam\/ui": "file:..\/..\/packages\/ui"/' > package.json.tmp

mv package.json.tmp package.json

# Install dependencies
npm install --legacy-peer-deps

# Install missing TypeScript dependencies if needed
npm install --save-dev typescript@5.3.0 @types/react@18.2.0 @types/node@20.10.0 --save-exact

echo "Dependencies fixed! You can now run the web app."