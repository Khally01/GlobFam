# 🚀 Deploy GlobFam to Railway - Quick Fix Guide

## The Problem
Railway deployment is failing with: `ERROR: failed to solve: process "/bin/sh -c npm ci" did not complete successfully`

This happens because we added new npm packages but didn't update package-lock.json.

## The Solution - Run These Commands

Open Terminal and paste these commands one by one:

### 1. Navigate to API directory
```bash
cd /Users/khally/Projects/GlobFam/globfam-saas/apps/api
```

### 2. Remove old package-lock.json
```bash
rm -f package-lock.json
```

### 3. Install all dependencies (this creates new package-lock.json)
```bash
npm install
```

This will install all the new packages we added:
- ✅ axios (HTTP client for banking APIs)
- ✅ csv-parse (CSV file parsing)
- ✅ xlsx (Excel file parsing) 
- ✅ openai (AI categorization)
- ✅ date-fns (Date utilities)
- ✅ decimal.js (Financial calculations)
- ✅ multer (File uploads)

### 4. Generate Prisma client
```bash
npx prisma generate
```

### 5. Go back to repository root
```bash
cd ../..
```

### 6. Add changes to git
```bash
git add apps/api/package-lock.json apps/api/package.json
```

### 7. Commit the changes
```bash
git commit -m "Update API dependencies for Phase 2 features (AI, Analytics, Banking, Goals)"
```

### 8. Push to GitHub
```bash
git push origin main
```

## What Happens Next

1. Railway will automatically detect the push and start deploying
2. The deployment should now succeed because package-lock.json has all dependencies
3. Check your Railway dashboard for deployment progress

## Verify Railway Environment Variables

Make sure these are set in Railway:

### API Service
- `DATABASE_URL` (from PostgreSQL service)
- `JWT_SECRET` (any secure string)
- `JWT_REFRESH_SECRET` (different secure string)
- `REDIS_URL` (from Redis service)
- `ALLOWED_ORIGINS` (your frontend URL, e.g., `https://globfam-web.up.railway.app`)
- `NODE_ENV` = `production`

### Optional (for new features)
- `OPENAI_API_KEY` (for AI categorization)
- `ENCRYPTION_KEY` (32-byte string for banking tokens)
- `ENCRYPTION_SALT` (16-byte string)

### Frontend Service
- `NEXT_PUBLIC_API_URL` (your API URL, e.g., `https://globfam-api.up.railway.app`)

## Success! 🎉

After pushing, your deployment should work with all the new Phase 2 features:
- 🤖 AI Transaction Categorization
- 📊 Advanced Analytics Dashboard
- 🏦 Banking Integration (Commonwealth Bank, Khan Bank)
- 🎯 Goals & Financial Forecasting
- 📁 CSV/Excel Import Support