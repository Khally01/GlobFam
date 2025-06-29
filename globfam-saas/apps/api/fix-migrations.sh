#!/bin/bash

echo "🔧 Fixing GlobFam Database Migrations"
echo "===================================="
echo ""

# Step 1: Check current status
echo "📊 Checking current migration status..."
npx prisma migrate status

echo ""
echo "📝 Applying migration history..."

# Step 2: Mark migrations as applied
echo "Marking first migration as applied..."
npx prisma migrate resolve --applied "20250617223112_init"

echo ""
echo "Marking second migration as applied..."
npx prisma migrate resolve --applied "20250625000000_add_budget_models"

echo ""
echo "✅ Migrations should now be marked as applied!"
echo ""

# Step 3: Verify
echo "📊 Verifying migration status..."
npx prisma migrate status

echo ""
echo "✨ Migration fix complete!"