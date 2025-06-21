#!/bin/bash

echo "🚀 Preparing GlobFam for Deployment..."

PROJECT_DIR="/Users/khally/Documents/GitHub/GlobFam/globfam-saas"

# Fix 1: Update root package.json for Railway
echo "📦 Fixing root package.json..."
cat > "$PROJECT_DIR/package.json" << 'EOF'
{
  "name": "globfam-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "echo 'Use npm run dev:api or dev:web'",
    "dev:api": "cd apps/api && npm run dev",
    "dev:web": "cd apps/web && npm run dev",
    "build": "echo 'Building all apps' && npm run build:api && npm run build:web",
    "build:api": "cd apps/api && npm run build",
    "build:web": "cd apps/web && npm run build",
    "start:api": "cd apps/api && npm start",
    "start:web": "cd apps/web && npm start",
    "install:all": "npm install && cd apps/api && npm install && cd ../web && npm install --legacy-peer-deps"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Fix 2: Create railway.json for API
echo "🚂 Creating Railway config for API..."
cat > "$PROJECT_DIR/apps/api/railway.json" << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
EOF

# Fix 3: Create railway.json for Web
echo "🚂 Creating Railway config for Web..."
cat > "$PROJECT_DIR/apps/web/railway.json" << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install --legacy-peer-deps && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
EOF

# Fix 4: Update web package.json to remove workspace dependencies
echo "🔧 Fixing web app dependencies..."
cd "$PROJECT_DIR/apps/web"
# Already fixed by previous script

# Fix 5: Create .gitignore if missing
if [ ! -f "$PROJECT_DIR/.gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > "$PROJECT_DIR/.gitignore" << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Next.js
.next/
out/
build/

# Production
dist/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Local env files
.env
.env*.local
.env.development
.env.production

# Vercel
.vercel

# Typescript
*.tsbuildinfo
next-env.d.ts

# Turbo
.turbo

# Database
*.db
*.sqlite

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
EOF
fi

echo ""
echo "✅ Project prepared for deployment!"
echo ""
echo "📋 Next Steps:"
echo "1. Commit these changes:"
echo "   cd $PROJECT_DIR"
echo "   git add ."
echo "   git commit -m 'Fix dependencies and prepare for Railway deployment'"
echo "   git push origin main"
echo ""
echo "2. Deploy to Railway:"
echo "   - Go to railway.app"
echo "   - Create new project from GitHub"
echo "   - Railway will auto-detect the monorepo structure"
echo ""
echo "3. Set environment variables in Railway for both services"
echo ""
echo "✨ Your project is now deployment-ready!"