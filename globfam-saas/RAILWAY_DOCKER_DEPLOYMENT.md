# Railway Docker Deployment Configuration

## Configuration Updates Applied

✅ **API Service (`apps/api/railway.toml`)**
- Changed from NIXPACKS to DOCKERFILE builder
- Using optimized multi-stage Dockerfile

✅ **Web Service (`apps/web/railway.json`)**
- Changed from NIXPACKS to DOCKERFILE builder  
- Using node:18-slim based Dockerfile (fixes SWC compatibility)

## Deployment Steps

### 1. Deploy API Service
```bash
cd apps/api
railway up
```

### 2. Deploy Web Service
```bash
cd apps/web
railway up
```

## Environment Variables Required

### API Service
```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
PORT=3001
DATABASE_URL=<your-database-url>
JWT_SECRET=<your-jwt-secret>
JWT_REFRESH_SECRET=<your-refresh-secret>
REDIS_URL=<your-redis-url>
OPENAI_API_KEY=<your-openai-key>
```

### Web Service
```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
NEXT_TELEMETRY_DISABLED=1
PORT=3000
NEXT_PUBLIC_API_URL=<your-api-url>
NEXT_PUBLIC_APP_NAME=GlobFam
NEXT_PUBLIC_APP_URL=<your-web-url>
```

## Docker Configuration Summary

### API Dockerfile Features
- Multi-stage build (deps, builder, runner)
- Alpine-based for small size
- Memory optimization with NODE_OPTIONS
- Health check included
- Non-root user for security
- Auto-runs Prisma migrations on start

### Web Dockerfile Features  
- Multi-stage build (deps, builder, runner)
- Debian-based (node:18-slim) for glibc compatibility
- Memory optimization with NODE_OPTIONS
- Health check included
- Non-root user for security
- Optimized Next.js production build

## Monitoring Post-Deployment

1. Check Railway dashboard for:
   - Build logs (should complete without errors)
   - Memory usage (should stay under limits)
   - Health check status

2. Verify endpoints:
   - API: `https://[your-api-url]/health`
   - Web: `https://[your-web-url]`

3. Test critical functionality:
   - User authentication
   - Asset management
   - Transaction operations

## Rollback Plan

If deployment fails:
1. Check logs in Railway dashboard
2. Review environment variables
3. To rollback to Nixpacks:
   ```bash
   # API
   cd apps/api
   # Edit railway.toml, change builder back to "NIXPACKS"
   
   # Web  
   cd apps/web
   # Edit railway.json, change builder back to "NIXPACKS"
   ```

## Support Resources

- Railway Docker docs: https://docs.railway.app/deploy/dockerfiles
- Next.js deployment: https://nextjs.org/docs/deployment
- Prisma deployment: https://www.prisma.io/docs/guides/deployment