# GlobFam Deployment Guide

## Current Stack Overview

Your complete deployment stack:
- **Frontend**: Railway / Vercel / Firebase Hosting
- **Backend**: Railway
- **Database**: Railway PostgreSQL
- **Cache**: Railway Redis
- **File Storage**: Firebase Storage (optional)
- **Authentication**: JWT (built-in)
- **CI/CD**: GitHub Actions → Railway

## Railway Deployment (Recommended)

### Initial Setup

1. **Install Railway CLI** (on your MacBook):
```bash
brew install railway
```

2. **Login to Railway**:
```bash
railway login
```

3. **Create New Project**:
```bash
cd globfam-platform
railway init
```

4. **Add Services**:
```bash
# Add PostgreSQL
railway add --plugin postgresql

# Add Redis
railway add --plugin redis
```

### Deploy Backend

1. **Navigate to backend**:
```bash
cd backend
railway link
```

2. **Set Environment Variables**:
```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -base64 32)
railway variables set FRONTEND_URL=https://your-frontend-url.com
```

3. **Deploy**:
```bash
railway up
```

### Deploy Frontend

1. **Navigate to frontend**:
```bash
cd ../frontend
railway link
```

2. **Set Environment Variables**:
```bash
railway variables set VITE_API_URL=https://your-backend.up.railway.app/api
```

3. **Deploy**:
```bash
railway up
```

## Alternative: Vercel (Frontend) + Railway (Backend)

### Frontend on Vercel

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Deploy Frontend**:
```bash
cd frontend
vercel --prod
```

3. **Set Environment Variables** (in Vercel Dashboard):
```
VITE_API_URL=https://your-backend.up.railway.app/api
```

### Backend stays on Railway (as above)

## Firebase Option (If you prefer)

### Frontend on Firebase Hosting

1. **Install Firebase Tools**:
```bash
npm install -g firebase-tools
```

2. **Initialize Firebase**:
```bash
cd frontend
firebase init hosting
# Choose: dist as public directory
# Configure as single-page app: Yes
```

3. **Deploy**:
```bash
npm run build
firebase deploy
```

### Firebase Configuration
Create `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=0, must-revalidate"
          }
        ]
      },
      {
        "source": "static/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

## Complete Production Stack

### Option 1: All-in-One Railway
- ✅ Simple deployment
- ✅ Automatic SSL
- ✅ Built-in monitoring
- ✅ Easy scaling
- 💰 ~$5-20/month

### Option 2: Best of Breed
- **Frontend**: Vercel (free tier generous)
- **Backend**: Railway
- **Database**: Railway PostgreSQL
- **Cache**: Railway Redis
- **CDN**: Cloudflare (free)
- **Monitoring**: Sentry (free tier)
- 💰 ~$5-15/month

### Option 3: Enterprise Scale
- **Frontend**: Firebase Hosting + CDN
- **Backend**: Google Cloud Run
- **Database**: Cloud SQL
- **Cache**: Memorystore
- **Files**: Cloud Storage
- 💰 Pay-per-use, scales infinitely

## Environment Variables Checklist

### Backend (.env)
```env
# Server
NODE_ENV=production
PORT=3001

# Database (from Railway)
DATABASE_URL=postgresql://...

# Redis (from Railway)
REDIS_URL=redis://...

# Security
JWT_SECRET=generate-random-32-chars
JWT_REFRESH_SECRET=generate-another-32-chars

# External Services
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
PLAID_ENV=sandbox

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend
FRONTEND_URL=https://globfam.vercel.app
```

### Frontend (.env.production)
```env
VITE_API_URL=https://globfam-backend.up.railway.app/api
```

## Deployment Commands

### Quick Deploy (Railway)
```bash
# Backend
cd backend
railway up

# Frontend
cd ../frontend
railway up
```

### Quick Deploy (Vercel + Railway)
```bash
# Backend on Railway
cd backend
railway up

# Frontend on Vercel
cd ../frontend
vercel --prod
```

## Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test login flow
- [ ] Check currency conversion
- [ ] Test transaction creation
- [ ] Verify email sending
- [ ] Check Plaid integration
- [ ] Test Money Garden
- [ ] Monitor error logs
- [ ] Set up domain name
- [ ] Configure SSL (auto on Railway/Vercel)

## Monitoring & Logs

### Railway
```bash
# View logs
railway logs

# Connect to database
railway connect postgresql
```

### Vercel
- Dashboard: https://vercel.com/dashboard
- Logs: Automatic in dashboard

## Custom Domain Setup

### Railway
```bash
railway domain
```

### Vercel
1. Go to project settings
2. Add domain
3. Update DNS records

## Troubleshooting

### Database Connection Issues
```bash
# Check DATABASE_URL
railway variables

# Test connection
railway run npm run db:migrate
```

### CORS Issues
Update backend CORS settings for your frontend URL.

### Build Failures
Check Node version (must be 20+):
```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

## Cost Optimization

1. **Use Free Tiers**:
   - Vercel: 100GB bandwidth free
   - Railway: $5 credit/month
   - Firebase: Generous free tier

2. **Optimize Images**: Use WebP format

3. **Enable Caching**: Set proper cache headers

4. **Use CDN**: Cloudflare free tier

## Security Checklist

- [ ] Environment variables set
- [ ] HTTPS enabled (automatic)
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] SQL injection prevention (Prisma)
- [ ] XSS protection (React)
- [ ] Secure headers (Helmet.js)

---

For support: Create an issue on GitHub or check Railway/Vercel documentation.