# Railway Deployment Solution

## Current Issues
1. **Backend API**: package-lock.json out of sync with new dependencies
2. **Frontend Web**: TypeScript error with toast action property

## Solutions Applied

### Option 1: Nixpacks with Lock File Removal (Current)
Both services are configured to remove package-lock.json before installing:
- `apps/api/railway.toml` - Uses `rm -f package-lock.json && npm install`
- `apps/web/railway.json` - Uses `rm -f package-lock.json && npm install`

### Option 2: Docker Build (Alternative)
Created Dockerfiles for both services as a fallback:
- `apps/api/Dockerfile` - Multi-stage build for API
- `apps/web/Dockerfile` - Multi-stage build for Next.js

To use Docker instead:
1. Rename `railway.toml` to `railway.nixpacks.toml`
2. Rename `railway.docker.toml` to `railway.toml`
3. Same for web service with JSON files

## Fixed Issues

### Backend Fixes:
1. ✅ Changed json2csv from v6 to v5.0.7
2. ✅ Added missing dependencies to package.json
3. ✅ Build command removes lock file before install

### Frontend Fixes:
1. ✅ Created missing dropdown-menu component
2. ✅ Removed toast action property (not supported)
3. ✅ Build command removes lock file before install

## Deployment Steps

### Method 1: With Current Configuration
```bash
# Commit all changes
git add -A
git commit -m "Fix deployment: remove lock files during build"
git push

# Railway will auto-deploy
```

### Method 2: Using Docker (if Method 1 fails)
```bash
# For API
cd apps/api
mv railway.toml railway.nixpacks.toml
mv railway.docker.toml railway.toml

# For Web
cd ../web
mv railway.json railway.nixpacks.json
mv railway.docker.json railway.json

# Commit and push
git add -A
git commit -m "Switch to Docker builds"
git push
```

## Environment Variables Required

### API Service
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=<32-char-secret>
JWT_REFRESH_SECRET=<32-char-secret>
ALLOWED_ORIGINS=https://your-frontend.railway.app
NODE_ENV=production
```

### Web Service
```
NEXT_PUBLIC_API_URL=https://your-api.railway.app
NEXT_PUBLIC_APP_NAME=GlobFam
NEXT_PUBLIC_APP_URL=https://your-frontend.railway.app
NODE_ENV=production
```

## Verification After Deployment

1. **Check API Health**:
   ```bash
   curl https://your-api.railway.app/health
   ```

2. **Check Database**:
   ```bash
   curl https://your-api.railway.app/api/db-health
   ```

3. **Test Frontend**:
   - Visit the web URL
   - Check browser console for errors
   - Test login functionality

## Troubleshooting

### If deployment still fails:

1. **Check Railway logs**:
   ```bash
   railway logs -s api
   railway logs -s web
   ```

2. **Try local build**:
   ```bash
   cd apps/api
   rm -f package-lock.json
   npm install
   npm run build
   ```

3. **Use Docker locally**:
   ```bash
   docker build -t globfam-api .
   docker run -p 3001:3001 globfam-api
   ```

## Summary

The main issue was package-lock.json being out of sync. By removing it during the build process, npm will generate a fresh one based on package.json. The Docker approach provides a more controlled environment if needed.