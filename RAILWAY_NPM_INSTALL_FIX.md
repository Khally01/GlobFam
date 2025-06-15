# Railway npm install Fix Guide

## Issues Identified

1. **Nested directory structure**: There was a problematic nested `globfam-platform` directory inside the backend folder
2. **Complex build commands**: The nixpacks.toml had complex cache-cleaning commands that might cause issues
3. **Missing dependency**: `concurrently` was in devDependencies but needed for production
4. **Postinstall script**: The backend's postinstall script might fail if prisma schema isn't available during install

## Fixes Applied

### 1. Simplified nixpacks.toml
- Removed all cache-cleaning commands and flags
- Simplified to basic `npm install` commands
- Separated build steps for clarity

### 2. Fixed package.json files
- Moved `concurrently` from devDependencies to dependencies in globfam-platform/package.json
- Modified backend postinstall script to fail gracefully

### 3. Removed nested directory
- Deleted the problematic `globfam-platform/backend/globfam-platform` directory

### 4. Simplified railway.json
- Removed custom buildCommand
- Removed environment-specific configurations
- Let nixpacks handle the build process

## Testing the Fix

1. **Option 1: Use the simplified configuration**
   ```bash
   # In Railway, temporarily set:
   NIXPACKS_CONFIG_FILE=nixpacks-simple.toml
   ```

2. **Option 2: Debug locally**
   ```bash
   # Run the debug script
   ./debug-npm-install.sh
   ```

3. **Option 3: Test the build locally**
   ```bash
   cd globfam-platform
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

## Alternative Solutions

If npm install continues to fail:

### 1. Use yarn instead
Update nixpacks.toml:
```toml
[phases.install]
cmds = [
  "cd globfam-platform && yarn install",
  "cd globfam-platform/backend && yarn install",
  "cd globfam-platform/frontend && yarn install"
]
```

### 2. Skip postinstall during install
```toml
[phases.install]
cmds = [
  "cd globfam-platform && npm install",
  "cd globfam-platform/backend && npm install --ignore-scripts",
  "cd globfam-platform/frontend && npm install"
]
```

### 3. Set npm registry explicitly
Add to railway.json environments:
```json
"env": {
  "NPM_CONFIG_REGISTRY": "https://registry.npmjs.org/"
}
```

## Environment Variables to Check

Ensure these are set in Railway:
- `NODE_ENV=production`
- `DATABASE_URL` (required for Prisma)
- `JWT_SECRET`
- `REDIS_URL` (if using Redis)

## Next Steps

1. Commit all changes:
   ```bash
   git add -A
   git commit -m "Fix Railway npm install issues"
   git push origin main
   ```

2. Monitor the Railway build logs for specific error messages

3. If the error persists, check:
   - Is there a specific npm package causing the failure?
   - Are there any permission issues?
   - Is the Node.js version compatible?

## Rollback Plan

If needed, revert to previous configuration:
```bash
git revert HEAD
git push origin main
```