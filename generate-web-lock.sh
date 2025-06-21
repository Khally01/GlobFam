#!/bin/bash

echo "Generating package-lock.json for web app..."
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/web
npm install --package-lock-only --legacy-peer-deps
echo "Done!"