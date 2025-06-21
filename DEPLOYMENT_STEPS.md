# GlobFam Deployment Guide

## Current Status
- ✅ API is running locally on port 3001
- ✅ PostgreSQL and Redis are running in Docker
- ✅ Database migrations completed
- ⚠️  Web app has dependency issues (needs fixing)
- ⚠️  Code needs to be pushed to GitHub

## Step 1: Push to GitHub
```bash
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas
git push origin main
```
You'll need to enter your GitHub username and password/token.

## Step 2: Deploy API to Railway

### Option A: Railway CLI
```bash
# Install Railway CLI
brew install railway

# Login to Railway
railway login

# Create new project
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/api
railway new

# Link to your project
railway link

# Add PostgreSQL
railway add --database postgresql

# Add Redis
railway add --service redis

# Set environment variables
railway variables set DATABASE_URL="your-railway-postgres-url"
railway variables set JWT_SECRET="qAkjnqtKorJAMP4OJZgA0DnZEOtHb3iElWl1jrRTeiE="
railway variables set JWT_REFRESH_SECRET="gyidyR+sJ7lzK5nx1xKdZoPC7MkJPu2EqnAFYlcM8zU="
railway variables set REDIS_URL="your-railway-redis-url"
railway variables set NODE_ENV="production"
railway variables set PORT="3001"

# Deploy
railway up
```

### Option B: Railway Dashboard (Easier)
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `GlobFam` repository
5. Set root directory to `apps/api`
6. Add PostgreSQL and Redis services
7. Set all environment variables in Settings
8. Deploy!

## Step 3: Deploy Web to Vercel

### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/web
vercel

# Follow prompts:
# - Set root directory to apps/web
# - Framework: Next.js
# - Build command: npm run build
# - Output directory: .next
```

### Option B: Vercel Dashboard (Easier)
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Root Directory: `apps/web`
   - Framework Preset: Next.js
   - Environment Variables:
     - `NEXT_PUBLIC_API_URL`: Your Railway API URL
     - `NEXT_PUBLIC_APP_URL`: Your Vercel URL
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: (if using Stripe)

## Step 4: Fix Web App Dependencies

Before deploying the web app, you need to fix the workspace dependencies issue:

1. Create a standalone package.json for the web app:
```bash
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/web
# Remove workspace dependencies and install actual packages
```

2. Or configure the monorepo properly with npm workspaces or pnpm

## Step 5: Configure Production Database

After Railway creates your PostgreSQL:
1. Get the DATABASE_URL from Railway
2. Run migrations:
```bash
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

## Step 6: Update DNS (Optional)

If you bought a domain:
1. In Vercel: Add custom domain
2. Update DNS records at your domain provider
3. Wait for propagation

## Environment Variables Summary

### API (Railway)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: qAkjnqtKorJAMP4OJZgA0DnZEOtHb3iElWl1jrRTeiE=
- `JWT_REFRESH_SECRET`: gyidyR+sJ7lzK5nx1xKdZoPC7MkJPu2EqnAFYlcM8zU=
- `NODE_ENV`: production
- `PORT`: 3001
- `STRIPE_SECRET_KEY`: (add when ready)
- `STRIPE_WEBHOOK_SECRET`: (add when ready)

### Web (Vercel)
- `NEXT_PUBLIC_API_URL`: https://your-api.railway.app
- `NEXT_PUBLIC_APP_URL`: https://your-app.vercel.app
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: (add when ready)

## Estimated Costs
- Railway: ~$5-20/month (API + PostgreSQL + Redis)
- Vercel: Free tier should be sufficient
- Total: ~$5-20/month

## Quick Deploy Commands
```bash
# 1. Push to GitHub
git push origin main

# 2. Deploy API
railway up

# 3. Deploy Web
vercel --prod
```