# Railway Build Configuration Fix

## Issue Resolved
Railway was incorrectly attempting to use a Dockerfile from `globfam-saas` instead of building the `globfam-platform` project with Nixpacks.

## Changes Made

1. **Created `.railwayignore`** - Prevents Railway from detecting and using Dockerfiles
   - Ignores all Dockerfile patterns
   - Ignores the entire `globfam-saas` directory
   - Excludes unnecessary files from deployment

2. **Updated `railway.json`** - Enhanced configuration for clearer build instructions
   - Added `watchPatterns` to only watch `globfam-platform` directory
   - Added health check configuration
   - Added production environment caching

3. **Created root `nixpacks.toml`** - Explicit Nixpacks configuration
   - Specifies Node.js 18.x
   - Clear install and build commands for globfam-platform
   - Sets production environment

4. **Disabled conflicting Dockerfiles** - Renamed Dockerfiles in globfam-saas
   - `globfam-saas/apps/web/Dockerfile` → `Dockerfile.disabled`
   - `globfam-saas/apps/api/Dockerfile` → `Dockerfile.disabled`

## Deployment Instructions

1. Commit these changes:
   ```bash
   git add .railwayignore railway.json nixpacks.toml RAILWAY_BUILD_FIX.md
   git add globfam-saas/apps/web/Dockerfile.disabled globfam-saas/apps/api/Dockerfile.disabled
   git rm globfam-saas/apps/web/Dockerfile globfam-saas/apps/api/Dockerfile
   git commit -m "Fix Railway build configuration to use globfam-platform with Nixpacks"
   ```

2. Push to your repository:
   ```bash
   git push origin main
   ```

3. In Railway:
   - The build should now correctly use Nixpacks
   - It will build from the `globfam-platform` directory
   - The start command will run the platform's Railway-specific start script

## Verification

After deployment, verify:
- Build logs show Nixpacks being used (not Docker)
- Build commands reference `globfam-platform` paths
- No errors about missing `globfam-saas` directories

## Environment Variables Required

Ensure these are set in Railway:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string (if using Redis)
- `JWT_SECRET` - Secret for JWT tokens
- `NODE_ENV` - Set to "production"
- `PORT` - Will be automatically set by Railway

## Rollback Instructions

If needed, to rollback:
1. Delete `.railwayignore`, `nixpacks.toml`
2. Restore original `railway.json`
3. Rename `Dockerfile.disabled` files back to `Dockerfile`