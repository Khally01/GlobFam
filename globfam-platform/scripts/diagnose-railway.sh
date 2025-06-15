#!/bin/bash

echo "🔍 Railway Deployment Diagnostics for GlobFam Platform"
echo "=================================================="

# Check environment
echo -e "\n📋 Environment Check:"
echo "NODE_ENV: ${NODE_ENV:-'NOT SET'}"
echo "PORT: ${PORT:-'NOT SET'}"

# Check required environment variables
echo -e "\n🔑 Required Environment Variables:"
vars=(
  "DATABASE_URL"
  "REDIS_URL"
  "JWT_SECRET"
  "JWT_REFRESH_SECRET"
  "FRONTEND_URL"
)

for var in "${vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ $var: NOT SET"
  else
    echo "✅ $var: SET (length: ${#var})"
  fi
done

# Check optional environment variables
echo -e "\n🔧 Optional Environment Variables:"
optional_vars=(
  "EXCHANGE_RATE_API_KEY"
  "PLAID_CLIENT_ID"
  "PLAID_SECRET"
  "SMTP_HOST"
  "SMTP_USER"
  "SENTRY_DSN"
)

for var in "${optional_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "⚠️  $var: NOT SET (optional)"
  else
    echo "✅ $var: SET"
  fi
done

# Check Node version
echo -e "\n🟢 Node.js Version:"
node --version

# Check if database migrations are needed
echo -e "\n🗄️  Database Status:"
if [ ! -z "$DATABASE_URL" ]; then
  npx prisma migrate status || echo "⚠️  Unable to check migration status"
else
  echo "❌ DATABASE_URL not set - cannot check migrations"
fi

# Check if build artifacts exist
echo -e "\n📦 Build Artifacts:"
if [ -d "backend/dist" ]; then
  echo "✅ Backend build exists"
else
  echo "❌ Backend build missing (dist folder not found)"
fi

if [ -d "frontend/dist" ]; then
  echo "✅ Frontend build exists"
else
  echo "❌ Frontend build missing (dist folder not found)"
fi

echo -e "\n=================================================="
echo "💡 If you see red lines in Railway logs, check the items marked with ❌ above"