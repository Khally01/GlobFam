# Repository Cleanup Summary

## Overview
This cleanup will remove 62 duplicate/unnecessary files to declutter the repository and improve maintainability.

## Files to be Removed

### API Directory (`apps/api/`) - 11 files
- `Dockerfile.disabled`
- `Dockerfile.optimized`
- `build-errors.log`
- `install-deps.sh`
- `nixpacks.toml.optimized`
- `package.json.optimized`
- `railway-build.sh`
- `railway.docker.toml`
- `railway.json`
- `railway.toml.backup`
- `tsconfig.tsbuildinfo`

### Web Directory (`apps/web/`) - 25 files
- `BUILD_FIX_SUMMARY.md`
- `DEPLOYMENT_GUIDE.md`
- `Dockerfile.backup`
- `Dockerfile.disabled`
- `Dockerfile.optimized`
- `build-fix.js`
- `build.sh`
- `fix-all-imports.js`
- `fix-dependencies.sh`
- `fix-imports.sh`
- `next.config.js.optimized`
- `package.json.backup`
- `package.json.optimized`
- `package.json.temp`
- `prebuild.js`
- `railway-build.sh`
- `railway-deploy.sh`
- `railway.docker.json`
- `railway.json.optimized`
- `tailwind.config.globfam.js`
- `validate-build-fix.js`
- `verify-build.sh`
- `src/components/ui/button-globfam.tsx`
- `src/components/ui/card-globfam.tsx`
- `src/app/(auth)/login/page-branded.tsx`

### Root Directory - 15 files
- `RAILWAY_DEPLOYMENT_CHECKLIST.md`
- `RAILWAY_DEPLOYMENT_FIXES.md`
- `RAILWAY_DEPLOYMENT_GUIDE.md`
- `RAILWAY_DEPLOYMENT_SOLUTION.md`
- `RAILWAY_DEPLOY_SOLUTION.md`
- `RAILWAY_DOCKER_DEPLOYMENT.md`
- `RAILWAY_FIX.md`
- `RAILWAY_MONOREPO_SETUP.md`
- `RAILWAY_SALES_PITCH_DEPLOY.md`
- `SETUP_GUIDE.md`
- `STRIPE_SETUP_GUIDE.md`
- `fix-imports.js`
- `fix-imports.sh`
- `.prettierrc`
- `.prettierignore`

### Additional Items
- `apps/web/dist/` directory (if exists)
- `apps/web/src/app/(dashboard)/dashboard/page-new.tsx` (if exists)

## What Remains After Cleanup

### Consolidated Documentation
- `README.md` - Project overview
- `DEPLOYMENT.md` - All deployment instructions in one place
- `CLAUDE.md` - Development guidelines (simplified)
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - Production-specific guide

### Clean Configuration
- Single `Dockerfile` per service
- Single `railway.toml`/`railway.json` per service
- Single `package.json` per service
- Proper `.gitignore` to prevent future clutter

## How to Run Cleanup

```bash
# Make script executable
chmod +x cleanup-duplicates.sh

# Run cleanup
./cleanup-duplicates.sh

# Review changes
git status

# Commit cleanup
git add -A
git commit -m "chore: clean up duplicate and unnecessary files"
```

## Benefits

1. **62 fewer files** to maintain
2. **Clearer project structure**
3. **Single source of truth** for configurations
4. **Easier onboarding** for new developers
5. **Reduced confusion** from multiple file versions

## Post-Cleanup

After running the cleanup:
1. All deployment documentation is in `DEPLOYMENT.md`
2. Development guidelines are in simplified `CLAUDE.md`
3. No duplicate UI components or configurations
4. Repository is organized and maintainable