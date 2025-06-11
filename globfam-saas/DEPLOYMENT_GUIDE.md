# GlobFam Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Local Development (Fastest)
```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Start with Docker (includes PostgreSQL + Redis)
npm run docker:up

# 4. Run migrations and seed data
npm run db:migrate
npm run db:seed

# 5. Start development servers
npm run dev
```

**Access:**
- API: http://localhost:3001
- Web: http://localhost:3000
- Demo login: `demo@globfam.app` / `demo123456`

### Option 2: Production Deployment

#### Railway (API) + Vercel (Web)
```bash
# 1. Deploy API to Railway
railway login
railway new
railway add --database postgresql
railway add --service redis
railway deploy

# 2. Deploy Web to Vercel
vercel login
vercel --prod

# 3. Set up environment variables in both platforms
```

#### Full Docker Deployment
```bash
# 1. Create production environment file
cp .env.example .env.production

# 2. Deploy with Docker Compose
npm run deploy:production
```

## 🔧 Environment Setup

### Required Environment Variables

**API (.env):**
```env
DATABASE_URL="postgresql://localhost:5432/globfam"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
REDIS_URL="redis://localhost:6379"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NODE_ENV="development"
PORT="3001"
```

**Web (.env.local):**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## 📦 Platform-Specific Deployment

### Railway (API Backend)
1. Connect GitHub repository
2. Select `apps/api` as root directory
3. Add PostgreSQL and Redis services
4. Set environment variables
5. Deploy

### Vercel (Web Frontend)
1. Connect GitHub repository
2. Set framework preset to "Next.js"
3. Set root directory to `apps/web`
4. Set environment variables
5. Deploy

### Render (Alternative)
1. Create new web service
2. Connect repository
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables

## 🗄️ Database Setup

### Development (Local)
```bash
# Start PostgreSQL with Docker
docker run --name globfam-postgres -p 5432:5432 -e POSTGRES_DB=globfam -e POSTGRES_PASSWORD=password -d postgres:14

# Run migrations
cd apps/api
npx prisma migrate dev

# Seed demo data
npm run db:seed
```

### Production
```bash
# Set DATABASE_URL to production database
# Run migrations
npx prisma migrate deploy

# Seed production data (optional)
npm run db:seed
```

## 🔐 Security Checklist

- [ ] Generate secure JWT secrets (32+ characters)
- [ ] Set up HTTPS in production
- [ ] Configure CORS for production domains
- [ ] Set up rate limiting
- [ ] Configure environment variables securely
- [ ] Set up database backups
- [ ] Configure monitoring and logging

## 🧪 Testing Deployment

### Health Checks
```bash
# API health
curl http://localhost:3001/health

# Web health
curl http://localhost:3000

# Database connection
cd apps/api && npx prisma db push
```

### Demo Account
- Email: `demo@globfam.app`
- Password: `demo123456`
- Family Code: `DEMO2025`

## 📊 Monitoring

### Logs
```bash
# Docker logs
npm run docker:logs

# API logs
cd apps/api && npm run logs

# Web logs (Vercel)
vercel logs
```

### Database
```bash
# Open Prisma Studio
npm run db:studio

# Check connections
cd apps/api && npx prisma db pull
```

## 🔄 CI/CD Pipeline

GitHub Actions automatically:
1. Runs tests on PR/push
2. Builds Docker images
3. Deploys to staging/production
4. Sends Slack notifications

### Required Secrets
- `RAILWAY_WEBHOOK_URL`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SLACK_WEBHOOK_URL`

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed:**
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Verify connection string
cd apps/api && npx prisma db pull
```

**API 500 Errors:**
```bash
# Check logs
npm run docker:logs api

# Verify environment variables
echo $DATABASE_URL
```

**Web Build Failures:**
```bash
# Clear cache
rm -rf apps/web/.next

# Rebuild
cd apps/web && npm run build
```

### Performance Optimization

1. **Database:** Add indexes for frequently queried fields
2. **API:** Implement Redis caching
3. **Web:** Optimize images and enable compression
4. **CDN:** Use Vercel Edge Network or CloudFlare

## 🔄 Backup Strategy

### Database Backups
```bash
# Daily backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20250606.sql
```

### Environment Backups
- Store environment variables in secure password manager
- Keep copies of critical configurations
- Document all third-party service configurations

## 📈 Scaling

### Horizontal Scaling
- Multiple API instances behind load balancer
- Database read replicas
- Redis cluster for sessions

### Vertical Scaling
- Increase container resources
- Optimize database queries
- Implement connection pooling

## 💰 Cost Optimization

### Development
- Use free tiers (Railway, Vercel, PlanetScale)
- Local development with Docker

### Production
- Railway: ~$20/month (API + DB + Redis)
- Vercel: ~$20/month (Web hosting)
- Total: ~$40/month for full stack

Ready to deploy! 🚀