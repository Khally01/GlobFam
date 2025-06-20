# GlobFam Web App Deployment Guide

## Current Status
✅ All dependency issues have been fixed
✅ @globfam imports replaced with local paths
✅ All UI components are in place
✅ Validation script confirms everything is ready

## Deploy to Railway

### Method 1: Railway CLI
```bash
# From the web app directory
cd /Users/khally/Documents/GitHub/GlobFam/globfam-saas/apps/web
railway link
railway up
```

### Method 2: Railway Dashboard
1. Go to Railway dashboard
2. Create new service
3. Connect your GitHub repository
4. Set root directory to: `globfam-saas/apps/web`
5. Railway will auto-detect Next.js and deploy

### Environment Variables Required
Add these in Railway service settings:
```
NEXT_PUBLIC_API_URL=https://globfam-v1.up.railway.app
NEXT_PUBLIC_APP_NAME=GlobFam
NEXT_PUBLIC_APP_URL=https://your-web-app.railway.app
```

### Post-Deployment
1. Set up custom domain (optional)
2. Configure CORS on API to allow web app domain
3. Test all features

## Local Testing
```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting
- If build fails, check `railway-deploy.sh` script
- Ensure all environment variables are set
- Check Railway logs for detailed error messages