# GlobFam Deployment Troubleshooting Guide

## Common Signup Error: "Something went wrong"

This generic error usually masks one of these specific issues:

### 1. **Database Connection Issues** (Most Common)
The most common cause is that Prisma migrations haven't been run in production.

**Solution:**
1. In Railway, go to your API service settings
2. Set the build command to:
   ```
   npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
   ```
3. Or add this environment variable:
   ```
   NIXPACKS_BUILD_CMD=npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
   ```

### 2. **CORS Configuration**
The API might be rejecting requests from your frontend domain.

**Check:**
- In Railway API service, ensure `ALLOWED_ORIGINS` includes your frontend URL:
  ```
  ALLOWED_ORIGINS=https://your-frontend.up.railway.app,http://localhost:3000
  ```

### 3. **Missing Environment Variables**
Ensure all required environment variables are set in Railway:

**API Service must have:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Any secure random string
- `JWT_REFRESH_SECRET` - Different secure random string
- `REDIS_URL` - Redis connection string
- `ALLOWED_ORIGINS` - Frontend URLs (comma-separated)
- `NODE_ENV` - Set to "production"

**Frontend Service must have:**
- `NEXT_PUBLIC_API_URL` - Your API URL (e.g., https://your-api.up.railway.app)

### 4. **API URL Configuration**
The frontend might be trying to reach the wrong API URL.

**Check:**
1. Frontend environment variable: `NEXT_PUBLIC_API_URL`
2. Should NOT have `/api` at the end
3. Should be HTTPS in production

### 5. **Database Schema Issues**
Tables might not exist in the database.

**Quick Fix:**
1. SSH into Railway or use Railway CLI
2. Run: `npx prisma migrate deploy`

### 6. **Build/Start Command Issues**
Ensure correct commands in Railway:

**API Service:**
- Build Command: `npm ci && npx prisma generate && npm run build`
- Start Command: `npm start`

**Frontend Service:**
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`

## How to Debug

### 1. Check Railway Logs
```bash
railway logs -s api
```

Look for:
- Database connection errors
- Missing environment variables
- Prisma errors
- CORS rejection messages

### 2. Check Browser Console
1. Open DevTools (F12)
2. Go to Network tab
3. Try to sign up
4. Look for the failed request
5. Check the response for specific error

### 3. Test API Directly
```bash
curl -X POST https://your-api.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User",
    "organizationName": "Test Org"
  }'
```

### 4. Common Error Messages and Solutions

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "relation 'User' does not exist" | Database not migrated | Run migrations |
| "CORS policy: No 'Access-Control-Allow-Origin'" | CORS misconfiguration | Update ALLOWED_ORIGINS |
| "Cannot read properties of undefined" | Missing environment variable | Check all env vars |
| "connect ECONNREFUSED" | Database/Redis not running | Check service status |
| "Invalid token" | JWT_SECRET mismatch | Ensure same secret everywhere |

## Quick Fix Checklist

1. ✅ Verify all environment variables are set
2. ✅ Run database migrations: `npx prisma migrate deploy`
3. ✅ Check ALLOWED_ORIGINS includes frontend URL
4. ✅ Verify NEXT_PUBLIC_API_URL is correct
5. ✅ Ensure PostgreSQL and Redis are running
6. ✅ Check API logs for specific errors
7. ✅ Test API endpoint directly with curl

## Manual Setup Commands

If you need to manually set up the database:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify database
npx prisma db pull
```

## Still Having Issues?

1. Check the specific error in Railway logs
2. Verify all services are running (API, PostgreSQL, Redis)
3. Ensure no typos in environment variables
4. Try redeploying with cleared cache