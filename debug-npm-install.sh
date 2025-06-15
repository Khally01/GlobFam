#!/bin/bash
# Debug script for npm install issues

echo "=== Debugging npm install issue ==="
echo ""

echo "1. Checking Node.js version:"
node --version
echo ""

echo "2. Checking npm version:"
npm --version
echo ""

echo "3. Checking if backend package.json is valid:"
cd globfam-platform/backend
if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
    echo "✓ backend/package.json is valid JSON"
else
    echo "✗ backend/package.json has JSON syntax errors"
fi
echo ""

echo "4. Attempting npm install in backend with verbose logging:"
npm install --verbose 2>&1 | tail -n 50
echo ""

echo "5. Checking for any permission issues:"
ls -la node_modules 2>/dev/null || echo "node_modules directory doesn't exist yet"
echo ""

echo "6. Checking npm cache:"
npm cache verify
echo ""

echo "=== End of debug output ==="