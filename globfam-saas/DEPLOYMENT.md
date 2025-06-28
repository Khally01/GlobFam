# GlobFam Deployment Guide

## Quick Start

### Prerequisites
- Railway account with project created
- PostgreSQL database (Railway or external)
- Redis instance (Railway or external)
- Stripe account (for payments)
- OpenAI API key (for AI features)

### Deploy to Railway

1. **Configure Railway Services**
   - Create two services: `api` and `web`
   - Set root directories:
     - API Service: `/apps/api`
     - Web Service: `/apps/web`

2. **Set Environment Variables**
   
   **API Service:**
   ```bash
   NODE_ENV=production
   NODE_OPTIONS=--max-old-space-size=512
   PORT=3001
   DATABASE_URL=<your-postgres-url>
   JWT_SECRET=<generate-with: openssl rand -base64 32>
   JWT_REFRESH_SECRET=<generate-with: openssl rand -base64 32>
   REDIS_URL=<your-redis-url>
   OPENAI_API_KEY=<your-openai-key>
   STRIPE_SECRET_KEY=<your-stripe-secret>
   STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
   ```

   **Web Service:**
   ```bash
   NODE_ENV=production
   NODE_OPTIONS=--max-old-space-size=512
   NEXT_TELEMETRY_DISABLED=1
   PORT=3000
   NEXT_PUBLIC_API_URL=<your-api-service-url>
   NEXT_PUBLIC_APP_NAME=GlobFam
   NEXT_PUBLIC_APP_URL=<your-web-service-url>
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable>
   ```

3. **Deploy**
   ```bash
   # From repository root
   railway link
   
   # Deploy API
   cd apps/api
   railway up
   
   # Deploy Web
   cd apps/web
   railway up
   ```

## Configuration Details

### Railway Configuration Files

Both services use Nixpacks for building:

- **API**: `apps/api/railway.toml`
- **Web**: `apps/web/railway.json`

These files are pre-configured with optimized build commands that handle dependency installation and memory constraints.

### Database Setup

1. **Create Database**
   ```bash
   # If using Railway PostgreSQL
   railway run railway add
   # Select PostgreSQL
   ```

2. **Run Migrations**
   ```bash
   cd apps/api
   npx prisma migrate deploy
   ```

3. **Seed Data (Optional)**
   ```bash
   npm run db:seed
   ```

### Custom Domains

1. In Railway dashboard, go to service settings
2. Add custom domain
3. Configure DNS:
   - API: `api.yourdomain.com`
   - Web: `app.yourdomain.com`

## Troubleshooting

### Common Issues

**Memory Errors (Exit Code 137)**
- Increase `NODE_OPTIONS` to `--max-old-space-size=768`
- Upgrade Railway plan for more resources

**Build Failures**
- Check environment variables are set
- Clear Railway build cache
- Review build logs in Railway dashboard

**Database Connection Issues**
- Verify `DATABASE_URL` format
- Ensure SSL is enabled: `?sslmode=require`
- Check connection pool limits

**SWC/Next.js Issues**
- Current config uses Nixpacks which handles this automatically
- If issues persist, Railway support can help

### Health Checks

- API: `https://api.yourdomain.com/health`
- Web: `https://app.yourdomain.com`

## Production Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Redis connected
- [ ] Stripe webhooks configured
- [ ] Custom domains configured
- [ ] SSL certificates active
- [ ] Health checks passing
- [ ] Error monitoring setup (optional)

## Monitoring

### Railway Dashboard
- CPU and memory usage
- Build and deploy logs
- Service health status

### Application Monitoring (Optional)
- Sentry for error tracking
- LogDNA for centralized logging
- Uptime monitoring service

## Scaling

Railway automatically handles:
- Zero-downtime deploys
- Horizontal scaling (with proper plan)
- Load balancing
- SSL certificates

For advanced scaling needs:
- Enable autoscaling in Railway
- Add read replicas for database
- Implement caching strategies
- Use CDN for static assets

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GlobFam Issues: [Create issue in repository]