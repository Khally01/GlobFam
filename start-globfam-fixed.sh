#!/bin/bash

echo "🚀 Starting GlobFam Development Environment (Fixed)..."

# Kill any existing processes
pkill -f "ts-node.*globfam" || true
pkill -f "next dev" || true

# Environment variables
export DATABASE_URL="postgresql://globfam:password@localhost:5432/globfam?schema=public"
export REDIS_URL="redis://localhost:6379"
export JWT_SECRET="qAkjnqtKorJAMP4OJZgA0DnZEOtHb3iElWl1jrRTeiE="
export JWT_REFRESH_SECRET="gyidyR+sJ7lzK5nx1xKdZoPC7MkJPu2EqnAFYlcM8zU="
export NODE_ENV="development"

# Check if Docker containers are running
if ! docker ps | grep -q globfam-saas-postgres; then
    echo "Starting PostgreSQL and Redis..."
    docker-compose -f /Users/khally/Documents/GitHub/GlobFam/globfam-saas/docker-compose.yml up -d postgres redis
    sleep 5
fi

# Start API
echo "📡 Starting API on port 3001..."
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/api
nohup npx ts-node src/index.ts > /tmp/globfam-api.log 2>&1 &
API_PID=$!
echo "API PID: $API_PID"

# Wait for API
sleep 3

# Check API health
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ API is healthy!"
else
    echo "❌ API failed to start. Check /tmp/globfam-api.log"
    exit 1
fi

# Start Web
echo "🌐 Starting Web app on port 3000..."
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/web

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing web dependencies..."
    npm install --legacy-peer-deps
fi

npx next dev -p 3000 &
WEB_PID=$!
echo "Web PID: $WEB_PID"

echo ""
echo "✨ GlobFam is starting up!"
echo "   📡 API: http://localhost:3001"
echo "   🌐 Web: http://localhost:3000"
echo "   📧 Demo: demo@globfam.app / demo123456"
echo ""
echo "📋 Logs:"
echo "   API: tail -f /tmp/globfam-api.log"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo "Stopping services..."
    kill $API_PID $WEB_PID 2>/dev/null
    exit 0
}

trap cleanup EXIT INT TERM

# Keep script running
wait