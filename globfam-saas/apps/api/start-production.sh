#!/bin/sh

echo "🚀 Starting GlobFam API Production..."
echo "=================================="
echo "Environment: ${NODE_ENV:-not set}"
echo "Port: ${PORT:-3001}"
echo "Database URL: ${DATABASE_URL:+[CONFIGURED]}"
echo "Redis URL: ${REDIS_URL:+[CONFIGURED]}"
echo "JWT Secret: ${JWT_SECRET:+[CONFIGURED]}"
echo "Node Version: $(node -v)"
echo "NPM Version: $(npm -v)"
echo "=================================="

# Check required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set!"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ ERROR: JWT_SECRET is not set!"
    exit 1
fi

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Try to run migrations with timeout
echo "📦 Running database migrations..."
timeout 30s npx prisma migrate deploy

MIGRATION_EXIT_CODE=$?

if [ $MIGRATION_EXIT_CODE -eq 124 ]; then
    echo "⚠️  Migration timed out after 30 seconds"
    echo "Continuing anyway..."
elif [ $MIGRATION_EXIT_CODE -ne 0 ]; then
    echo "❌ Migration failed with exit code: $MIGRATION_EXIT_CODE"
    echo "Continuing anyway to see if database is accessible..."
fi

# Check if dist/index.js exists
if [ ! -f "dist/index.js" ]; then
    echo "❌ ERROR: dist/index.js not found! Build may have failed."
    echo "Contents of dist directory:"
    ls -la dist/ || echo "dist directory doesn't exist"
    exit 1
fi

# Start the server
echo "🏃 Starting Node.js server..."
echo "Command: node dist/index.js"
exec node dist/index.js