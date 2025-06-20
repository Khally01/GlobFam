#!/bin/bash
echo "🔧 Fixing imports for Railway deployment..."

# Replace @globfam/ui imports with local components
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak 's|from "@globfam/ui"|from "@/components/ui"|g' {} \;

# Replace @globfam/types imports with local types
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak 's|from "@globfam/types"|from "@/types"|g' {} \;

# Clean up backup files
find src -name "*.bak" -delete

echo "✅ Imports fixed!"