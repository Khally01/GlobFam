# Railway Deployment Fix Instructions

## The Problem
Railway is auto-detecting and using Dockerfiles instead of Nixpacks configuration, causing `npm ci` to fail due to package-lock.json being out of sync.

## The Solution
Force Railway to use Nixpacks by removing/renaming the Dockerfiles.

## Steps to Fix

### 1. Run the force-nixpacks script
```bash
chmod +x force-nixpacks.sh
./force-nixpacks.sh
```

This will rename:
- `apps/api/Dockerfile` → `apps/api/Dockerfile.railway-backup`
- `apps/web/Dockerfile` → `apps/web/Dockerfile.railway-backup`

### 2. Commit the changes
```bash
git add -A
git commit -m "Force Railway to use Nixpacks instead of Docker"
git push
```

### 3. Deploy
Railway will now use the Nixpacks configuration which:
- Uses `npm install` instead of `npm ci`
- Includes `--legacy-peer-deps` flag
- Properly handles all dependencies

## What Changed

### API (`apps/api/nixpacks.toml`)
- Uses `npm install --legacy-peer-deps`
- Generates Prisma client during build
- Runs migrations on start (not during build)

### Web (`apps/web/nixpacks.toml`)
- Uses `npm install --legacy-peer-deps`
- Simplified configuration
- Proper memory limits

## Verification
After deployment, Railway build logs should show:
- "Using Nixpacks" (not "Using Detected Dockerfile")
- `npm install` commands (not `npm ci`)

## Rollback
If needed, restore Dockerfiles:
```bash
mv apps/api/Dockerfile.railway-backup apps/api/Dockerfile
mv apps/web/Dockerfile.railway-backup apps/web/Dockerfile
```