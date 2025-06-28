# GlobFam Production Deployment Guide

## Quick Start for Railway Deployment

### 1. Railway Configuration Updates Applied ✅

Both services have been reverted to use **Nixpacks** (which was working before):

- **API**: `apps/api/railway.toml` - Uses Nixpacks with optimized build command
- **Web**: `apps/web/railway.json` - Uses Nixpacks with optimized build command

### 2. Railway Dashboard Configuration Required

#### For API Service:
1. Go to Railway Dashboard → API Service → Settings → General
2. Set **Root Directory**: `/apps/api`
3. Go to Variables tab and add:
```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
PORT=3001
DATABASE_URL=<your-postgres-url>
JWT_SECRET=<generate-with: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate-with: openssl rand -base64 32>
REDIS_URL=<your-redis-url>
OPENAI_API_KEY=<your-openai-key>
```

#### For Web Service:
1. Go to Railway Dashboard → Web Service → Settings → General
2. Set **Root Directory**: `/apps/web`
3. Go to Variables tab and add:
```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
NEXT_TELEMETRY_DISABLED=1
PORT=3000
NEXT_PUBLIC_API_URL=<your-api-service-url>
NEXT_PUBLIC_APP_NAME=GlobFam
NEXT_PUBLIC_APP_URL=<your-web-service-url>
```

### 3. Deploy Commands

```bash
# Deploy API
cd apps/api
railway up

# Deploy Web
cd apps/web
railway up
```

## Production Environment Variables

### API Service (.env.production)
```env
# Core Configuration
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@host:5432/globfam_production?sslmode=require&connection_limit=5

# Redis
REDIS_URL=redis://default:password@redis-host:6379

# Authentication (Generate secrets with: openssl rand -base64 32)
JWT_SECRET=your-32-character-jwt-secret-here
JWT_REFRESH_SECRET=your-32-character-refresh-secret-here

# Stripe (Production keys from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID_MONTHLY=price_your_monthly_price_id
STRIPE_PRICE_ID_YEARLY=price_your_yearly_price_id

# OpenAI (for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Security
CORS_ORIGIN=https://app.globfam.com,https://globfam.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional Services
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
LOG_LEVEL=info
```

### Web Service (.env.production)
```env
# Core Configuration
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
NEXT_TELEMETRY_DISABLED=1
PORT=3000

# API Configuration
NEXT_PUBLIC_API_URL=https://api.globfam.com
NEXT_PUBLIC_APP_URL=https://app.globfam.com
NEXT_PUBLIC_APP_NAME=GlobFam

# Features
NEXT_PUBLIC_ENABLE_AI_CATEGORIZATION=true
NEXT_PUBLIC_ENABLE_BANKING_INTEGRATION=false

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# Optional Services
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SUPPORT_EMAIL=support@globfam.com
```

## Pre-Deployment Checklist

- [ ] Database is provisioned and accessible
- [ ] Redis is provisioned and accessible
- [ ] Environment variables are set in Railway
- [ ] Root directories are configured in Railway
- [ ] Stripe account is set up with products/prices
- [ ] OpenAI API key has sufficient credits
- [ ] Domain names are configured (api.globfam.com, app.globfam.com)

## Post-Deployment Verification

1. **Check API Health**: `https://api.globfam.com/health`
2. **Check Web App**: `https://app.globfam.com`
3. **Test Authentication**: Register and login
4. **Test Core Features**: 
   - Create assets
   - Add transactions
   - AI categorization
   - Analytics dashboard

## Monitoring Setup

### 1. Railway Metrics
- Monitor build times
- Check memory usage
- Review crash logs

### 2. Application Monitoring (Recommended)
```bash
# Add Sentry for error tracking
npm install @sentry/node @sentry/nextjs
```

### 3. Uptime Monitoring
- Set up Pingdom or UptimeRobot
- Monitor both API and Web endpoints
- Configure alerts for downtime

## Troubleshooting Common Issues

### Memory Issues (Exit Code 137)
1. Increase NODE_OPTIONS memory limit to 768
2. Upgrade Railway plan if needed
3. Optimize dependencies (remove unused packages)

### Build Failures
1. Check Railway build logs
2. Ensure all environment variables are set
3. Verify package.json has all required dependencies
4. Try clearing Railway build cache

### Database Connection Issues
1. Verify DATABASE_URL format
2. Check SSL settings (sslmode=require)
3. Ensure connection limits are set
4. Verify database is accessible from Railway

### SWC/Next.js Issues
1. The current configuration uses Nixpacks which handles SWC automatically
2. If issues persist, add to next.config.js:
```javascript
experimental: {
  forceSwcTransforms: true
}
```

## Scaling for Production

### Phase 1: Single Region (Current)
- API and Web on Railway
- PostgreSQL database
- Redis for sessions/caching

### Phase 2: Multi-Region (Future)
- Add CDN (CloudFlare)
- Database read replicas
- Multiple API instances
- Edge deployment for Web

### Phase 3: Enterprise Scale
- Kubernetes deployment
- Auto-scaling policies
- Global load balancing
- Multi-region failover

## Security Recommendations

1. **Enable 2FA** on all service accounts
2. **Rotate secrets** quarterly
3. **Set up WAF** on CloudFlare
4. **Enable audit logging**
5. **Regular security scans**

## Support Resources

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Next.js Deployment: https://nextjs.org/docs/deployment
- PostgreSQL Best Practices: https://wiki.postgresql.org/wiki/Performance_Optimization

## Emergency Contacts

- Railway Support: support@railway.app
- Database Issues: Check Railway dashboard
- Domain/DNS: Your registrar support
- Payment Processing: Stripe support

---

**Last Updated**: December 2024
**Version**: 1.0