# Railway Deployment Memory Fix

## Issues
1. **Backend API**: Exit code 137 (Out of Memory) during npm install
2. **Frontend Web**: TypeScript error and missing SWC dependencies

## Solutions Applied

### Backend API Fixes

1. **Replaced json2csv with papaparse** (json2csv is deprecated)
   - Changed `json2csv@^5.0.7` to `papaparse@^5.4.1` in package.json
   - Updated export logic to use Papa.unparse()

2. **Optimized Dockerfile for memory usage**:
   - Added `NODE_OPTIONS="--max-old-space-size=512"`
   - Added flags: `--prefer-offline --no-audit --progress=false`

3. **Create .dockerignore** to reduce context size:
```
node_modules
npm-debug.log
.env
.env.*
dist
.git
.gitignore
README.md
.next
.cache
.DS_Store
coverage
.nyc_output
*.log
```

### Frontend Web Fixes

1. **Fixed TypeScript error** in NotionDashboard.tsx:
   - Added explicit type annotation to reduce function

2. **Added SWC dependencies** in Dockerfile:
   - Installs `@next/swc-linux-x64-gnu` and `@next/swc-linux-x64-musl`

## Alternative: Use Railway's Higher Memory Plan

If memory issues persist, consider:

1. **Increase Railway service memory**:
   - Go to Railway dashboard
   - Select your API service
   - Settings → Scale → Increase memory to 1GB or 2GB

2. **Use build-time environment variable**:
   ```toml
   [build]
   builder = "NIXPACKS"
   buildCommand = "NODE_OPTIONS='--max-old-space-size=1024' npm install && npm run build"
   ```

## Deployment Steps

1. **Create .dockerignore files**:
   ```bash
   # For API
   cat > apps/api/.dockerignore << EOF
   node_modules
   .env
   dist
   .git
   EOF

   # For Web
   cat > apps/web/.dockerignore << EOF
   node_modules
   .env
   .next
   .git
   EOF
   ```

2. **Commit and push**:
   ```bash
   git add -A
   git commit -m "Fix: Replace json2csv, add memory optimizations"
   git push
   ```

3. **If still failing, switch to Docker**:
   ```bash
   # Rename config files to use Docker
   cd apps/api
   mv railway.toml railway.toml.bak
   mv railway.docker.toml railway.toml
   ```

## Quick Memory Fix for Railway

Add this to your Railway service settings as an environment variable:
```
NODE_OPTIONS=--max-old-space-size=1024
```

This gives Node.js more memory during the build process.