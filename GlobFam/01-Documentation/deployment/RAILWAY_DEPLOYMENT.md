# Railway Deployment Guide

## Environment Variables Required

### API Service
```bash
DATABASE_URL=<from PostgreSQL>
JWT_SECRET=<generate secure string>
JWT_REFRESH_SECRET=<generate different secure string>
REDIS_URL=<from Redis>
ALLOWED_ORIGINS=https://your-frontend.up.railway.app
NODE_ENV=production

# Optional
OPENAI_API_KEY=<for AI features>
ENCRYPTION_KEY=<32-byte string>
ENCRYPTION_SALT=<16-byte string>
```

### Frontend Service
```bash
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
```

## Deployment Steps

1. Push code to GitHub
2. Railway auto-deploys
3. Check logs for errors
4. Verify all services are running