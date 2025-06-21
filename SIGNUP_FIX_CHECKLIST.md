# Quick Fix Checklist for Signup Failure

## Most Common Causes (Check These First!)

### 1. Database Migrations Not Run ⚠️
**This is the #1 cause of signup failures!**

**Symptoms:**
- Error in logs: "relation 'users' does not exist"
- 500 Internal Server Error on signup

**Fix:**
In Railway Settings > Variables, add:
```
NIXPACKS_BUILD_CMD=npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
```
Then redeploy.

### 2. Missing Environment Variables 🔑
**Check Railway Variables Tab:**
- [ ] `DATABASE_URL` - Should auto-link to PostgreSQL
- [ ] `REDIS_URL` - Should auto-link to Redis  
- [ ] `JWT_SECRET=qAkjnqtKorJAMP4OJZgA0DnZEOtHb3iElWl1jrRTeiE=`
- [ ] `JWT_REFRESH_SECRET=gyidyR+sJ7lzK5nx1xKdZoPC7MkJPu2EqnAFYlcM8zU=`
- [ ] `NODE_ENV=production`

### 3. Frontend Not Pointing to Correct API 🌐
**In your frontend deployment (Vercel/etc):**
```
NEXT_PUBLIC_API_URL=https://globfam-v1.up.railway.app
```
(No trailing slash!)

### 4. CORS Not Configured 🚫
**Symptoms:**
- Browser console shows CORS errors
- "Access-Control-Allow-Origin" errors

**Fix in API:**
The API needs to allow your frontend domain. This should be in the API code.

## Quick Diagnostic Steps

### Step 1: Test API is Running
```bash
curl https://globfam-v1.up.railway.app/health
```
Should return something like: `{"status":"ok"}`

### Step 2: Test Register Endpoint
```bash
curl -X POST https://globfam-v1.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test"}'
```

### Step 3: Check Browser Console
1. Open DevTools (F12)
2. Go to Network tab
3. Try to sign up
4. Look for red failed requests
5. Click on them to see error details

## Railway Specific Fixes

### If you see "prisma command not found":
Add to Variables:
```
NIXPACKS_PKGS=openssl libc6-compat
```

### If you see TypeScript errors:
Make sure `typescript` is in `dependencies` not `devDependencies` in package.json

### If you see "Cannot find module":
The monorepo structure might be causing issues. Ensure:
- Root Directory is set to `apps/api` (exactly this, no slashes)
- All dependencies are properly installed

## Emergency Fix Sequence

1. **In Railway Dashboard:**
   - Go to your API service
   - Settings > General
   - Verify Root Directory = `apps/api`
   
2. **In Variables tab, add:**
   ```
   NIXPACKS_BUILD_CMD=cd apps/api && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
   NIXPACKS_NODE_VERSION=18
   ```

3. **Click "Redeploy" on latest deployment**

4. **Wait for deployment to finish (check logs)**

5. **Test the endpoint again**

## Still Not Working?

Check Railway deployment logs for the EXACT error:
1. Railway Dashboard > Your Service
2. Deployments > Latest deployment
3. Click "View Logs"
4. Look for red error messages
5. Search for "error" or "failed"

Common log errors:
- "Table does not exist" → Migrations didn't run
- "Invalid token" → JWT secret mismatch
- "ECONNREFUSED" → Can't connect to database/Redis
- "Module not found" → Missing dependencies

The actual error in the logs will tell you exactly what's wrong!