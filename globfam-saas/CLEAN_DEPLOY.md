# 🚀 Clean Deployment Guide for GlobFam

## Current Setup:
- Monorepo with API (`/apps/api`) and Web (`/apps/web`)
- API: Express.js + TypeScript + Prisma + PostgreSQL
- Web: Next.js + TypeScript

## 🎯 Deployment Strategy:

### Option 1: Deploy API to Railway (Recommended)

1. **In Railway Dashboard:**
   - Create New Project → Deploy from GitHub
   - Select your `GlobFam` repository
   - Configure Service:
     - **Root Directory**: `apps/api`
     - **Start Command**: `npm start`
     - Leave other settings as default

2. **Add Database Services:**
   - Click "New" → PostgreSQL
   - Click "New" → Redis

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=qAkjnqtKorJAMP4OJZgA0DnZEOtHb3iElWl1jrRTeiE=
   JWT_REFRESH_SECRET=gyidyR+sJ7lzK5nx1xKdZoPC7MkJPu2EqnAFYlcM8zU=
   ```
   (DATABASE_URL and REDIS_URL will be auto-injected by Railway)

4. **Deploy!**

### Option 2: Use Docker (If Railway Still Fails)

1. **Enable the optimized Dockerfile:**
   ```bash
   cd apps/api
   mv Dockerfile.disabled Dockerfile
   ```

2. **In Railway:**
   - Set Builder to "Dockerfile" (if available)
   - Or deploy to any Docker host

### Option 3: Deploy Standalone API (Simplest)

We already created a standalone API at `~/globfam-api-standalone`. 
Just push it to a new GitHub repo and deploy that instead.

## 🌐 Deploy Web App:

### To Vercel (Best for Next.js):
1. Go to vercel.com
2. Import your GitHub repo
3. Set root directory to `apps/web`
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.railway.app
   ```

## 📋 What We Changed:
- Removed conflicting root-level deployment files
- Simplified API deployment configuration
- Added railway-build script for custom build process
- Ready for clean deployment

## 🔧 If Issues Persist:
Use the standalone API approach - it's already prepared and will work immediately!