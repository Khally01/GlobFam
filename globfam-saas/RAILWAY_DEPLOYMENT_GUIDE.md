# Railway Deployment Guide for GlobFam

## Pre-Deployment Steps

### 1. Delete package-lock.json and regenerate it
Since we added new dependencies, you need to regenerate the lock file:

```bash
cd apps/api
rm package-lock.json
npm install
```

### 2. Commit all changes
```bash
git add .
git commit -m "Add banking integration, goals, forecasting, and analytics features"
git push
```

## Railway Configuration

### 1. API Service Configuration

#### Environment Variables (Required):
```bash
# Database
DATABASE_URL=<from Railway PostgreSQL>

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# Redis
REDIS_URL=<from Railway Redis>

# CORS (IMPORTANT: Include your frontend URL)
ALLOWED_ORIGINS=https://your-frontend.up.railway.app,http://localhost:3000

# Environment
NODE_ENV=production
PORT=3001

# Optional: Banking APIs
BASIQ_API_KEY=your-basiq-api-key
ENCRYPTION_KEY=generate-32-byte-random-string
ENCRYPTION_SALT=generate-16-byte-random-string

# Optional: OpenAI for AI features
OPENAI_API_KEY=your-openai-api-key
```

#### Build Settings:
- **Root Directory**: `/apps/api`
- **Build Command**: Leave empty (Nixpacks will detect)
- **Start Command**: Leave empty (Nixpacks will detect)

### 2. Frontend Service Configuration

#### Environment Variables:
```bash
NEXT_PUBLIC_API_URL=https://your-api-service.up.railway.app
```

#### Build Settings:
- **Root Directory**: `/apps/web`
- **Build Command**: Leave empty
- **Start Command**: Leave empty

### 3. PostgreSQL Service
- Should be automatically provisioned
- Make sure it's linked to the API service

### 4. Redis Service
- Should be automatically provisioned
- Make sure it's linked to the API service

## Deployment Steps

1. **Push changes to GitHub**
   ```bash
   git add .
   git commit -m "Fix deployment configuration"
   git push
   ```

2. **In Railway Dashboard**:
   - Go to your API service
   - Check deployment logs
   - If you see Dockerfile errors, make sure the Dockerfile is empty (we did this)
   - Railway should automatically use Nixpacks

3. **First Deployment Database Setup**:
   The nixpacks.toml configuration will automatically run migrations during build.
   If it fails, you can manually run:
   ```bash
   railway run npx prisma migrate deploy
   ```

4. **Verify Deployment**:
   ```bash
   # Test API health
   curl https://your-api.up.railway.app/health

   # Test registration
   curl -X POST https://your-api.up.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "testpass123",
       "name": "Test User",
       "organizationName": "Test Org"
     }'
   ```

## Troubleshooting

### "npm ci" fails
- Delete package-lock.json locally
- Run `npm install` to regenerate
- Commit and push

### Database connection fails
- Check DATABASE_URL is set correctly
- Ensure PostgreSQL service is running
- Check if migrations have run

### CORS errors
- Verify ALLOWED_ORIGINS includes your frontend URL
- Must be comma-separated list
- Include https:// prefix

### Build fails with module errors
- We added new dependencies (csv-parse, xlsx, openai, etc.)
- Make sure package-lock.json is updated
- Check all imports match installed packages

### Signup still fails
1. Check Railway logs for specific error
2. Common issues:
   - Database tables don't exist (migrations not run)
   - Missing environment variables
   - CORS blocking requests
   - Wrong API URL in frontend

## Quick Checklist

- [ ] Deleted old package-lock.json
- [ ] Ran `npm install` to regenerate with new dependencies
- [ ] Dockerfile is empty (forcing Nixpacks)
- [ ] nixpacks.toml exists in apps/api
- [ ] All environment variables set in Railway
- [ ] PostgreSQL and Redis services running
- [ ] Frontend has correct NEXT_PUBLIC_API_URL
- [ ] Committed and pushed all changes