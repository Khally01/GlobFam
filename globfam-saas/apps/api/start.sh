#!/bin/sh

echo "🚀 Starting GlobFam API..."
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo "Database URL configured: ${DATABASE_URL:+Yes}"
echo "Redis URL configured: ${REDIS_URL:+Yes}"

# Run migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Migration failed!"
    exit 1
fi

echo "✅ Migrations completed"

# Start the server
echo "🏃 Starting server..."
npm start