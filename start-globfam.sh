#!/bin/bash

echo "Starting GlobFam Development Environment..."

# Set up environment variables
export DATABASE_URL="postgresql://globfam:password@localhost:5432/globfam?schema=public"
export REDIS_URL="redis://localhost:6379"
export JWT_SECRET="qAkjnqtKorJAMP4OJZgA0DnZEOtHb3iElWl1jrRTeiE="
export JWT_REFRESH_SECRET="gyidyR+sJ7lzK5nx1xKdZoPC7MkJPu2EqnAFYlcM8zU="
export NODE_ENV="development"

# Kill any existing processes
pkill -f "ts-node.*globfam" || true

# Start API
echo "Starting API on port 3001..."
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/api
npx ts-node src/index.ts &
API_PID=$!

echo "API started with PID: $API_PID"

# Wait for API to start
sleep 5

# Start Web
echo "Starting Web app on port 3000..."
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/web
npm install --legacy-peer-deps
npx next dev -p 3000 &
WEB_PID=$!

echo "Web app started with PID: $WEB_PID"

echo ""
echo "🚀 GlobFam is running!"
echo "   - API: http://localhost:3001"
echo "   - Web: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait