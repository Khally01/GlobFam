# Railway Deployment Checklist

## Prerequisites
- [ ] Railway CLI installed
- [ ] Logged into Railway (`railway login`)
- [ ] PostgreSQL and Redis services created in Railway

## API Service (Backend)

### 1. Environment Variables Required
```bash
# Database
DATABASE_URL=postgresql://... # From Railway PostgreSQL

# Redis
REDIS_URL=redis://... # From Railway Redis

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-32-char-secret
JWT_REFRESH_SECRET=your-32-char-secret

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.railway.app

# OpenAI (optional)
OPENAI_API_KEY=sk-...

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Environment
NODE_ENV=production
PORT=3001
```

### 2. Deployment Steps
```bash
cd apps/api

# Link to Railway project
railway link

# Deploy
railway up

# Check logs
railway logs
```

### 3. Post-Deployment
- Check /health endpoint
- Verify database migrations ran successfully
- Test authentication endpoints

## Web Service (Frontend)

### 1. Environment Variables Required
```bash
# API URL
NEXT_PUBLIC_API_URL=https://your-api-domain.railway.app

# App Configuration
NEXT_PUBLIC_APP_NAME=GlobFam
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.railway.app

# Environment
NODE_ENV=production
```

### 2. Deployment Steps
```bash
cd apps/web

# Link to Railway project
railway link

# Deploy
railway up

# Check logs
railway logs
```

### 3. Post-Deployment
- Verify API connection
- Test login/signup flow
- Check all pages load correctly

## Common Issues & Solutions

### 1. TypeScript Build Errors
- Fixed: AuthRequest type conflicts resolved
- Fixed: Nullable description in AI service

### 2. Monorepo Dependencies
- Web app uses custom build scripts in railway.json
- Shared packages are handled by build process

### 3. Database Migrations
- Migrations run automatically during build
- Check logs for migration success

### 4. CORS Issues
- Ensure ALLOWED_ORIGINS includes your frontend URL
- Include protocol (https://)

### 5. Memory Issues
- API: Default memory should be sufficient
- Web: May need to increase if build fails

## Verification Steps

1. **API Health Check**
   ```bash
   curl https://your-api-domain.railway.app/health
   ```

2. **Database Connection**
   ```bash
   curl https://your-api-domain.railway.app/api/db-health
   ```

3. **Frontend Loading**
   - Visit the web URL
   - Check browser console for errors
   - Verify API calls are working

## Rollback Plan
If deployment fails:
1. Check Railway logs for specific errors
2. Rollback to previous deployment in Railway dashboard
3. Fix issues locally and test
4. Redeploy

## Support Resources
- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- GitHub Issues: https://github.com/anthropics/claude-code/issues