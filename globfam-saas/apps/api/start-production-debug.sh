#!/bin/sh

echo "🔍 DEBUG: Starting GlobFam API Production Debug..."
echo "=================================="
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la
echo "=================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ ERROR: node_modules directory not found!"
    exit 1
fi

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "❌ ERROR: dist directory not found! Build may have failed."
    exit 1
fi

echo "dist directory contents:"
ls -la dist/
echo "=================================="

# Try to start with simple server first
echo "🧪 Testing with simple health check server..."
node simple-start.js