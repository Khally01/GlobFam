# Signup Failure Troubleshooting Guide

## Issue: "Something went wrong" error when trying to sign up

Based on the deployment configuration, here are the most likely causes and solutions:

## 1. Check API Health

First, verify the API is running:
```bash
curl https://globfam-v1.up.railway.app/health
```

If this doesn't return a successful response, the API deployment has issues.

## 2. Common Authentication Issues

### A. CORS Configuration
The frontend and API are on different domains. Check if CORS is properly configured:

**In API (apps/api/src/index.ts or similar):**
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-domain.vercel.app',
    process.env.FRONTEND_URL
  ],
  credentials: true
}));
```

### B. Environment Variables on Railway
Verify these are set in Railway:
- `NODE_ENV=production`
- `JWT_SECRET` (must match exactly)
- `JWT_REFRESH_SECRET` (must match exactly)
- `DATABASE_URL` (auto-injected from PostgreSQL)
- `REDIS_URL` (auto-injected from Redis)

### C. Database Migrations
The most common issue - Prisma migrations not run on production:

1. Check Railway deployment logs for errors like:
   - "Table users does not exist"
   - "relation does not exist"

2. To fix, add to Railway settings:
   ```
   NIXPACKS_BUILD_CMD=npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
   ```

## 3. Frontend Configuration Issues

### A. API URL Configuration
Check if the frontend is pointing to the correct API:

**In apps/web/.env or .env.production:**
```
NEXT_PUBLIC_API_URL=https://globfam-v1.up.railway.app
```

### B. Register Endpoint Call
The register endpoint should be called as:
```javascript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important for CORS
  body: JSON.stringify({
    email,
    password,
    // other fields
  })
});
```

## 4. Debugging Steps

### Step 1: Test Register Endpoint Directly
```bash
curl -X POST https://globfam-v1.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

### Step 2: Check Browser Console
1. Open browser DevTools
2. Go to Network tab
3. Try to sign up
4. Look for the register request
5. Check:
   - Status code (401, 403, 500, etc.)
   - Response body for error details
   - Request headers (especially CORS)

### Step 3: Check Railway Logs
1. Go to Railway dashboard
2. Click on your API service
3. Go to "Deployments" tab
4. Click on latest deployment
5. Check logs for errors

## 5. Common Error Patterns

### "Cannot connect to database"
- PostgreSQL service not active
- DATABASE_URL not properly injected
- Migrations not run

### "Invalid token" or JWT errors
- JWT_SECRET mismatch between local and production
- JWT_REFRESH_SECRET not set

### "CORS error"
- Frontend URL not whitelisted in API CORS config
- Missing credentials: 'include' in fetch

### "bcrypt" or crypto errors
- Missing native dependencies
- Add to Railway: `NIXPACKS_PKGS=openssl`

## 6. Quick Fixes to Try

1. **Redeploy with fresh build:**
   ```
   NIXPACKS_BUILD_CMD=npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
   ```

2. **Add missing packages:**
   ```
   NIXPACKS_PKGS=openssl libc6-compat
   ```

3. **Force Node version:**
   ```
   NIXPACKS_NODE_VERSION=18
   ```

4. **Enable detailed logging:**
   ```
   DEBUG=* 
   LOG_LEVEL=debug
   ```

## 7. Validation Checklist

- [ ] API health endpoint returns success
- [ ] PostgreSQL service is active in Railway
- [ ] Redis service is active in Railway
- [ ] All 5 environment variables are set
- [ ] Frontend has correct NEXT_PUBLIC_API_URL
- [ ] CORS is configured for frontend domain
- [ ] Database migrations have run successfully
- [ ] No TypeScript build errors in logs

## 8. If All Else Fails

1. Check the exact error in:
   - Browser console (Network tab)
   - Railway deployment logs
   - PostgreSQL logs (in Railway)

2. Test locally with production database:
   ```bash
   DATABASE_URL="your-railway-postgres-url" npm run dev
   ```

3. Enable verbose logging in the API to see the exact error.

The "something went wrong" error is generic - the real error will be in one of these logs!