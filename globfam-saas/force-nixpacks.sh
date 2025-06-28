#!/bin/bash

echo "🔧 Forcing Railway to use Nixpacks by renaming Dockerfiles..."

# Handle API Dockerfile
if [ -f "apps/api/Dockerfile" ]; then
    mv apps/api/Dockerfile apps/api/Dockerfile.railway-backup
    echo "✅ Renamed apps/api/Dockerfile to Dockerfile.railway-backup"
else
    echo "ℹ️  No Dockerfile found in apps/api"
fi

# Handle Web Dockerfile  
if [ -f "apps/web/Dockerfile" ]; then
    mv apps/web/Dockerfile apps/web/Dockerfile.railway-backup
    echo "✅ Renamed apps/web/Dockerfile to Dockerfile.railway-backup"
else
    echo "ℹ️  No Dockerfile found in apps/web"
fi

echo ""
echo "📝 Next steps:"
echo "1. Commit these changes: git add -A && git commit -m 'Force Railway to use Nixpacks'"
echo "2. Push to your repository"
echo "3. Railway will now use Nixpacks configuration"
echo ""
echo "To restore Dockerfiles later:"
echo "  mv apps/api/Dockerfile.railway-backup apps/api/Dockerfile"
echo "  mv apps/web/Dockerfile.railway-backup apps/web/Dockerfile"