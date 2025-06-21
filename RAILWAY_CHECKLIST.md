# 🔍 Railway Settings Checklist

## 1. Service Settings Tab

### General
- **Service Name**: Should be something like "globfam-api"
- **Root Directory**: `apps/api` (CRITICAL - must be exactly this)
- **Watch Paths**: Leave empty (default)

### Build & Deploy
- **Builder**: Should auto-detect as "Nixpacks"
- **Build Command**: Leave empty (uses package.json scripts)
- **Start Command**: Leave empty (uses package.json start)
- **Healthcheck Path**: `/health` (optional but recommended)
- **Healthcheck Timeout**: 300 (default)

## 2. Variables Tab

### Required Environment Variables
```
NODE_ENV=production
JWT_SECRET=qAkjnqtKorJAMP4OJZgA0DnZEOtHb3iElWl1jrRTeiE=
JWT_REFRESH_SECRET=gyidyR+sJ7lzK5nx1xKdZoPC7MkJPu2EqnAFYlcM8zU=
```

### Should be Auto-Injected (from PostgreSQL/Redis services)
- `DATABASE_URL` - Should show as "Reference to Postgres.DATABASE_URL"
- `REDIS_URL` - Should show as "Reference to Redis.REDIS_URL"

### Remove These If Present
- `NIXPACKS_PROVIDER` (remove this)
- `RAILWAY_DOCKERFILE_PATH` (remove this)

## 3. Domains Tab
- Should show your Railway-generated domain
- Something like: `globfam-api-production.up.railway.app`

## 4. Networking Tab
- **Port**: Should auto-detect as 3001
- If not, manually set to 3001

## 5. GitHub Integration
- **Auto Deploy**: Should be "Enabled"
- **Branch**: Should be "main"

## 🚨 Common Issues to Check:

1. **Wrong Root Directory**
   - Must be `apps/api` not `/apps/api` (no leading slash)
   - Not `globfam-saas/apps/api`
   - Just `apps/api`

2. **Missing Services**
   - Do you have PostgreSQL service added?
   - Do you have Redis service added?
   - Are they both "Active"?

3. **Build Logs**
   - Check the "Deployments" tab
   - Click on the latest deployment
   - Look for any red errors
   - Common errors:
     - "Cannot find module" = dependency issue
     - "prisma command not found" = Prisma not generated
     - "Table does not exist" = migrations not run

## 🔧 Quick Fixes:

### If build fails with module errors:
Add this variable:
```
NIXPACKS_NODE_VERSION=18
```

### If Prisma fails:
Add this variable:
```
NIXPACKS_BUILD_CMD=npm ci && npx prisma generate && npm run build
```

### If TypeScript fails:
Make sure `typescript` is in dependencies (not just devDependencies)

## 📋 Final Verification:
1. Is PostgreSQL service showing as "Active"?
2. Is Redis service showing as "Active"?
3. Is DATABASE_URL showing in Variables (auto-injected)?
4. Is REDIS_URL showing in Variables (auto-injected)?
5. Are your JWT secrets set?
6. Is Root Directory exactly `apps/api`?

## 🚀 After Checking Everything:
Click "Redeploy" from the latest deployment!