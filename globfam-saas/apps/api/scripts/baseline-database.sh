#!/bin/bash

# Script to baseline an existing database for Prisma migrations
# Use this when you have an existing database that wasn't created with Prisma

echo "🔧 Baselining existing database for Prisma..."
echo ""
echo "This script will:"
echo "1. Mark all existing migrations as already applied"
echo "2. Allow future migrations to run normally"
echo ""

# Create migrations table and mark migrations as applied
echo "📝 Creating migration history..."

# This command tells Prisma to mark all migrations in prisma/migrations as already applied
# without actually running them
npx prisma migrate resolve --applied "20250617223112_init"
npx prisma migrate resolve --applied "20250625000000_add_budget_models"

echo ""
echo "✅ Database baseline complete!"
echo ""
echo "You can now run future migrations normally with:"
echo "  npx prisma migrate deploy"