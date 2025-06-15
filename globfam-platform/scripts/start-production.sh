#!/bin/bash

# Start script for Railway production deployment

echo "Starting GlobFam Platform..."

# Set working directory
cd /app

# Run database migrations
echo "Running database migrations..."
cd backend && npx prisma migrate deploy

# Install process manager
npm install -g concurrently

# Start both services with concurrently
echo "Starting services..."
cd /app
concurrently -n "backend,frontend" -c "cyan,magenta" \
  "cd backend && npm start" \
  "cd frontend && npm run preview -- --port ${PORT:-3000} --host 0.0.0.0"