# Railway Build Fix - npm ci to npm install

## Problem
Railway build was failing with "npm ci" commands because package-lock.json files were missing in both the backend and frontend directories.

## Solution Applied

### 1. Updated nixpacks.toml files
- **Root nixpacks.toml** (`/nixpacks.toml`): Changed `npm ci` to `npm install` for both backend and frontend
- **Platform nixpacks.toml** (`/globfam-platform/nixpacks.toml`): Changed `npm ci` to `npm install` for both backend and frontend

### 2. Updated Dockerfiles (for consistency)
While Railway uses nixpacks (not Docker), we updated these for consistency:
- **Backend Dockerfile**: Changed `npm ci` to `npm install`
- **Backend Dockerfile.prod**: Changed `npm ci` to `npm install` (both dev and production installs)
- **Frontend Dockerfile**: Changed `npm ci` to `npm install`
- **Frontend Dockerfile.prod**: Changed `npm ci` to `npm install`

### 3. Verified other files
- **railway.json**: Uses `npm run install:all` which already uses `npm install`
- **package.json scripts**: The `install:all` script correctly uses `npm install`
- **Deployment scripts**: No usage of `npm ci` found

## Why This Works
- `npm install` creates package-lock.json if it doesn't exist
- `npm ci` requires package-lock.json to exist and fails if it's missing
- Using `npm install` makes the build more resilient to missing lock files

## Future Considerations
1. Consider generating package-lock.json files by running `npm install` locally in each directory
2. Commit the package-lock.json files to ensure consistent dependency versions
3. Once package-lock.json files exist, you can switch back to `npm ci` for faster, more reliable builds

## Commands to generate package-lock.json (optional)
```bash
# Generate package-lock.json for backend
cd globfam-platform/backend
npm install

# Generate package-lock.json for frontend
cd ../frontend
npm install

# Commit the lock files
git add backend/package-lock.json frontend/package-lock.json
git commit -m "Add package-lock.json files for consistent builds"
```