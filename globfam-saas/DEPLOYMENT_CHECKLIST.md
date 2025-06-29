# GlobFam Production Deployment Checklist

## Pre-Deployment Tasks ✅

### 1. Security (COMPLETED)
- [x] Generated new JWT secrets
- [x] Added ENCRYPTION_KEY requirement
- [x] Created production environment templates
- [x] Removed hardcoded secrets from code
- [x] Created `generate-secrets.sh` script

### 2. Build Issues (COMPLETED)
- [x] Fixed API missing dependencies (papaparse, exceljs)
- [x] Fixed Web SWC binary issue
- [x] Both builds now passing

### 3. Configuration (COMPLETED)
- [x] Created `vercel.json` for web deployment
- [x] Created API-specific `railway.json`
- [x] Configured production CORS
- [x] Set up automated database migrations

### 4. Testing (COMPLETED)
- [x] Created authentication tests
- [x] Created transaction tests
- [x] Set up Jest configuration

## Deployment Steps

### Step 1: Generate Production Secrets
```bash
cd globfam-saas
./scripts/generate-secrets.sh
```
Save the generated values securely!

### Step 2: Deploy Database (Railway)
1. Create new Railway project
2. Add PostgreSQL service
3. Add Redis service
4. Note the connection URLs

### Step 3: Deploy API (Railway)
1. Create new service in Railway
2. Connect to GitHub repo
3. Set root directory: `/globfam-saas/apps/api`
4. Add environment variables:
   ```
   DATABASE_URL=[from PostgreSQL]
   REDIS_URL=[from Redis]
   JWT_SECRET=[generated]
   JWT_REFRESH_SECRET=[generated]
   ENCRYPTION_KEY=[generated]
   NODE_ENV=production
   PORT=3001
   ALLOWED_ORIGINS=https://app.globfam.app
   ```
5. Deploy

### Step 4: Deploy Web (Vercel)
1. Import project to Vercel
2. Set root directory: `/globfam-saas`
3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.globfam.app
   NEXT_PUBLIC_APP_NAME=GlobFam
   NEXT_PUBLIC_APP_URL=https://app.globfam.app
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[your key]
   ```
4. Deploy

### Step 5: Configure Stripe
1. Add webhook endpoint in Stripe Dashboard
2. Update `STRIPE_WEBHOOK_SECRET` in Railway
3. Configure pricing IDs

### Step 6: Post-Deployment
1. Test authentication flow
2. Test transaction creation
3. Verify CORS is working
4. Check database migrations ran
5. Monitor logs for errors

## Features to Enable Later

### Phase 2 (Post-Launch)
- [ ] Bank integrations (Plaid/Basiq)
- [ ] Email notifications (SendGrid)
- [ ] File uploads (AWS S3)
- [ ] AI insights (OpenAI)

### Phase 3
- [ ] Error tracking (Sentry)
- [ ] Analytics (PostHog)
- [ ] Advanced monitoring

## MVP Features (Ready Now)
- ✅ User registration & authentication
- ✅ Multi-currency dashboard
- ✅ Family organization management
- ✅ Manual transaction entry
- ✅ Basic budgeting
- ✅ Stripe payment integration (needs configuration)

## Emergency Rollback Plan
1. Keep previous deployment active
2. Use Railway's rollback feature
3. Revert Vercel to previous deployment
4. Check database migrations compatibility

## Support Contacts
- Railway Support: https://railway.app/help
- Vercel Support: https://vercel.com/support
- Database issues: Check PostgreSQL logs in Railway

## Monitoring
- API Health: `https://api.globfam.app/health`
- Check Railway metrics dashboard
- Monitor Vercel analytics

## Notes
- Docker builds may fail locally but work in Railway
- Always run `./validate-deployment.sh` before deploying
- Keep production secrets in a password manager
- Never commit .env files with real values